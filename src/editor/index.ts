import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';

import { NotebookPanel, StaticNotebook } from '@jupyterlab/notebook';

import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { IEditorServices } from '@jupyterlab/codeeditor';

import { WidgetTracker } from '@jupyterlab/apputils';

import { VoilaWidgetFactory } from './factory';

import { IVoilaEditorTracker, VoilaEditor } from './widget';

import { VoilaButton, EditorButton } from './components/notebookButtons';

export const editor: JupyterFrontEndPlugin<IVoilaEditorTracker> = {
  id: 'voila-editor/editor',
  autoStart: true,
  provides: IVoilaEditorTracker,
  optional: [],
  requires: [
    ILayoutRestorer,
    NotebookPanel.IContentFactory,
    IEditorServices,
    IRenderMimeRegistry
  ],
  activate: (
    app: JupyterFrontEnd,
    restorer: ILayoutRestorer | null,
    contentFactory: NotebookPanel.IContentFactory,
    editorServices: IEditorServices,
    rendermime: IRenderMimeRegistry
  ) => {
    const tracker = new WidgetTracker<VoilaEditor>({
      namespace: 'voila-editor'
    });

    if (restorer) {
      restorer.restore(tracker, {
        command: 'docmanager:open',
        args: panel => ({ path: panel.context.path, factory: 'Voila Editor' }),
        name: panel => panel.context.path,
        when: app.serviceManager.ready
      });
    }

    const factory = new VoilaWidgetFactory({
      name: 'Voila Editor',
      fileTypes: ['notebook'],
      modelName: 'notebook',
      preferKernel: true,
      canStartKernel: true,
      rendermime: rendermime,
      contentFactory,
      editorConfig: StaticNotebook.defaultEditorConfig,
      notebookConfig: StaticNotebook.defaultNotebookConfig,
      mimeTypeService: editorServices.mimeTypeService
    });

    factory.widgetCreated.connect((sender, widget) => {
      widget.context.pathChanged.connect(() => {
        void tracker.save(widget);
      });

      void tracker.add(widget);
      widget.update();
      app.commands.notifyCommandChanged();
    });

    app.docRegistry.addWidgetFactory(factory);

    app.docRegistry.addWidgetExtension('Notebook', new VoilaButton());
    app.docRegistry.addWidgetExtension(
      'Notebook',
      new EditorButton(app.commands)
    );

    return tracker;
  }
};
