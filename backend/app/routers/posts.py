from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from slugify import slugify
from app.db.database import get_db
from app.models.post import Post, Tag
from app.models.user import User
from app.schemas.schemas import PostCreate, PostUpdate, PostResponse, PostSummary
from app.core.security import get_current_user

router = APIRouter()

async def get_or_create_tags(db, tag_names):
    tags = []
    for name in tag_names:
        name = name.lower().strip()
        result = await db.execute(select(Tag).where(Tag.name == name))
        tag = result.scalar_one_or_none()
        if not tag:
            tag = Tag(name=name)
            db.add(tag)
            await db.flush()
        tags.append(tag)
    return tags

@router.get("/", response_model=List[PostSummary])
async def list_posts(
    tag: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = select(Post).options(selectinload(Post.author), selectinload(Post.tags))
    query = query.where(Post.published == True)
    if tag:
        query = query.join(Post.tags).where(Tag.name == tag.lower())
    if search:
        query = query.where(Post.title.ilike(f"%{search}%"))
    query = query.order_by(Post.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{slug}", response_model=PostResponse)
async def get_post(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Post).options(selectinload(Post.author), selectinload(Post.tags)).where(Post.slug == slug)
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.post("/", response_model=PostResponse, status_code=201)
async def create_post(
    post_in: PostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    base_slug = slugify(post_in.title)
    slug = base_slug
    count = 1
    while True:
        result = await db.execute(select(Post).where(Post.slug == slug))
        if not result.scalar_one_or_none():
            break
        slug = f"{base_slug}-{count}"
        count += 1
    tags = await get_or_create_tags(db, post_in.tags)
    post = Post(
        title=post_in.title, slug=slug, content=post_in.content,
        excerpt=post_in.excerpt or post_in.content[:200],
        published=post_in.published, author_id=current_user.id, tags=tags,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    result = await db.execute(
        select(Post).options(selectinload(Post.author), selectinload(Post.tags)).where(Post.id == post.id)
    )
    return result.scalar_one()

@router.put("/{slug}", response_model=PostResponse)
async def update_post(
    slug: str,
    post_in: PostUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Post).options(selectinload(Post.tags)).where(Post.slug == slug))
    post = result.scalar_one_or_none()
    if not post or post.author_id != current_user.id:
        raise HTTPException(status_code=404, detail="Post not found")
    if post_in.title is not None: post.title = post_in.title
    if post_in.content is not None: post.content = post_in.content
    if post_in.excerpt is not None: post.excerpt = post_in.excerpt
    if post_in.published is not None: post.published = post_in.published
    if post_in.tags is not None: post.tags = await get_or_create_tags(db, post_in.tags)
    await db.commit()
    await db.refresh(post)
    result = await db.execute(
        select(Post).options(selectinload(Post.author), selectinload(Post.tags)).where(Post.id == post.id)
    )
    return result.scalar_one()

@router.delete("/{slug}", status_code=204)
async def delete_post(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Post).where(Post.slug == slug))
    post = result.scalar_one_or_none()
    if not post or post.author_id != current_user.id:
        raise HTTPException(status_code=404, detail="Post not found")
    await db.delete(post)
    await db.commit()