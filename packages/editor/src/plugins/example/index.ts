import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * The command ids used by the main plugin.
 */
export namespace CommandIDs {
  export const open = 'jupyterlab-app-template:open';
}

/**
 * The main plugin.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-app-template:main',
  autoStart: true,
  activate: (app: JupyterFrontEnd): void => {
    console.log('example plugin activated');
  }
};

export default plugin;
