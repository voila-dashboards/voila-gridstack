import { Widget } from '@lumino/widgets';

import { GridStack } from 'gridstack';

import 'gridstack/dist/gridstack.css';

import { GridItem } from './../components/gridItem';

export class NotebookView extends Widget {
  constructor(cells: Map<string, GridItem>) {
    super();
    this.removeClass('lm-Widget');
    this.removeClass('p-Widget');
    this.addClass('grid-notebook');

    this._cells = cells;
  }

  dispose(): void {
    //console.debug('Dispose notebook grid');
    super.dispose();
    this._grid?.destroy();
    this._grid = null;
  }

  onAfterShow(): void {
    // console.debug("onAfterShow:", this._grid);
  }

  onBeforeHide(): void {
    // console.debug("onBeforeHide:", this._grid);
  }

  onUpdateRequest(): void {
    //console.debug("onUpdateRequest:", this._grid);
    if (!this._grid) {
      this._initGridStack();
    }
    this._grid?.removeAll();

    this._cells.forEach((value: GridItem, key: string) => {
      //console.debug("ID notebook: ", key);
      const options = { id: key, height: 1, noResize: true };
      const widget = value.notebookCell;
      this._grid.addWidget(widget, options);

      if (value.height !== 0 && this._grid.getCellHeight() !== 0) {
        const height = Math.ceil(value.height / this._grid.getCellHeight() + 1);
        this._grid.update(widget, null, null, null, height);
      }
    });
  }

  private _initGridStack(): void {
    //console.debug("_initGridStack");
    const grid = document.createElement('div');
    grid.className = 'grid-stack';
    this.node.appendChild(grid);

    this._grid = GridStack.init(
      {
        dragOut: true,
        removable: false,
        styleInHead: true
      },
      grid
    );
    this._grid.column(1);
  }

  private _grid: GridStack;
  private _cells: Map<string, GridItem>;
}
