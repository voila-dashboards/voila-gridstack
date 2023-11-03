import { NotebookPanel } from '@jupyterlab/notebook';

import { Cell, CodeCell, CodeCellModel } from '@jupyterlab/cells';

import { showDialog, showErrorMessage } from '@jupyterlab/apputils';

import { IDragEvent } from '@lumino/dragdrop';

import { Widget } from '@lumino/widgets';

import { Message } from '@lumino/messaging';

import { Signal } from '@lumino/signaling';

import { GridItemHTMLElement, GridStackNode } from 'gridstack';

import { GridStackLayout } from './layout';

import { GridStackModel } from './model';

import { DashboardMetadataEditor } from '../components/metadata';

import { CellChange } from '../format';

const TOOLBAR_HEIGHT = 40;

interface IDroppable {
  /**
   * Whether the content can be dropped
   */
  droppable: boolean;
  /**
   * Reason why the content cannot be dropped
   */
  reason?: string;
}

/**
 * A gridstack widget to host the visible Notebook's Cells.
 */
export class GridStackWidget extends Widget {
  /**
   * Construct a `GridStackWidget`.
   *
   * @param model - The `GridStackModel`.
   */
  constructor(model: GridStackModel) {
    super();
    this.removeClass('lm-Widget');
    this.removeClass('p-Widget');
    this.addClass('grid-editor');
    this._model = model;

    this._gridLayout = this.layout = new GridStackLayout(this._model.info);
    this._gridLayout.gridItemChanged.connect(this._onGridItemChange, this);

    this._model.ready.connect(() => {
      this._initGridItems();
      this._model.cellRemoved.connect(this._removeCell, this);
      this._model.cellPinned.connect(this._lockCell, this);
      this._model.contentChanged.connect(this._updateGridItems, this);
    });
  }

  /**
   * Update the layout to reclaim any empty space
   */
  compact(): void {
    this._gridLayout.grid.compact();
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    if (this._shadowWidget) {
      this._resetShadowWidget();
    }
    Signal.clearData(this);
    super.dispose();
  }

  /**
   * Handle `after-attach` messages sent to the widget.
   *
   * ### Note
   * Add event listeners for the drag and drop event.
   */
  protected onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    this.node.addEventListener('lm-dragenter', this, true);
    this.node.addEventListener('lm-dragleave', this, true);
    this.node.addEventListener('lm-dragover', this, true);
    this.node.addEventListener('lm-drop', this, true);
    this.node.addEventListener('lm-dragend', this, true);
  }

  /**
   * Handle `before-detach` messages sent to the widget.
   *
   * ### Note
   * Remove event listeners for the drag and drop event.
   */
  protected onBeforeDetach(msg: Message): void {
    super.onBeforeDetach(msg);
    this.node.removeEventListener('lm-dragenter', this, true);
    this.node.removeEventListener('lm-dragleave', this, true);
    this.node.removeEventListener('lm-dragover', this, true);
    this.node.removeEventListener('lm-drop', this, true);
    this.node.removeEventListener('lm-dragend', this, true);
  }

  /**
   * Handle event messages sent to the widget.
   *
   * ### Note
   * Calling the pertinent function depending on the drag and drop stage.
   */
  public handleEvent(event: Event): void {
    if (!(event as IDragEvent).type) {
      return;
    }

    if ((event as IDragEvent).proposedAction === 'copy') {
      switch (event.type) {
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
  }

  /**
   * Getter to acces the list of `GridstackItemWidget`.
   */
  get gridWidgets(): Widget[] {
    return this._gridLayout.gridWidgets;
  }

  /**
   * Launch the `DashboardMetadataEditor`.
   */
  public infoEditor(): void {
    const body = new DashboardMetadataEditor(this._model.info);
    showDialog({
      title: 'Edit grid parameters',
      body,
    }).then((value) => {
      if (value.button.accept) {
        this._model.info = body.info;

        if (this._gridLayout) {
          this._gridLayout.margin = body.info.cellMargin;
          this._gridLayout.cellHeight = body.info.defaultCellHeight;
          this._gridLayout.columns = body.info.maxColumns;
        }
      }
    });
  }

  /**
   * Initialize the `GridstackItemWidget` from Notebook's metadata.
   */
  private _initGridItems(): void {
    const cells = this._model.cells;

    for (let i = 0; i < cells?.length; i++) {
      const model = cells.get(i);
      this._model.execute(model);
      const info = this._model.getCellInfo(model.id);
      if (info && !info.hidden && model.sharedModel.source.length !== 0) {
        const item = this._model.createCell(model, info.locked);
        this._gridLayout.addGridItem(model.id, item, info);
      }
    }

    this._model.executed = true;
  }

  /**
   * A handler invoked when a grid item has to be removed.
   *
   * @param model - The `GridstackModel` that sends the signal.
   * @param id - The Cell id.
   */
  private _removeCell(model: GridStackModel, cell: CellChange): void {
    this._gridLayout.removeGridItem(cell.id);
  }

  /**
   * A handler invoked when a grid item has to be removed.
   *
   * @param model - The `GridstackModel` that sends the signal.
   * @param id - The Cell id.
   */
  private _lockCell(model: GridStackModel, cell: CellChange): void {
    this._gridLayout.updateGridItem(cell.id, cell.info);
  }

  /**
   * Update the `GridstackItemWidget` from Notebook's metadata.
   */
  private _updateGridItems(): void {
    // Look for deleted cells. We look manually and not using
    // `this._model.deletedCells` because when changing cell type
    // the cell is removed but not added to this list.
    this._gridLayout.gridItems.forEach((item) => {
      let exist = false;
      for (let i = 0; i < this._model.cells?.length; i++) {
        if (item.gridstackNode?.id === this._model.cells.get(i).id) {
          exist = true;
          break;
        }
      }
      if (!exist && item.gridstackNode) {
        this._model.hideCell(item.gridstackNode.id as string);
        this._gridLayout.removeGridItem(item.gridstackNode.id as string);
      }
    });

    for (let i = 0; i < this._model.cells?.length; i++) {
      const model = this._model.cells.get(i);
      const info = this._model.getCellInfo(model.id);
      const items = this._gridLayout.gridItems;
      const item = items?.find((value) => value.gridstackNode?.id === model.id);

      // If the cell is not in gridstack but it should add to gridstack
      if (
        !item &&
        info &&
        !info.hidden &&
        model.sharedModel.source.length !== 0
      ) {
        // Add this cell to the gridstack
        if (
          model.type === 'code' &&
          (model as CodeCellModel).executionCount &&
          (model as CodeCellModel).outputs.length !== 0
        ) {
          const outputs = (model as CodeCellModel).outputs;
          let error = false;
          for (let i = 0; i < outputs.length; i++) {
            if (outputs.get(i).type === 'error') {
              error = true;
              break;
            }
          }
          if (error) {
            continue;
          }
          const item = this._model.createCell(model, info.locked);
          this._gridLayout.addGridItem(model.id, item, info);
          continue;
        }

        if (model.type !== 'code') {
          const item = this._model.createCell(model, info.locked);
          this._gridLayout.addGridItem(model.id, item, info);
          continue;
        }
      }

      if (
        item &&
        info &&
        !info.hidden &&
        model.sharedModel.source.length !== 0
      ) {
        this._gridLayout.updateGridItem(model.id, info);
        continue;
      }

      if (
        item &&
        info &&
        !info.hidden &&
        model.sharedModel.source.length === 0
      ) {
        this._model.hideCell(model.id);
        this._gridLayout.removeGridItem(model.id);
        continue;
      }

      // If the cell is in gridstack and should not delete
      if (item && info?.hidden) {
        this._model.hideCell(model.id);
        this._gridLayout.removeGridItem(model.id);
        continue;
      }
    }
  }

  /**
   * A signal handler invoked when a grid item change.
   *
   * @param sender - The `GridStackLayout` that sends the signal.
   * @param items - The list of `GridStackNode`.
   */
  private _onGridItemChange(
    sender: GridStackLayout,
    items: GridStackNode[]
  ): void {
    if (this._shadowWidget !== null) {
      // Ignore item modification when drag-and-drop is in progress
      return;
    }

    items.forEach((el) => {
      this._model.setCellInfo(el.id as string, {
        hidden: false,
        col: el.x ?? 0,
        row: el.y ?? 0,
        width: el.w ?? 2,
        height: el.h ?? 2,
        locked: el.locked ?? true,
      });
    });
  }

  /**
   * Handle the `'lm-dragenter'` event for the widget.
   */
  private _evtDragEnter(event: IDragEvent): void {
    const test = this._isDroppable(event);
    if (test.droppable) {
      event.preventDefault();
      event.stopPropagation();

      // We know that the widget exists as this is tested in `_isDroppable`
      const widget = (event.source.parent as NotebookPanel).content.activeCell;
      const item = this._gridLayout.gridItems.find(
        (value) => value.gridstackNode?.id === widget!.model.id
      );

      const y = Math.floor(
        (event.offsetY + this.node.scrollTop) / this._gridLayout.cellHeight
      );
      const x = Math.floor(
        (this._gridLayout.columns * event.offsetX) / this.node.offsetWidth
      );
      let w = 2;
      let h = 2;
      if (widget!.model.type === 'code') {
        const rect = (
          widget as CodeCell
        ).outputArea.node.getBoundingClientRect();
        const c = this._gridLayout.columns - x;
        w = Math.min(
          c,
          Math.ceil(rect.width / this._gridLayout.grid.cellWidth())
        );
        h = Math.ceil(
          (rect.height + TOOLBAR_HEIGHT) / this._gridLayout.cellHeight
        );
      } else {
        const rect = widget!.node.getBoundingClientRect();
        const c = this._gridLayout.columns - x;
        w = Math.min(
          c,
          Math.ceil(rect.width / this._gridLayout.grid.cellWidth())
        );
        h = Math.ceil(
          (rect.height + TOOLBAR_HEIGHT) / this._gridLayout.cellHeight
        );
      }

      // Reset the shadow widget as the enter event is triggered when coming from a child
      this._resetShadowWidget();
      // Stop event on gridstack during drag and drop action
      this._gridLayout.grid.el.style.pointerEvents = 'none';

      if (item) {
        // If the cell is already in the grid, so we need to move it.
        this._shadowWidget = item;
        this._gridLayout.grid.update(item, {
          x,
          y,
          w,
          h,
        });
      } else {
        this._shadowWidget = this._gridLayout.grid.addWidget(
          '<div class="grid-stack-item grid-stack-placeholder"><div class="grid-stack-item-content placeholder-content"></div></div>',
          {
            x,
            y,
            w,
            h,
          }
        );
      }
    } else {
      if (test.reason) {
        this._setErrorMessage(test.reason);
      }
    }
  }

  /**
   * Handle the `'lm-dragleave'` event for the widget.
   */
  private _evtDragLeave(event: IDragEvent): void {
    this.removeClass('pr-DropTarget');

    // Reset only if the user move out of the editor - not when entering children
    if (!this._isPointerOnWidget(event)) {
      // Clear scroll interval
      if (this._scrollIntervalId) {
        clearInterval(this._scrollIntervalId);
        this._scrollIntervalId = null;
      }
      this._resetShadowWidget();
    }

    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Handle the `'lm-dragover'` event for the widget.
   */
  private _evtDragOver(event: IDragEvent): void {
    this.addClass('pr-DropTarget');
    event.dropAction = 'copy';

    this._scrollIfNeeded(event);

    if (this._shadowWidget) {
      // We know that the widget exists as this is tested in `_isDroppable`
      const widget = (event.source.parent as NotebookPanel).content.activeCell;

      const x = Math.floor(
        (this._gridLayout.columns * event.offsetX) / this.node.offsetWidth
      );
      const y = Math.floor(
        (event.offsetY + this.node.scrollTop) / this._gridLayout.cellHeight
      );

      let w = 2;
      if (widget!.model.type === 'code') {
        const rect = (
          widget as CodeCell
        ).outputArea.node.getBoundingClientRect();
        const c = this._gridLayout.columns - x;
        w = Math.min(
          c,
          Math.ceil(rect.width / this._gridLayout.grid.cellWidth())
        );
      } else {
        const rect = widget!.node.getBoundingClientRect();
        const c = this._gridLayout.columns - x;
        w = Math.min(
          c,
          Math.ceil(rect.width / this._gridLayout.grid.cellWidth())
        );
      }

      if (!this._shadowWidget.classList.contains('grid-stack-placeholder')) {
        // Don't expand the existing widget
        w = Math.min(
          w,
          this._shadowWidget.gridstackNode?.w ?? this._gridLayout.columns
        );
      }

      this._gridLayout.grid.update(this._shadowWidget, {
        x,
        y,
        w,
      });
    }
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Handle the `'lm-drop'` event for the widget.
   */
  private _evtDrop(event: IDragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    // Clear scroll interval
    if (this._scrollIntervalId) {
      clearInterval(this._scrollIntervalId);
      this._scrollIntervalId = null;
    }
    this._resetShadowWidget();

    if (event.proposedAction !== 'copy') {
      return;
    }

    if (event.source.activeCell instanceof Cell) {
      const widget = (event.source.parent as NotebookPanel).content.activeCell;
      if (!widget) {
        return;
      }

      const row = Math.floor(
        (event.offsetY + this.node.scrollTop) / this._gridLayout.cellHeight
      );
      const col = Math.floor(
        (this._gridLayout.columns * event.offsetX) / this.node.offsetWidth
      );
      let width = 1;
      let height = 1;
      if (widget!.model.type === 'code') {
        const rect = (
          widget as CodeCell
        ).outputArea.node.getBoundingClientRect();
        const c = this._gridLayout.columns - col;
        width = Math.min(
          c,
          Math.ceil(rect.width / this._gridLayout.grid.cellWidth())
        );
        height = Math.ceil(
          (rect.height + TOOLBAR_HEIGHT) / this._gridLayout.cellHeight
        );
      } else {
        const rect = widget!.node.getBoundingClientRect();
        const c = this._gridLayout.columns - col;
        width = Math.min(
          c,
          Math.ceil(rect.width / this._gridLayout.grid.cellWidth())
        );
        height = Math.ceil(
          (rect.height + TOOLBAR_HEIGHT) / this._gridLayout.cellHeight
        );
      }

      const items = this._gridLayout.gridItems;
      const item = items?.find(
        (value) => value.gridstackNode?.id === widget?.model.id
      );
      const info = this._model.getCellInfo(widget.model.id);

      if (!item && info?.hidden) {
        if (
          widget.model.type === 'code' &&
          (widget.model as CodeCellModel).executionCount &&
          (widget.model as CodeCellModel).outputs.length !== 0
        ) {
          const outputs = (widget.model as CodeCellModel).outputs;
          for (let i = 0; i < outputs.length; i++) {
            if (outputs.get(i).type === 'error') {
              showErrorMessage(
                'Cell error',
                'It is not possible to add cells with execution errors.'
              );
              return;
            }
          }

          info.hidden = false;
          info.col = col;
          info.row = row;
          info.width = width;
          info.height = height;
          info.locked = info.locked === false ? false : true;
          this._model.setCellInfo(widget.model.id, info);
          const item = this._model.createCell(widget.model, info.locked);
          this._gridLayout.addGridItem(widget.model.id, item, info);
        } else if (
          widget.model.type !== 'code' &&
          widget.model.sharedModel.source.length !== 0
        ) {
          info.hidden = false;
          info.col = col;
          info.row = row;
          info.width = width;
          info.height = height;
          info.locked = info.locked === false ? false : true;
          this._model.setCellInfo(widget.model.id, info);
          const item = this._model.createCell(widget.model, info.locked);
          this._gridLayout.addGridItem(widget.model.id, item, info);
        } else {
          showErrorMessage(
            'Empty cell',
            'It is not possible to add empty cells.'
          );
        }
      } else if (item && info) {
        info.hidden = false;
        info.col = col;
        info.row = row;
        info.width = Math.min(width, info.width);
        info.locked = info.locked === false ? false : true;
        this._model.setCellInfo(widget.model.id, info);
        this._gridLayout.updateGridItem(widget.model.id, info);
      } else if (!info) {
        showErrorMessage(
          'Wrong notebook',
          'It is not possible to add cells from another notebook.'
        );
      }
    }

    this.removeClass('pr-DropTarget');
  }

  /**
   * Whether the dragged element is droppable or not
   *
   * @param event Event object
   * @returns Whether the element can be dropped and the reason why it can't
   */
  private _isDroppable(event: IDragEvent): IDroppable {
    if (event.proposedAction !== 'copy') {
      return { droppable: false };
    }

    if (event.source.activeCell instanceof Cell) {
      const widget = (event.source.parent as NotebookPanel).content.activeCell;
      if (!widget) {
        return { droppable: false };
      }
      const items = this._gridLayout.gridItems;
      const item = items?.find(
        (value) => value.gridstackNode?.id === widget?.model.id
      );
      const info = this._model.getCellInfo(widget.model.id);

      if (!item && info?.hidden) {
        if (
          widget.model.type === 'code' &&
          (widget.model as CodeCellModel).executionCount &&
          (widget.model as CodeCellModel).outputs.length !== 0
        ) {
          const outputs = (widget.model as CodeCellModel).outputs;
          for (let i = 0; i < outputs.length; i++) {
            if (outputs.get(i).type === 'error') {
              return {
                droppable: false,
                reason: 'GridStack Error: cells with execution errors.',
              };
            }
          }
          return { droppable: true };
        } else if (
          widget.model.type !== 'code' &&
          widget.model.sharedModel.source.length !== 0
        ) {
          return { droppable: true };
        } else {
          return { droppable: false, reason: 'GridStack Error: empty cells.' };
        }
      } else if (item && info) {
        return { droppable: true };
      } else if (!info) {
        return {
          droppable: false,
          reason: 'GridStack Error: cells from another notebook.',
        };
      }
    }

    return { droppable: false };
  }

  private _scrollIfNeeded(event: IDragEvent): boolean {
    // Clear scroll interval
    if (this._scrollIntervalId) {
      clearInterval(this._scrollIntervalId);
      this._scrollIntervalId = null;
    }

    const boundingBox = this.node.getBoundingClientRect();
    const offset = 40;
    // Strict because the drag leave event triggers when equals
    // 5px of scroll bar at the right site
    if (event.clientY < boundingBox.top + offset) {
      this._scrollIntervalId = setInterval(() => {
        this.node.scrollBy({ top: -20 });
      }, 10);
      return true;
    } else if (event.clientY > boundingBox.bottom - offset) {
      this._scrollIntervalId = setInterval(() => {
        this.node.scrollBy({ top: 20 });
      }, 10);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Test if the mouse pointer for the event occurs within the widget
   */
  private _isPointerOnWidget(event: IDragEvent): boolean {
    const boundingBox = this.node.getBoundingClientRect();
    // Strict because the drag leave event triggers when equals
    // 5px of scroll bar at the right site
    return (
      event.clientX > boundingBox.left &&
      event.clientX < boundingBox.right - 5 &&
      event.clientY > boundingBox.top &&
      event.clientY < boundingBox.bottom
    );
  }

  /**
   * Remove the shadow widget and activate the events on the grid
   */
  private _resetShadowWidget(): void {
    if (this._shadowWidget) {
      if (this._shadowWidget.classList.contains('grid-stack-placeholder')) {
        this._gridLayout.grid.removeWidget(this._shadowWidget, true, false);
      } else {
        // Existing item need to be reset
        const info = this._model.getCellInfo(
          this._shadowWidget.gridstackNode?.id as string
        );
        if (info) {
          this._gridLayout.updateGridItem(
            this._shadowWidget.gridstackNode?.id as string,
            info
          );
        }
      }
      this._shadowWidget = null;
      this._gridLayout.grid.el.style.pointerEvents = 'auto';
    }
  }

  private _setErrorMessage(reason: string) {
    // Find the drag-and-drop floating image from notebook cells
    const floatingElement = document.body.querySelector('.lm-mod-drag-image');
    if (floatingElement) {
      let error = floatingElement.querySelector('.grid-stack-error');
      if (!error) {
        error = floatingElement.appendChild(document.createElement('div'));
        error.className = 'grid-stack-error';
      }
      error.innerHTML = `<p>${reason}</p>`;
    }
  }

  private _gridLayout: GridStackLayout;

  private _model: GridStackModel;
  private _shadowWidget: GridItemHTMLElement | null = null;
  private _scrollIntervalId: number | null = null;
}
