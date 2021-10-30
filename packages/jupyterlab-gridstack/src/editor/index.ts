import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer,
} from '@jupyterlab/application';

import { NotebookPanel, StaticNotebook } from '@jupyterlab/notebook';

import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { IEditorServices } from '@jupyterlab/codeeditor';

import { WidgetTracker } from '@jupyterlab/apputils';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { VoilaGridStackWidgetFactory } from './factory';

import { IVoilaGridStackTracker, VoilaGridStackWidget } from './widget';

import { VoilaButton, EditorButton } from './components/notebookButtons';

/**
 * The main editor plugin.
 */
export const editor: JupyterFrontEndPlugin<IVoilaGridStackTracker> = {
  id: '@voila-dashboards/jupyterlab-gridstack:editor',
  autoStart: true,
  provides: IVoilaGridStackTracker,
  requires: [
    NotebookPanel.IContentFactory,
    IMainMenu,
    IEditorServices,
    IRenderMimeRegistry,
  ],
  optional: [ILayoutRestorer],
  activate: (
    app: JupyterFrontEnd,
    contentFactory: NotebookPanel.IContentFactory,
    mainMenu: IMainMenu,
    editorServices: IEditorServices,
    rendermime: IRenderMimeRegistry,
    restorer: ILayoutRestorer | null
  ) => {
    const tracker = new WidgetTracker<VoilaGridStackWidget>({
      namespace: 'jupyterlab-gridstack',
    });

    if (restorer) {
      restorer.restore(tracker, {
        command: 'docmanager:open',
        args: (panel) => ({
          path: panel.context.path,
          factory: 'Voila GridStack',
        }),
        name: (panel) => panel.context.path,
        when: app.serviceManager.ready,
      });
    }

    const factory = new VoilaGridStackWidgetFactory({
      name: 'Voila GridStack',
      fileTypes: ['notebook'],
      modelName: 'notebook',
      preferKernel: true,
      canStartKernel: true,
      rendermime: rendermime,
      contentFactory,
      editorConfig: StaticNotebook.defaultEditorConfig,
      notebookConfig: StaticNotebook.defaultNotebookConfig,
      mimeTypeService: editorServices.mimeTypeService,
    });

    factory.widgetCreated.connect((sender, widget) => {
      widget.context.pathChanged.connect(() => {
        void tracker.save(widget);
      });

      void tracker.add(widget);
      widget.update();
      app.commands.notifyCommandChanged();
    });

    // Add undo/redo hooks to the edit menu.
    mainMenu.editMenu.undoers.add({
      tracker,
      undo: (widget: any) => widget.undo(),
      redo: (widget: any) => widget.redo(),
    });

    app.docRegistry.addWidgetFactory(factory);
    app.docRegistry.addWidgetExtension('Notebook', new VoilaButton());
    app.docRegistry.addWidgetExtension(
      'Notebook',
      new EditorButton(app.commands)
    );

    return tracker;
  },
};
