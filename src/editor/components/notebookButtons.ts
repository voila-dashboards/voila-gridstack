import { ToolbarButton } from '@jupyterlab/apputils';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { NotebookPanel, INotebookModel } from '@jupyterlab/notebook';

import { PageConfig } from '@jupyterlab/coreutils';

import { editIcon } from '@jupyterlab/ui-components';

import { CommandRegistry } from '@lumino/commands';

import { IDisposable } from '@lumino/disposable';

const VOILA_ICON_CLASS = 'jp-MaterialIcon jp-VoilaIcon';

export class EditorButton
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  /**
   * Instantiate a new NotebookButton.
   * @param commands The command registry.
   */
  constructor(commands: CommandRegistry) {
    this._commands = commands;
  }

  /**
   * Create a new extension object.
   */
  createNew(panel: NotebookPanel): IDisposable {
    const button = new ToolbarButton({
      className: 'voilaEditor',
      tooltip: 'Open with Voilà Editor',
      icon: editIcon,
      onClick: () => {
        this._commands.execute('docmanager:open', {
          path: panel.context.path,
          factory: 'Voila Editor'
        });
      }
    });
    panel.toolbar.insertAfter('voila', 'voilaEditor', button);
    return button;
  }

  private _commands: CommandRegistry;
}

export class VoilaButton
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  /**
   * Create a new extension object.
   */
  createNew(panel: NotebookPanel): IDisposable {
    const button = new ToolbarButton({
      className: 'voila',
      tooltip: 'Render with Voilà',
      iconClass: VOILA_ICON_CLASS,
      onClick: () => {
        const baseUrl = PageConfig.getBaseUrl();
        const win = window.open(
          `${baseUrl}voila/render/${panel.context.path}`,
          '_blank'
        );
        win.focus();
      }
    });
    panel.toolbar.insertAfter('cellType', 'voila', button);
    return button;
  }
}
