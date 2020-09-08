import { Panel } from '@lumino/widgets';

import Cell from '../components/cell';

export default class NotebookPanel extends Panel {

  constructor() {
    super();
    this.addClass('jp-Notebook');
  }

  addCell = (cell: Cell) => {
    this.addWidget(cell);
    this.update();
  }
}