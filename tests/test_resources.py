import os
import pytest

from lxml import etree

BASE_DIR = os.path.dirname(__file__)

@pytest.fixture
def voila_args():
    nb_path = os.path.join(BASE_DIR, 'nb.ipynb')
    return [nb_path,
            '--VoilaTest.config_file_paths=[]',
            '--VoilaConfiguration.resources={"gridstack": {"show_handles": True}}']

@pytest.mark.gen_test
def test_resources_gridstack_show_handles(http_client, base_url):
    """Test with handlebars"""
    response = yield http_client.fetch(base_url)
    assert response.code == 200
    html_body = response.body.decode('utf-8')

    parser = etree.HTMLParser()
    tree = etree.fromstring(html_body, parser=parser)

    elem = tree.xpath("//div[@class='gridhandle']")
    assert  elem
