import {
  INotebookModel,
  NotebookPanel,
  StaticNotebook
} from '@jupyterlab/notebook';

import {
  ICellModel,
  CodeCell,
  CodeCellModel,
  MarkdownCell,
  MarkdownCellModel,
  RawCell,
  RawCellModel
} from '@jupyterlab/cells';

import { showDialog } from '@jupyterlab/apputils';

import { IEditorMimeTypeService } from '@jupyterlab/codeeditor';

import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { ReadonlyPartialJSONValue } from '@lumino/coreutils';

import { SplitPanel } from '@lumino/widgets';

import { Signal } from '@lumino/signaling';

import { GridStackPanel } from './views/gridstackPanel';

import { GridItem, DashboardCellView } from './components/gridItem';

import { EditorGridstack } from './components/editorGridstack';

import { DashboardView } from './format';

export class EditorPanel extends SplitPanel {
  constructor(options: EditorPanel.IOptions) {
    super();
    this.addClass('grid-panel');

    this._context = options.context;
    this.rendermime = options.rendermime;
    this.contentFactory = options.contentFactory;
    this.mimeTypeService = options.mimeTypeService;
    this._editorConfig = options.editorConfig;
    this._notebookConfig = options.notebookConfig;

    this._activeView = 'grid_default';
    this._gridStackPanel = new GridStackPanel();
    this.addWidget(this._gridStackPanel);

    this._context.sessionContext.ready.then(() => {
      console.debug('ready!');
      this._checkMetadata();
      this._gridStackPanel.initGridStack();
      this._initCellsList();
    });

    this._context.model.contentChanged.connect(this._updateCellsList, this);
  }

  dispose(): void {
    super.dispose();
    this._gridStackPanel = null;
    Signal.clearData(this);
  }

  readonly rendermime: IRenderMimeRegistry;

  readonly contentFactory: NotebookPanel.IContentFactory;

  readonly mimeTypeService: IEditorMimeTypeService;

  get gridStackPanel(): GridStackPanel {
    return this._gridStackPanel;
  }

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

  onUpdateRequest(): void {
    this._gridStackPanel.update();
  }

  private _checkMetadata(): void {
    //console.debug('_checkMetadata');
    let data = this._context.model.metadata.get('extensions') as Record<
      string,
      any
    >;

    if (!data) {
      data = {
        jupyter_dashboards: {
          version: 1,
          activeView: 'grid_default',
          views: {
            grid_default: {
              name: 'grid',
              type: 'grid',
              cellMargin: 10,
              cellHeight: 30,
              numColumns: 12
            }
          }
        }
      };
    } else if (!data.jupyter_dashboards) {
      data['jupyter_dashboards'] = {
        version: 1,
        activeView: 'grid_default',
        views: {
          grid_default: {
            name: 'grid',
            type: 'grid',
            cellMargin: 10,
            cellHeight: 30,
            numColumns: 12
          }
        }
      };
    } else if (!data.jupyter_dashboards.views[this._activeView]) {
      data.jupyter_dashboards.views[this._activeView] = {
        name: 'grid',
        type: 'grid',
        cellMargin: 10,
        cellHeight: 30,
        numColumns: 12
      };
    }

    this._gridStackPanel.info = data.jupyter_dashboards?.views[
      this._activeView
    ] as DashboardView;
    this._context.model.metadata.set(
      'extensions',
      data as ReadonlyPartialJSONValue
    );
    this._context.save();
  }

  private _initCellsList(): void {
    //console.debug('_initCellsList');
    for (let i = 0; i < this._context.model.cells?.length; i++) {
      const model = this._context.model.cells.get(i);

      if (model.value.text.length !== 0) {
        const item = this._createCell(model);
        //item.execute(this._context.sessionContext);
        this._gridStackPanel.addCell(item);
      }
    }

    this._context.save();
  }

  private _updateCellsList(): void {
    //console.debug('_updateCellsList');
    if (this._gridStackPanel.isReady) {
      this._context.model.deletedCells.forEach(id => {
        this._gridStackPanel.deleteCell(id);
      });

      for (let i = 0; i < this._context.model.cells?.length; i++) {
        const model = this._context.model.cells.get(i);
        const cell = this._gridStackPanel.getCell(model.id);

        if (cell && model.value.text.length === 0) {
          this._gridStackPanel.deleteCell(model.id);
        }

        if (!cell && model.value.text.length !== 0) {
          const item = this._createCell(model);
          this._gridStackPanel.addCell(item);
        }
      }
    }
  }

  private _createCell(cell: ICellModel): GridItem {
    const info = this._checkCellMetadata(cell);
    let item = null;
    switch (cell.type) {
      case 'code':
        item = new CodeCell({
          model: cell as CodeCellModel,
          rendermime: this.rendermime,
          contentFactory: this.contentFactory,
          editorConfig: this._editorConfig.code,
          updateEditorOnShow: true
        });
        break;

      case 'markdown':
        item = new MarkdownCell({
          model: cell as MarkdownCellModel,
          rendermime: this.rendermime,
          contentFactory: this.contentFactory,
          editorConfig: this._editorConfig.markdown,
          updateEditorOnShow: true
        });
        break;

      default:
        item = new RawCell({
          model: cell as RawCellModel,
          contentFactory: this.contentFactory,
          editorConfig: this._editorConfig.raw,
          updateEditorOnShow: true
        });
        break;
    }

    return new GridItem(item, info, this.rendermime);
  }

  private _checkCellMetadata(cell: ICellModel): DashboardCellView {
    let data = cell.metadata.get('extensions') as Record<string, any>;

    if (!data) {
      data = {
        jupyter_dashboards: {
          activeView: 'grid_default',
          views: {
            grid_default: {
              hidden: true,
              row: null,
              col: null,
              width: 1,
              height: 1
            }
          }
        }
      };
    } else if (!data.jupyter_dashboards) {
      data['jupyter_dashboards'] = {
        activeView: 'grid_default',
        views: {
          grid_default: {
            hidden: true,
            row: null,
            col: null,
            width: 1,
            height: 1
          }
        }
      };
    } else if (!data.jupyter_dashboards.views[this._activeView]) {
      data.jupyter_dashboards.views[this._activeView] = {
        hidden: true,
        row: null,
        col: null,
        width: 1,
        height: 1
      };
    }

    cell.metadata.set('extensions', data as ReadonlyPartialJSONValue);
    return data.jupyter_dashboards.views[this._activeView];
  }

  info(): void {
    const body = new EditorGridstack(this._gridStackPanel.info);
    showDialog({
      title: 'Edit grid parameters',
      body
    }).then(value => {
      if (value.button.accept) {
        this._gridStackPanel.info = body.info;

        const data = {
          jupyter_dashboards: {
            version: 1,
            activeView: 'grid_default',
            views: {
              grid_default: this._gridStackPanel.info
            }
          }
        };
        this._context.model.metadata.set(
          'extensions',
          data as ReadonlyPartialJSONValue
        );
        this._context.save();
      }
    });
  }

  save(): void {
    for (let i = 0; i < this._context.model.cells?.length; i++) {
      const model = this._context.model.cells.get(i);
      const cell = this._gridStackPanel.getCell(model.id);
      const data = model.metadata.get('extensions') as Record<string, any>;

      if (cell && data) {
        data.jupyter_dashboards.views[this._activeView] = cell.info;
        model.metadata.set('extensions', data as ReadonlyPartialJSONValue);
      } else if (cell) {
        const data = {
          jupyter_dashboards: {
            activeView: 'grid_default',
            views: {
              grid_default: cell.info
            }
          }
        };
        model.metadata.set('extensions', data as ReadonlyPartialJSONValue);
      }
    }

    this._context.save();
  }

  private _context: DocumentRegistry.IContext<INotebookModel>;
  private _editorConfig: StaticNotebook.IEditorConfig;
  private _notebookConfig: StaticNotebook.INotebookConfig;
  private _activeView: string;
  private _gridStackPanel: GridStackPanel;
}

export namespace EditorPanel {
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
