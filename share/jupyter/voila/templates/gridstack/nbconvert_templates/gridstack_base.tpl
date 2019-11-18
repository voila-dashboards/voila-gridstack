{%- extends 'base.tpl' -%}

{% block html_head_css %}
<link rel="stylesheet" type="text/css" href="{{resources.base_url}}voila/static/index.css" />

{% if resources.theme == 'dark' %}
    <link rel="stylesheet" type="text/css" href="{{resources.base_url}}voila/static/theme-dark.css" />
{% else %}
    <link rel="stylesheet" type="text/css" href="{{resources.base_url}}voila/static/theme-light.css" />
{% endif %}

{% for css in resources.inlining.css %}
    <style type="text/css">
    {{ css }}
    </style>
{% endfor %}

<link href="https://cdn.jsdelivr.net/npm/gridstack@0.5.2/dist/gridstack.min.css" rel="stylesheet" />

{{ super() }}

<style>
.grid-stack-item-content {
    background: var(--jp-layout-color0);
    color: var(--jp-ui-font-color1);
    display: flex;
    flex-direction: column;
}

.gridhandle {
    cursor: move;
    margin-left: 10px;
}

.voila-gridstack {
{% if resources.gridstack.show_handles  %}
    background: var(--jp-layout-color3);
{% else %}
    background: var(--jp-layout-color0);
{% endif %}
    color: var(--jp-ui-font-color0);
}
</style>

<style>
a.anchor-link {
  display: none;
}
.highlight  {
  margin: 0.4em;
}
</style>

{% endblock html_head_css %}

{% block body_header %}
{% if resources.theme == 'dark' %}
<body class="theme-dark" data-base-url="{{resources.base_url}}voila/">
{% else %}
<body class="theme-light" data-base-url="{{resources.base_url}}voila/">
{% endif %}
{% endblock body_header %}
