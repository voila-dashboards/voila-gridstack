import { NotebookPanel } from '@jupyterlab/notebook';

import { Cell } from '@jupyterlab/cells';

import { IDragEvent } from '@lumino/dragdrop';

import { Widget } from '@lumino/widgets';

import { Message } from '@lumino/messaging';

import { GridStack, GridHTMLElement, GridStackNode } from 'gridstack';

import 'gridstack/dist/gridstack.css';

import { GridItem } from './../components/gridItem';

export type DashboardInfo = {
  version: number;
  activeView: string;
  views: { [id: string]: DashboardView };
};

export type DashboardView = {
  name: string;
  type: string;
  cellMargin: number;
  cellHeight: number;
  numColumns: number;
};

export class GridStackPanel extends Widget {
  constructor() {
    super();
    this.addClass('grid-editor');

    this._cells = new Map<string, GridItem>();
  }

  dispose(): void {
    super.dispose();
    this._grid?.destroy();
    this._grid = null;
  }

  onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    this.node.addEventListener('lm-dragenter', this, true);
    this.node.addEventListener('lm-dragleave', this, true);
    this.node.addEventListener('lm-dragover', this, true);
    this.node.addEventListener('lm-drop', this, true);
    this.node.addEventListener('lm-dragend', this, true);
    this.node.addEventListener('scroll', this);
  }

  /**
   * Remove click listeners on detach
   */
  onBeforeDetach(msg: Message): void {
    super.onBeforeDetach(msg);
    this.node.removeEventListener('lm-dragenter', this, true);
    this.node.removeEventListener('lm-dragleave', this, true);
    this.node.removeEventListener('lm-dragover', this, true);
    this.node.removeEventListener('lm-drop', this, true);
    this.node.removeEventListener('scroll', this);
  }

  handleEvent(event: Event): void {
    switch (event.type) {
      case 'scroll':
        // this._evtScroll(event);
        break;
      case 'lm-dragenter':
        this._evtDragEnter(event as IDragEvent);
        break;
      case 'lm-dragleave':
        this._evtDragLeave(event as IDragEvent);
        break;
      case 'lm-dragover':
        this._evtDragOver(event as IDragEvent);
        break;
      case 'lm-drop':
        this._evtDrop(event as IDragEvent);
        break;
    }
  }

  onUpdateRequest(): void {
    /* this._cells.forEach((value: GridItem) => {
      if (!value.info.hidden) {
        this._updateGridItem(value);
      }
    }); */
  }

  get isReady(): boolean {
    return this._ready;
  }

  get info(): DashboardView {
    return this._info;
  }

  set info(info: DashboardView) {
    this._info = info;
    if (this._grid) {
      this._grid.margin(this._info.cellMargin);
      this._grid.cellHeight(this._info.cellHeight);
      this._grid.column(this._info.numColumns);
    }
  }

  public getCell(id: string): GridItem {
    //console.info('getCell');
    return this._cells.get(id);
  }

  public addCell(cell: GridItem): void {
    //console.info('addCell:', cell, cell.cellId);
    this._cells.set(cell.cellId, cell);
    if (!cell.info.hidden) {
      this._addGridItem(cell);
    }
  }

  public updateCell(cell: GridItem): void {
    //console.info('updateCell');
    this._cells.set(cell.cellId, cell);
    if (!cell.info.hidden) {
      this._updateGridItem(cell);
    }
  }

  public deleteCell(id: string): void {
    //console.info('deleteCell');
    const cell = this._cells.get(id);
    this._cells.delete(id);
    if (cell && !cell.info.hidden) {
      this._removeGridItem(cell);
    }
  }

  public initGridStack(): void {
    //console.info('initGridStack');
    const grid = document.createElement('div');
    grid.className = 'grid-stack';
    this.node.appendChild(grid);

    this._grid = GridStack.init(
      {
        float: true,
        column: this._info.numColumns,
        margin: this._info.cellMargin,
        cellHeight: this._info.cellHeight,
        styleInHead: true,
        disableOneColumnMode: true,
        resizable: { autoHide: true, handles: 'e, se, s, sw, w' },
        alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      },
      grid
    );

    this._ready = true;

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

  private _addGridItem(item: GridItem): void {
    const options = {
      id: item.cellId,
      x: item.info.col,
      y: item.info.row,
      width: item.info.width,
      height: item.info.height,
      autoPosition: false
    };

    if (item.info.row === null || item.info.col === null) {
      options['autoPosition'] = true;
    }

    item.closeSignal.connect(this._removeGridItem);
    this._grid.addWidget(item.gridCell(true), options);
  }

  private _updateGridItem(item: GridItem): void {
    this._grid.update(
      item.gridCell(false),
      item.info.col,
      item.info.row,
      item.info.width,
      item.info.height
    );
  }

  private _removeGridItem = (item: GridItem): void => {
    if (item) {
      item.info.hidden = true;
      item.closeSignal.disconnect(this._removeGridItem);
      this._grid.removeWidget(item.gridCell(false), true, false);
    }
  };

  private _onChange(event: Event, items: GridStackNode[]): void {
    items.forEach(el => {
      const cell = this._cells.get(el.id as string);
      if (cell) {
        cell.info = {
          hidden: false,
          col: el.x,
          row: el.y,
          width: el.width,
          height: el.height
        };
        //this._cells.set(el.id as string, cell);
      }
    });
  }

  private _onRemoved(event: Event, items: GridStackNode[]): void {
    items.forEach(el => {
      const cell = this._cells.get(el.id as string);
      if (cell) {
        cell.info.hidden = true;
        cell.closeSignal.disconnect(this._removeGridItem);
        //this._cells.set(el.id as string, cell);
      }
    });
  }

  /**
   * Handle the `'lm-dragenter'` event for the widget.
   */
  private _evtDragEnter(event: IDragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Handle the `'lm-dragleave'` event for the widget.
   */
  private _evtDragLeave(event: IDragEvent): void {
    this.removeClass('pr-DropTarget');
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Handle the `'lm-dragover'` event for the widget.
   */
  private _evtDragOver(event: IDragEvent): void {
    this.addClass('pr-DropTarget');
    event.dropAction = 'copy';
    event.preventDefault();
    event.stopPropagation();
  }

  private _evtDrop(event: IDragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (event.proposedAction !== 'copy') {
      return;
    }

    if (event.source.activeCell instanceof Cell) {
      const col = Math.floor(
        (this._grid.getColumn() * event.offsetX) / this.node.offsetWidth
      );
      const row = Math.floor(event.offsetY / this._grid.getCellHeight(true));

      const widget = (event.source.parent as NotebookPanel).content.activeCell;
      const cell = this._cells.get(widget.model.id);

      //console.info('_evtDrop:', cell, widget.model.id);

      if (cell && cell.info.hidden) {
        cell.info.hidden = false;
        cell.info.col = col;
        cell.info.row = row;
        //this._cells.set(cell.cellId, cell);
        this._addGridItem(cell);
      }
    }

    this.removeClass('pr-DropTarget');
  }

  private _ready: boolean;
  private _grid: GridStack;
  private _info: DashboardView;
  private _cells: Map<string, GridItem>;
}
