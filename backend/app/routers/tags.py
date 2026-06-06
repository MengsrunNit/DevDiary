from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.database import get_db
from app.models.post import Tag, post_tags

router = APIRouter()

@router.get("/")
async def list_tags(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Tag.name, func.count(post_tags.c.post_id).label("count"))
        .join(post_tags, Tag.id == post_tags.c.tag_id, isouter=True)
        .group_by(Tag.name)
        .order_by(func.count(post_tags.c.post_id).desc())
    )
    return [{"name": row.name, "count": row.count} for row in result.all()]