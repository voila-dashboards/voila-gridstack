import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  sessionContextDialogs,
  ISessionContextDialogs
} from '@jupyterlab/apputils';

import { IEditorServices } from '@jupyterlab/codeeditor';

import { editorServices } from '@jupyterlab/codemirror';

import { DocumentManager, IDocumentManager } from '@jupyterlab/docmanager';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { ITranslator, TranslationManager } from '@jupyterlab/translation';

import trackerSettings from '@jupyterlab/notebook-extension/schema/tracker.json';

import { Widget } from '@lumino/widgets';

import { App } from './app';

const NOTEBOOK_FACTORY = 'Notebook';

const GRIDSTACK_EDITOR_FACTORY = 'Voila GridStack';

/**
 * The default code editor services plugin
 */
const codeEditorServices: JupyterFrontEndPlugin<IEditorServices> = {
  id: 'editor:services',
  provides: IEditorServices,
  activate: () => editorServices
};

/**
 * A minimal document manager plugin.
 */
const doc: JupyterFrontEndPlugin<IDocumentManager> = {
  id: 'editor:docmanager',
  provides: IDocumentManager,
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    const opener = {
      open: (widget: Widget, options: DocumentRegistry.IOpenOptions) => {
        app.shell.add(widget, 'main', options);
      }
    };
    const docManager = new DocumentManager({
      registry: app.docRegistry,
      manager: app.serviceManager,
      opener
    });

    // TODO: fix this by adding a command
    setTimeout(() => {
      docManager.open('basics.ipynb', NOTEBOOK_FACTORY);
    }, 1000);
    setTimeout(() => {
      docManager.open('basics.ipynb', GRIDSTACK_EDITOR_FACTORY, undefined, {
        mode: 'split-right'
      });
    }, 2000);
    return docManager;
  }
};

/**
 * The default paths.
 */
const paths: JupyterFrontEndPlugin<JupyterFrontEnd.IPaths> = {
  id: 'gridstack-editor:paths',
  activate: (
    app: JupyterFrontEnd<JupyterFrontEnd.IShell>
  ): JupyterFrontEnd.IPaths => {
    return (app as App).paths;
  },
  autoStart: true,
  provides: JupyterFrontEnd.IPaths
};

/**
 * The default session dialogs plugin
 */
const sessionDialogs: JupyterFrontEndPlugin<ISessionContextDialogs> = {
  id: 'editor:sessionDialogs',
  provides: ISessionContextDialogs,
  autoStart: true,
  activate: () => sessionContextDialogs
};

/**
 * A plugin to load some of the default shortcuts
 */
const shortcuts: JupyterFrontEndPlugin<void> = {
  id: 'gridstack-editor:shortcuts',
  activate: (app: JupyterFrontEnd<JupyterFrontEnd.IShell>): void => {
    // load the default notebook keybindings
    const bindings = trackerSettings['jupyter.lab.shortcuts'];
    bindings.forEach(binding => app.commands.addKeyBinding(binding));
  },
  autoStart: true
};

/**
 * A simplified Translator
 */
const translator: JupyterFrontEndPlugin<ITranslator> = {
  id: '@jupyterlab/translation:translator',
  activate: (app: App): ITranslator => {
    const translationManager = new TranslationManager();
    return translationManager;
  },
  autoStart: true,
  provides: ITranslator
};

const plugins = [
  codeEditorServices,
  doc,
  paths,
  sessionDialogs,
  shortcuts,
  translator
];

export default plugins;
