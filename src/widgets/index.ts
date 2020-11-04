import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IJupyterWidgetRegistry } from '@jupyter-widgets/base';

import { IVoilaEditorTracker } from '../editor/widget';

export const widgets: JupyterFrontEndPlugin<void> = {
  id: 'voila-editor/widgets',
  autoStart: true,
  optional: [IVoilaEditorTracker, IJupyterWidgetRegistry],
  activate: (
    app: JupyterFrontEnd,
    voilaEditorTracker: IVoilaEditorTracker | null,
    widgeRegistry: IJupyterWidgetRegistry | null
  ) => {
    console.log(widgets.id, 'activated');
  }
};
