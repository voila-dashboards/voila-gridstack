import { JupyterFrontEnd, JupyterFrontEndPlugin, ILayoutRestorer } from '@jupyterlab/application';
import { ABCWidgetFactory, DocumentRegistry } from "@jupyterlab/docregistry";
import { WidgetTracker, sessionContextDialogs } from '@jupyterlab/apputils';
import { INotebookModel } from '@jupyterlab/notebook';

import VoilaEditor from './widget';

export const editor: JupyterFrontEndPlugin<void> = {
  id: 'voila-editor/editor',
  autoStart: true,
  requires: [ILayoutRestorer],
  optional: [],
  activate: (app: JupyterFrontEnd, restorer: ILayoutRestorer) => {
    const { commands } = app;

    const tracker = new WidgetTracker<VoilaEditor>({ namespace: "voila-editor" });

    if (restorer) {
      restorer.restore(tracker, {
        command: "docmanager:open",
        args: panel => ({ path: panel.context.path, factory: "Voila" }),
        name: panel => panel.context.path,
        when: app.serviceManager.ready
      });
    }

    const factory = new VoilaWidgetFactory({
      name: "Voila",
      fileTypes: ["notebook"],
      modelName: "notebook",
      defaultRendered: ["notebook"],
      preferKernel: true
    });

    factory.widgetCreated.connect( (sender, widget) => {
      widget.context.pathChanged.connect(() => {
        void tracker.save(widget);
      });
      void tracker.add(widget);
    });

    app.docRegistry.addWidgetFactory(factory);
  }
};

class VoilaWidgetFactory extends ABCWidgetFactory<VoilaEditor, INotebookModel> {
  constructor(options: DocumentRegistry.IWidgetFactoryOptions<VoilaEditor>) {
    super(options);
  }

  protected createNewWidget(context: DocumentRegistry.IContext<INotebookModel>): VoilaEditor {
    context.sessionContext.initialize().then( value => {
      if (value) sessionContextDialogs.selectKernel(context.sessionContext);
    }).catch( e => console.error("Failed to initialize the kernel session.\n" + e) );

    return new VoilaEditor(context);
  }
}