import os
import pytest
from lxml import etree
import json
import tempfile

BASE_DIR = os.path.dirname(__file__)

@pytest.fixture(params=[None, 20])
def defaultCellHeight(request):
    return request.param

@pytest.fixture
def nb_metadata(defaultCellHeight):
    grid_default = {"name": "grid", "type": "grid"}
    if defaultCellHeight is not None:
        grid_default['defaultCellHeight'] = defaultCellHeight
    return {"extensions": {
               "jupyter_dashboards":  {
                   "activeView": "grid_default",
                   "views": {
                       "grid_default": grid_default}}}}


@pytest.fixture(params=['a', 'b'])
def voila_resources(request):
    return request.param

@pytest.fixture
def voila_args(voila_resources, nb_metadata):
    nb_path = os.path.join(BASE_DIR, 'nb.ipynb')
    with open(nb_path) as fid:
        nb_json = json.load(fid)
    nb_json['metadata'] = nb_metadata
    nb_temp = tempfile.NamedTemporaryFile(delete=False, mode="w", suffix=".ipynb")
    with nb_temp as fid:
        json.dump(nb_json, fid)
    print(nb_temp.name)

    return [nb_temp.name, '--VoilaTest.config_file_paths=[]', '--VoilaConfiguration.resources={"a" : "%s"}' % voila_resources]

@pytest.mark.gen_test
def test_radom_test(http_client, base_url, voila_resources, nb_metadata):
    response = yield http_client.fetch(base_url)
    assert response.code == 200
    html_body = response.body.decode('utf-8')
    assert "Resources: {}".format(voila_resources) in html_body

@pytest.mark.gen_test
def test_gridstack_general_conf(http_client, base_url, nb_metadata, voila_resources):
    response = yield http_client.fetch(base_url)
    assert response.code == 200
    html_body = response.body.decode('utf-8')

    grid_default = nb_metadata['extensions']['jupyter_dashboards']['views']['grid_default']

    cellHeight = grid_default.get('defaultCellHeight', None)
    assert (cellHeight is None) or (f"cellHeight: {cellHeight}" in html_body)

@pytest.mark.gen_test
def test_template_test(http_client, base_url, voila_resources, nb_metadata):
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
