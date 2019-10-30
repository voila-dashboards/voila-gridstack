import pytest
from lxml import etree

@pytest.mark.gen_test
def test_template_test(http_client, base_url):
    response = yield http_client.fetch(base_url)
    assert response.code == 200
    html_body = response.body.decode('utf-8')

    parser = etree.HTMLParser()
    tree = etree.fromstring(html_body, parser=parser)

    # test width/height params
    elem = tree.xpath("//pre[text()='Hi !\n']/ancestor::div[@class='grid-stack-item']")[0]
    assert elem.attrib['data-gs-width'] == '6'
    assert elem.attrib['data-gs-height'] == '5'
    assert elem.attrib['data-gs-x'] == '0'
    assert elem.attrib['data-gs-y'] == '0'

    # test cell "2"
    elem = tree.xpath("//pre[text()='2']/ancestor::div[@class='grid-stack-item']")[0]
    assert elem.attrib['data-gs-width'] == '4'
    assert elem.attrib['data-gs-height'] == '4'
    assert elem.attrib['data-gs-x'] == '6'
    assert elem.attrib['data-gs-y'] == '0'

    # markdown cell
    elem = tree.xpath("//h1[text()='This is markdown']/ancestor::div[@class='grid-stack-item']")[0]
    assert elem.attrib['data-gs-width'] == '10'
    assert elem.attrib['data-gs-height'] == '2'
    assert elem.attrib['data-gs-x'] == '0'
    assert elem.attrib['data-gs-y'] == '5'

    # test hidden cell
    elem = tree.xpath("//*[text()='This is a hidden cell.']")
    assert not elem

    # test absence of handles
    elem = tree.xpath("//div[contains(@class, 'gridhandle')]")
    assert not elem

    assert "cellHeight: 40" in html_body
    assert "width: 12" in html_body
    assert "verticalMargin: 10" in html_body
