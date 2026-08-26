"""
问数历史 MySQL 仓储

负责新增、更新和读取 `query_history` 记录。
"""

from datetime import datetime

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.entities.query_history import QueryHistory
from app.models.query_history import QueryHistoryMySQL
from app.services.result_summary import count_result_rows


class QueryHistoryRepository:
    """封装查询历史的持久化操作"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, history_id: str, query: str) -> QueryHistory:
        """创建一条运行中的问数记录"""

        model = QueryHistoryMySQL(
            id=history_id,
            query=query,
            status="running",
            summary="连接中...",
            row_count=0,
        )
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)
        return self.to_entity(model)

    async def mark_done(self, history_id: str, result: object, summary: str):
        """把问数记录标记为成功，并保存结构化结果"""

        model = await self.session.get(QueryHistoryMySQL, history_id)
        if not model:
            return

        model.status = "done"
        model.summary = summary
        model.result = result
        model.row_count = count_result_rows(result)
        model.error = None
        model.updated_at = datetime.now()
        await self.session.commit()

    async def mark_error(self, history_id: str, message: str):
        """把问数记录标记为失败"""

        model = await self.session.get(QueryHistoryMySQL, history_id)
        if not model:
            return

        model.status = "error"
        model.summary = message
        model.error = message
        model.updated_at = datetime.now()
        await self.session.commit()

    async def list_recent(self, limit: int = 20) -> list[QueryHistory]:
        """按更新时间倒序读取最近问数记录"""

        result = await self.session.execute(
            select(QueryHistoryMySQL)
            .order_by(desc(QueryHistoryMySQL.updated_at))
            .limit(limit)
        )
        return [self.to_entity(model) for model in result.scalars().all()]

    @staticmethod
    def to_entity(model: QueryHistoryMySQL) -> QueryHistory:
        """ORM 模型转应用实体"""

        return QueryHistory(
            id=model.id,
            query=model.query,
            status=model.status,
            summary=model.summary,
            result=model.result,
            row_count=model.row_count,
            error=model.error,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
