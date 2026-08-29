from app.services.demo_query_service import _build_sql, _extract_date_clause


def test_build_sql_for_region_sales_total():
    sql, metric_label, keywords = _build_sql("统计华北地区的销售总额")

    assert "FROM fact_order f" in sql
    assert "JOIN dim_region r ON f.region_id = r.region_id" in sql
    assert "r.region_name = '华北'" in sql
    assert "SUM(f.order_amount)" in sql
    assert metric_label == "销售额"
    assert "华北地区的销售总额" in keywords[0]


def test_build_sql_for_grouped_sales():
    sql, _, _ = _build_sql("按地区统计销售额")

    assert "GROUP BY r.region_name" in sql
    assert "ORDER BY `销售额` DESC" in sql
    assert "LIMIT 10" in sql


def test_extract_date_clause():
    clause = _extract_date_clause("最近7天销售额")

    assert clause is not None
    assert "BETWEEN" in clause
