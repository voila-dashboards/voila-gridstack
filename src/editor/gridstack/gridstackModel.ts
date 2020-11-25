import {
  INotebookModel,
  NotebookPanel,
  StaticNotebook
} from '@jupyterlab/notebook';

import { ICellModel, CodeCell, CodeCellModel } from '@jupyterlab/cells';

import {
  IRenderMimeRegistry,
  renderMarkdown,
  renderText
} from '@jupyterlab/rendermime';

import { IEditorMimeTypeService } from '@jupyterlab/codeeditor';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { SimplifiedOutputArea } from '@jupyterlab/outputarea';

import { IObservableUndoableList } from '@jupyterlab/observables';

import { Signal, ISignal } from '@lumino/signaling';

import { deleteIcon } from '../icons';

import { GridStackItem } from './gridstackItemWidget';

import {
  DashboardView,
  DashboardCellView,
  validateDashboardView,
  validateDashboardCellView
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
    this._cellRemoved = new Signal<this, string>(this);
    this._stateChanged = new Signal<this, null>(this);
    this._contentChanged = new Signal<this, null>(this);

    this._info = {
      name: 'grid',
      type: 'grid',
      maxColumns: 12,
      cellMargin: 10,
      defaultCellHeight: 60
    };

    this._context.sessionContext.ready.then(() => {
      this._checkMetadata();
      this._checkCellsMetadata();
      this._context.save().then(v => {
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
  get cellRemoved(): ISignal<this, string> {
    return this._cellRemoved;
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
    const data = this._context.model.metadata.get('extensions') as Record<
      string,
      any
    >;

    data.jupyter_dashboards.views[VIEW] = this._info;
    this._context.model.metadata.set('extensions', data);
    this._context.model.dirty = true;
  }

  /**
   * The Notebook's cells.
   */
  get cells(): IObservableUndoableList<ICellModel> {
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
        const data = cell.metadata.get('extensions') as Record<string, any>;
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
        const data = cell.metadata.get('extensions') as Record<string, any>;
        data.jupyter_dashboards.views[VIEW] = info;
        cell.metadata.set('extensions', data);
        this._context.model.dirty = true;
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
        const data = cell.metadata.get('extensions') as Record<string, any>;
        data.jupyter_dashboards.views[VIEW].hidden = true;
        cell.metadata.set('extensions', data);
        this._context.model.dirty = true;
      }
    }
  }

  /**
   * Create a new cell widget from a `CellModel`.
   *
   * @param cellModel - `ICellModel`.
   */
  public createCell(cellModel: ICellModel): GridStackItem {
    const cell = document.createElement('div');
    cell.className = 'grid-item-widget';

    switch (cellModel.type) {
      case 'code': {
        const codeCell = new CodeCell({
          model: cellModel as CodeCellModel,
          rendermime: this.rendermime,
          contentFactory: this.contentFactory,
          editorConfig: this._editorConfig.code,
          updateEditorOnShow: true
        });

        const item = new SimplifiedOutputArea({
          model: codeCell.outputArea.model,
          rendermime: codeCell.outputArea.rendermime,
          contentFactory: codeCell.outputArea.contentFactory
        });

        cell.appendChild(item.node);
        break;
      }
      case 'markdown':
        renderMarkdown({
          host: cell,
          source: cellModel.value.text,
          sanitizer: this.rendermime.sanitizer,
          latexTypesetter: this.rendermime.latexTypesetter,
          linkHandler: this.rendermime.linkHandler,
          resolver: this.rendermime.resolver,
          shouldTypeset: false,
          trusted: true
        });
        break;

      default:
        renderText({
          host: cell,
          source: cellModel.value.text,
          sanitizer: this.rendermime.sanitizer
        });
        break;
    }

    const close = document.createElement('div');
    close.className = 'trash-can';
    deleteIcon.element({ container: close, height: '16px', width: '16px' });

    close.onclick = (): void => {
      const data = cellModel.metadata.get('extensions') as Record<string, any>;
      data.jupyter_dashboards.views[VIEW].hidden = true;
      cellModel.metadata.set('extensions', data);
      this._context.model.dirty = true;
      this._cellRemoved.emit(cellModel.id);
    };

    return new GridStackItem(cellModel.id, cell, close);
  }

  /**
   * Execute a CodeCell.
   *
   * @param cell - `ICellModel`.
   */
  public execute(cell: ICellModel): void {
    if (cell.type !== 'code') {
      return;
    }

    const codeCell = new CodeCell({
      model: cell as CodeCellModel,
      rendermime: this.rendermime,
      contentFactory: this.contentFactory,
      editorConfig: this._editorConfig.code,
      updateEditorOnShow: true
    });

    SimplifiedOutputArea.execute(
      cell.value.text,
      codeCell.outputArea,
      this._context.sessionContext
    ).catch(reason => console.error(reason));
  }

  /**
   * Update cells.
   */
  private _updateCells(): void {
    this._checkCellsMetadata();
    this._contentChanged.emit(null);
  }

  /**
   * Check the dashboard notebook's metadata.
   */
  private _checkMetadata(): void {
    let data = this._context.model.metadata.get('extensions') as Record<
      string,
      any
    >;

    if (!data) {
      data = {
        jupyter_dashboards: {
          version: 1,
          activeView: VIEW,
          views: {
            grid_default: this._info
          }
        }
      };
    } else if (!data.jupyter_dashboards) {
      data['jupyter_dashboards'] = {
        version: 1,
        activeView: VIEW,
        views: {
          grid_default: this._info
        }
      };
    } else if (!validateDashboardView(data.jupyter_dashboards.views[VIEW])) {
      data.jupyter_dashboards.views[VIEW] = this._info;
    } else {
      this._info = data.jupyter_dashboards?.views[VIEW] as DashboardView;
    }

    this._context.model.metadata.set('extensions', data);
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

  /**
   * Check the dashboard cell metadata.
   *
   * @param cell - `ICellModel`.
   */
  private _checkCellMetadata(cell: ICellModel): void {
    let data = cell.metadata.get('extensions') as Record<string, any>;

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
              height: 2
            }
          }
        }
      };
      cell.metadata.set('extensions', data);
    } else if (!data.jupyter_dashboards) {
      data['jupyter_dashboards'] = {
        activeView: VIEW,
        views: {
          grid_default: {
            hidden: true,
            row: null,
            col: null,
            width: 2,
            height: 2
          }
        }
      };
      cell.metadata.set('extensions', data);
    } else if (
      !validateDashboardCellView(data.jupyter_dashboards.views[VIEW])
    ) {
      data.jupyter_dashboards.views[VIEW] = {
        hidden: true,
        row: null,
        col: null,
        width: 2,
        height: 2
      };
      cell.metadata.set('extensions', data);
    }
  }

  private _context: DocumentRegistry.IContext<INotebookModel>;
  private _editorConfig: StaticNotebook.IEditorConfig;
  private _notebookConfig: StaticNotebook.INotebookConfig;
  private _info: DashboardView;

  private _ready: Signal<this, null>;
  private _cellRemoved: Signal<this, string>;
  private _stateChanged: Signal<this, null>;
  private _contentChanged: Signal<this, null>;
}

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
