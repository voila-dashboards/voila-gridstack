import { ReactWidget, ToolbarButtonComponent } from '@jupyterlab/apputils';

import { editIcon } from '@jupyterlab/ui-components';

import * as React from 'react';

import EditorPanel from '../panel';

export default class Edit extends ReactWidget {
  constructor(panel: EditorPanel) {
    super();
    this._panel = panel;
  }

  render(): JSX.Element {
    const onClick = (): void => {
      this._panel.info();
    };

    return (
      <ToolbarButtonComponent
        icon={editIcon}
        onClick={onClick}
        tooltip={'Edit grid parameters'}
      />
    );
  }

  private _panel: EditorPanel;
}
