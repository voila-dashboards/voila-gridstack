import os
import pytest

from lxml import etree

BASE_DIR = os.path.dirname(__file__)

@pytest.fixture(params=[False, True], ids="show_handles={}".format)
def show_handles(request):
    return request.param

@pytest.fixture
def voila_resources(show_handles):
    return {"gridstack": {"show_handles": show_handles}}

@pytest.fixture
def voila_args(voila_resources):
    nb_path = os.path.join(BASE_DIR, 'nb.ipynb')
    return [nb_path,
            '--VoilaTest.config_file_paths=[]',
            '--VoilaConfiguration.resources={}'.format(voila_resources)]


async def test_resources_gridstack_show_handles(http_server_client, base_url, show_handles):
    """Test with handlebars"""
    response = await http_server_client.fetch(base_url)
    assert response.code == 200
    html_body = response.body.decode('utf-8')

    parser = etree.HTMLParser()
    tree = etree.fromstring(html_body, parser=parser)

    elem = tree.xpath("//div[@class='gridhandle']")
    assert (show_handles and elem) or (not show_handles and not elem)

    gridstack_config = tree.xpath("//script[contains(text(), 'GridStack')]")[0].text

    if show_handles:
        assert "handles: 'e, se, s, sw, w'" in gridstack_config
    else:
        assert "handles: 'none'" in gridstack_config
