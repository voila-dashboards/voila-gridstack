import { DocumentRegistry, DocumentWidget } from "@jupyterlab/docregistry";
import { INotebookModel } from "@jupyterlab/notebook";
import { listIcon, } from '@jupyterlab/ui-components';

import EditorPanel from './panel';

import ViewSelector from './toolbar/viewSelector';

export default class VoilaEditor extends DocumentWidget<EditorPanel, INotebookModel> {
  
  constructor(context: DocumentRegistry.IContext<INotebookModel>) {
    super({ context, content: new EditorPanel(context.model) });
    this.id = 'voila-editor/editor:widget';
    this.title.label = 'Voila Editor';
    this.title.closable = true;
    this.title.icon = listIcon;

    // Adding the buttons in widget toolbar
    this.toolbar.addItem('status', new ViewSelector());
  }

  dispose(): void {
    super.dispose();
  }
}