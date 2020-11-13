import { NotebookPanel } from '@jupyterlab/notebook';

import { Cell, CodeCellModel } from '@jupyterlab/cells';

import { showDialog, showErrorMessage } from '@jupyterlab/apputils';

import { IDragEvent } from '@lumino/dragdrop';

import { Widget } from '@lumino/widgets';

import { Message } from '@lumino/messaging';

import { Signal } from '@lumino/signaling';

import { GridStackNode } from 'gridstack';

import { GridStackLayout } from './gridstackLayout';

import { GridStackModel } from './gridstackModel';

import { EditorGridstack } from '../components/editorGridstack';

export class GridStackWidget extends Widget {
  constructor(model: GridStackModel) {
    super();
    this.removeClass('lm-Widget');
    this.removeClass('p-Widget');
    this.addClass('grid-editor');
    this._model = model;

    this.layout = new GridStackLayout(this._model.info);
    this.layout.gridItemChanged.connect(this._onGridItemChange, this);

    this._model.ready.connect(() => {
      this.layout.initGridStack(this._model.info);
      this._initGridItems();
      this._model.cellRemoved.connect(this._removeCell, this);
      this._model.contentChanged.connect(this._updateGridItems, this);
    });
  }

  dispose(): void {
    Signal.clearData(this);
    super.dispose();
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

  get gridWidgets(): Widget[] {
    return this.layout.gridWidgets;
  }

  infoEditor(): void {
    const body = new EditorGridstack(this._model.info);
    showDialog({
      title: 'Edit grid parameters',
      body
    }).then(value => {
      if (value.button.accept) {
        this._model.info = body.info;

        if (this.layout) {
          this.layout.setMargin(body.info.cellMargin);
          this.layout.setCellHeight(body.info.cellHeight);
          this.layout.setColumn(body.info.numColumns);
        }
      }
    });
  }

  private _initGridItems(): void {
    const cells = this._model.cells;

    for (let i = 0; i < cells?.length; i++) {
      const model = cells.get(i);
      const info = this._model.getCellInfo(model.id);
      //this._model.execute();

      if (!info.hidden && model.value.text.length !== 0) {
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
          if (!error) {
            const item = this._model.createCell(model);
            this.layout.addGridItem(model.id, item, info);
          }
        }

        if (model.type !== 'code') {
          const item = this._model.createCell(model);
          this.layout.addGridItem(model.id, item, info);
        }
      }
    }
  }

  private _removeCell(model: GridStackModel, id: string): void {
    this._model.hideCell(id);
    this.layout.removeGridItem(id);
  }

  private _updateGridItems(): void {
    this._model.deletedCells.forEach(id => {
      this._model.hideCell(id);
      this.layout.removeGridItem(id);
    });

    for (let i = 0; i < this._model.cells?.length; i++) {
      const model = this._model.cells.get(i);
      const info = this._model.getCellInfo(model.id);
      const items = this.layout.gridItems;
      const item = items.find(value => value.gridstackNode.id === model.id);

      // If the cell is not in gridstack but it should add to gridstack
      if (!item && !info.hidden && model.value.text.length !== 0) {
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
          const item = this._model.createCell(model);
          this.layout.addGridItem(model.id, item, info);
          continue;
        }

        if (model.type !== 'code') {
          const item = this._model.createCell(model);
          this.layout.addGridItem(model.id, item, info);
          continue;
        }
      }

      if (item && !info.hidden && model.value.text.length !== 0) {
        this.layout.updateGridItem(model.id, info);
        continue;
      }

      if (item && !info.hidden && model.value.text.length === 0) {
        this._model.hideCell(model.id);
        this.layout.removeGridItem(model.id);
        continue;
      }

      // If the cell is in gridstack and shoud not delete
      if (item && info.hidden) {
        this._model.hideCell(model.id);
        this.layout.removeGridItem(model.id);
        continue;
      }
    }
  }

  /**
   * A signal handler invoked when a grid item change.
   */
  private _onGridItemChange(
    sender: GridStackLayout,
    items: GridStackNode[]
  ): void {
    items.forEach(el => {
      this._model.setCellInfo(el.id as string, {
        hidden: false,
        col: el.x,
        row: el.y,
        width: el.width,
        height: el.height
      });
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
      const row = Math.floor(event.offsetY / this.layout.getCellHeight(true));
      const col = Math.floor(
        (this.layout.getColumn() * event.offsetX) / this.node.offsetWidth
      );

      const widget = (event.source.parent as NotebookPanel).content.activeCell;
      const items = this.layout.gridItems;
      const item = items.find(
        value => value.gridstackNode.id === widget.model.id
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
                'Is not possible to add cells with execution errors'
              );
              return;
            }
          }

          info.hidden = false;
          info.col = col;
          info.row = row;
          this._model.setCellInfo(widget.model.id, info);
          const item = this._model.createCell(widget.model);
          this.layout.addGridItem(widget.model.id, item, info);
        } else if (
          widget.model.type !== 'code' &&
          widget.model.value.text.length !== 0
        ) {
          info.hidden = false;
          info.col = col;
          info.row = row;
          this._model.setCellInfo(widget.model.id, info);
          const item = this._model.createCell(widget.model);
          this.layout.addGridItem(widget.model.id, item, info);
        } else {
          showErrorMessage('Empty cell', 'Is not possible to add empty cells.');
        }
      } else if (item && info) {
        info.hidden = false;
        info.col = col;
        info.row = row;
        this._model.setCellInfo(widget.model.id, info);
        this.layout.updateGridItem(widget.model.id, info);
      } else if (!info) {
        showErrorMessage(
          'Wrong notebook',
          'Is not possible to add cells from another notebook.'
        );
      }
    }

    this.removeClass('pr-DropTarget');
  }

  private _model: GridStackModel;
  public layout: GridStackLayout;
}
