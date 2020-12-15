import { ReactWidget, ToolbarButtonComponent } from '@jupyterlab/apputils';

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
      const conf = '?voila-template=gridstack';
      const win = window.open(
        `${baseUrl}voila/render/${this._path + conf}`,
        '_blank'
      );
      win?.focus();
    };

    return (
      <ToolbarButtonComponent
        iconClass="jp-MaterialIcon jp-VoilaIcon"
        onClick={onClick}
        tooltip={'Open voila'}
      />
    );
  }

  private _path: string;
}
