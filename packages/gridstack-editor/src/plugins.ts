import {
  IRouter,
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  Router
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

/**
 * The factory to create notebook panels.
 */
const NOTEBOOK_FACTORY = 'Notebook';

/**
 * The factory to create GridStack editor widgets for a notebook.
 */
const GRIDSTACK_EDITOR_FACTORY = 'Voila GridStack';

/**
 * A namespace for default commands.
 */
namespace CommandIDs {
  export const open = 'docmanager:open';
}

/**
 * The default code editor services plugin
 */
const codeEditorServices: JupyterFrontEndPlugin<IEditorServices> = {
  id: 'gridstack-editor:services',
  provides: IEditorServices,
  activate: () => editorServices
};

/**
 * A minimal document manager plugin.
 */
const doc: JupyterFrontEndPlugin<IDocumentManager> = {
  id: 'gridstack-editor:docmanager',
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

    app.commands.addCommand(CommandIDs.open, {
      label: 'Open a document',
      execute: (args: any) => {
        const path = args['path'] as string;
        const factory = args['factory'] as string;
        const options = args['options'] as DocumentRegistry.IOpenOptions;
        docManager.open(path, factory, undefined, options);
      }
    });

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
 * The default URL router provider.
 */
const router: JupyterFrontEndPlugin<IRouter> = {
  id: 'gridstack-editor:router',
  requires: [JupyterFrontEnd.IPaths],
  activate: (app: JupyterFrontEnd, paths: JupyterFrontEnd.IPaths) => {
    const { commands } = app;
    const base = paths.urls.base;
    const router = new Router({ base, commands });
    void app.started.then(() => {
      // Route the very first request on load.
      void router.route();

      // Route all pop state events.
      window.addEventListener('popstate', () => {
        void router.route();
      });
    });
    return router;
  },
  autoStart: true,
  provides: IRouter
};

/**
 * The default session dialogs plugin
 */
const sessionDialogs: JupyterFrontEndPlugin<ISessionContextDialogs> = {
  id: 'gridstack-editor:sessionDialogs',
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
  id: 'gridstack-editor:translator',
  activate: (app: JupyterFrontEnd<JupyterFrontEnd.IShell>): ITranslator => {
    const translationManager = new TranslationManager();
    return translationManager;
  },
  autoStart: true,
  provides: ITranslator
};

/**
 * The default tree route resolver plugin.
 */
const tree: JupyterFrontEndPlugin<void> = {
  id: 'gridstack-editor:tree-resolver',
  autoStart: true,
  requires: [IRouter],
  activate: (app: JupyterFrontEnd, router: IRouter): void => {
    const { commands } = app;
    const treePattern = new RegExp('/tree/(.*)');

    const command = 'router:tree';
    commands.addCommand(command, {
      execute: (args: any) => {
        const parsed = args as IRouter.ILocation;
        const matches = parsed.path.match(treePattern);
        if (!matches) {
          return;
        }
        const [, path] = matches;

        app.restored.then(() => {
          commands.execute(CommandIDs.open, {
            path,
            factory: NOTEBOOK_FACTORY
          });
          commands.execute(CommandIDs.open, {
            path,
            factory: GRIDSTACK_EDITOR_FACTORY,
            options: { mode: 'split-right' }
          });
        });
      }
    });

    router.register({ command, pattern: treePattern });
  }
};

const plugins = [
  codeEditorServices,
  doc,
  paths,
  router,
  sessionDialogs,
  shortcuts,
  translator,
  tree
];

export default plugins;
