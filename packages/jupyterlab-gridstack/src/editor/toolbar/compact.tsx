import { ReactWidget, ToolbarButtonComponent } from '@jupyterlab/apputils';

import * as React from 'react';

import { compactIcon } from '../../icons';

import { GridStackWidget } from '../gridstack/widget';

import { VoilaGridStackPanel } from '../panel';

/**
 * A toolbar widget to open the dashboard metadata editor dialog.
 */
export default class Compact extends ReactWidget {
  constructor(panel: VoilaGridStackPanel) {
    super();
    this._panel = panel;
  }

  render(): JSX.Element {
    const onClick = (): void => {
      (this._panel?.widgets[0] as GridStackWidget)?.compact();
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
