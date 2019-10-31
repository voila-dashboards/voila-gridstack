import os
import pytest
from lxml import etree
import json
import tempfile

BASE_DIR = os.path.dirname(__file__)


@pytest.fixture(params=[None, 20], ids="defaultCellHeight={}".format)
def defaultCellHeight(request):
    return request.param


@pytest.fixture(params=[None, 0, 10], ids="cellMargin={}".format)
def cellMargin(request):
    return request.param


@pytest.fixture(params=[None, 15], ids="maxColumns={}".format)
def maxColumns(request):
    return request.param


@pytest.fixture
def nb_metadata(defaultCellHeight, cellMargin, maxColumns):
    grid_default = {"name": "grid", "type": "grid"}
    if defaultCellHeight is not None:
        grid_default['defaultCellHeight'] = defaultCellHeight
    if cellMargin is not None:
        grid_default['cellMargin'] = cellMargin
    if maxColumns is not None:
        grid_default['maxColumns'] = maxColumns
    return {"extensions": {
               "jupyter_dashboards":  {
                   "activeView": "grid_default",
                   "views": {
                       "grid_default": grid_default}}}}


@pytest.fixture
def voila_args(nb_metadata):
    nb_path = os.path.join(BASE_DIR, 'nb.ipynb')
    with open(nb_path) as fid:
        nb_json = json.load(fid)
    nb_json['metadata'] = nb_metadata
    nb_temp = tempfile.NamedTemporaryFile(delete=False, mode="w", suffix=".ipynb")
    with nb_temp as fid:
        json.dump(nb_json, fid)
    print(nb_temp.name)

    return [nb_temp.name, '--VoilaTest.config_file_paths=[]']


@pytest.mark.gen_test
def test_gridstack_general_conf(http_client, base_url, nb_metadata):
    response = yield http_client.fetch(base_url)
    assert response.code == 200
    html_body = response.body.decode('utf-8')

    parser = etree.HTMLParser()
    tree = etree.fromstring(html_body, parser=parser)
    gridstack_config = tree.xpath("//script[contains(text(), 'gridstack')]")[0].text

    grid_default = nb_metadata['extensions']['jupyter_dashboards']['views']['grid_default']

    def assert_config(metadata_name, gridstack_property):
        value = grid_default.get(metadata_name)
        if value is None:
            assert gridstack_property not in gridstack_config
        else:
            assert (f"{gridstack_property}: {value}" in gridstack_config)

    assert_config('defaultCellHeight', 'cellHeight')
    assert_config('cellMargin', 'verticalMargin')
    assert_config('maxColumns', 'width')
