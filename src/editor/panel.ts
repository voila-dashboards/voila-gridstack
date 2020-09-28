import { INotebookModel } from '@jupyterlab/notebook';

import { Context } from '@jupyterlab/docregistry';

import * as nbformat from '@jupyterlab/nbformat';

import { ReadonlyPartialJSONValue } from '@lumino/coreutils';

import { Widget } from '@lumino/widgets';

import { GridStack, GridStackNode, GridHTMLElement } from 'gridstack';

import Cell from './components/cell';

import 'gridstack/dist/gridstack.css';

type DasboardInfo = {
  version: number;
  activeView: string;
  views: { [id: string]: DasboardView };
};

type DasboardView = {
  name: string;
  type: string;
  cellMargin: number;
  cellHeight: number;
  numColumns: number;
};

type DasboardCellInfo = {
  version: number;
  views: { [id: string]: DasboardCellView };
};

type DasboardCellView = {
  hidden: boolean;
  row: number;
  col: number;
  width: number;
  height: number;
};

export default class EditorPanel extends Widget {
  constructor(context: Context<INotebookModel>) {
    super();
    this._context = context;
    this._context.model.stateChanged.connect(() => {
      this._stateChanged();
    });

    this.addClass('grid-panel');

    this._cells = new Map<string, { info: DasboardCellInfo; cell: Cell }>();
  }

  dispose(): void {
    super.dispose();
    this._cells = null;
    this._grid = null;
  }

  onUpdateRequest(): void {
    this._grid?.destroy();

    const grid = document.createElement('div');
    grid.className = 'grid-stack';
    this.node.append(grid);

    this._grid = GridStack.init({
      animate: true,
      removable: true,
      removeTimeout: 500,
      styleInHead: true,
      disableOneColumnMode: true,
      resizable: { autoHide: true, handles: 'e, se, s, sw, w' }
      //alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    });

    this._grid.on('change', this._onChange.bind(this));
    this._grid.on('removed', this._onRemove.bind(this));
    this._grid.on('dropped', this._onDropped.bind(this));

    this._cells.forEach(
      (value: { info: DasboardCellInfo; cell: Cell }, key: string) => {
        if (!value.info.views[this._dashboard.activeView].hidden) {
          const widget = document.createElement('div');
          widget.className = 'grid-stack-item';
          widget.append(value.cell.node);

          const view: DasboardCellView =
            value.info.views[this._dashboard.activeView];
          const options = {
            id: key,
            x: view.col,
            y: view.row,
            width: view.width,
            height: view.height,
            autoPosition: false
          };

          if (!view.row || !view.col) {
            options['autoPosition'] = true;
          }

          this._grid.addWidget(widget, options);
          value.cell.update();
        }
      }
    );
  }

  private _stateChanged(): void {
    console.log('stateChanged');
    const language_info = this._context.model.metadata.get(
      'language_info'
    ) as nbformat.ILanguageInfoMetadata;
    const data = this._context.model.metadata.get('extensions') as Record<
      string,
      any
    >;

    if (data && data.jupyter_dashboards) {
      this._dashboard = data['jupyter_dashboards'] as DasboardInfo;
    } else {
      this._dashboard = {
        version: 1,
        activeView: 'grid_default',
        views: {
          grid_default: {
            name: 'grid',
            type: 'grid',
            cellMargin: 1,
            cellHeight: 1,
            numColumns: 12
          }
        }
      };
    }

    for (let i = 0; i < this._context.model.cells?.length; i++) {
      const cell = this._context.model.cells.get(i);
      const data = cell.metadata.get('extensions') as Record<string, any>;

      let info: DasboardCellInfo = {
        version: 1,
        views: {
          grid_default: {
            hidden: true,
            row: null,
            col: null,
            width: 1,
            height: 1
          }
        }
      };

      if (data && data.jupyter_dashboards) {
        info = data['jupyter_dashboards'] as DasboardCellInfo;
      }

      this._cells.set(cell.id, { info, cell: new Cell(cell, language_info) });
    }

    this.update();
  }

  private _onChange(
    event: Event,
    items: GridHTMLElement | GridStackNode[]
  ): void {
    // TODO: fix casts
    (items as GridStackNode[]).forEach(el => {
      const cell = this._cells.get(el.id as string);
      cell.info.views[this._dashboard.activeView] = {
        hidden: false,
        col: el.x,
        row: el.y,
        width: el.width,
        height: el.height
      };
    });
  }

  private _onRemove(
    event: Event,
    items: GridHTMLElement | GridStackNode[]
  ): void {
    // TODO: fix casts
    (items as GridStackNode[]).forEach(el => {
      console.log('Removed:', el);
      const cell = this._cells.get(el.id as string);
      cell.info.views[this._dashboard.activeView] = {
        hidden: true,
        col: el.x,
        row: el.y,
        width: el.width,
        height: el.height
      };
    });
  }

  private _onDropped(
    event: Event,
    items: GridHTMLElement | GridStackNode[]
  ): void {
    // TODO: fix casts
    const widgets = items as GridStackNode[];
    const [previousWidget, newWidget] = widgets;
    console.log('Removed widget that was dragged out of grid:', previousWidget);
    console.log('Added widget in dropped grid:', newWidget);
  }

  save(): void {
    const data = this._context.model.metadata.get('extensions') as Record<
      string,
      any
    >;

    if (data) {
      data['jupyter_dashboards'] = this._dashboard;
      this._context.model.metadata.set(
        'extensions',
        data as ReadonlyPartialJSONValue
      );
    } else {
      const data = { jupyter_dashboards: this._dashboard };
      this._context.model.metadata.set(
        'extensions',
        data as ReadonlyPartialJSONValue
      );
    }

    for (let i = 0; i < this._context.model.cells?.length; i++) {
      const cell = this._context.model.cells.get(i);
      const data = cell.metadata.get('extensions') as Record<string, any>;

      if (data) {
        data['jupyter_dashboards'] = this._cells.get(cell.id).info;
        cell.metadata.set('extensions', data as ReadonlyPartialJSONValue);
        this._context.model.cells.set(i, cell);
      } else {
        const data = { jupyter_dashboards: this._cells.get(cell.id).info };
        cell.metadata.set('extensions', data as ReadonlyPartialJSONValue);
        this._context.model.cells.set(i, cell);
      }
    }

    this._context.save();
  }

  private _grid: GridStack;
  private _dashboard: DasboardInfo;
  private _context: Context<INotebookModel>;
  private _cells: Map<string, { info: DasboardCellInfo; cell: Cell }>;
}
