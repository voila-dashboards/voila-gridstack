import { DocumentWidget, Context } from "@jupyterlab/docregistry";
import { INotebookModel } from "@jupyterlab/notebook";
import { listIcon } from '@jupyterlab/ui-components';

import EditorPanel from './panel';

import Save from './toolbar/save';

export default class VoilaEditor extends DocumentWidget<EditorPanel, INotebookModel> {
  private save: Save;

  constructor(context: Context<INotebookModel>, content: EditorPanel) {
    super({ context, content });
    this.id = 'voila-editor/editor:widget';
    this.title.label = 'Voila Editor';
    this.title.closable = true;
    this.title.icon = listIcon;

    // Adding the buttons in widget toolbar
    this.save = new Save(this.content);
    this.toolbar.addItem('save', this.save);
  }

  dispose(): void {
    super.dispose();
    console.debug("Widget dispose");
  }
}

