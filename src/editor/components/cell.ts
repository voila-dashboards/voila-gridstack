import { CodeCell, MarkdownCell } from '@jupyterlab/cells';

import { Panel } from '@lumino/widgets';

export default class CellView extends Panel {
  constructor(cell: CodeCell | MarkdownCell) {
    super();
    this.addClass('grid-stack-item-content');

    this._cell = cell;

    if (this._cell.model.type === 'code') {
      const out = (this._cell as CodeCell).outputArea;
      out.addClass('cell');
      this.addWidget(out);
    } else if (this._cell.model.type === 'markdown') {
      (this._cell as MarkdownCell).rendered = true;
      (this._cell as MarkdownCell).inputHidden = false;
      this._cell.addClass('cell');
      this.addWidget(this._cell);
    }

    this._cell.update();
  }

  onUpdateRequest(): void {
    this._cell.update();
  }

  private _cell: CodeCell | MarkdownCell;
}
