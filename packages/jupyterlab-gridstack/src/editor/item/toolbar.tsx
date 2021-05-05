import { ReactWidget } from '@jupyterlab/apputils';

import * as React from 'react';

import { GridStackItemModel } from './model';

import { deleteIcon, pinIcon, unPinIcon } from '../icons';

/**
 * A React widget for items toolbar.
 */
export class GridStackItemToolbar extends ReactWidget {
  constructor(model: GridStackItemModel) {
    super();
    this.addClass('grid-item-toolbar');
    this._model = model;
  }

  render(): JSX.Element {
    const close = () => {
      this._model.close();
      this.update();
    };

    const lock = () => {
      this._model.lock();
      this.update();
    };

    const unlock = () => {
      this._model.unlock();
      this.update();
    };

    return (
      <>
        {this._model.isLocked ? (
          <div className="pin" onClick={unlock}>
            <unPinIcon.react height="16px" width="16px" />
          </div>
        ) : (
          <div className="pin" onClick={lock}>
            <pinIcon.react height="16px" width="16px" />
          </div>
        )}
        <div className="grid-item-toolbar-spacer" />
        <div className="trash-can" onClick={close}>
          <deleteIcon.react height="16px" width="16px" />
        </div>
      </>
    );
  }

  private _model: GridStackItemModel;
}
