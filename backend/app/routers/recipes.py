from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app import models, schemas

router = APIRouter(prefix="/recipes", tags=["recipes"])


def _get_recipe(db: Session, recipe_id: str) -> models.Recipe:
    """Todas las recetas son compartidas: cualquier usuario autenticado puede verlas y modificarlas."""
    recipe = (
        db.query(models.Recipe)
        .options(joinedload(models.Recipe.owner))
        .filter(models.Recipe.id == recipe_id)
        .first()
    )
    if not recipe:
        raise HTTPException(status_code=404, detail="Receta no encontrada")
    return recipe


@router.get("", response_model=List[schemas.RecipeOut])
def list_recipes(
    include_inactive: bool = False,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """Lista las recetas de TODOS los usuarios."""
    query = db.query(models.Recipe).options(joinedload(models.Recipe.owner))
    if not include_inactive:
        query = query.filter(models.Recipe.is_active == True)  # noqa: E712
    if category:
        query = query.filter(models.Recipe.category == category)
    return query.order_by(models.Recipe.created_at.desc()).all()


@router.get("/{recipe_id}", response_model=schemas.RecipeOut)
def get_recipe(
    recipe_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    return _get_recipe(db, recipe_id)


@router.post("", response_model=schemas.RecipeOut, status_code=status.HTTP_201_CREATED)
def create_recipe(
    payload: schemas.RecipeCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    recipe = models.Recipe(owner_id=user.id, **payload.model_dump())
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return recipe


@router.put("/{recipe_id}", response_model=schemas.RecipeOut)
def update_recipe(
    recipe_id: str,
    payload: schemas.RecipeUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    recipe = _get_recipe(db, recipe_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(recipe, field, value)
    db.commit()
    db.refresh(recipe)
    return recipe


@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_recipe(
    recipe_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """Baja lógica (soft delete): la receta deja de listarse pero no se borra de la BD."""
    recipe = _get_recipe(db, recipe_id)
    recipe.is_active = False
    db.commit()
    return None


@router.post("/{recipe_id}/reactivate", response_model=schemas.RecipeOut)
def reactivate_recipe(
    recipe_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    recipe = _get_recipe(db, recipe_id)
    recipe.is_active = True
    db.commit()
    db.refresh(recipe)
    return recipe
