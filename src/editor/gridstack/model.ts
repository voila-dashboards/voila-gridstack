import {
  CellList,
  INotebookModel,
  NotebookPanel,
  StaticNotebook,
} from '@jupyterlab/notebook';

import {
  ICellModel,
  CodeCell,
  CodeCellModel,
  MarkdownCell,
  MarkdownCellModel,
  RawCell,
  RawCellModel,
} from '@jupyterlab/cells';

import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { IEditorMimeTypeService } from '@jupyterlab/codeeditor';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { SimplifiedOutputArea } from '@jupyterlab/outputarea';

import { YNotebook, createMutex } from '@jupyter/ydoc';

import { Widget } from '@lumino/widgets';

import { Signal, ISignal } from '@lumino/signaling';

import * as Y from 'yjs';

import { GridStackItemWidget, GridStackItemModel, ItemState } from '../item';

import {
  DashboardView,
  DashboardCellView,
  validateDashboardView,
  validateDashboardCellView,
  CellChange,
} from '../format';

export const VIEW = 'grid_default';

/**
 * A gridstack model to keep the state.
 */
export class GridStackModel {
  /**
   * Construct a `GridStackModel`.
   *
   * @param options - The options to construct a new `GridStackModel`.
   */
  constructor(options: GridStackModel.IOptions) {
    this._context = options.context;
    this.rendermime = options.rendermime;
    this.contentFactory = options.contentFactory;
    this.mimeTypeService = options.mimeTypeService;
    this._editorConfig = options.editorConfig;
    this._notebookConfig = options.notebookConfig;

    this._ready = new Signal<this, null>(this);
    this._cellRemoved = new Signal<this, CellChange>(this);
    this._cellPinned = new Signal<this, CellChange>(this);
    this._stateChanged = new Signal<this, null>(this);
    this._contentChanged = new Signal<this, null>(this);

    this._info = {
      name: 'grid',
      type: 'grid',
      maxColumns: 12,
      cellMargin: 2,
      defaultCellHeight: 40,
    };

    this._context.sessionContext.ready.then(() => {
      this._checkMetadata();
      this._checkCellsMetadata();

      const ymodel = this._context.model.sharedModel as YNotebook;
      this._ystate = ymodel.ystate;
      if (this._ystate.get('executed') !== true) {
        ymodel.transact(() => {
          this._ystate.set('executed', false);
        }, false);
      }

      this._context.save().then((v) => {
        this._ready.emit(null);
      });
    });

    this._context.model.contentChanged.connect(this._updateCells, this);
  }

  /**
   * A signal emitted when the model is ready.
   */
  get ready(): ISignal<this, null> {
    return this._ready;
  }

  /**
   * A signal emitted when a cell is removed.
   */
  get cellRemoved(): ISignal<this, CellChange> {
    return this._cellRemoved;
  }

  /**
   * A signal emitted when a cell pinned.
   */
  get cellPinned(): ISignal<this, CellChange> {
    return this._cellPinned;
  }

  /**
   * A signal emitted when the model state changes.
   */
  get stateChanged(): ISignal<this, null> {
    return this._stateChanged;
  }

  /**
   * A signal emitted when the model content changes.
   */
  get contentChanged(): ISignal<this, null> {
    return this._contentChanged;
  }

  /**
   * The rendermime instance for this context.
   */
  readonly rendermime: IRenderMimeRegistry;
  /**
   * A notebook panel content factory.
   */
  readonly contentFactory: NotebookPanel.IContentFactory;
  /**
   * The service used to look up mime types.
   */
  readonly mimeTypeService: IEditorMimeTypeService;

  /**
   * A config object for cell editors.
   */
  get editorConfig(): StaticNotebook.IEditorConfig {
    return this._editorConfig;
  }
  /**
   * A config object for cell editors.
   *
   * @param value - A `StaticNotebook.IEditorConfig`.
   */
  set editorConfig(value: StaticNotebook.IEditorConfig) {
    this._editorConfig = value;
  }

  /**
   * A config object for notebook widget.
   */
  get notebookConfig(): StaticNotebook.INotebookConfig {
    return this._notebookConfig;
  }
  /**
   * A config object for notebook widget.
   *
   * @param value - A `StaticNotebook.INotebookConfig`.
   */
  set notebookConfig(value: StaticNotebook.INotebookConfig) {
    this._notebookConfig = value;
  }

  set executed(value: boolean) {
    this._ystate.set('executed', value);
  }

  /**
   * Getter for the dashboard metadata info.
   */
  get info(): DashboardView {
    return this._info;
  }

  /**
   * Setter for the dashboard metadata info.
   *
   * @param value - The new `DashboardView` metadata info.
   */
  set info(info: DashboardView) {
    this._info = info;
    this._mutex(() => {
      const data = this._context.model.sharedModel.getMetadata();

      (data as Record<string, any>).extensions.jupyter_dashboards.views[VIEW] =
        this._info;
      //this._context.model.metadata.set('extensions', data.extensions);
      this._context.model.sharedModel.setMetadata(data);
      this._context.model.dirty = true;
    });
  }

  /**
   * The Notebook's cells.
   */
  get cells(): CellList {
    return this._context.model.cells;
  }

  /**
   * Ids of the notebooks's deleted cells.
   */
  get deletedCells(): string[] {
    return this._context.model.deletedCells;
  }

  /**
   * Get the dashboard cell's metadata.
   *
   * @param id - Cell id.
   */
  public getCellInfo(id: string): DashboardCellView | undefined {
    for (let i = 0; i < this._context.model.cells?.length; i++) {
      const cell = this._context.model.cells.get(i);

      if (cell.id === id) {
        const data = cell.sharedModel.getMetadata().extensions as Record<
          string,
          any
        >;
        return data.jupyter_dashboards.views[VIEW];
      }
    }

    return undefined;
  }

  /**
   * Set the dashboard cell's metadata.
   *
   * @param id - Cell id.
   * @param info - DashboardCellView.
   */
  public setCellInfo(id: string, info: DashboardCellView): void {
    for (let i = 0; i < this._context.model.cells?.length; i++) {
      const cell = this._context.model.cells.get(i);

      if (cell.id === id) {
        this._mutex(() => {
          const data = cell.sharedModel.getMetadata().extensions as Record<
            string,
            any
          >;
          data.jupyter_dashboards.views[VIEW] = info;
          cell.sharedModel.setMetadata({ extensions: data });
          this._context.model.dirty = true;
        });
        break;
      }
    }
  }

  /**
   * Hide a cell.
   *
   * @param id - Cell id.
   */
  public hideCell(id: string): void {
    for (let i = 0; i < this._context.model.cells?.length; i++) {
      const cell = this._context.model.cells.get(i);

      if (cell.id === id) {
        this._mutex(() => {
          const data = cell.sharedModel.getMetadata().extensions as Record<
            string,
            any
          >;
          data.jupyter_dashboards.views[VIEW].hidden = true;
          cell.sharedModel.setMetadata({ extensions: data });
          this._context.model.dirty = true;
          this._cellRemoved.emit({
            id,
            info: data.jupyter_dashboards.views[VIEW],
          });
        });
        break;
      }
    }
  }

  /**
   * Lock/unlock a cell.
   *
   * @param id - Cell id.
   */
  public lockCell(id: string, lock: boolean): void {
    for (let i = 0; i < this._context.model.cells?.length; i++) {
      const cell = this._context.model.cells.get(i);

      if (cell.id === id) {
        this._mutex(() => {
          const data = cell.sharedModel.getMetadata().extensions as Record<
            string,
            any
          >;
          data.jupyter_dashboards.views[VIEW].locked = lock;
          cell.sharedModel.setMetadata({ extensions: data });
          this._context.model.dirty = true;
          this._cellPinned.emit({
            id,
            info: data.jupyter_dashboards.views[VIEW],
          });
        });
        break;
      }
    }
  }

  /**
   * Create a new cell widget from a `CellModel`.
   *
   * @param cellModel - `ICellModel`.
   */
  public createCell(
    cellModel: ICellModel,
    locked: boolean
  ): GridStackItemWidget {
    let item: Widget;

    switch (cellModel.type) {
      case 'code': {
        const codeCell = new CodeCell({
          model: cellModel as CodeCellModel,
          rendermime: this.rendermime,
          contentFactory: this.contentFactory,
          editorConfig: this._editorConfig.code,
        });

        item = new SimplifiedOutputArea({
          model: codeCell.outputArea.model,
          rendermime: codeCell.outputArea.rendermime,
          contentFactory: codeCell.outputArea.contentFactory,
        });

        break;
      }
      case 'markdown': {
        const markdownCell = new MarkdownCell({
          model: cellModel as MarkdownCellModel,
          rendermime: this.rendermime,
          contentFactory: this.contentFactory,
          editorConfig: this._editorConfig.markdown,
        });
        markdownCell.inputHidden = false;
        markdownCell.rendered = true;
        Private.removeElements(markdownCell.node, 'jp-Collapser');
        Private.removeElements(markdownCell.node, 'jp-InputPrompt');
        item = markdownCell;
        break;
      }
      default: {
        const rawCell = new RawCell({
          model: cellModel as RawCellModel,
          contentFactory: this.contentFactory,
          editorConfig: this._editorConfig.raw,
        });
        rawCell.inputHidden = false;
        Private.removeElements(rawCell.node, 'jp-Collapser');
        Private.removeElements(rawCell.node, 'jp-InputPrompt');
        item = rawCell;
        break;
      }
    }

    const options = {
      cellId: cellModel.id,
      cellWidget: item,
      isLocked: locked,
    };

    const widget = new GridStackItemWidget(item, options);
    widget.stateChanged.connect(this._itemChanged);
    return widget;
  }

  /**
   * Execute a CodeCell.
   *
   * @param cell - `ICellModel`.
   */
  public execute(cell: ICellModel): void {
    if (cell.type !== 'code' || this._ystate.get('executed')) {
      return;
    }

    const codeCell = new CodeCell({
      model: cell as CodeCellModel,
      rendermime: this.rendermime,
      contentFactory: this.contentFactory,
      editorConfig: this._editorConfig.code,
    });

    SimplifiedOutputArea.execute(
      cell.sharedModel.source,
      codeCell.outputArea,
      this._context.sessionContext
    )
      .then((resp) => {
        if (
          resp?.header.msg_type === 'execute_reply' &&
          resp.content.status === 'ok'
        ) {
          (cell as CodeCellModel).executionCount = resp.content.execution_count;
        }
      })
      .catch((reason) => console.error(reason));
  }

  private readonly _mutex = createMutex();

  /**
   * Update cells.
   */
  private _updateCells(): void {
    this._mutex(() => {
      this._checkCellsMetadata();
      this._contentChanged.emit(null);
    });
  }

  /**
   * Check the dashboard notebook's metadata.
   */
  private _checkMetadata(): void {
    let data = this._context.model.sharedModel.getMetadata()
      .extensions as Record<string, any>;

    if (!data) {
      data = {
        jupyter_dashboards: {
          version: 1,
          activeView: VIEW,
          views: {
            grid_default: this._info,
          },
        },
      };
    } else if (!data.jupyter_dashboards) {
      data['jupyter_dashboards'] = {
        version: 1,
        activeView: VIEW,
        views: {
          grid_default: this._info,
        },
      };
    } else if (!validateDashboardView(data.jupyter_dashboards.views[VIEW])) {
      data.jupyter_dashboards.views[VIEW] = this._info;
    } else {
      this._info = data.jupyter_dashboards?.views[VIEW] as DashboardView;
    }

    this._mutex(() => {
      this._context.model.sharedModel.updateMetadata({ extensions: data });
    });
  }

  /**
   * Check the dashboard cell's metadata.
   */
  private _checkCellsMetadata(): void {
    for (let i = 0; i < this._context.model.cells?.length; i++) {
      const cell = this._context.model.cells.get(i);
      this._checkCellMetadata(cell);
    }
  }

  private _itemChanged = (item: GridStackItemModel, change: ItemState) => {
    switch (change) {
      case ItemState.CLOSED:
        this.hideCell(item.cellId);
        item.stateChanged.disconnect(this._itemChanged);
        item.dispose();
        break;

      case ItemState.LOCKED:
        this.lockCell(item.cellId, true);
        break;

      case ItemState.UNLOCKED:
        this.lockCell(item.cellId, false);
        break;

      default:
        break;
    }
  };

  /**
   * Check the dashboard cell metadata.
   *
   * @param cell - `ICellModel`.
   */
  private _checkCellMetadata(cell: ICellModel): void {
    let data = cell.sharedModel.getMetadata().extensions as Record<string, any>;

    if (!data) {
      data = {
        jupyter_dashboards: {
          activeView: VIEW,
          views: {
            grid_default: {
              hidden: true,
              row: null,
              col: null,
              width: 2,
              height: 2,
              locked: true,
            },
          },
        },
      };
      this._mutex(() => {
        cell.sharedModel.setMetadata({ extensions: data });
      });
    } else if (!data.jupyter_dashboards) {
      data['jupyter_dashboards'] = {
        activeView: VIEW,
        views: {
          grid_default: {
            hidden: true,
            row: null,
            col: null,
            width: 2,
            height: 2,
            locked: true,
          },
        },
      };
      this._mutex(() => {
        cell.sharedModel.setMetadata({ extensions: data });
      });
    } else if (
      !validateDashboardCellView(data.jupyter_dashboards.views[VIEW])
    ) {
      data.jupyter_dashboards.views[VIEW] = {
        hidden: true,
        row: null,
        col: null,
        width: 2,
        height: 2,
        locked: true,
      };
      this._mutex(() => {
        cell.sharedModel.setMetadata({ extensions: data });
      });
    }
  }

  private _context: DocumentRegistry.IContext<INotebookModel>;
  private _editorConfig: StaticNotebook.IEditorConfig;
  private _notebookConfig: StaticNotebook.INotebookConfig;
  private _info: DashboardView;
  private _ystate: Y.Map<any> = new Y.Map();

  private _ready: Signal<this, null>;
  private _cellRemoved: Signal<this, CellChange>;
  private _cellPinned: Signal<this, CellChange>;
  private _stateChanged: Signal<this, null>;
  private _contentChanged: Signal<this, null>;
}

/**
 * A namespace for GridStackModel statics.
 */
export namespace GridStackModel {
  /**
   * Notebook config interface for GridStackModel
   */
  export interface IOptions {
    /**
     * The Notebook context.
     */
    context: DocumentRegistry.IContext<INotebookModel>;
    /**
     * The rendermime instance for this context.
     */
    rendermime: IRenderMimeRegistry;
    /**
     * A notebook panel content factory.
     */
    contentFactory: NotebookPanel.IContentFactory;
    /**
     * The service used to look up mime types.
     */
    mimeTypeService: IEditorMimeTypeService;
    /**
     * A config object for cell editors
     */
    editorConfig: StaticNotebook.IEditorConfig;
    /**
     * A config object for notebook widget
     */
    notebookConfig: StaticNotebook.INotebookConfig;
  }
}

/**
 * A namespace for private module data.
 */
namespace Private {
  /**
   * Remove children by className from an HTMLElement.
   */
  export function removeElements(node: HTMLElement, className: string): void {
    const elements = node.getElementsByClassName(className);
    for (let i = 0; i < elements.length; i++) {
      elements[i].remove();
    }
  }
}
