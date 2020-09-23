import { GridStack, GridStackNode, GridHTMLElement } from 'gridstack';

import { Widget } from '@lumino/widgets';

import Cell from '../components/cell';

import 'gridstack/dist/gridstack.css';

export default class GridStackPanel extends Widget {
  private grid: GridStack;
  private cells: { [id: string]: Cell };

  constructor() {
    super();
    this.addClass('grid-panel');

    this.cells = {};
  }

  dispose = (): void => {
    super.dispose();
    this.cells = null;
    this.grid = null;
    console.debug('Grid disposed:', this.grid);
  };

  onUpdateRequest = (): void => {
    this.grid?.destroy();

    const grid = document.createElement('div');
    grid.className = 'grid-stack';
    this.node.append(grid);

    this.grid = GridStack.init({
      disableOneColumnMode: true,
      styleInHead: true
    });

    this.grid.on(
      'change',
      (event: Event, elements: GridHTMLElement | GridStackNode[]) => {
        // TODO: fix cast
        (elements as GridStackNode[]).forEach(e => {
          console.debug(e.id);
          this.cells[e.id];
        });
      }
    );

    for (const k in Object.keys(this.cells)) {
      const widget = document.createElement('div');
      widget.className = 'grid-stack-item';
      widget.append(this.cells[k].node);
      this.grid.addWidget(widget, { autoPosition: true });
      this.cells[k].update();
    }
  };

  addCell = (cell: Cell): void => {
    console.debug('Id:', cell.id);
    this.cells[cell.id] = cell;
    this.update();
  };
}
