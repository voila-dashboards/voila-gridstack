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
  function($, Jupyter, gridstack, widgets) {
    const metadataKeys = ['extensions', 'jupyter_dashboards'];
    let activeViewName = 'grid_default';
    let version = 1;
    let activeView = undefined;
    let grid = undefined;

    /*
     * Init nested metadata for Notebook level and cells level
     */
    function initMetadata(cellWidgets) {
      let nbMetadata = Jupyter.notebook.metadata;
      metadataKeys.forEach( key => {
        if (!nbMetadata[key]) nbMetadata[key] = Object();
        nbMetadata = nbMetadata[key];
      });

      if (!nbMetadata.version) {
        nbMetadata.version = 1;
        nbMetadata.activeView = 'grid_default';
        nbMetadata.views = {
          'grid_default': {
            'name': 'grid',           // user-assigned, unique human readable name
            'type': 'grid',           // layout algorithm to use (grid in this example view)
            'cellMargin': 10,         // margin between cells in pixels
            'defaultCellHeight': 40,  // height in pixels of a logical row
            'maxColumns': 12          // total number of logical columns
          }
        };
      }

      nbMetadata.activeView = 'grid_default';
      activeViewName = "grid_default";
      version = nbMetadata.version;
      activeView = nbMetadata.views[activeViewName];

      Object.values(cellWidgets).forEach( cellWidget => {
        let cellMetadata = $(cellWidget).data("cell").metadata;
        metadataKeys.forEach( key => {
          if (!cellMetadata[key]) cellMetadata[key] = Object();
          cellMetadata = cellMetadata[key];
        });

        if (!cellMetadata.version) {
          cellMetadata.version = version;
          cellMetadata.views = {};
          cellMetadata.views[activeViewName] = {
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
        draggable: {
          handle: '.gridhandle'
        }
      },
      gridElement
      );

      //  bqplot doesn't resize when resizing the tile, fix: fake a resize event
      /* grid.on('resizestop', (event, elem) => {
        window.dispatchEvent(new Event('resize'));
      }); */

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
        const metadata = cell.metadata.extensions.jupyter_dashboards.views[activeViewName];

        if (!metadata.hidden) {
          const item = document.createElement('div');
          item.className = 'grid-stack-item';
          const content = document.createElement('div');
          content.className = 'grid-stack-item-content';
          content.innerHTML = '<div class="gridhandle"><i class="fa"></i></div>';

          //widgets.Widget.attach(cellWidget.cloneNode(true), content);

          content.appendChild(cellWidget.cloneNode(true));
          item.appendChild(content);

          grid.addWidget(item, {
            id: cell.cell_id,
            x: metadata.col,
            y: metadata.row,
            width: metadata.width,
            height: metadata.height
          });

          // Trying to trigger bqplot resize event or get bqplot.Figure
          // and call figure.update_plotarea_dimensions();
          const bqplot =  $(item).find(".bqplot");
          //console.debug(bqplot);
          if (bqplot.length > 0 ) {
            bqplot[0].dispatchEvent(new Event('resize'));
            //bqplot[0].update_plotarea_dimensions();
            //const figure =  $(bqplot[0]).data("figure");
            //console.debug(figure);
          }
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
          cell.metadata.extensions.jupyter_dashboards.views[activeViewName].hidden = true;
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
        cell.metadata.extensions.jupyter_dashboards.views[activeViewName] = {
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
