import { Cell, CodeCell, MarkdownCell } from '@jupyterlab/cells';

import { SimplifiedOutputArea } from '@jupyterlab/outputarea';

import { closeIcon } from '@jupyterlab/ui-components';

import {
  IRenderMimeRegistry,
  renderMarkdown,
  renderText
} from '@jupyterlab/rendermime';

import { ISessionContext } from '@jupyterlab/apputils';

import { ISignal, Signal } from '@lumino/signaling';

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
  constructor(
    cell: Cell,
    info: DasboardCellView,
    rendermime: IRenderMimeRegistry
  ) {
    super();
    this.removeClass('lm-Widget');
    this.removeClass('p-Widget');
    this.removeClass('lm-Panel');
    this.removeClass('p-Panel');

    this._cell = cell;
    this._info = info;
    this._type = cell.model.type;
    this._rendermime = rendermime;

    this._cell.model.contentChanged.connect(this.update, this);
  }

  dispose(): void {
    this._cell.dispose();
    this._cell = null;
    Signal.clearData(this);
  }

  onUpdateRequest(): void {
    this._cell.update();
  }

  get info(): DasboardCellView {
    return this._info;
  }

  set info(info: DasboardCellView) {
    this._info = info;
  }

  get closeSignal(): ISignal<this, string> {
    return this._closeSignal;
  }

  gridCell(create: boolean): HTMLElement {
    if (!this._gridCell || create) {
      this._output();
    }

    return this._gridCell;
  }

  execute(sessionContext: ISessionContext): void {
    if (this._type === 'code') {
      SimplifiedOutputArea.execute(
        this._cell.model.value.text,
        (this._cell as CodeCell).outputArea,
        sessionContext
      ).catch(reason => console.error(reason));
    } else if (this._type === 'markdown') {
      (this._cell as MarkdownCell).inputHidden = false;
      (this._cell as MarkdownCell).rendered = true;
    }

    this.update();
  }

  private _output(): void {
    const cell = document.createElement('div');
    cell.className = 'grid-content';

    if (this._type === 'markdown') {
      renderMarkdown({
        host: cell,
        source: this._cell.model.value.text,
        sanitizer: this._rendermime.sanitizer,
        latexTypesetter: this._rendermime.latexTypesetter,
        linkHandler: this._rendermime.linkHandler,
        resolver: this._rendermime.resolver,
        shouldTypeset: false,
        trusted: true
      });
    } else if (this._type === 'code') {
      const out = (this._cell as CodeCell).outputArea;

      const item = new SimplifiedOutputArea({
        model: out.model,
        rendermime: out.rendermime,
        contentFactory: out.contentFactory
      });

      cell.appendChild(item.node);
    } else {
      renderText({
        host: cell,
        source: this._cell.model.value.text,
        sanitizer: this._rendermime.sanitizer
      });
    }

    const item = document.createElement('div');
    item.className = 'grid-stack-item';
    item.className = 'grid-item';

    const content = document.createElement('div');
    content.className = 'grid-stack-item-content';

    const button = document.createElement('div');
    button.className = 'close-button';
    const close = document.createElement('div');
    closeIcon.element({
      container: close,
      height: '16px',
      width: '16px',
      marginRight: '10px'
    });
    close.onclick = () => {
      console.debug('Close id:', this._cell.model.id);
      this._closeSignal.emit(this._cell.model.id);
    };

    button.appendChild(close);
    content.appendChild(button);
    content.appendChild(cell);
    item.appendChild(content);

    this._gridCell = item;
  }

  private _cell: Cell;
  private _info: DasboardCellView;
  private _type: 'code' | 'markdown' | 'raw';
  private _rendermime: IRenderMimeRegistry;
  private _gridCell: HTMLElement;
  private _closeSignal = new Signal<this, string>(this);
}
