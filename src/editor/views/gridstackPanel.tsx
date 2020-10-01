import { Widget } from '@lumino/widgets';

import { GridStack, GridStackNode, GridHTMLElement } from 'gridstack';

import 'gridstack/dist/gridstack.css';

import { GridItem } from './../components/cell';

export type DasboardInfo = {
  version: number;
  activeView: string;
  views: { [id: string]: DasboardView };
};

export type DasboardView = {
  name: string;
  type: string;
  cellMargin: number;
  cellHeight: number;
  numColumns: number;
};

export class GridStackPanel extends Widget {
  constructor() {
    super();
    this.addClass('grid-panel');
    this._cells = new Map<string, GridItem>();
  }

  dispose(): void {
    // console.debug('Dispose grid');
    super.dispose();
    this._cells = null;
    this._grid = null;
  }

  get cells(): Map<string, GridItem> {
    return this._cells;
  }

  set cells(cells: Map<string, GridItem>) {
    this._cells = cells;
  }

  get info(): DasboardInfo {
    return this._info;
  }

  set info(info: DasboardInfo) {
    this._info = info;
  }

  onUpdateRequest(): void {
    this._grid?.destroy();

    const grid = document.createElement('div');
    grid.className = 'grid-stack';
    this.node.appendChild(grid);

    this._grid = GridStack.init(
      {
        animate: true,
        removable: true,
        removeTimeout: 500,
        styleInHead: true,
        disableOneColumnMode: true,
        resizable: { autoHide: true, handles: 'e, se, s, sw, w' }
        //alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      },
      grid
    );

    this._grid.on(
      'change',
      (event: Event, items: GridHTMLElement | GridStackNode[]) => {
        this._onChange(event, items as GridStackNode[]);
      }
    );

    this._grid.on(
      'removed',
      (event: Event, items: GridHTMLElement | GridStackNode[]) => {
        this._onRemove(event, items as GridStackNode[]);
      }
    );

    this._grid.on(
      'dropped',
      (event: Event, items: GridHTMLElement | GridStackNode[]) => {
        const previousWidget = items[0];
        const newWidget = items[1];
        this._onDropped(
          event,
          previousWidget as GridStackNode,
          newWidget as GridStackNode
        );
      }
    );

    this._cells.forEach((value: GridItem, key: string) => {
      if (!value.info.views[this._info.activeView].hidden) {
        const widget = document.createElement('div');
        widget.className = 'grid-stack-item';
        widget.append(value.node);

        const view = value.info.views[this._info.activeView];

        const options = {
          id: key,
          x: view.col,
          y: view.row,
          width: view.width,
          height: view.height,
          autoPosition: false
        };

        if (view.row === null || view.col === null) {
          options['autoPosition'] = true;
        }

        this._grid.addWidget(widget, options);
      }
    });
  }

  getItem(id: string): GridItem {
    return this._cells.get(id);
  }

  addItem(id: string, cell: GridItem): void {
    this._cells.set(id, cell);
    this.update();
  }

  removeItem(id: string): boolean {
    return this._cells.delete(id);
  }

  private _onChange(event: Event, items: GridStackNode[]): void {
    items.forEach(el => {
      console.debug('_onChange:', el);

      const cell = this._cells.get(el.id as string);
      cell.info.views[this._info.activeView] = {
        hidden: false,
        col: el.x,
        row: el.y,
        width: el.width,
        height: el.height
      };
      this._cells.set(el.id as string, cell);
    });
  }

  private _onRemove(event: Event, items: GridStackNode[]): void {
    items.forEach(el => {
      console.debug('_onRemove:', el);

      const cell = this._cells.get(el.id as string);
      cell.info.views[this._info.activeView] = {
        hidden: true,
        col: el.x,
        row: el.y,
        width: el.width,
        height: el.height
      };
      this._cells.set(el.id as string, cell);
    });
  }

  private _onDropped(
    event: Event,
    previousWidget: GridStackNode,
    newWidget: GridStackNode
  ): void {
    console.log('Removed widget that was dragged out of grid:', previousWidget);
    console.log('Added widget in dropped grid:', newWidget);
  }

  private _grid: GridStack;
  private _info: DasboardInfo;
  private _cells: Map<string, GridItem>;
}
