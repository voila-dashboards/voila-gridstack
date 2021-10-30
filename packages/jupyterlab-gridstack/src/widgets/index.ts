import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import { IJupyterWidgetRegistry } from '@jupyter-widgets/base';

import {
  registerWidgetManager,
  WidgetRenderer,
} from '@jupyter-widgets/jupyterlab-manager';

import { VoilaGridStackPanel } from '../editor/panel';

import { IVoilaGridStackTracker } from '../editor/widget';

function* widgetRenderers(
  editor: VoilaGridStackPanel
): IterableIterator<WidgetRenderer> {
  for (const w of editor.gridWidgets) {
    if (w instanceof WidgetRenderer) {
      yield w;
    }
  }
}

/**
 * A plugin to add support for rendering Jupyter Widgets in the editor.
 */
export const widgets: JupyterFrontEndPlugin<void> = {
  id: '@voila-dashboards/jupyterlab-gridstack:widgets',
  autoStart: true,
  optional: [IVoilaGridStackTracker, IJupyterWidgetRegistry],
  activate: (
    app: JupyterFrontEnd,
    voilaEditorTracker: IVoilaGridStackTracker | null,
    widgetRegistry: IJupyterWidgetRegistry | null
  ) => {
    if (!widgetRegistry) {
      return;
    }
    voilaEditorTracker?.forEach((panel) => {
      registerWidgetManager(
        panel.context,
        panel.content.rendermime,
        widgetRenderers(panel.content)
      );
    });

    voilaEditorTracker?.widgetAdded.connect((sender, panel) => {
      registerWidgetManager(
        panel.context,
        panel.content.rendermime,
        widgetRenderers(panel.content)
      );
    });
    console.log(widgets.id, 'activated');
  },
};
