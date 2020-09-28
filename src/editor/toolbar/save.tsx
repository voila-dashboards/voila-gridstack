import { ReactWidget } from '@jupyterlab/apputils';

import { saveIcon } from '@jupyterlab/ui-components';

import * as React from 'react';

import EditorPanel from '../panel';

export default class Save extends ReactWidget {
  constructor(panel: EditorPanel) {
    super();
    this.addClass('jp-ToolbarButton');
    this._panel = panel;
  }

  render(): JSX.Element {
    return (
      <button
        onClick={this._panel.save}
        className="bp3-button bp3-minimal jp-ToolbarButtonComponent minimal jp-Button"
      >
        <saveIcon.react
          tag="span"
          right="7px"
          top="5px"
          width="16px"
          height="16px"
        />
      </button>
    );
  }

  private _panel: EditorPanel;
}
