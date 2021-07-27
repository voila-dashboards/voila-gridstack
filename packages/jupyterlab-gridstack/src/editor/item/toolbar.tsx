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
    this._model.stateChanged.connect(() => {
      this.update();
      console.debug('update toolbar');
    });
  }

  dispose() {
    this._model.stateChanged.disconnect(this.update);
    super.dispose();
  }

  render(): JSX.Element {
    return (
      <>
        {this._model.isLocked ? (
          <div className="pin" onClick={() => this._model.unlock()}>
            <unPinIcon.react height="16px" width="16px" />
          </div>
        ) : (
          <div className="pin" onClick={() => this._model.lock()}>
            <pinIcon.react height="16px" width="16px" />
          </div>
        )}
        <div className="grid-item-toolbar-spacer" />
        <div className="trash-can" onClick={() => this._model.close()}>
          <deleteIcon.react height="16px" width="16px" />
        </div>
      </>
    );
  }

  private _model: GridStackItemModel;
}
