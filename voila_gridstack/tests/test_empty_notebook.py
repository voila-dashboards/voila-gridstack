import os
import pytest
from conftest import BASE_DIR
from lxml import etree

@pytest.fixture
def voila_args():
    nb_path = os.path.join(BASE_DIR, 'nb_without_metadata.ipynb')
    return [nb_path, '--VoilaTest.config_file_paths=[]']


async def test_render_without_metadata(http_server_client, base_url):
    response = await http_server_client.fetch(base_url)
    assert response.code == 200
    html_body = response.body.decode('utf-8')

    parser = etree.HTMLParser()
    tree = etree.fromstring(html_body, parser=parser)
    text_elem = tree.xpath("//pre[text()='Hi !\n']")
    assert text_elem

    hidden_elem = tree.xpath("//*[text()='This is a hidden cell.']")
    assert hidden_elem

    expr_elem = tree.xpath("//script[contains(text(), '2') and contains(text(), 'text/plain')]")
    assert expr_elem

    md_elem = tree.xpath("//h1[text()='This is markdown']")
    assert md_elem

    all_elements = text_elem + hidden_elem + expr_elem + md_elem

    for elem in all_elements:
        attribs = elem.xpath("ancestor::div[@class='grid-stack-item']")[0].attrib
        assert attribs['gs-auto-position'] == 'true'
        assert 'gs-x' not in attribs
        assert 'gs-y' not in attribs
        assert attribs['gs-w'] == '12'
        assert attribs['gs-h'] == '2'

    # check if the document is properly ended
    assert "</html>" in html_body
