import { ReactWidget } from '@jupyterlab/apputils';

import React from 'react';

export default class PreviewPanel extends ReactWidget {
  constructor() {
    super();
  }

  render(): JSX.Element {
    return <div>Hello World</div>;
  }
}