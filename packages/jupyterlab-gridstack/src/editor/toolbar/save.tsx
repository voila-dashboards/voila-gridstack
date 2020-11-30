import { ReactWidget, ToolbarButtonComponent } from '@jupyterlab/apputils';

import { saveIcon } from '@jupyterlab/ui-components';

import * as React from 'react';

import { VoilaGridStackPanel } from '../panel';

/**
 * A toolbar widget to save the dashboard metadata.
 */
export default class Save extends ReactWidget {
  constructor(panel: VoilaGridStackPanel) {
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

  private _panel: VoilaGridStackPanel;
}
