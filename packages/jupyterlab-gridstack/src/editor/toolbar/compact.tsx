import { ReactWidget, ToolbarButtonComponent } from '@jupyterlab/apputils';

import * as React from 'react';

import { compactIcon } from '../../icons';

import { VoilaGridStackPanel } from '../panel';

/**
 * A toolbar widget to compact the dashboard on the top left corner.
 */
export default class Compact extends ReactWidget {
  constructor(panel: VoilaGridStackPanel) {
    super();
    this._panel = panel;
  }

  render(): JSX.Element {
    const onClick = (): void => {
      this._panel.compact();
    };

    return (
      <ToolbarButtonComponent
        icon={compactIcon}
        onClick={onClick}
        tooltip={'Compact the grid towards the top left corner'}
      />
    );
  }

  private _panel: VoilaGridStackPanel;
}
