/***************************************************************************
* Copyright (c) 2018, Voila contributors                                   *
*                                                                          *
* Distributed under the terms of the BSD 3-Clause License.                 *
*                                                                          *
* The full license is in the file LICENSE, distributed with this software. *
****************************************************************************/
define(['jquery',
        'base/js/namespace'], function($, Jupyter) {

    var gridstack_metadata_keys = ['extensions', 'jupyter_dashboards'];

    /*
     * Init nested metadata for Notebook level and cells level
     */
    function init_metadata() {

        var notebook_gridstack_metadata = Jupyter.notebook.metadata;

        gridstack_metadata_keys.forEach(function (key) {
            if (!notebook_gridstack_metadata[key]){
                notebook_gridstack_metadata[key] = Object();
            }
            notebook_gridstack_metadata = notebook_gridstack_metadata[key];
        });

        if (!notebook_gridstack_metadata['version']) {
            notebook_gridstack_metadata.version = 1;
            notebook_gridstack_metadata.activeView = 'default_view';
            notebook_gridstack_metadata.views = {'default_view': {
                                                                  'name': 'active_view',    // user-assigned, unique human readable name
                                                                  'type': 'grid',           // layout algorithm to use (grid in this example view)
                                                                  'cellMargin': 10,         // margin between cells in pixels
                                                                  'defaultCellHeight': 40,  // height in pixels of a logical row
                                                                  'maxColumns': 12          // total number of logical columns
                                                                 }
                                                };
        }

        cells = $('.cell').toArray().map(function (e) {
                    return $(e).data("cell");
                });
        cells.forEach(function (cell) {
            cell_gridstack_metatada = cell.metadata;
            gridstack_metadata_keys.forEach(function (key) {
                if (!cell_gridstack_metatada[key]){
                    cell_gridstack_metatada[key] = Object();
                }
                cell_gridstack_metatada = cell_gridstack_metatada[key];
            });
            if (!cell_gridstack_metatada['version']) {
                cell_gridstack_metatada.version = notebook_gridstack_metadata['version'];
                cell_gridstack_metatada.views = {};
                cell_gridstack_metatada.views[notebook_gridstack_metadata.activeView] = {};
            }
        });
    }

    /*
     * Hides code cells with empty output and raw text cells
     * @param {gridstack object} grid: GridStack object returned by Gridstack.init()
     */
    function hide_elements(grid) {
        grid.engine.nodes.forEach( function (item) {
            cell = $(item.el).find(".cell").first().data('cell');
            active_view_name = Jupyter.notebook.metadata.extensions.jupyter_dashboards.activeView;

            if (!cell) {
                return;
            }

            if (cell.metadata.extensions.jupyter_dashboards.views[active_view_name].hidden) {
                $(item.el).addClass('grid-stack-item-hidden');
                grid.removeWidget(item.el, false);
                return;
            }
            if ((cell.cell_type === "code" &&
                cell.input_prompt_number !== undefined &&
                cell.output_area.outputs.length === 0) ||
                cell.cell_type === "raw" ) {

                cell.metadata.extensions.jupyter_dashboards.views[active_view_name] = { hidden: true };
                $(item.el).addClass('grid-stack-item-hidden');
                grid.removeWidget(item.el, false);
            }
        });
    }

    /*
     * Adds listener on grid to save Notebook when a gridstack element change size or position
     * @param {gridstack object} grid: GridStack object returned by Gridstack.init()
     */
    function on_change(grid) {
        const handleChange = (event, items) => {
            if (!items) {
              return;
            }
            items.forEach( function (item) {
                // get notebook cell
                cell = $(item.el).find(".cell").first().data('cell');
                if (!cell) {
                    return;
                }

                var views = cell.metadata.extensions.jupyter_dashboards.views;
                active_view_name = Jupyter.notebook.metadata.extensions.jupyter_dashboards.activeView;

                // keep only the "hidden" field if hidden
                if (views[active_view_name].hidden) {
                    views[active_view_name] = { hidden: true };
                    return;
                }

                gridstack_meta = views[active_view_name];

                // modify cell's gridstack metadata
                gridstack_meta.col = item.x;
                gridstack_meta.row = item.y;
                gridstack_meta.width = item.w;
                gridstack_meta.height = item.h;
            });

            hide_elements(grid);
            Jupyter.notebook.save_notebook();
        };

        grid.on('added', handleChange);
        grid.on('change', handleChange);
        grid.on('removed', handleChange);

        // fill initial sizes and positions
        grid._triggerEvent("change", grid.engine.nodes);
    }

    /*
     * Waiting function used to wait for all cells executed
     */
    function wait(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    /*
     * Wait for all cells executed using HTML class, and update loading text
     */
    async function wait_for_all_cells_executed() {
        while ( ! all_cells_executed() ) {
            code_cells_count = $(".code_cell").length;
            remaining_code_cells = code_cells_count - $(".code_cell.running").length + 1;
            $('#loading_text').text(`Running code cell ${remaining_code_cells} / ${code_cells_count}...`);
            await wait(100);
        }
        return;
    }

    function all_cells_executed() {
        return $(".cell.running").length == 0;
    }

    return {metadata_keys: gridstack_metadata_keys,
            init_metadata: init_metadata,
            init_on_change: on_change,
            wait_for_all_cells_executed: wait_for_all_cells_executed,
            hide_elements: hide_elements
            };
});
