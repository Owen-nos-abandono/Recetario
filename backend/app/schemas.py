import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator, ConfigDict


# ---------- Auth ----------

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        if not re.search(r"[A-Z]", v):
            raise ValueError("La contraseña debe incluir al menos una mayúscula")
        if not re.search(r"[a-z]", v):
            raise ValueError("La contraseña debe incluir al menos una minúscula")
        if not re.search(r"\d", v):
            raise ValueError("La contraseña debe incluir al menos un número")
        if not re.search(r"[^A-Za-z0-9]", v):
            raise ValueError("La contraseña debe incluir al menos un símbolo")
        return v


class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    is_verified: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


# ---------- Recetas ----------

class RecipeBase(BaseModel):
    title: str
    description: Optional[str] = None
    ingredients: str
    steps: str
    servings: Optional[int] = None
    prep_time_minutes: Optional[int] = None
    category: Optional[str] = None


class RecipeCreate(RecipeBase):
    pass


class RecipeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    ingredients: Optional[str] = None
    steps: Optional[str] = None
    servings: Optional[int] = None
    prep_time_minutes: Optional[int] = None
    category: Optional[str] = None


class RecipeOut(RecipeBase):
    id: str
    owner_id: str
    owner_name: str = "Usuario"
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
