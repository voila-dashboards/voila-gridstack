import { Layout, Widget } from '@lumino/widgets';

import { IIterator, ArrayIterator } from '@lumino/algorithm';

import { Signal, ISignal } from '@lumino/signaling';

import { Message } from '@lumino/messaging';

import {
  GridStack,
  GridHTMLElement,
  GridStackNode,
  GridItemHTMLElement
} from 'gridstack';

import 'gridstack/dist/gridstack.css';

import { GridStackItem } from './gridstackItemWidget';

import { DashboardView, DashboardCellView } from './../format';

/**
 * A gridstack layout to host the visible Notebook's Cells.
 */
export class GridStackLayout extends Layout {
  /**
   * Construct a `GridStackLayout`.
   *
   * @param info - The `DashboardView` metadata.
   */
  constructor(info: DashboardView) {
    super();
    this._margin = info.cellMargin;
    this._cellHeight = info.defaultCellHeight;
    this._columns = info.maxColumns;

    this._gridItems = new Array<GridStackItem>();

    this._gridItemChanged = new Signal<this, GridStackNode[]>(this);
  }

  get gridItemChanged(): ISignal<this, GridStackNode[]> {
    return this._gridItemChanged;
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    this._gridItems = undefined;
    this._grid?.destroy();
    this._grid = undefined;
    super.dispose();
  }

  /**
   * Handle `update-request` messages sent to the widget.
   */
  protected onUpdateRequest(msg: Message) {
    const items = this._grid?.getGridItems();
    items?.forEach(item => {
      this._grid?.removeWidget(item, true, false);
      this._grid?.addWidget(item);
    });
  }

  /**
   * Handle `resize-request` messages sent to the widget.
   */
  protected onResize(msg: Message): void {
    this._grid?.onParentResize();
  }

  /**
   * Handle `fit-request` messages sent to the widget.
   */
  protected onFitRequest(msg: Message): void {
    this._grid?.onParentResize();
  }

  /**
   * Create an iterator over the widgets in the layout.
   */
  iter(): IIterator<Widget> {
    return new ArrayIterator(this._gridItems!);
  }

  /**
   * Remove a widget from the layout.
   *
   * @param widget - The `widget` to remove.
   */
  removeWidget(widget: Widget): void {
    return;
  }

  /* isReady(): boolean {
    return this._grid !== null;
  } */

  /**
   * Change gridstack's items margin.
   *
   * @param margin - The new margin.
   */
  setMargin(margin: number): void {
    if (this._margin !== margin) {
      this._margin = margin;
      this._grid?.margin(this._margin);
      this.parent!.update();
    }
  }

  /**
   * Get gridstack's cell height.
   *
   * @param forcePixel - An optional boolean.
   */
  getCellHeight(forcePixel?: boolean): number | undefined {
    return this._grid?.getCellHeight(forcePixel);
  }

  /**
   * Change the gridstack's cell height.
   *
   * @param height - The new height.
   */
  setCellHeight(height: number): void {
    if (this._cellHeight !== height) {
      this._cellHeight = height;
      this._grid?.cellHeight(this._cellHeight);
      this.parent!.update();
    }
  }

  /**
   * Get gridstack's number of columns.
   */
  getColumn(): number | undefined {
    return this._grid?.getColumn();
  }

  /**
   * Change the gridstack's number of columns.
   *
   * @param columns - The new number of columns.
   */
  setColumn(columns: number): void {
    if (this._columns !== columns) {
      this._columns = columns;
      this._grid?.column(columns);
      this.parent!.update();
    }
  }

  /**
   * Get the list of `GridStackItem` (Lumino widgets).
   */
  get gridWidgets(): Array<GridStackItem> {
    return this._gridItems!;
  }

  /**
   * Get the list of `GridItemHTMLElement`.
   */
  get gridItems(): GridItemHTMLElement[] | undefined {
    return this._grid?.getGridItems();
  }

  /**
   * Initialize gridstack.
   *
   * @param info - The dashboard metadata parameters.
   */
  initGridStack(info: DashboardView): void {
    this._margin = info.cellMargin;
    this._cellHeight = info.defaultCellHeight;
    this._columns = info.maxColumns;

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
      (event: Event, items: GridHTMLElement | GridStackNode[] | undefined) => {
        this._onChange(event, items as GridStackNode[]);
      }
    );

    this._grid.on(
      'removed',
      (event: Event, items: GridHTMLElement | GridStackNode[] | undefined) => {
        if ((items as GridStackNode[]).length <= 1) {
          this._onRemoved(event, items as GridStackNode[]);
        }
      }
    );
  }

  /**
   * Add new cell to gridstack.
   *
   * @param id - The Cell id.
   * @param item - The cell widget.
   * @param info - The dashboard cell metadata parameters.
   */
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

    this._gridItems?.push(item);
    this._grid?.addWidget(item.node, options);
  }

  /**
   * Update a cell from gridstack.
   *
   * @param id - The Cell id.
   * @param info - The dashboard cell metadata parameters.
   */
  updateGridItem(id: string, info: DashboardCellView): void {
    const items = this._grid?.getGridItems();
    const item = items?.find(value => value.gridstackNode?.id === id);
    this._grid!.update(item!, info.col, info.row, info.width, info.height);
  }

  /**
   * Remove a cell from gridstack.
   *
   * @param id - The Cell id.
   */
  removeGridItem(id: string): void {
    const items = this._grid?.getGridItems();
    const item = items?.find(value => value.gridstackNode?.id === id);

    if (item) {
      this._gridItems = this._gridItems?.filter(obj => obj.cellId !== id);
      this._grid?.removeWidget(item, true, false);
    }
  }

  /**
   * Handle change-event messages sent to from gridstack.
   */
  private _onChange(event: Event, items: GridStackNode[]): void {
    if (items) {
      this._gridItemChanged.emit(items);
    }
  }

  /**
   * Handle remove event messages sent from gridstack.
   */
  private _onRemoved(event: Event, items: GridStackNode[]): void {
    items.forEach(el => {
      //this._model.hideCell(el.id as string);
    });
  }

  private _margin: number;
  private _cellHeight: number;
  private _columns: number;
  private _grid: GridStack | undefined = undefined;
  private _gridItems: Array<GridStackItem> | undefined = undefined;
  private _gridItemChanged: Signal<this, GridStackNode[]>;
}
