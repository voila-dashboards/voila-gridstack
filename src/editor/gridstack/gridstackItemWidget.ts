import { Widget } from '@lumino/widgets';

/**
 * A Lumino widget for gridstack items.
 */
export class GridStackItem extends Widget {
  constructor(cellId: string, widget: HTMLElement, close: HTMLElement) {
    super();
    this.removeClass('lm-Widget');
    this.removeClass('p-Widget');
    this.addClass('grid-stack-item');

    this.cellId = cellId;

    const content = document.createElement('div');
    content.className = 'grid-stack-item-content';

    const toolbar = document.createElement('div');
    toolbar.className = 'grid-item-toolbar';

    toolbar.appendChild(close);
    content.appendChild(toolbar);
    content.appendChild(widget);
    this.node.appendChild(content);
  }

  cellId: string;
}
