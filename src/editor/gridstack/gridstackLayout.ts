import { Layout, Widget } from '@lumino/widgets';

import { IIterator, ArrayIterator } from '@lumino/algorithm';

import { Signal } from '@lumino/signaling';

import {
  GridStack,
  GridHTMLElement,
  GridStackNode,
  GridItemHTMLElement
} from 'gridstack';

import 'gridstack/dist/gridstack.css';

import { GridStackItem } from './gridstackItemWidget';

import { DashboardView, DashboardCellView } from './../format';

export class GridStackLayout extends Layout {
  constructor(info: DashboardView) {
    super();
    this._margin = info.cellMargin;
    this._cellHeight = info.cellHeight;
    this._columns = info.numColumns;

    this._gridItems = new Array<GridStackItem>();

    this.gridItemChanged = new Signal<this, GridStackNode[]>(this);
  }

  readonly gridItemChanged: Signal<this, GridStackNode[]>;

  dispose(): void {
    this._gridItems = null;
    this._grid?.destroy();
    this._grid = null;
    super.dispose();
  }

  onResize(): void {
    if (this._grid) {
      this._grid.onParentResize();
    }
  }

  onFitRequest(): void {
    if (this._grid) {
      this._grid.onParentResize();
    }
  }

  iter(): IIterator<Widget> {
    return new ArrayIterator(this._gridItems);
  }

  removeWidget(widget: Widget): void {
    return;
  }

  isReady(): boolean {
    return this._grid !== null;
  }

  setMargin(margin: number): void {
    if (this._margin !== margin) {
      this._margin = margin;
      this._grid.margin(this._margin);
    }
  }

  getCellHeight(forcePixel?: boolean): number {
    return this._grid.getCellHeight(forcePixel);
  }

  setCellHeight(height: number): void {
    if (this._cellHeight !== height) {
      this._cellHeight = height;
      this._grid.cellHeight(this._cellHeight);
    }
  }

  getColumn(): number {
    return this._grid.getColumn();
  }

  setColumn(columns: number): void {
    if (this._columns !== columns) {
      this._columns = columns;
      this._grid.column(columns);
    }
  }

  get gridWidgets(): Array<GridStackItem> {
    return this._gridItems;
  }

  get gridItems(): GridItemHTMLElement[] {
    return this._grid.getGridItems();
  }

  initGridStack(info: DashboardView): void {
    this._margin = info.cellMargin;
    this._cellHeight = info.cellHeight;
    this._columns = info.numColumns;

    const grid = document.createElement('div');
    grid.className = 'grid-stack';
    this.parent!.node.appendChild(grid);

    this._grid = GridStack.init(
      {
        float: true,
        column: this._columns,
        margin: this._margin,
        cellHeight: this._cellHeight,
        styleInHead: true,
        disableOneColumnMode: true,
        draggable: { handle: '.grid-item-toolbar' },
        resizable: { autoHide: true, handles: 'e, se, s, sw, w' },
        alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
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
        if ((items as GridStackNode[]).length <= 1) {
          this._onRemoved(event, items as GridStackNode[]);
        }
      }
    );
  }

  addGridItem(id: string, item: GridStackItem, info: DashboardCellView): void {
    const options = {
      id,
      x: info.col,
      y: info.row,
      width: info.width,
      height: info.height,
      autoPosition: false
    };

    if (info.row === null || info.col === null) {
      options['autoPosition'] = true;
    }

    this._gridItems.push(item);
    this._grid.addWidget(item.node, options);
  }

  updateGridItem(id: string, info: DashboardCellView): void {
    const items = this._grid.getGridItems();
    const item = items.find(value => value.gridstackNode.id === id);
    this._grid.update(item, info.col, info.row, info.width, info.height);
  }

  removeGridItem(id: string): void {
    const items = this._grid.getGridItems();
    const item = items.find(value => value.gridstackNode.id === id);

    if (item) {
      this._gridItems = this._gridItems.filter(obj => obj.cellId !== id);
      this._grid.removeWidget(item, true, false);
    }
  }

  private _onChange(event: Event, items: GridStackNode[]): void {
    if (items) {
      this.gridItemChanged.emit(items);
    }
  }

  private _onRemoved(event: Event, items: GridStackNode[]): void {
    items.forEach(el => {
      //this._model.hideCell(el.id as string);
    });
  }

  private _margin: number;
  private _cellHeight: number;
  private _columns: number;
  private _grid: GridStack = null;
  private _gridItems: Array<GridStackItem> = null;
}
