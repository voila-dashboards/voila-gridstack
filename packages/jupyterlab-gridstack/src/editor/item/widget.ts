import { Widget, Panel } from '@lumino/widgets';

import { ISignal } from '@lumino/signaling';

import { GridStackItemModel, ItemState } from './model';

import { GridStackItemToolbar } from './toolbar';

/**
 * A Lumino widget for gridstack items.
 */
export class GridStackItemWidget extends Panel {
  constructor(cell: Widget, model: GridStackItemModel) {
    super();
    this.removeClass('lm-Widget');
    this.removeClass('p-Widget');
    this.addClass('grid-stack-item');

    this._model = model;

    const content = new Panel();
    content.addClass('grid-stack-item-content');

    content.addWidget(new GridStackItemToolbar(this._model));

    cell.addClass('grid-item-widget');
    content.addWidget(cell);

    this.addWidget(content);
  }

  get cellId(): string {
    return this._model.cellId;
  }

  get isLocked(): boolean {
    return this._model.isLocked;
  }

  get stateChanged(): ISignal<GridStackItemModel, ItemState> {
    return this._model.stateChanged;
  }

  private _model: GridStackItemModel;
}
