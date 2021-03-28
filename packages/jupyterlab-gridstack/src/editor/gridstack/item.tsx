import { ReactWidget } from '@jupyterlab/apputils';

import { Widget } from '@lumino/widgets';

import * as React from 'react';

import { deleteIcon, pinIcon, unPinIcon } from '../icons';

/**
 * A Lumino widget for gridstack items.
 */
export class GridStackItem extends Widget {
  constructor(options: GridStackItem.IOptions) {
    super();
    this.removeClass('lm-Widget');
    this.removeClass('p-Widget');
    this.addClass('grid-stack-item');

    this._cellId = options.cellId;
    this._item = options.cellWidget;

    this._toolbar = new GridStackItemToolbar(
      options.isPinned,
      options.closeFn,
      options.pinFn,
      options.unPinFn
    );

    this._cell = document.createElement('div');
    this._cell.className = 'grid-item-widget';

    this._content = document.createElement('div');
    this._content.className = 'grid-stack-item-content';

    this.node.appendChild(this._content);
  }

  get cellId(): string {
    return this._cellId;
  }

  onAfterAttach(): void {
    Widget.attach(this._toolbar, this._content);
    this._content.appendChild(this._cell);
    Widget.attach(this._item, this._cell);
  }

  private _cellId = '';
  private _item: Widget;
  private _toolbar: GridStackItemToolbar;
  private _cell: HTMLElement;
  private _content: HTMLElement;
}

/**
 * A React widget for items toolbar.
 */
class GridStackItemToolbar extends ReactWidget {
  constructor(isPinned: boolean, closeFn: any, pinFn: any, unPinFn?: any) {
    super();
    this.addClass('grid-item-toolbar');
    this._isPinned = isPinned;
    this._closeFn = closeFn;
    this._pinFn = pinFn;
    this._unPinFn = unPinFn;
  }

  render(): JSX.Element {
    const pin = () => {
      this._pinFn();
      this._isPinned = true;
      this.update();
    };

    const unPin = () => {
      this._unPinFn();
      this._isPinned = false;
      this.update();
    };

    return (
      <>
        {this._isPinned ? (
          <div className="pin" onClick={unPin}>
            <unPinIcon.react height="16px" width="16px" />
          </div>
        ) : (
          <div className="pin" onClick={pin}>
            <pinIcon.react height="16px" width="16px" />
          </div>
        )}

        <div className="trash-can" onClick={this._closeFn}>
          <deleteIcon.react height="16px" width="16px" />
        </div>
      </>
    );
  }

  private _isPinned: boolean;
  private _closeFn: () => any;
  private _pinFn: () => any;
  private _unPinFn: () => any;
}

/**
 * A namespace for GridStackItem statics.
 */
export namespace GridStackItem {
  /**
   *  Options interface for GridStackItem
   */
  export interface IOptions {
    /**
     * The cell Id.
     */
    cellId: string;
    /**
     * The cell widget.
     */
    cellWidget: Widget;
    /**
     * If the cell is pinned or not.
     */
    isPinned: boolean;
    /**
     * Close callback.
     */
    closeFn: () => any;
    /**
     * Pin callback.
     */
    pinFn: () => any;
    /**
     * Unpin callback.
     */
    unPinFn: () => any;
  }
}
