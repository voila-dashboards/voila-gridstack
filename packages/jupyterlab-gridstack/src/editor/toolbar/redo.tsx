import { ReactWidget, ToolbarButtonComponent } from '@jupyterlab/apputils';

import { INotebookModel } from '@jupyterlab/notebook';

import { redoIcon } from '@jupyterlab/ui-components';

import * as React from 'react';

/**
 * A toolbar widget to redo changes.
 */
export default class Redo extends ReactWidget {
  constructor(model: INotebookModel) {
    super();
    this._model = model;
  }

  render(): JSX.Element {
    const onClick = (): void => {
      this._model.sharedModel.redo();
    };

    return (
      <ToolbarButtonComponent
        icon={redoIcon}
        onClick={onClick}
        tooltip={'Redo changes'}
      />
    );
  }

  private _model: INotebookModel;
}
