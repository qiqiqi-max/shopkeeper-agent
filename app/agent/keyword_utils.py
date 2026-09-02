"""关键词处理工具。"""

from collections.abc import Iterable


def dedupe_preserve_order(items: Iterable[str]) -> list[str]:
    """去重但保留首次出现顺序，保证召回请求可复现。"""
    return list(dict.fromkeys(items))
