import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Boolean, DateTime, Integer, ForeignKey, Text
)
from sqlalchemy.orm import relationship

from app.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)

    # Ya no se verifica el correo: todas las cuentas nacen verificadas (se conserva la columna por compatibilidad)
    is_verified = Column(Boolean, default=True, nullable=False)

    # Seguridad de inicio de sesión
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime, nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)  # baja lógica de cuenta
    created_at = Column(DateTime, default=datetime.utcnow)

    recipes = relationship("Recipe", back_populates="owner")


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(String, primary_key=True, default=gen_uuid)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    ingredients = Column(Text, nullable=False)   # texto separado por líneas
    steps = Column(Text, nullable=False)          # texto separado por líneas
    servings = Column(Integer, nullable=True)
    prep_time_minutes = Column(Integer, nullable=True)
    category = Column(String, nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)  # baja lógica (soft delete)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="recipes")

    @property
    def owner_name(self) -> str:
        """Nombre público del autor (nunca se expone el correo)."""
        return (self.owner.full_name if self.owner and self.owner.full_name else "Usuario")
