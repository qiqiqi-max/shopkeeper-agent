from app.services.result_summary import count_result_rows, summarize_result


def test_summarize_list_result():
    data = [{"region": "华东"}, {"region": "华南"}]

    assert count_result_rows(data) == 2
    assert summarize_result(data) == "查询完成，共 2 行结果。"


def test_summarize_empty_result():
    assert count_result_rows([]) == 0
    assert summarize_result([]) == "查询完成，结果为空。"


def test_summarize_object_result():
    assert count_result_rows({"total": 100}) == 1
    assert summarize_result({"total": 100}) == "查询完成，已返回结构化结果。"
