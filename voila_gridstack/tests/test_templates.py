import os
import pytest
from lxml import etree

BASE_DIR = os.path.dirname(__file__)


async def test_template_test(http_server_client, base_url):
    response = await http_server_client.fetch(base_url)
    assert response.code == 200
    html_body = response.body.decode('utf-8')

    parser = etree.HTMLParser()
    tree = etree.fromstring(html_body, parser=parser)

    # test top-level section
    elem = tree.xpath("//section[@id='demo']")
    assert elem

    # test width/height params
    elem = tree.xpath("//pre[text()='Hi !\n']/ancestor::div[@class='grid-stack-item']")[0]
    assert elem.attrib['gs-w'] == '6'
    assert elem.attrib['gs-h'] == '5'
    assert elem.attrib['gs-x'] == '0'
    assert elem.attrib['gs-y'] == '0'

    # test cell "2"
    elem = tree.xpath("//script[contains(text(), '2') and contains(text(), 'text/plain')]/ancestor::div[@class='grid-stack-item']")[0]
    assert elem.attrib['gs-w'] == '4'
    assert elem.attrib['gs-h'] == '4'
    assert elem.attrib['gs-x'] == '6'
    assert elem.attrib['gs-y'] == '0'

    # markdown cell
    elem = tree.xpath("//h1[text()='This is markdown']/ancestor::div[@class='grid-stack-item']")[0]
    assert elem.attrib['gs-w'] == '10'
    assert elem.attrib['gs-h'] == '2'
    assert elem.attrib['gs-x'] == '0'
    assert elem.attrib['gs-y'] == '5'

    # test hidden cell
    elem = tree.xpath("//*[text()='This is a hidden cell.']")
    assert not elem

    # test absence of handles
    elem = tree.xpath("//div[contains(@class, 'gridhandle')]")
    assert not elem

    assert "cellHeight: 40" in html_body
    assert "column: 12" in html_body
    assert "margin: 10" in html_body
