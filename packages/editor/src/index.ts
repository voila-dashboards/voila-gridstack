// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { PageConfig, URLExt } from '@jupyterlab/coreutils';
(window as any).__webpack_public_path__ = URLExt.join(
  PageConfig.getBaseUrl(),
  'example/'
);

import { App } from './app';

import plugins from './plugins';

import '../style/index.css';

/**
 * The main function
 */
async function main(): Promise<void> {
  const app = new App();
  const mods = [
    plugins,
    require('jupyterlab-gridstack'),
    require('@jupyterlab/rendermime-extension'),
    require('@jupyterlab/notebook-extension').default.filter(({ id }: any) =>
      [
        '@jupyterlab/notebook-extension:factory',
        '@jupyterlab/notebook-extension:widget-factory',
        '@jupyterlab/notebook-extension:tracker'
      ].includes(id)
    )
  ];

  app.registerPluginModules(mods);

  await app.start();
}

window.addEventListener('load', main);
