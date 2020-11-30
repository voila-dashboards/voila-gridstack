import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { showDialog, Dialog } from '@jupyterlab/apputils';

import { jupyterIcon } from '@jupyterlab/ui-components';

import { Widget } from '@lumino/widgets';

import { MainMenu } from './menu';

import { IMainMenu } from './tokens';

import * as React from 'react';

/**
 * The command IDs used by the top plugin.
 */
namespace CommandIDs {
  export const about = 'help:about';
}

/**
 * The main menu plugin.
 */
const plugin: JupyterFrontEndPlugin<IMainMenu> = {
  id: 'jupyterlab-app-template:menu',
  autoStart: true,
  provides: IMainMenu,
  activate: (app: JupyterFrontEnd): IMainMenu => {
    const logo = new Widget();
    jupyterIcon.element({
      container: logo.node,
      elementPosition: 'center',
      margin: '2px 2px 2px 8px',
      height: 'auto',
      width: '16px'
    });
    logo.id = 'jupyter-logo';

    const { commands } = app;

    commands.addCommand(CommandIDs.about, {
      label: `About ${app.name}`,
      execute: () => {
        const title = (
          <span className="about-header">
            <jupyterIcon.react margin="7px 9.5px" height="auto" width="58px" />
            <div className="about-header-info">
              About the JupyterLab App Template
            </div>
          </span>
        );

        const repoUrl = 'https://github.com/jtpio/jupyterlab-app-template';
        const externalLinks = (
          <span>
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="jp-Button-flat about-externalLinks"
            >
              JUPYTERLAB APP TEMPLATE ON GITHUB
            </a>
          </span>
        );
        const body = <div className="about-body">{externalLinks}</div>;

        return showDialog({
          title,
          body,
          buttons: [
            Dialog.createButton({
              label: 'Dismiss',
              className: 'about-button jp-mod-reject jp-mod-styled'
            })
          ]
        });
      }
    });

    const menu = new MainMenu({ commands });
    menu.id = 'main-menu';
    menu.helpMenu.addGroup([{ command: CommandIDs.about }]);

    app.shell.add(logo, 'top');
    app.shell.add(menu, 'top');

    return menu;
  }
};

export default plugin;
