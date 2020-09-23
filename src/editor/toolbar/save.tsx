import { saveIcon } from '@jupyterlab/ui-components';
import { ReactWidget } from '@jupyterlab/apputils';

import * as React from 'react';

import EditorPanel from '../panel';

export default class Save extends ReactWidget {
  private panel: EditorPanel;

  constructor(panel: EditorPanel) {
    super();
    this.addClass('jp-ToolbarButton');
    this.panel = panel;
  }

  render() {
    return (
      <button
        onClick={this.panel.save}
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
}
