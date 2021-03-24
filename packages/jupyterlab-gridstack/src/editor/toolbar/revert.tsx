import { ReactWidget, ToolbarButtonComponent } from '@jupyterlab/apputils';

import { undoIcon } from '@jupyterlab/ui-components';

import * as React from 'react';

import { VoilaGridStackPanel } from '../panel';

/**
 * A toolbar widget to reload the dashboard positions from disk.
 */
export default class Revert extends ReactWidget {
  constructor(panel: VoilaGridStackPanel) {
    super();
    this._panel = panel;
  }

  render(): JSX.Element {
    const onClick = (): void => {
      this._panel.revert();
    };

    return (
      <ToolbarButtonComponent
        icon={undoIcon}
        onClick={onClick}
        tooltip={'Reload Notebook from Disk'}
      />
    );
  }

  private _panel: VoilaGridStackPanel;
}
