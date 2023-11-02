import { ReactWidget, ToolbarButtonComponent } from '@jupyterlab/apputils';

import { launcherIcon } from '@jupyterlab/ui-components';

import { PageConfig } from '@jupyterlab/coreutils';

import * as React from 'react';

/**
 * A toolbar widget to launch Voila.
 */
export default class Voila extends ReactWidget {
  constructor(path: string) {
    super();
    this._path = path;
  }

  render(): JSX.Element {
    const onClick = (): void => {
      const baseUrl = PageConfig.getBaseUrl();
      const conf = '?template=gridstack';
      const win = window.open(
        `${baseUrl}voila/render/${this._path + conf}`,
        '_blank'
      );
      win?.focus();
    };

    return (
      <ToolbarButtonComponent
        icon={launcherIcon}
        onClick={onClick}
        tooltip={'Open with Voilà Gridstack in a New Browser Tab'}
      />
    );
  }

  private _path: string;
}
