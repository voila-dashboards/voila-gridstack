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

import { Signal } from '@lumino/signaling';

import { deleteIcon } from '../icons';

import { GridStackItem } from './gridstackItemWidget';

import { DashboardView, DashboardCellView } from '../format';

export const VIEW = 'grid_default';

export class GridStackModel {
  constructor(options: GridStackModel.IOptions) {
    this._context = options.context;
    this.rendermime = options.rendermime;
    this.contentFactory = options.contentFactory;
    this.mimeTypeService = options.mimeTypeService;
    this._editorConfig = options.editorConfig;
    this._notebookConfig = options.notebookConfig;

    this.ready = new Signal<this, null>(this);
    this.cellRemoved = new Signal<this, string>(this);
    this.stateChanged = new Signal<this, null>(this);
    this.contentChanged = new Signal<this, null>(this);

    this._info = {
      name: 'grid',
      type: 'grid',
      cellMargin: 5,
      cellHeight: 60,
      numColumns: 12
    };

    this._context.sessionContext.ready.then(() => {
      this._checkMetadata();
      this._checkCellsMetadata();
      this._context.save().then(v => {
        this.ready.emit(void 0);
      });
    });

    this._context.model.contentChanged.connect(this._updateCells, this);
  }

  readonly ready: Signal<this, null>;

  readonly cellRemoved: Signal<this, string>;

  readonly stateChanged: Signal<this, null>;

  readonly contentChanged: Signal<this, null>;

  readonly rendermime: IRenderMimeRegistry;

  readonly contentFactory: NotebookPanel.IContentFactory;

  readonly mimeTypeService: IEditorMimeTypeService;

  get editorConfig(): StaticNotebook.IEditorConfig {
    return this._editorConfig;
  }
  set editorConfig(value: StaticNotebook.IEditorConfig) {
    this._editorConfig = value;
  }

  get notebookConfig(): StaticNotebook.INotebookConfig {
    return this._notebookConfig;
  }
  set notebookConfig(value: StaticNotebook.INotebookConfig) {
    this._notebookConfig = value;
  }

  get info(): DashboardView {
    return this._info;
  }

  set info(info: DashboardView) {
    this._info = info;
    const data = this._context.model.metadata.get('extensions') as Record<
      string,
      any
    >;

    data.jupyter_dashboards.views[VIEW] = this._info;
    this._context.model.metadata.set('extensions', data);
    this._context.model.dirty = true;
    //this._context.save();
  }

  get cells(): IObservableUndoableList<ICellModel> {
    return this._context.model.cells;
  }

  get deletedCells(): string[] {
    return this._context.model.deletedCells;
  }

  public getCellInfo(id: string): DashboardCellView {
    for (let i = 0; i < this._context.model.cells?.length; i++) {
      const cell = this._context.model.cells.get(i);

      if (cell.id === id) {
        const data = cell.metadata.get('extensions') as Record<string, any>;
        return data.jupyter_dashboards.views[VIEW];
      }
    }
  }

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

  public createCell(cellModel: ICellModel): GridStackItem {
    const cell = document.createElement('div');
    cell.className = 'grid-item-widget';

    switch (cellModel.type) {
      case 'code': {
        const out = new CodeCell({
          model: cellModel as CodeCellModel,
          rendermime: this.rendermime,
          contentFactory: this.contentFactory,
          editorConfig: this._editorConfig.code,
          updateEditorOnShow: true
        }).outputArea;

        const item = new SimplifiedOutputArea({
          model: out.model,
          rendermime: out.rendermime,
          contentFactory: out.contentFactory
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
      this.cellRemoved.emit(cellModel.id);
    };

    return new GridStackItem(cellModel.id, cell, close);
  }

  /* execute(sessionContext: ISessionContext): void {
    if (this._type === 'code') {
      SimplifiedOutputArea.execute(
        this._cell.model.value.text,
        (this._cell as CodeCell).outputArea,
        sessionContext
      ).catch(reason => console.error(reason));
    } else if (this._type === 'markdown') {
      (this._cell as MarkdownCell).inputHidden = false;
      (this._cell as MarkdownCell).rendered = true;
    }

    this.update();
  } */

  private _updateCells(): void {
    this._checkCellsMetadata();
    this.contentChanged.emit(void 0);
  }

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
    } else if (
      !data.jupyter_dashboards.views[VIEW] ||
      !('name' in data.jupyter_dashboards.views[VIEW]) ||
      !('type' in data.jupyter_dashboards.views[VIEW]) ||
      !('cellMargin' in data.jupyter_dashboards.views[VIEW]) ||
      !('cellHeight' in data.jupyter_dashboards.views[VIEW]) ||
      !('numColumns' in data.jupyter_dashboards.views[VIEW])
    ) {
      data.jupyter_dashboards.views[VIEW] = this._info;
    } else {
      this._info = data.jupyter_dashboards?.views[VIEW] as DashboardView;
    }

    this._context.model.metadata.set('extensions', data);
  }

  private _checkCellsMetadata(): void {
    for (let i = 0; i < this._context.model.cells?.length; i++) {
      const cell = this._context.model.cells.get(i);
      this._checkCellMetadata(cell);
    }
  }

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
      !data.jupyter_dashboards.views[VIEW] ||
      !('hidden' in data.jupyter_dashboards.views[VIEW]) ||
      !('row' in data.jupyter_dashboards.views[VIEW]) ||
      !('col' in data.jupyter_dashboards.views[VIEW]) ||
      !('width' in data.jupyter_dashboards.views[VIEW]) ||
      !('height' in data.jupyter_dashboards.views[VIEW])
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
}

export namespace GridStackModel {
  /**
   * Notebook config interface for NotebookPanel
   */
  export interface IOptions {
    context: DocumentRegistry.IContext<INotebookModel>;

    rendermime: IRenderMimeRegistry;

    contentFactory: NotebookPanel.IContentFactory;

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
