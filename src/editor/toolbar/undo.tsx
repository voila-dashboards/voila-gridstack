import { ReactWidget, ToolbarButtonComponent } from '@jupyterlab/apputils';

import { INotebookModel } from '@jupyterlab/notebook';

import { undoIcon } from '@jupyterlab/ui-components';

import * as React from 'react';

/**
 * A toolbar widget to undo changes.
 */
export default class Undo extends ReactWidget {
  constructor(model: INotebookModel) {
    super();
    this._model = model;
  }

  render(): JSX.Element {
    const onClick = (): void => {
      this._model.sharedModel.undo();
    };

    return (
      <ToolbarButtonComponent
        icon={undoIcon}
        onClick={onClick}
        tooltip={'Undo changes'}
      />
    );
  }

  private _model: INotebookModel;
}
