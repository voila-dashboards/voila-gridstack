import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILayoutRestorer
} from '@jupyterlab/application';

import { WidgetTracker } from '@jupyterlab/apputils';

import VoilaWidgetFactory from './factory';

import VoilaEditor from './widget';

export const editor: JupyterFrontEndPlugin<void> = {
  id: 'voila-editor/editor',
  autoStart: true,
  optional: [ILayoutRestorer],
  activate: (app: JupyterFrontEnd, restorer: ILayoutRestorer | null) => {
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
      defaultFor: ['notebook'],
      preferKernel: true,
      canStartKernel: true
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
  }
};
