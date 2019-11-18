{%- extends 'gridstack_base.tpl' -%}

{% block html_head_js scoped %}
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.0/jquery-ui.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.3/jquery.ui.touch-punch.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.5.0/lodash.min.js"></script>

<script src="https://cdn.jsdelivr.net/npm/gridstack@0.5.2/dist/gridstack.all.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gridstack@0.5.2/dist/gridstack.jQueryUI.min.js"></script>
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
{% endblock html_head_js %}


{% block any_cell scoped %}
    {% set cell_jupyter_dashboards = cell.metadata.get('extensions', {}).get('jupyter_dashboards', {}) %}
    {% set view_data = cell_jupyter_dashboards.get('views', {}).get(active_view, {}) %}
    {% set hidden = view_data.get('hidden') %}
    {% set auto_position = ('row' not in view_data or 'col' not in view_data) %}
    {%- if not hidden and cell.cell_type in ['markdown', 'code'] %} 
    <div class="grid-stack-item"
         data-gs-width="{{ view_data.width | default(12) }}" 
         data-gs-height="{{ view_data.height | default(2) }}"
         {% if auto_position %}
         data-gs-auto-position=true
         {% else %}
         data-gs-y="{{ view_data.row }}"
         data-gs-x="{{ view_data.col }}"
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
{% endblock any_cell %}

{% block body %}
<section id="demo" class="voila-gridstack">
    <div class="container">
        <div class="grid-stack" data-gs-animate="yes">
                {{ super() }}
        </div>
    </div>
</section>
{% endblock body %}
