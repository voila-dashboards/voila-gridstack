import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { DOMUtils, MainAreaWidget } from '@jupyterlab/apputils';

import { IMainMenu } from '../top/tokens';

import { fileIcon, jupyterIcon } from '@jupyterlab/ui-components';

import { Widget } from '@lumino/widgets';

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
  optional: [IMainMenu],
  activate: (app: JupyterFrontEnd, menu: IMainMenu | null): void => {
    const { commands, shell } = app;

    const node = document.createElement('div');
    node.textContent = 'Hello world!';
    const content = new Widget({ node });
    content.id = DOMUtils.createDomID();
    content.title.label = 'Hello';
    content.title.caption = 'Hello World';
    content.title.icon = fileIcon;
    content.addClass('jp-ExampleWidget');
    const widget = new MainAreaWidget({ content });
    widget.title.closable = true;
    shell.add(widget, 'main');

    commands.addCommand(CommandIDs.open, {
      label: 'Open Logo',
      execute: () => {
        const widget = new Widget();
        jupyterIcon.element({
          container: widget.node,
          elementPosition: 'center',
          margin: '5px 5px 5px 5px',
          height: '100%',
          width: '100%'
        });
        widget.id = DOMUtils.createDomID();
        widget.title.label = 'Jupyter Logo';
        widget.title.icon = jupyterIcon;
        widget.title.closable = true;
        app.shell.add(widget, 'main');
      }
    });

    if (menu) {
      menu.helpMenu.addGroup([{ command: CommandIDs.open }]);
    }
  }
};

export default plugin;
