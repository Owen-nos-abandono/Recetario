from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db
from app.config import get_settings
from app import models, schemas, security

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()
limiter = Limiter(key_func=get_remote_address)


@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/hour")
async def register(request: Request, payload: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        # No revelamos detalles de por qué falló (mitiga enumeración de usuarios)
        raise HTTPException(status_code=400, detail="No se pudo completar el registro")

    user = models.User(
        email=payload.email,
        hashed_password=security.hash_password(payload.password),
        full_name=payload.full_name,
        is_verified=True,  # sin verificación por correo
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=schemas.TokenResponse)
@limiter.limit("10/hour")
async def login(request: Request, payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Inicio de sesión: correo + contraseña."""
    user = db.query(models.User).filter(models.User.email == payload.email).first()

    generic_error = HTTPException(status_code=401, detail="Correo o contraseña incorrectos")

    if not user or not user.is_active:
        raise generic_error

    if user.locked_until and user.locked_until > datetime.utcnow():
        raise HTTPException(
            status_code=423,
            detail="Cuenta bloqueada temporalmente por múltiples intentos fallidos",
        )

    if not security.verify_password(payload.password, user.hashed_password):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= settings.LOGIN_MAX_ATTEMPTS:
            user.locked_until = datetime.utcnow() + timedelta(minutes=settings.LOGIN_LOCKOUT_MINUTES)
            user.failed_login_attempts = 0
        db.commit()
        raise generic_error

    user.failed_login_attempts = 0
    db.commit()

    return schemas.TokenResponse(
        access_token=security.create_access_token(subject=user.id),
        refresh_token=security.create_refresh_token(subject=user.id),
    )


@router.post("/refresh", response_model=schemas.TokenResponse)
async def refresh_token(payload: schemas.RefreshRequest, db: Session = Depends(get_db)):
    data = security.decode_token(payload.refresh_token)
    if not data or data.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Refresh token inválido")

    user = db.query(models.User).filter(models.User.id == data.get("sub")).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Refresh token inválido")

    access_token = security.create_access_token(subject=user.id)
    new_refresh_token = security.create_refresh_token(subject=user.id)
    return schemas.TokenResponse(access_token=access_token, refresh_token=new_refresh_token)
