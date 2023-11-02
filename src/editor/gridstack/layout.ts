import { Layout, Widget } from '@lumino/widgets';

import { Signal, ISignal } from '@lumino/signaling';

import { Message, MessageLoop } from '@lumino/messaging';

import { GridStack, GridStackNode, GridItemHTMLElement } from 'gridstack';

import { GridStackItemWidget } from '../item';

import { DashboardView, DashboardCellView } from '../format';

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

    this._helperMessage = document.createElement('div');
    this._helperMessage.appendChild(document.createElement('p')).textContent =
      'Drag and drop cells here to start building the dashboard.';
    this._helperMessage.className = 'jp-grid-helper';

    this._gridHost = document.createElement('div');
    this._gridHost.className = 'grid-stack';

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
        alwaysShowResizeHandle:
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          ),
      },
      this._gridHost
    );

    this._updateBackgroundSize();

    this._grid.on(
      'change',
      (
        event: Event,
        items?: GridItemHTMLElement | GridStackNode | GridStackNode[]
      ) => {
        this._onChange(event, items as GridStackNode[]);
      }
    );

    this._grid.on(
      'removed',
      (
        event: Event,
        items?: GridItemHTMLElement | GridStackNode | GridStackNode[]
      ) => {
        if ((items as GridStackNode[]).length <= 1) {
          this._onRemoved(event, items as GridStackNode[]);
        }
      }
    );

    this._grid.on(
      'resize',
      (
        event: Event,
        item?: GridItemHTMLElement | GridStackNode | GridStackNode[]
      ) => {
        if (item && (item as GridItemHTMLElement).gridstackNode) {
          this._onResize(event, (item as GridItemHTMLElement).gridstackNode!);
        }
      }
    );

    this._grid.on('resizestop', (event: Event, elem: GridItemHTMLElement) => {
      window.dispatchEvent(new Event('resize'));
    });
  }

  get gridItemChanged(): ISignal<this, GridStackNode[]> {
    return this._gridItemChanged;
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    this._grid.destroy();
    super.dispose();
  }

  /**
   * Init the gridstack layout
   */
  init(): void {
    super.init();
    this.parent!.node.appendChild(this._gridHost);
    // fake window resize event to resize bqplot
    window.dispatchEvent(new Event('resize'));
  }

  /**
   * Handle `update-request` messages sent to the widget.
   */
  protected onUpdateRequest(msg: Message): void {
    const items = this._grid?.getGridItems();
    items?.forEach((item) => {
      this._grid.removeWidget(item, true, false);
      this._grid.addWidget(item);
    });
  }

  /**
   * Handle `resize-request` messages sent to the widget.
   */
  protected onResize(msg: Message): void {
    // Using timeout to wait until the resize stop
    // rerendering all the widgets every time uses
    // too much resources
    clearTimeout(this._resizeTimeout);
    this._resizeTimeout = setTimeout(this._onResizeStops, 500);
    this._prepareGrid();
  }

  /**
   * Handle `fit-request` messages sent to the widget.
   */
  protected onFitRequest(msg: Message): void {
    this._prepareGrid();
  }

  /**
   * Create an iterator over the widgets in the layout.
   *
   * @returns A new iterator over the widgets in the layout.
   */
  *[Symbol.iterator](): IterableIterator<Widget> {
    for (const item of this._gridItems) {
      yield item;
    }
  }

  /**
   * Remove a widget from the layout.
   *
   * @param widget - The `widget` to remove.
   */
  removeWidget(widget: Widget): void {
    return;
  }

  /**
   * Get gridstack's items margin.
   */
  get margin(): number {
    return this._margin;
  }

  /**
   * Change gridstack's items margin.
   *
   * @param margin - The new margin.
   */
  set margin(margin: number) {
    if (this._margin !== margin) {
      this._margin = margin;
      this._grid.margin(this._margin);
      this.parent!.update();
    }
  }

  /**
   * Get gridstack's cell height.
   *
   * @param forcePixel - An optional boolean.
   */
  get cellHeight(): number {
    return this._grid.getCellHeight(true) ?? this._cellHeight;
  }

  /**
   * Change the gridstack's cell height.
   *
   * @param height - The new height.
   */
  set cellHeight(height: number) {
    if (this._cellHeight !== height) {
      this._cellHeight = height;
      this._grid.cellHeight(this._cellHeight);
      this._updateBackgroundSize();
      this.parent!.update();
    }
  }

  /**
   * Get gridstack's number of columns.
   */
  get columns(): number {
    return this._columns;
  }

  /**
   * Change the gridstack's number of columns.
   *
   * @param columns - The new number of columns.
   */
  set columns(columns: number) {
    if (this._columns !== columns) {
      this._columns = columns;
      this._grid.column(columns);
      this._updateBackgroundSize();
      this.parent!.update();
    }
  }

  /**
   * Helper to get access to underlying GridStack object
   */
  get grid(): GridStack {
    return this._grid;
  }

  /**
   * Get the list of `GridStackItem` (Lumino widgets).
   */
  get gridWidgets(): Array<GridStackItemWidget> {
    return this._gridItems;
  }

  /**
   * Get the list of `GridItemHTMLElement`.
   */
  get gridItems(): GridItemHTMLElement[] {
    return this._grid.getGridItems() ?? [];
  }

  /**
   * Add new cell to gridstack.
   *
   * @param id - The Cell id.
   * @param item - The cell widget.
   * @param info - The dashboard cell metadata parameters.
   */
  addGridItem(
    id: string,
    item: GridStackItemWidget,
    info: DashboardCellView
  ): void {
    const options = {
      id,
      x: info.col,
      y: info.row,
      width: info.width,
      height: info.height,
      locked: info.locked,
      autoPosition: false,
    };

    if (info.row === null || info.col === null) {
      options['autoPosition'] = true;
    }

    this._gridItems.push(item);

    if (this._gridItems.length === 1) {
      this.parent!.node.removeChild(this._helperMessage);
    }

    MessageLoop.sendMessage(item, Widget.Msg.BeforeAttach);
    this._grid.addWidget(item.node, options);
    MessageLoop.sendMessage(item, Widget.Msg.AfterAttach);
    this.updateGridItem(id, info);
  }

  /**
   * Update a cell from gridstack.
   *
   * @param id - The Cell id.
   * @param info - The dashboard cell metadata parameters.
   */
  updateGridItem(id: string, info: DashboardCellView): void {
    const items = this._grid.getGridItems();
    const item = items?.find((value) => value.gridstackNode?.id === id);
    this._grid.update(item!, {
      x: info.col,
      y: info.row,
      w: info.width,
      h: info.height,
      locked: info.locked,
    });
  }

  /**
   * Remove a cell from gridstack.
   *
   * @param id - The Cell id.
   */
  removeGridItem(id: string): void {
    const items = this._grid.getGridItems();
    const item = items?.find((value) => value.gridstackNode?.id === id);

    if (item) {
      this._gridItems = this._gridItems.filter((obj) => obj.cellId !== id);
      this._grid.removeWidget(item, true, false);
    }

    if (this._gridItems.length === 0) {
      this._gridHost.insertAdjacentElement('beforebegin', this._helperMessage);
    }
  }

  /**
   * Handle change-event messages sent to from gridstack.
   */
  private _onChange(event: Event, items: GridStackNode[]): void {
    this._gridItemChanged.emit(items ?? []);
  }

  /**
   * Handle remove event messages sent from gridstack.
   */
  private _onRemoved(event: Event, items: GridStackNode[]): void {
    items.forEach((el) => {
      //this._model.hideCell(el.id as string);
    });
  }

  /**
   * Handle resize event messages sent from gridstack.
   */
  private _onResize(event: Event, item: GridStackNode): void {
    const widget = this._gridItems.find((value) => value.cellId === item.id);
    if (widget) {
      MessageLoop.sendMessage(widget, Widget.Msg.UpdateRequest);
    }
  }

  /**
   * Handle resize-stop event messages in the layout.
   */
  private _onResizeStops = (): void => {
    this._gridItems.forEach((item) => {
      MessageLoop.sendMessage(item, Widget.Msg.UpdateRequest);
    });
  };

  /**
   * Update background size style to fit new grid parameters
   */
  private _updateBackgroundSize(): void {
    this._gridHost.style.backgroundSize = `100px ${this.cellHeight}px, calc(100% / ${this.columns} + 0px) 100px, 20px 20px, 20px 20px`;
  }

  private _prepareGrid(): void {
    const rect = this.parent!.node.getBoundingClientRect();
    this._gridHost.style.minHeight = `${rect.height}px`;
    if (this._gridItems.length === 0) {
      const size = this._helperMessage.getBoundingClientRect();
      const height = size.height === 0 ? 18 : size.height;
      const width = size.width === 0 ? 350 : size.width;
      this._helperMessage.style.top = `${(rect.height - height) / 2}px`;
      this._helperMessage.style.left = `${(rect.width - width) / 2}px`;
      this._gridHost.insertAdjacentElement('beforebegin', this._helperMessage);
    }
    this._grid.onParentResize();
  }

  private _margin: number;
  private _cellHeight: number;
  private _columns: number;
  private _gridHost: HTMLElement;
  private _grid: GridStack;
  private _gridItems: GridStackItemWidget[] = [];
  private _gridItemChanged = new Signal<this, GridStackNode[]>(this);
  private _helperMessage: HTMLElement;
  private _resizeTimeout = 0;
}
