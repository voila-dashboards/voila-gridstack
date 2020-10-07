import { Cell, CodeCell, MarkdownCell, InputArea } from '@jupyterlab/cells';

import { SimplifiedOutputArea, OutputArea } from '@jupyterlab/outputarea';

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
  constructor(cell: Cell, info: DasboardCellInfo) {
    super();
    this.removeClass('lm-Widget');
    this.removeClass('p-Widget');
    this.removeClass('lm-Panel');
    this.removeClass('p-Panel');
    this.addClass('grid-stack-item-content');

    this._cell = cell;
    this._info = info;
    this._type = cell.model.type;

    this._cell.model.contentChanged.connect(this.update, this);

    if (this._type === 'code') {
      this._cell.inputHidden = true;
    }

    this.addWidget(this._cell);
  }

  dispose(): void {
    console.debug('Cell disposed');
    this._cell.dispose();
    this._cell = null;
    Signal.clearData(this);
  }

  onUpdateRequest(): void {
    console.debug('updating cell');
    this._cell.update();
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

    this.update();
  }

  cell(): Cell {
    return this._cell;
  }

  output(): InputArea | OutputArea | Cell {
    if (this._type === 'code') {
      return (this._cell as CodeCell).outputArea;
    } else if (this._type === 'markdown') {
      (this._cell as MarkdownCell).inputHidden = false;
      (this._cell as MarkdownCell).rendered = true;
      return this._cell;
    } else {
      return this._cell.inputArea;
    }
  }

  get info(): DasboardCellInfo {
    return this._info;
  }

  set info(info: DasboardCellInfo) {
    this._info = info;
  }

  private _cell: Cell;
  private _info: DasboardCellInfo;
  private _type: 'code' | 'markdown' | 'raw';
}
