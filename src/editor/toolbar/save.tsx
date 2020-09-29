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

  private save(): void {
    this._panel.save();
  }

  render(): JSX.Element {
    return (
      <div
        onClick={() => this.save()}
        className="bp3-button bp3-minimal jp-ToolbarButtonComponent minimal jp-Button"
      >
        <saveIcon.react
          tag="span"
          right="7px"
          top="5px"
          width="16px"
          height="16px"
        />
      </div>
    );
  }

  private _panel: EditorPanel;
}
