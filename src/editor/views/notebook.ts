import { Widget } from '@lumino/widgets';

import { GridStack } from 'gridstack';

import 'gridstack/dist/gridstack.css';

import { GridItem } from './../components/gridItem';

export class NotebookView extends Widget {
  constructor() {
    super();
    this.addClass('grid-panel');
    this._cells = new Map<string, GridItem>();
  }

  dispose(): void {
    // console.debug('Dispose grid');
    super.dispose();
    this._cells = null;
    this._grid = null;
  }

  get cells(): Map<string, GridItem> {
    return this._cells;
  }

  set cells(cells: Map<string, GridItem>) {
    this._cells = cells;
  }

  onUpdateRequest(): void {
    this._grid?.destroy();

    const grid = document.createElement('div');
    grid.className = 'grid-stack';
    this.node.append(grid);

    this._grid = GridStack.init(
      {
        dragOut: true,
        disableResize: true,
        styleInHead: true
      },
      grid
    );

    this._grid.column(1);

    this._cells.forEach((value: GridItem, key: string) => {
      const widget = document.createElement('div');
      widget.className = 'grid-stack-item';
      widget.append(value.node);

      const options = {
        id: key,
        height: 2,
        noResize: true,
        autoPosition: true
      };

      this._grid.addWidget(widget, options);
    });
  }

  getItem(id: string): GridItem {
    return this._cells.get(id);
  }

  addItem(id: string, cell: GridItem): void {
    this._cells.set(id, cell);
    this.update();
  }

  removeItem(id: string): boolean {
    return this._cells.delete(id);
  }

  private _grid: GridStack;
  private _cells: Map<string, GridItem>;
}
