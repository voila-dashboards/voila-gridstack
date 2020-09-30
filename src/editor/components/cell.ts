import { CodeCell, MarkdownCell } from '@jupyterlab/cells';

import { Panel } from '@lumino/widgets';

export type DasboardCellInfo = {
  version: number;
  views: { [id: string]: DasboardCellView };
};

export type DasboardCellView = {
  hidden: boolean;
  row: number;
  col: number;
  width: number;
  height: number;
};

export class GridItem extends Panel {
  constructor(cell: CodeCell | MarkdownCell, info: DasboardCellInfo) {
    super();
    this.addClass('grid-stack-item-content');

    this._cell = cell;
    this._info = info;

    if (this._cell.model.type === 'code') {
      this._isCode = true;
      const out = (this._cell as CodeCell).outputArea;
      out.addClass('cell');
      this.addWidget(out);
      out.update();
    } else if (this._cell.model.type === 'markdown') {
      this._isCode = false;
      (this._cell as MarkdownCell).rendered = true;
      (this._cell as MarkdownCell).inputHidden = false;
      this._cell.addClass('cell');
      this.addWidget(this._cell);
      this._cell.update();
    }

    this._cell.update();
  }

  dispose(): void {
    this._cell.dispose();
    this._cell = null;
  }

  onUpdateRequest(): void {
    if (!this._isCode) {
      this._cell.update();
    } else {
      (this._cell as CodeCell).outputArea.update();
    }
  }

  get info(): DasboardCellInfo {
    return this._info;
  }

  set info(info: DasboardCellInfo) {
    this._info = info;
  }

  private _isCode: boolean;
  private _cell: CodeCell | MarkdownCell;
  private _info: DasboardCellInfo;
}
