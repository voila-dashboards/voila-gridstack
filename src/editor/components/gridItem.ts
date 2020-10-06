import { Cell, CodeCell, MarkdownCell } from '@jupyterlab/cells';

import { SimplifiedOutputArea } from '@jupyterlab/outputarea';

import { ISessionContext } from '@jupyterlab/apputils';

import { Signal } from '@lumino/signaling';

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
  constructor(cell: Cell, info: DasboardCellInfo, isOutput: boolean) {
    super();
    this.removeClass('lm-Widget');
    this.removeClass('p-Widget');
    this.removeClass('lm-Panel');
    this.removeClass('p-Panel');
    this.addClass('grid-stack-item-content');

    this._cell = cell;
    this._info = info;
    this._isOutput = isOutput;
    this._type = this._cell.model.type;

    this._cell.model.contentChanged.connect(this.updateCell, this);

    if (this._isOutput) {
      if (this._type === 'code') {
        this._cell.inputHidden = true;
      }

      this._cell.addClass('grid-content');
      this.addWidget(this._cell);
    } else {
      this.addWidget(this._cell);
    }

    this._cell.update();
  }

  dispose(): void {
    this._cell.dispose();
    this._cell = null;
    Signal.clearData(this);
  }

  onUpdateRequest(): void {
    this._cell.update();
  }

  updateCell(): void {
    this._cell.editor.refresh();
    this._cell.update();
    console.debug('updating cell');
  }

  execute(sessionContext: ISessionContext): void {
    if (this._type === 'code') {
      SimplifiedOutputArea.execute(
        this._cell.model.value.text,
        (this._cell as CodeCell).outputArea,
        sessionContext
      )
        .then(value => console.info('executed:', value))
        .catch(reason => console.error(reason));
    } else if (this._type === 'markdown') {
      (this._cell as MarkdownCell).inputHidden = false;
      (this._cell as MarkdownCell).rendered = true;
    }

    this._cell.update();
  }

  get info(): DasboardCellInfo {
    return this._info;
  }

  set info(info: DasboardCellInfo) {
    this._info = info;
  }

  private _cell: Cell;
  private _info: DasboardCellInfo;
  private _isOutput: boolean;
  private _type: 'code' | 'markdown' | 'raw';
}
