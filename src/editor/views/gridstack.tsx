import GridStack from 'gridstack/dist/gridstack.all.js';
import 'gridstack/dist/gridstack.css';

import { Widget } from '@lumino/widgets';

export default class GridStackPanel extends Widget {
  private grid: GridStack;
  private gridStack: HTMLDivElement;

  constructor() {
    super();
    this.removeClass('lm-Widget');
    this.removeClass('p-Widget');
    this.removeClass('lm-Panel');
    this.removeClass('p-Panel');
    
    //this.addClass('jp-Notebook');
    this.addClass('grid-panel');
  }

  /*onUpdateRequest = () => {
    this.grid = GridStack.init({
      //column: 10,
      //cellHeight: 0,
      minWidth: '400px',
      styleInHead: true
    }, this.gridStack);

    var aux1 = `<div class="grid-stack-item"><div class="grid-stack-item-content">1</div></div>`;
		this.grid.addWidget(aux1, 0, 0, 1, 1, true);

		var aux2 = `<div class="grid-stack-item"><div class="grid-stack-item-content">widget</div></div>`;
		this.grid.addWidget(aux2, 1, 0, 1, 1, true);

		var aux3 = `<div class="grid-stack-item"><div class="grid-stack-item-content">3</div></div>`;
		this.grid.addWidget(aux3, 1, 1, 1, 1, true);

		var aux4 = `<div class="grid-stack-item"><div class="grid-stack-item-content">4</div></div>`;
    this.grid.addWidget(aux4, 1, 1, 1, 1, true);
  }*/

  onAfterAttach = () => {
    this.gridStack = document.createElement('div');
    this.gridStack.className = 'grid-stack';
    this.node.appendChild(this.gridStack);

    console.info(this.gridStack);
    //debugger;
    this.grid = GridStack.init({
      //column: 10,
      //cellHeight: 0,
      minWidth: '400px',
      styleInHead: true
    }, this.gridStack);

    var aux1 = `<div class="grid-stack-item"><div class="grid-stack-item-content">1</div></div>`;
		this.grid.addWidget(aux1, 0, 0, 1, 1, true);

		var aux2 = `<div class="grid-stack-item"><div class="grid-stack-item-content">widget</div></div>`;
		this.grid.addWidget(aux2, 1, 0, 1, 1, true);

		var aux3 = `<div class="grid-stack-item"><div class="grid-stack-item-content">3</div></div>`;
		this.grid.addWidget(aux3, 1, 1, 1, 1, true);

		var aux4 = `<div class="grid-stack-item"><div class="grid-stack-item-content">4</div></div>`;
    this.grid.addWidget(aux4, 1, 1, 1, 1, true);
  }
  
  /*
  addWidgets = () => {
    var aux1 = `<div class="grid-stack-item"><div class="grid-stack-item-content">1</div></div>`;
		this.grid.addWidget(aux1, 0, 0, 1, 1, true);

		var aux2 = `<div class="grid-stack-item"><div class="grid-stack-item-content">widget</div></div>`;
		this.grid.addWidget(aux2, 1, 0, 1, 1, true);

		var aux3 = `<div class="grid-stack-item"><div class="grid-stack-item-content">3</div></div>`;
		this.grid.addWidget(aux3, 1, 1, 1, 1, true);

		var aux4 = `<div class="grid-stack-item"><div class="grid-stack-item-content">4</div></div>`;
    this.grid.addWidget(aux4, 1, 1, 1, 1, true);
	} */
}