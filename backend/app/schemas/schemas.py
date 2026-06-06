from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class TagSchema(BaseModel):
    id: int
    name: str
    model_config = {"from_attributes": True}

class UserPublic(BaseModel):
    id: int
    username: str
    display_name: Optional[str]
    bio: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    display_name: Optional[str] = None

class PostCreate(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    published: bool = False
    tags: List[str] = []

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    published: Optional[bool] = None
    tags: Optional[List[str]] = None

class PostResponse(BaseModel):
    id: int
    title: str
    slug: str
    content: str
    excerpt: Optional[str]
    published: bool
    author: UserPublic
    tags: List[TagSchema]
    created_at: datetime
    updated_at: Optional[datetime]
    model_config = {"from_attributes": True}

class PostSummary(BaseModel):
    id: int
    title: str
    slug: str
    excerpt: Optional[str]
    published: bool
    author: UserPublic
    tags: List[TagSchema]
    created_at: datetime
    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str