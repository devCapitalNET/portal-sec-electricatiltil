from uuid import UUID

from pydantic import BaseModel, EmailStr


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    nombre: str
    rol: str
    activo: bool

    model_config = {"from_attributes": True}


TokenOut.model_rebuild()


class UserCreate(BaseModel):
    email: EmailStr
    nombre: str
    password: str
    rol: str = "operador"


class UserUpdate(BaseModel):
    nombre: str | None = None
    rol: str | None = None
    activo: bool | None = None
    password: str | None = None
