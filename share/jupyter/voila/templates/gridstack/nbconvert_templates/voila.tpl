{%- extends 'base.tpl' -%}
{% from 'mathjax.tpl' import mathjax %}

{% set jupyter_dashboards = nb.metadata.get('extensions', {}).get('jupyter_dashboards', {}) %}
{% set active_view = jupyter_dashboards.get('activeView', 'grid_default') %}
{% set gridstack_conf = jupyter_dashboards.get('views', {}).get(active_view, {}) %}

{% block html_head_js scoped %}
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.0/jquery-ui.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.3/jquery.ui.touch-punch.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.5.0/lodash.min.js"></script>
<script src="http://gridstackjs.com/dist/gridstack.js"></script>
<script src="http://gridstackjs.com/dist/gridstack.jQueryUI.js"></script>
<script type="text/javascript">
    // bqplot doesn't resize when resizing the tile, fix: fake a resize event
    var resize_workaround = _.debounce(() => {
        window.dispatchEvent(new Event('resize'));
    }, 100)
    $(function () {
        $('.grid-stack').gridstack({
            alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            {% if resources.gridstack.show_handles %}
            resizable: {
                handles: 'e, se, s, sw, w'
            },
            {% else %}
            resizable: {
                handles: 'none'
            },
            {% endif %} 
            {% if gridstack_conf.defaultCellHeight %}
            cellHeight: {{gridstack_conf.defaultCellHeight}}, 
            {% endif %}
            {% if gridstack_conf.maxColumns %}
            width: {{gridstack_conf.maxColumns}}, 
            {% endif %}
            {% if gridstack_conf.cellMargin is defined %}
            verticalMargin: {{gridstack_conf.cellMargin}},
            {% endif %}
            draggable: {
                handle: '.gridhandle',
            }
        }).on('resizestop', function(event, elem) {
            resize_workaround()
        });
    });
</script>
{{ super() }}
{% endblock html_head_js%}

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

<link href="http://gridstackjs.com/dist/gridstack.css" rel="stylesheet" />

{{ super() }}

<style>
.cell, .output_wrapper, .output, .output_area, .output_subarea, .widget-subarea {
    display: flex;
    flex: 1;

}

.p-Widget {
    flex: 1;
}

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

body {
    overflow: scroll;
}
</style>

{{ mathjax() }}
{% endblock html_head_css %}

{% block body %}
{% if resources.theme == 'dark' %}
<body class="theme-dark" data-base-url="{{resources.base_url}}voila/">
{% else %}
<body class="theme-light" data-base-url="{{resources.base_url}}voila/">
{% endif %}
<section id="demo" class="voila-gridstack">
    <div class="container">
        <div class="grid-stack" data-gs-animate="yes">
                {{ super() }}
                <!-- <div class="grid-stack-item" data-gs-x="0" data-gs-y="0" data-gs-width="4" data-gs-height="2">
                <div class="grid-stack-item-content">
                </div> -->
        </div>
    </div>
</section>
</body>
{% endblock body %}


{% block markdowncell scoped %}
    {% set cell_jupyter_dashboards = cell.metadata.get('extensions', {}).get('jupyter_dashboards', {}) %}
    {% set view_data = cell_jupyter_dashboards.get('views', {}).get(active_view, {}) %}
    {% set hidden = view_data.get('hidden') %}
    {% set auto_position = ('row' not in view_data or 'col' not in view_data) %}
    {%- if not hidden %} 
    <div class="grid-stack-item"
         data-gs-width="{{ view_data.width | default(12) }}" 
         data-gs-height="{{ view_data.height | default(2) }}"
         {% if auto_position %}
         data-gs-auto-position=true
         {% else %}
         data-gs-y="{{ view_data.row }}"
         data-gs-x="{{ view_data.col }}",
         {% endif %}
     >
        <div class="grid-stack-item-content">
            {% if resources.gridstack.show_handles %}
            <div class="gridhandle">
                <i class=" fa fa-arrows"></i>
            </div>
            {% endif %}
            {{ super() }}
        </div>
    </div>
    {% endif %}
{% endblock markdowncell %}

{% block codecell scoped %}
{% set cell_jupyter_dashboards = cell.metadata.get('extensions', {}).get('jupyter_dashboards', {}) %}
{% set view_data = cell_jupyter_dashboards.get('views', {}).get(active_view, {}) %}
{% set hidden = view_data.get('hidden') %}
{% if not hidden %}
{% if view_data %}
<div class="grid-stack-item"
     data-gs-width="{{ view_data.width | default(12)}}" 
     data-gs-height="{{ view_data.height | default(2)}}"
     data-gs-y="{{ view_data.row }}"
     data-gs-x="{{ view_data.col }}">
    <!-- custom width/height -->
{% else %}
<div class="grid-stack-item" data-gs-width="12" data-gs-height="2" data-gs-auto-position='true'>
{% endif %}
    <div class="grid-stack-item-content">
        {% if resources.gridstack.show_handles %}
        <div class="gridhandle">
            <i class=" fa fa-arrows"></i>
        </div>
        {% endif %}
    {{ super() }}
    </div>
</div>
{% endif %}
{% endblock codecell %}
