import { ReactWidget } from '@jupyterlab/apputils';

import * as React from 'react';

export default class ViewSelector extends ReactWidget {
  constructor() {
    super();
  }

  render(): JSX.Element {
    return (
      <div>preview</div>
    );
  }
}