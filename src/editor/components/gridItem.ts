import { Cell, CodeCell, MarkdownCell } from '@jupyterlab/cells';

import { SimplifiedOutputArea } from '@jupyterlab/outputarea';

import { CodeMirrorEditor } from '@jupyterlab/codemirror';

// import {  } from '@jupyterlab/codeeditor';

import {
  IRenderMimeRegistry,
  renderMarkdown,
  renderText
} from '@jupyterlab/rendermime';

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
  constructor(
    cell: Cell,
    info: DasboardCellInfo,
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

  get notebookCell(): HTMLElement {
    const item = document.createElement('div');
    item.className = 'grid-stack-item';
    item.className = 'grid-item';

    const content = document.createElement('div');
    content.className = 'grid-stack-item-content';

    this._input();
    content.appendChild(this._notebookCell);
    item.appendChild(content);
    return item;
  }

  get gridCell(): HTMLElement {
    const item = document.createElement('div');
    item.className = 'grid-stack-item';
    item.className = 'grid-item';

    const content = document.createElement('div');
    content.className = 'grid-stack-item-content';

    this._output();
    content.appendChild(this._gridCell);
    item.appendChild(content);
    return item;
  }

  get height(): number {
    return this._notebookCell.scrollHeight + 20;
  }

  execute(sessionContext: ISessionContext): void {
    if (this._type === 'code') {
      SimplifiedOutputArea.execute(
        this._cell.model.value.text,
        (this._cell as CodeCell).outputArea,
        sessionContext
      )
        .then(value => {
          /*console.info('executed:', value)*/
        })
        .catch(reason => console.error(reason));
    } else if (this._type === 'markdown') {
      (this._cell as MarkdownCell).inputHidden = false;
      (this._cell as MarkdownCell).rendered = true;
    }

    this.update();
  }

  private _input(): void {
    this._notebookCell = document.createElement('div');
    this._notebookCell.className = 'grid-content';

    if (this._type === 'markdown') {
      renderMarkdown({
        host: this._notebookCell,
        source: this._cell.model.value.text,
        sanitizer: this._rendermime.sanitizer,
        latexTypesetter: this._rendermime.latexTypesetter,
        linkHandler: this._rendermime.linkHandler,
        resolver: this._rendermime.resolver,
        shouldTypeset: false,
        trusted: true
      });
    } else if (this._type === 'code') {
      const input = (this._cell as CodeCell).editor;
      const itemIn = document.createElement('div');
      itemIn.className = 'jp-InputArea-editor';
      new CodeMirrorEditor({
        host: itemIn,
        model: input.model,
        config: {
          mode: input.model.mimeType,
          codeFolding: false,
          readOnly: true
        },
        selectionStyle: input.selectionStyle
      });
      this._notebookCell.appendChild(itemIn);

      const out = (this._cell as CodeCell).outputArea;
      const itemOut = new SimplifiedOutputArea({
        model: out.model,
        rendermime: out.rendermime,
        contentFactory: out.contentFactory
      });
      this._notebookCell.appendChild(itemOut.node);
    } else {
      renderText({
        host: this._notebookCell,
        source: this._cell.model.value.text,
        sanitizer: this._rendermime.sanitizer
      });
    }
  }

  private _output(): void {
    this._gridCell = document.createElement('div');
    this._gridCell.className = 'grid-content';

    if (this._type === 'markdown') {
      renderMarkdown({
        host: this._gridCell,
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

      this._gridCell.appendChild(item.node);
    } else {
      renderText({
        host: this._gridCell,
        source: this._cell.model.value.text,
        sanitizer: this._rendermime.sanitizer
      });
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
  private _rendermime: IRenderMimeRegistry;
  private _notebookCell: HTMLElement;
  private _gridCell: HTMLElement;
}
