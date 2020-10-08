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

import { IEditorMimeTypeService } from '@jupyterlab/codeeditor';

import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { ReadonlyPartialJSONValue } from '@lumino/coreutils';

import { SplitPanel } from '@lumino/widgets';

import { Signal } from '@lumino/signaling';

import { GridStackPanel, DasboardInfo } from './views/gridstackPanel';

import { NotebookView } from './views/notebook';

import { GridItem, DasboardCellInfo } from './components/gridItem';

export default class EditorPanel extends SplitPanel {
  constructor(options: EditorPanel.IOptions) {
    super();
    this.addClass('grid-panel');

    this._context = options.context;
    this.rendermime = options.rendermime;
    this.contentFactory = options.contentFactory;
    this.mimeTypeService = options.mimeTypeService;
    this._editorConfig = options.editorConfig;
    this._notebookConfig = options.notebookConfig;

    this._cells = new Map<string, GridItem>();

    this._notebookView = new NotebookView(this._cells);
    this.addWidget(this._notebookView);

    this._gridStackPanel = new GridStackPanel(this._cells);
    this.addWidget(this._gridStackPanel);

    this._checkMetadata();
    this._context.sessionContext.ready.then(() => {
      this._initCellsList();
      this._context.model.stateChanged.connect(this._updateCellsList, this);
    });
  }

  dispose(): void {
    // console.debug('Dispose');
    super.dispose();
    this._notebookView = null;
    this._gridStackPanel = null;
    Signal.clearData(this);
  }

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

  onUpdateRequest(): void {
    this._notebookView.update();
    this._gridStackPanel.update();
  }

  private _checkMetadata(): void {
    console.debug('_checkMetadata');

    const data = this._context.model.metadata.get('extensions') as Record<
      string,
      any
    >;

    if (data && data.jupyter_dashboards) {
      this._gridStackPanel.info = data['jupyter_dashboards'] as DasboardInfo;
    } else {
      this._gridStackPanel.info = {
        version: 1,
        activeView: 'grid_default',
        views: {
          grid_default: {
            name: 'grid',
            type: 'grid',
            cellMargin: 1,
            cellHeight: 1,
            numColumns: 12
          }
        }
      };

      const data = { jupyter_dashboards: this._gridStackPanel.info };
      this._context.model.metadata.set(
        'extensions',
        data as ReadonlyPartialJSONValue
      );
    }
  }

  private _initCellsList(): void {
    console.debug('_initCellsList');

    for (let i = 0; i < this._context.model.cells?.length; i++) {
      const model = this._context.model.cells.get(i);
      const cell = this._cells.get(model.id);

      if (model.value.text.length === 0) {
        if (cell !== undefined) {
          this._cells.delete(model.id);
        }
        continue;
      } else if (cell === undefined) {
        const item = this._createCell(model);
        item.execute(this._context.sessionContext);
        this._cells.set(model.id, item);
      } else {
        this._cells.set(model.id, cell);
      }
    }

    this.update();
  }

  private _updateCellsList(): void {
    console.debug('_updateCellsList');

    while (this._context.model.deletedCells.length > 0) {
      const id = this._context.model.deletedCells.shift();
      this._cells.delete(id);
    }

    for (let i = 0; i < this._context.model.cells?.length; i++) {
      const model = this._context.model.cells.get(i);
      const cell = this._cells.get(model.id);

      if (cell === undefined && model.value.text.length !== 0) {
        const item = this._createCell(model);
        item.execute(this._context.sessionContext);
        this._cells.set(model.id, item);
      }
    }

    this.update();
  }

  private _createCell(cell: ICellModel): GridItem {
    const data = cell.metadata.get('extensions') as Record<string, any>;

    let info: DasboardCellInfo = {
      version: 1,
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

    if (data && data.jupyter_dashboards) {
      info = data['jupyter_dashboards'] as DasboardCellInfo;
    }

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
        item.outputArea.model.clear();
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

  save(): void {
    console.debug('save');

    for (let i = 0; i < this._context.model.cells?.length; i++) {
      const model = this._context.model.cells.get(i);
      const cell = this._cells.get(model.id);
      const data = model.metadata.get('extensions') as Record<string, any>;

      if (cell === undefined) {
        continue;
      } else if (data) {
        data['jupyter_dashboards'] = cell.info;
        model.metadata.set('extensions', data as ReadonlyPartialJSONValue);
        this._context.model.cells.set(i, model);
      } else {
        const data = { jupyter_dashboards: cell.info };
        model.metadata.set('extensions', data as ReadonlyPartialJSONValue);
        this._context.model.cells.set(i, model);
      }
    }

    this._context.save();
  }

  private _context: DocumentRegistry.IContext<INotebookModel>;
  private _editorConfig: StaticNotebook.IEditorConfig;
  private _notebookConfig: StaticNotebook.INotebookConfig;
  private _gridStackPanel: GridStackPanel;
  private _notebookView: NotebookView;
  private _cells: Map<string, GridItem>;
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
