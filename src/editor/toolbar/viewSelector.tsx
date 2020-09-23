import { ReactWidget } from '@jupyterlab/apputils';

import * as React from 'react';

export default class ViewSelector extends ReactWidget {
  constructor() {
    super();
  }

  onClick = () => {};

  render(): JSX.Element {
    return <div onClick={this.onClick}>preview</div>;
  }
}
