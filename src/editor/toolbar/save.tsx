import { ReactWidget, ToolbarButtonComponent } from '@jupyterlab/apputils';

import { saveIcon } from '@jupyterlab/ui-components';

import * as React from 'react';

import { EditorPanel } from '../panel';

export default class Save extends ReactWidget {
  constructor(panel: EditorPanel) {
    super();
    this._panel = panel;
  }

  render(): JSX.Element {
    const onClick = (): void => {
      this._panel.save();
    };

    return (
      <ToolbarButtonComponent
        icon={saveIcon}
        onClick={onClick}
        tooltip={'Save the layout'}
      />
    );
  }

  private _panel: EditorPanel;
}
