import { Panel } from '@lumino/widgets';

export default class NotebookPanel extends Panel {
  constructor() {
    super();
    this.addClass('jp-Notebook');
  }
}
