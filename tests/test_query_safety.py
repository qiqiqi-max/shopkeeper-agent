import pytest

from app.agent.graph import route_after_validation
from app.agent.keyword_utils import dedupe_preserve_order
from app.repositories.mysql.dw.dw_mysql_repository import DWMySQLRepository


@pytest.mark.parametrize("sql", ["SELECT 1", "WITH data AS (SELECT 1) SELECT * FROM data"])
def test_read_only_sql_accepts_select_statements(sql):
    assert DWMySQLRepository._ensure_read_only(sql).upper().startswith(("SELECT", "WITH"))


@pytest.mark.parametrize(
    "sql",
    [
        "DELETE FROM fact_order",
        "SELECT 1; SELECT 2",
        "DROP TABLE fact_order",
        "SELECT 1 FOR UPDATE",
    ],
)
def test_read_only_sql_rejects_writes_and_multiple_statements(sql):
    with pytest.raises(ValueError):
        DWMySQLRepository._ensure_read_only(sql)


@pytest.mark.parametrize("identifier", ["fact_order; DROP TABLE users", "fact-order", "1table"])
def test_identifier_validation_rejects_injection_shapes(identifier):
    with pytest.raises(ValueError):
        DWMySQLRepository._quote_identifier(identifier)


def test_identifier_validation_quotes_valid_identifier():
    assert DWMySQLRepository._quote_identifier("fact_order") == "`fact_order`"


def test_limit_validation_rejects_out_of_range_values():
    with pytest.raises(ValueError):
        DWMySQLRepository._validate_limit(0)
    with pytest.raises(ValueError):
        DWMySQLRepository._validate_limit(100001)


def test_validation_route_has_a_bounded_correction_loop():
    assert route_after_validation({"error": None}) == "run_sql"
    assert route_after_validation({"error": "bad sql", "sql_retry_count": 0}) == "correct_sql"
    assert route_after_validation({"error": "bad sql", "sql_retry_count": 1}) == "correct_sql"
    assert route_after_validation({"error": "bad sql", "sql_retry_count": 2}) == "fail_sql"


def test_keyword_dedupe_preserves_first_seen_order():
    assert dedupe_preserve_order(["销售额", "华北", "销售额", "GMV", "华北"]) == [
        "销售额",
        "华北",
        "GMV",
    ]
