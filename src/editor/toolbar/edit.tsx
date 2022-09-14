import { ReactWidget, ToolbarButtonComponent } from '@jupyterlab/apputils';

import { editIcon } from '@jupyterlab/ui-components';

import * as React from 'react';

import { VoilaGridStackPanel } from '../panel';

/**
 * A toolbar widget to open the dashboard metadata editor dialog.
 */
export default class Edit extends ReactWidget {
  constructor(panel: VoilaGridStackPanel) {
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

  private _panel: VoilaGridStackPanel;
}
