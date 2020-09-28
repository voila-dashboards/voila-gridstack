import { Widget } from '@lumino/widgets';

import { GridStack, GridStackNode, GridHTMLElement } from 'gridstack';

import Cell from '../components/cell';

import 'gridstack/dist/gridstack.css';

export default class GridStackPanel extends Widget {
  constructor() {
    super();
    this.addClass('grid-panel');

    this._cells = {};
  }

  dispose(): void {
    super.dispose();
    this._cells = null;
    this._grid = null;
    console.debug('Grid disposed:', this._grid);
  }

  onUpdateRequest(): void {
    this._grid?.destroy();

    const grid = document.createElement('div');
    grid.className = 'grid-stack';
    this.node.append(grid);

    this._grid = GridStack.init({
      disableOneColumnMode: true,
      styleInHead: true
    });

    this._grid.on(
      'change',
      (event: Event, elements: GridHTMLElement | GridStackNode[]) => {
        // TODO: fix cast
        (elements as GridStackNode[]).forEach(e => {
          console.debug(e.id);
          this._cells[e.id];
        });
      }
    );

    for (const k in Object.keys(this._cells)) {
      const widget = document.createElement('div');
      widget.className = 'grid-stack-item';
      widget.append(this._cells[k].node);
      this._grid.addWidget(widget, { autoPosition: true });
      this._cells[k].update();
    }
  }

  addCell(cell: Cell): void {
    console.debug('Id:', cell.id);
    this._cells[cell.id] = cell;
    this.update();
  }

  private _grid: GridStack;
  private _cells: { [id: string]: Cell };
}
