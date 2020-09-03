import { INotebookModel } from '@jupyterlab/notebook';
import { SplitPanel, Panel } from '@lumino/widgets';

import NotebookPanel from './views/notebook';
import GridStackPanel from './views/gridstack';

export default class EditorPanel extends Panel {
  private nb: INotebookModel = null;

  constructor(model: INotebookModel) {
    super();
    this.nb = model;
    //this.addWidget(new NotebookPanel(this.nb));
    this.addWidget(new GridStackPanel());
  }
}