{% set jupyter_dashboards = nb.metadata.get('extensions', {}).get('jupyter_dashboards', {}) %}
{% set active_view = jupyter_dashboards.get('activeView', 'grid_default') %}
{% set gridstack_conf = jupyter_dashboards.get('views', {}).get(active_view, {}) %}
{% set dashboard_type = gridstack_conf.get("type", "grid") %}

{% if dashboard_type == 'grid' %}
    {% include 'grid.tpl' %}
{% elif dashboard_type == 'report' %}
    {% include 'report.tpl' %}
{% else %}
    {% include 'grid.tpl' %}
{% endif %}

