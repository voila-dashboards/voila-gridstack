import { ReactWidget } from '@jupyterlab/apputils';

import * as React from 'react';

import { GridStackItemModel, ItemState } from './model';

import { deleteIcon, pinIcon, unPinIcon } from '../icons';

/**
 * A React widget for items toolbar.
 */
export class GridStackItemToolbar extends ReactWidget {
  constructor(model: GridStackItemModel) {
    super();
    this.addClass('grid-item-toolbar');
    this._model = model;
    this._model.stateChanged.connect(this._stateChanged);
  }

  dispose() {
    this._model.stateChanged.disconnect(this._stateChanged);
    super.dispose();
  }

  private _stateChanged = (
    item: GridStackItemModel,
    state: ItemState
  ): void => {
    this.update();
  };

  render(): JSX.Element {
    return (
      <>
        {this._model.isLocked ? (
          <button
            className="gridstack-toolbar-button jp-toolbar-button pin"
            onClick={() => this._model.unlock()}
          >
            <unPinIcon.react className="jp-react-button" />
          </button>
        ) : (
          <button
            className="gridstack-toolbar-button jp-toolbar-button pin"
            onClick={() => this._model.lock()}
          >
            <pinIcon.react className="jp-react-button" />
          </button>
        )}
        <div className="grid-item-toolbar-spacer" />
        <button
          className="gridstack-toolbar-button jp-toolbar-button trash-can"
          onClick={() => this._model.close()}
        >
          <deleteIcon.react className="jp-react-button" />
        </button>
      </>
    );
  }

  private _model: GridStackItemModel;
}
