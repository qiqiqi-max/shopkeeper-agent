"""
数仓 MySQL 仓储

这一层对应文档里的 DW Repository，职责是到真实数仓中补齐配置文件里
没有显式维护的信息，例如字段类型和字段示例值。Service 层只关心
“需要哪些信息”，具体怎样查数仓由仓储层统一封装
SQL 生成闭环中的数据库环境读取 SQL 校验和最终查询执行也集中放在这里
"""

import re

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlglot import exp, parse
from sqlglot.errors import ParseError


class DWMySQLRepository:
    """负责查询数仓真实表结构和字段样例值"""

    def __init__(self, session: AsyncSession):
        self.session = session

    @staticmethod
    def _quote_identifier(identifier: str) -> str:
        """校验并引用 MySQL 标识符，避免动态表名和字段名注入。"""
        if not isinstance(identifier, str) or not re.fullmatch(
            r"[A-Za-z_][A-Za-z0-9_]*", identifier
        ):
            raise ValueError(f"非法数据库标识符：{identifier}")
        return f"`{identifier}`"

    @staticmethod
    def _validate_limit(limit: int) -> int:
        """限制元数据抽样规模，避免异常参数造成无界查询。"""
        if not isinstance(limit, int) or not 1 <= limit <= 100_000:
            raise ValueError("limit 必须是 1 到 100000 之间的整数")
        return limit

    @staticmethod
    def _ensure_read_only(sql: str) -> str:
        """只允许单条 SELECT，避免模型输出修改数据的语句。"""
        normalized = sql.strip()
        if not normalized:
            raise ValueError("只允许执行单条只读 SELECT 查询")
        try:
            statements = parse(normalized, read="mysql")
        except ParseError as exc:
            raise ValueError("SQL 解析失败") from exc
        statement = statements[0] if len(statements) == 1 else None
        if not isinstance(statement, exp.Select):
            raise ValueError("只允许执行单条只读 SELECT 查询")
        if statement.args.get("locks") or statement.find(exp.Into):
            raise ValueError("不允许使用锁定或导出数据的 SELECT 语法")
        return statement.sql(dialect="mysql")

    async def get_column_types(self, table_name: str) -> dict[str, str]:
        """查询整张表的字段类型，作为 ColumnInfo.type 的真实来源"""
        sql = f"show columns from {self._quote_identifier(table_name)}"
        result = await self.session.execute(text(sql))
        result_dict = result.mappings().fetchall()
        return {row["Field"]: row["Type"] for row in result_dict}

    async def get_column_values(
        self, table_name: str, column_name: str, limit: int = 10
    ) -> list:
        """抽样查询字段示例值，供元数据入库和后续检索链路复用"""
        table = self._quote_identifier(table_name)
        column = self._quote_identifier(column_name)
        safe_limit = self._validate_limit(limit)
        sql = f"select distinct {column} from {table} limit {safe_limit}"
        result = await self.session.execute(text(sql))
        return [row[0] for row in result.fetchall()]

    async def get_db_info(self):
        """读取当前数仓数据库的方言和版本，供 SQL 生成提示词使用"""

        sql = "select version()"
        result = await self.session.execute(text(sql))
        version = result.scalar()

        # dialect 来自 SQLAlchemy 当前绑定的数据库方言，例如 mysql
        dialect = self.session.bind.dialect.name
        return {"dialect": dialect, "version": version}

    async def validate(self, sql: str):
        """用 EXPLAIN 让数据库提前解析 SQL，发现语法 表名 字段名等错误"""
        sql = f"explain {self._ensure_read_only(sql)}"
        await self.session.execute(text(sql))

    async def run(self, sql: str) -> list[dict]:
        """执行最终 SQL，并把 SQLAlchemy 行对象转换成前端更易消费的字典列表"""
        result = await self.session.execute(text(self._ensure_read_only(sql)))
        return [dict(row) for row in result.mappings().fetchall()]
