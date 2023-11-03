import os
from lxml import etree
import pytest
from conftest import BASE_DIR


@pytest.fixture
def voila_args():
    nb_path = os.path.join(BASE_DIR, "nb_report.ipynb")
    return [nb_path, "--VoilaTest.config_file_paths=[]"]


async def test_report_view(http_server_client, base_url):
    response = await http_server_client.fetch(base_url)
    assert response.code == 200
    html_body = response.body.decode("utf-8")

    parser = etree.HTMLParser()
    tree = etree.fromstring(html_body, parser=parser)

    assert "SVG circles" in html_body
    assert "Voilà logo" not in html_body

    caption_tag = tree.xpath("//p[contains(text(), 'SVG circles')]")
    assert caption_tag

    header = tree.xpath("//*[contains(text(), 'Graphics')]")
    assert header

    circle_tag = tree.xpath(
        "//script[contains(text(), 'image/svg+xml') and contains(text(), 'hsl')]"
    )
    assert circle_tag

    voila_caption_tag = tree.xpath("//p[contains(text(), 'Voilà logo')]")
    assert not voila_caption_tag

    img_tag = tree.xpath("//img")
    assert not img_tag

    # test element order
    ordered_tags = [header[0], circle_tag[0], caption_tag[0]]
    document_order = [e for e in tree.getiterator() if e in ordered_tags]
    assert ordered_tags == document_order
