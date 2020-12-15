import { Widget } from '@lumino/widgets';

/**
 * A Lumino widget for gridstack items.
 */
export class GridStackItem extends Widget {
  constructor(cellId: string, item: Widget, close: HTMLElement) {
    super();
    this.removeClass('lm-Widget');
    this.removeClass('p-Widget');
    this.addClass('grid-stack-item');

    const content = document.createElement('div');
    content.className = 'grid-stack-item-content';

    const toolbar = document.createElement('div');
    toolbar.className = 'grid-item-toolbar';

    const cell = document.createElement('div');
    cell.className = 'grid-item-widget';
    this._cell = cell;

    this._item = item;
    this._cellId = cellId;

    toolbar.appendChild(close);
    content.appendChild(toolbar);
    content.appendChild(cell);
    this.node.appendChild(content);
  }

  get cellId(): string {
    return this._cellId;
  }

  onAfterAttach(): void {
    Widget.attach(this._item, this._cell);
  }

  private _cell: HTMLElement;
  private _item: Widget;
  private _cellId = '';
}
