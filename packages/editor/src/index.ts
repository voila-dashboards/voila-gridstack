// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { PageConfig, URLExt } from '@jupyterlab/coreutils';
(window as any).__webpack_public_path__ = URLExt.join(
  PageConfig.getBaseUrl(),
  'example/'
);

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

import { ITranslator, TranslationManager } from '@jupyterlab/translation';

import { Widget } from '@lumino/widgets';

import { App } from './app/app';

import '../style/index.css';

const codeEditorServices: JupyterFrontEndPlugin<IEditorServices> = {
  id: 'editor:services',
  provides: IEditorServices,
  activate: () => editorServices
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

const sessionDialogs: JupyterFrontEndPlugin<ISessionContextDialogs> = {
  id: 'editor:sessionDialogs',
  provides: ISessionContextDialogs,
  autoStart: true,
  activate: () => sessionContextDialogs
};

const doc: JupyterFrontEndPlugin<IDocumentManager> = {
  id: 'editor:docmanager',
  provides: IDocumentManager,
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    const opener = {
      open: (widget: Widget) => {
        // add the widget to the notebook area
        app.shell.add(widget, 'main');
      }
    };
    const docManager = new DocumentManager({
      registry: app.docRegistry,
      manager: app.serviceManager,
      opener
    });
    setTimeout(() => {
      // TODO: fix this
      docManager.open('basics.ipynb', 'Notebook');
    }, 2000);
    return docManager;
  }
};

/**
 * The main function
 */
async function main(): Promise<void> {
  const app = new App();
  const mods = [
    translator,
    doc,
    codeEditorServices,
    sessionDialogs,
    require('./plugins/paths'),
    require('./plugins/example'),
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
