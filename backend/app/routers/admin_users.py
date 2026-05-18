from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth_jwt import require_admin
from app.core.security import hash_password
from app.database import get_db
from app.models import User
from app.schemas.auth import UserCreate, UserOut, UserUpdate

router = APIRouter()


@router.get("/users", response_model=list[UserOut])
async def list_users(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> list[UserOut]:
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return [UserOut.model_validate(u) for u in result.scalars().all()]


@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(
    body: UserCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> UserOut:
    exists = await db.execute(select(User).where(User.email == body.email))
    if exists.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email ya registrado")
    if body.rol not in {"admin", "operador"}:
        raise HTTPException(status_code=400, detail="rol invalido (admin|operador)")
    user = User(
        email=body.email,
        nombre=body.nombre,
        password_hash=hash_password(body.password),
        rol=body.rol,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserOut.model_validate(user)


@router.patch("/users/{user_id}", response_model=UserOut)
async def update_user(
    user_id: UUID,
    body: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(require_admin),
) -> UserOut:
    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    data = body.model_dump(exclude_unset=True)
    password = data.pop("password", None)

    if "activo" in data and data["activo"] is False and user.id == current.id:
        raise HTTPException(status_code=400, detail="No puedes desactivar tu propio usuario")
    if "rol" in data and data["rol"] not in {"admin", "operador"}:
        raise HTTPException(status_code=400, detail="rol invalido (admin|operador)")
    if "rol" in data and data["rol"] != "admin" and user.id == current.id:
        raise HTTPException(status_code=400, detail="No puedes degradar tu propio rol admin")

    for key, value in data.items():
        setattr(user, key, value)

    if password:
        user.password_hash = hash_password(password)

    await db.commit()
    await db.refresh(user)
    return UserOut.model_validate(user)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
async def deactivate_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(require_admin),
):
    """Soft delete: desactiva el usuario."""
    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    if user.id == current.id:
        raise HTTPException(status_code=400, detail="No puedes desactivar tu propio usuario")
    user.activo = False
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
