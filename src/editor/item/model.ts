import { Widget } from '@lumino/widgets';

import { Signal, ISignal } from '@lumino/signaling';

export enum ItemState {
  CLOSED,
  LOCKED,
  UNLOCKED,
}

export class GridStackItemModel {
  constructor(options: GridStackItemModel.IOptions) {
    this._cellId = options.cellId;

    this._isLocked = options.isLocked;
    this._stateChanged = new Signal<this, ItemState>(this);
  }

  get cellId(): string {
    return this._cellId;
  }

  get isLocked(): boolean {
    return this._isLocked;
  }

  get stateChanged(): ISignal<this, ItemState> {
    return this._stateChanged;
  }

  dispose() {
    Signal.clearData(this);
  }

  close(): void {
    this._stateChanged.emit(ItemState.CLOSED);
  }

  lock(): void {
    this._isLocked = true;
    this._stateChanged.emit(ItemState.LOCKED);
  }

  unlock(): void {
    this._isLocked = false;
    this._stateChanged.emit(ItemState.UNLOCKED);
  }

  private _isLocked: boolean;
  private _cellId = '';
  private _stateChanged: Signal<this, ItemState>;
}

/**
 * A namespace for GridStackItem statics.
 */
export namespace GridStackItemModel {
  /**
   *  Options interface for GridStackItem
   */
  export interface IOptions {
    /**
     * The cell Id.
     */
    cellId: string;
    /**
     * The cell widget.
     */
    cellWidget: Widget;
    /**
     * If the cell is pinned or not.
     */
    isLocked: boolean;
  }
}
