// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

require('../style/index.css');

/**
 * The main function
 */
async function main() {
  const App = require('./app').App;
  const app = new App();
  const mods = [
    require('./plugins'),
    require('jupyterlab-gridstack'),
    require('@jupyterlab/rendermime-extension'),
    require('@jupyterlab/notebook-extension').default.filter(({ id }) =>
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
