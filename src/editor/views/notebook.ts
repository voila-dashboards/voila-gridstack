import { Widget } from '@lumino/widgets';

import { GridStack } from 'gridstack';

import 'gridstack/dist/gridstack.css';

import { GridItem } from './../components/gridItem';

export class NotebookView extends Widget {
  constructor(cells: Map<string, GridItem>) {
    super();
    this.removeClass('lm-Widget');
    this.removeClass('p-Widget');
    this.addClass('grid-stack');
    this.addClass('grid-notebook');

    this._cells = cells;
    console.debug('notebook init');
  }

  dispose(): void {
    console.debug('Dispose notebook grid');
    super.dispose();
    this._grid = null;
  }

  onUpdateRequest(): void {
    this._grid?.removeAll();

    this._grid = GridStack.init(
      {
        cellHeight: 100,
        dragOut: true,
        removable: false,
        styleInHead: true
      },
      '.grid-stack.grid-notebook'
    );

    this._grid.column(1);

    this._cells.forEach((value: GridItem, key: string) => {
      console.debug('New cell in notebook');
      const widget = document.createElement('div');
      widget.className = 'grid-stack-item';
      widget.appendChild(value.node);

      const options = {
        id: key,
        noResize: true,
        autoPosition: true
      };

      this._grid.addWidget(widget, options);
    });
  }

  private _grid: GridStack;
  private _cells: Map<string, GridItem>;
}
