import os
import pytest
from conftest import BASE_DIR
from lxml import etree

@pytest.fixture
def voila_args():
    nb_path = os.path.join(BASE_DIR, 'nb_without_metadata.ipynb')
    return [nb_path, '--VoilaTest.config_file_paths=[]']

@pytest.mark.gen_test
def test_render_without_metadata(http_client, base_url):

    response = yield http_client.fetch(base_url)
    assert response.code == 200
    html_body = response.body.decode('utf-8')

    parser = etree.HTMLParser()
    tree = etree.fromstring(html_body, parser=parser)

    elem = tree.xpath("//pre[text()='Hi !\n']")
    assert elem

    elem = tree.xpath("//*[text()='This is a hidden cell.']")
    assert elem

    elem = tree.xpath("//pre[text()='2']")
    assert elem

    md_elem = tree.xpath("//h1[text()='This is markdown']")
    assert md_elem

    md_attribs = md_elem[0].xpath("ancestor::div[@class='grid-stack-item']")[0].attrib
    assert md_attribs['data-gs-auto-position']
    assert 'data-gs-x' not in md_attribs
    assert 'data-gs-y' not in md_attribs
    assert md_attribs['data-gs-width'] == '12'
    assert md_attribs['data-gs-height'] == '2'

    # check if the document is properly ended
    assert "</html>" in html_body
