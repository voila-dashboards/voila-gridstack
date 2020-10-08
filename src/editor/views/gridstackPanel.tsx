import { NotebookPanel } from '@jupyterlab/notebook';

import { Cell } from '@jupyterlab/cells';

import { IDragEvent } from '@lumino/dragdrop';

import { Widget } from '@lumino/widgets';

import { Message } from '@lumino/messaging';

import { GridStack, GridHTMLElement, GridStackNode } from 'gridstack';

import 'gridstack/dist/gridstack.css';

import { GridItem } from './../components/gridItem';

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
  constructor(cells: Map<string, GridItem>) {
    super();
    this.removeClass('lm-Widget');
    this.removeClass('p-Widget');
    this.addClass('grid-editor');

    this._cells = cells;
  }

  dispose(): void {
    //console.debug('Dispose GridStackPanel');
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
        console.info('scroll');
        // this._evtScroll(event);
        break;
      case 'lm-dragenter':
        console.info('dragenter');
        this._evtDragEnter(event as IDragEvent);
        break;
      case 'lm-dragleave':
        console.info('dragleave');
        this._evtDragLeave(event as IDragEvent);
        break;
      case 'lm-dragover':
        console.info('dragover');
        this._evtDragOver(event as IDragEvent);
        break;
      case 'lm-drop':
        console.info('drop');
        this._evtDrop(event as IDragEvent);
        break;
    }
  }

  onUpdateRequest(): void {
    //console.debug("onUpdateRequest grid:", this._grid);
    if (!this._grid) {
      this._initGridStack();
    }
    this._grid?.removeAll();

    this._cells.forEach((value: GridItem, key: string) => {
      //console.debug("ID grid panel: ", key);
      if (!value.info.views[this._info.activeView].hidden) {
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

        this._grid.addWidget(value.gridCell, options);
      }
    });
  }

  get info(): DasboardInfo {
    return this._info;
  }

  set info(info: DasboardInfo) {
    this._info = info;
  }

  private _initGridStack(): void {
    //console.debug("_initGridStack grid");
    const grid = document.createElement('div');
    grid.className = 'grid-stack';
    this.node.appendChild(grid);

    this._grid = GridStack.init(
      {
        float: true,
        removable: true,
        removeTimeout: 200,
        acceptWidgets: true,
        styleInHead: true,
        disableOneColumnMode: true,
        resizable: { autoHide: true, handles: 'e, se, s, sw, w' }
        // alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      },
      grid
    );

    this._grid.on(
      'change',
      (event: Event, items: GridHTMLElement | GridStackNode[]) => {
        // console.debug("change grid: ", items);
        this._onChange(event, items as GridStackNode[]);
      }
    );

    this._grid.on(
      'removed',
      (event: Event, items: GridHTMLElement | GridStackNode[]) => {
        // console.debug("removed grid: ", items);
        if ((items as GridStackNode[]).length <= 1) {
          this._onRemoved(event, items as GridStackNode[]);
        }
      }
    );

    this._grid.on(
      'dropped',
      (event: Event, items: GridHTMLElement | GridStackNode[]) => {
        console.debug('dropped grid: ', items);
        this._onDropped(event, items as GridStackNode);
      }
    );
  }

  private _onChange(event: Event, items: GridStackNode[]): void {
    items.forEach(el => {
      const cell = this._cells.get(el.id as string);
      if (cell !== undefined) {
        cell.info.views[this._info.activeView] = {
          hidden: false,
          col: el.x,
          row: el.y,
          width: el.width,
          height: el.height
        };
        this._cells.set(el.id as string, cell);
      }
    });
  }

  private _onRemoved(event: Event, items: GridStackNode[]): void {
    items.forEach(el => {
      const cell = this._cells.get(el.id as string);
      if (cell !== undefined) {
        cell.info.views[this._info.activeView].hidden = true;
        this._cells.set(el.id as string, cell);
      }
    });
  }

  private _onDropped(event: Event, item: GridStackNode): void {
    const cell = this._cells.get(item.id as string);
    if (cell !== undefined) {
      cell.info.views[this._info.activeView] = {
        hidden: false,
        col: null,
        row: null,
        width: 2,
        height: 2
      };
      this._cells.set(item.id as string, cell);
      this.update();
    }
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

    if (event.proposedAction === 'copy') {
      if (event.source.activeCell instanceof Cell) {
        const widget = (event.source.parent as NotebookPanel).content
          .activeCell;
        const cell = this._cells.get(widget.model.id);
        cell.info.views[this._info.activeView].hidden = false;
        this._cells.set(widget.model.id, cell);
        this.update();
      }
    } else {
      return;
    }

    this.removeClass('pr-DropTarget');
    this.update();
  }

  private _grid: GridStack;
  private _info: DasboardInfo;
  private _cells: Map<string, GridItem>;
}
