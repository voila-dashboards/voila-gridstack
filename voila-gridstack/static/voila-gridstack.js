/***************************************************************************
* Copyright (c) 2018, Voila contributors                                   *
*                                                                          *
* Distributed under the terms of the BSD 3-Clause License.                 *
*                                                                          *
* The full license is in the file LICENSE, distributed with this software. *
****************************************************************************/
define(
  [
    'jquery',
    'base/js/namespace',
    'nbextensions/voila-gridstack/gridstack'
  ],
  function($, Jupyter, gridstack) {

    const metadataKeys = ['extensions', 'jupyter_dashboards'];
    let activeView = undefined;
    let grid = undefined;

    /*
     * Init nested metadata for Notebook level and cells level
     */
    function initMetadata(cellWidgets) {
      let metadata = Jupyter.notebook.metadata;
      metadataKeys.forEach( key => {
        if (!metadata[key]) metadata[key] = Object();
        metadata = metadata[key];
      });

      if (!metadata.version) {
        metadata.version = 1;
        metadata.activeView = 'default_view';
        metadata.views = {
          'default_view': {
            'name': 'default_view',    // user-assigned, unique human readable name
            'type': 'grid',           // layout algorithm to use (grid in this example view)
            'cellMargin': 10,         // margin between cells in pixels
            'defaultCellHeight': 40,  // height in pixels of a logical row
            'maxColumns': 12          // total number of logical columns
          }
        };
      }

      activeView = metadata.views[metadata.activeView];
      activeView.name = "grid_default";
      
      Object.values(cellWidgets).forEach( cellWidget => {
        let metadata = $(cellWidget).data("cell").metadata;
        metadataKeys.forEach( key => {
          if (!metadata[key]) metadata[key] = Object();
          metadata = metadata[key];
        });

        if (!metadata.version) {
          metadata.version = nbMetadata.version;
          metadata.views = {};
          metadata.views[activeView.name] = {
            'hidden': false,      // if cell output+widget are visible in the layout
            "row": 0,             // logical row position
            "col": 0,             // logical column position
            "width": 2,           // logical width
            "height": 2           // logical height
          };
        }
      });
    }

    function initGridStack(gridElement, cellWidgets) {
      // init GridStack
      grid = gridstack.init({
        //float: true,
        alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        resizable: {
          handles: 'e, se, s, sw, w',
          autoHide: true
        },
        disableOneColumnMode: true,
        cellHeight: activeView.defaultCellHeight,
        margin: activeView.cellMargin,
        column: activeView.maxColumns,
      },
      gridElement
      );

      //  bqplot doesn't resize when resizing the tile, fix: fake a resize event
      grid.on('resizestop', (event, elem) => {
        window.dispatchEvent(new Event('resize'));
      });

      grid.on('change', (event, items) => {
        on_change(event, items, cellWidgets);
      });
    }

    function removeGridStack() {
      grid.destroy();
    }

    function addCells(cellWidgets) {
      Object.values(cellWidgets).forEach( cellWidget => {
        const cell =  $(cellWidget).data("cell");
        const metadata = cell.metadata.extensions.jupyter_dashboards.views[activeView.name];

        if (!metadata.hidden) {
          const item = document.createElement('div');
          item.className = 'grid-stack-item';
          const content = document.createElement('div');
          content.className = 'grid-stack-item-content';

          content.appendChild(cellWidget.cloneNode(true));
          item.appendChild(content);

          grid.addWidget(item, {
            id: cell.cell_id,
            x: metadata.col,
            y: metadata.row,
            width: metadata.width,
            height: metadata.height
          });
        }
      });
    }

    /*
     * Hides code cells with empty output and raw text cells
     * @param {gridstack object} grid: GridStack object returned by Gridstack.init()
     */
    function hideCells(cellWidgets) {
      Object.values(cellWidgets).forEach( cellWidget => {
        const cell = $(cellWidget).data("cell");
        
        if (
          cell.cell_type === "raw" ||
          (
            cell.cell_type === "code" &&
            cell.input_prompt_number !== undefined &&
            cell.output_area.outputs.length === 0
          )
        ) {
          cell.metadata.extensions.jupyter_dashboards.views[activeView.name].hidden = true;
        }
      });
    }

    /*
     * Adds listener on grid to save Notebook when a gridstack element change size or position
     * @param {gridstack object} grid: GridStack object returned by Gridstack.init()
     */
    function on_change(event, items, cellWidgets) {
      items.forEach( item => {
        const cell = $(cellWidgets[item.id]).data("cell");
        cell.metadata.extensions.jupyter_dashboards.views[activeView.name] = {
          'hidden': false,        // if cell output+widget are visible in the layout
          "row": item.y,          // logical row position
          "col": item.x,          // logical column position
          "width": item.width,    // logical width
          "height": item.height   // logical height
        };
      });

      Jupyter.notebook.save_notebook();
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

    return {
      metadata_keys: metadataKeys,
      initMetadata: initMetadata,
      initGridStack: initGridStack,
      removeGridStack: removeGridStack,
      hideCells: hideCells,
      addCells: addCells,
      init_on_change: on_change,
      wait_for_all_cells_executed: wait_for_all_cells_executed
    };
  }
);
