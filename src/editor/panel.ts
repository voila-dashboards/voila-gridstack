import { ReadonlyPartialJSONValue } from '@lumino/coreutils';
import { INotebookModel } from '@jupyterlab/notebook';
import { Context } from "@jupyterlab/docregistry";
import { Widget } from '@lumino/widgets';

import * as nbformat from '@jupyterlab/nbformat';

import 'gridstack/dist/gridstack.css';
import GridStack from 'gridstack/dist/gridstack.all.js';

import Cell from './components/cell';

type DasboardInfo = {
  version: number,
  activeView: string,
  views: { [id: string]: DasboardView }
}

type DasboardView = {
  name: string,
  type: string,
  cellMargin: number,
  cellHeight: number,
  numColumns: number
}

type DasboardCellInfo = {
  version: number,
  views: { [id: string]: DasboardCellView }
}

type DasboardCellView = {
  hidden: boolean,
  row: number,
  col: number,
  width: number,
  height: number,
}

export default class EditorPanel extends Widget {
  private context: Context<INotebookModel>;

  private grid: GridStack;
  private cells: Map<string, { info: DasboardCellInfo, cell: Cell }>;

  private dasboard: DasboardInfo;

  constructor(context: Context<INotebookModel>) {
    super();
    this.context = context;
    this.context.model.stateChanged.connect( () => { this.stateChanged() });

    this.addClass('grid-panel');

    this.cells = new Map<string, { info: DasboardCellInfo, cell: Cell }>();
  }

  dispose(): void {
    super.dispose();
    this.cells = null;
    this.grid = null;
  }

  onUpdateRequest = () => {
    //console.debug("onUpdateRequest:", this.grid, this.cells);
    
    this.grid?.destroy();

    const grid = document.createElement('div');
    grid.className = 'grid-stack';
    this.node.append(grid);

    this.grid = GridStack.init({
      animate: true,
      removable: true,
      removeTimeout: 500,
      styleInHead: true,
      disableOneColumnMode: true,
      resizable: { autoHide: true, handles: 'e, se, s, sw, w' },
      //alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    });
    
    this.grid.on('change', this.onChange );
    this.grid.on('removed', this.onRemove );
    this.grid.on('dropped', this.onDropped );

    this.cells.forEach( (value: { info: DasboardCellInfo, cell: Cell }, key: string, ) => {
      if ( !value.info.views[this.dasboard.activeView].hidden ) { 
        const widget = document.createElement('div');
        widget.className = 'grid-stack-item';
        widget.append(value.cell.node);

        const view: DasboardCellView = value.info.views[this.dasboard.activeView];
        let options = {
          id: key,
          x: view.col,
          y: view.row,
          width: view.width,
          height: view.height
        };

        if ( !view.row || !view.col ) options['autoPosition'] = true;

        this.grid.addWidget( widget, options);
        value.cell.update();
      }
    });
  }

  stateChanged = (): void => {
    console.log("stateChanged");
    const language_info = this.context.model.metadata.get('language_info') as nbformat.ILanguageInfoMetadata;
    const data = this.context.model.metadata.get('extensions') as Object;

    if ( data && data.hasOwnProperty('jupyter_dashboards') ) {
      this.dasboard = data['jupyter_dashboards'] as DasboardInfo;
    } else {
      this.dasboard = {
        version: 1,
        activeView: "grid_default",
        views: { 
          grid_default: { name: "grid", type: "grid", cellMargin: 1, cellHeight: 1, numColumns: 12 }
        }
      }
    }

    for (let i = 0; i < this.context.model.cells?.length; i++) {
      const cell = this.context.model.cells.get(i);
      const data = cell.metadata.get('extensions') as Object;
      
      let info: DasboardCellInfo = {
        version: 1,
        views: {
          grid_default: { hidden: true, row: null, col: null, width: 1, height: 1 }
        }
      };
      
      if ( data && data.hasOwnProperty('jupyter_dashboards') )
        info = data['jupyter_dashboards'] as DasboardCellInfo;

      this.cells.set(cell.id, { info, cell: new Cell(cell, language_info) });
    }

    this.update();
  }

  onChange = (event: any, items: any[]) => {
    items.forEach( el => {
      const cell = this.cells.get(el.id);
      cell.info.views[this.dasboard.activeView] = { 
        hidden: false,
        col: el.x,
        row: el.y,
        width: el.width,
        height: el.height
      };
    });
  }

  onRemove = (event: Event, items: any[]) => {
    items.forEach( (el) => {
      console.log("Removed:", el);
      const cell = this.cells.get(el.id);
      cell.info.views[this.dasboard.activeView] = { 
        hidden: true,
        col: el.x,
        row: el.y,
        width: el.width,
        height: el.height
      };
    });
  }

  onDropped = (event: Event, previousWidget: any, newWidget: any) => {
    console.log('Removed widget that was dragged out of grid:', previousWidget);
    console.log('Added widget in dropped grid:', newWidget);
  }

  save = (): void => {
    const data = this.context.model.metadata.get('extensions') as Object;
    
    if (data) {
      data['jupyter_dashboards'] = this.dasboard;
      this.context.model.metadata.set('extensions', data as ReadonlyPartialJSONValue);
    } else {
      const data = { jupyter_dashboards: this.dasboard };
      this.context.model.metadata.set('extensions', data as ReadonlyPartialJSONValue);
    }


    for (let i = 0; i < this.context.model.cells?.length; i++) {
      const cell = this.context.model.cells.get(i);
      const data = cell.metadata.get('extensions') as Object;
      
      if ( data ) {
        data['jupyter_dashboards'] = this.cells.get(cell.id).info;
        cell.metadata.set('extensions', data as ReadonlyPartialJSONValue);
        this.context.model.cells.set(i, cell);
      } else {
        const data = { jupyter_dashboards: this.cells.get(cell.id).info };
        cell.metadata.set('extensions', data as ReadonlyPartialJSONValue);
        this.context.model.cells.set(i, cell);
      }
    }

    this.context.save();
  }

}