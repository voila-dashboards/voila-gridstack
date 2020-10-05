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

//import { ReadonlyPartialJSONValue } from '@lumino/coreutils';

import { Panel } from '@lumino/widgets';

import { Signal } from '@lumino/signaling';

//import { GridStackPanel, DasboardInfo } from './views/gridstackPanel';

import { NotebookView } from './views/notebook';

import { GridItem, DasboardCellInfo } from './components/gridItem';

export default class EditorPanel extends Panel {
  constructor(options: EditorPanel.IOptions) {
    super();
    this._context = options.context;
    this.rendermime = options.rendermime;
    this.contentFactory = options.contentFactory;
    this.mimeTypeService = options.mimeTypeService;
    this._editorConfig = options.editorConfig;
    this._notebookConfig = options.notebookConfig;

    this._notebookView = new NotebookView();
    this.addWidget(this._notebookView);

    //this._gridStackPanel = new GridStackPanel();
    //this.addWidget(this._gridStackPanel);

    this._checkMetadata();
    this._context.sessionContext.ready.then(() => this._initNotebook());
  }

  dispose(): void {
    // console.debug('Dispose');
    super.dispose();
    this._notebookView = null;
    //this._gridStackPanel = null;
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
    //this._gridStackPanel.update();
  }

  private _checkMetadata(): void {
    console.debug('_checkMetadata');

    /* const data = this._context.model.metadata.get('extensions') as Record<
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
    } */
  }

  private _initNotebook(): void {
    console.debug('_initNotebook');

    const cells: Map<string, GridItem> = new Map<string, GridItem>();

    for (let i = 0; i < this._context.model.cells?.length; i++) {
      const model = this._context.model.cells.get(i);
      const cell = this._notebookView.getItem(model.id);

      if (model.value.text.length === 0) {
        continue;
      } else if (cell === undefined) {
        const item = this._createCell(model, false);
        item.execute(this._context.sessionContext);
        cells.set(model.id, item);
      } else {
        cells.set(model.id, cell);
      }
    }

    this._notebookView.cells = cells;
    this.update();
    this._context.model.stateChanged.connect(this._updateNotebook, this);
  }

  private _updateNotebook(): void {
    console.debug('_updateNotebook');

    while (this._context.model.deletedCells.length > 0) {
      const id = this._context.model.deletedCells.shift();
      console.debug('deleted', id);
      this._notebookView.removeItem(id);
    }

    for (let i = 0; i < this._context.model.cells?.length; i++) {
      const model = this._context.model.cells.get(i);
      const cell = this._notebookView.getItem(model.id);
      console.debug(model);
      console.debug(cell);

      if (cell === undefined && model.value.text.length !== 0) {
        console.debug(cell);
        const item = this._createCell(model, false);
        item.execute(this._context.sessionContext);
        this._notebookView.addItem(model.id, item);
      }
    }

    this.update();
  }

  /* private _initGridStack(): void {
    console.debug('_initGridStack');

    const cells: Map<string, GridItem> = new Map<string, GridItem>();

    for (let i = 0; i < this._context.model.cells?.length; i++) {
      const model = this._context.model.cells.get(i);
      const cell = this._gridStackPanel.getItem(model.id);

      if (model.value.text.length === 0) {
        continue;

      } else if (cell === undefined) {
        const item = this._createCell(model, true);
        item.execute(this._context.sessionContext);
        cells.set(model.id, item);

      } else {
        cells.set(model.id, cell);
      }
    }

    this._gridStackPanel.cells = cells;
    this.update();
    this._context.model.stateChanged.connect(this._updateCells, this);
  } */

  /* private _updateCells(): void {
    console.debug('_updateCells');

    while (this._context.model.deletedCells.length > 0) {
      const id = this._context.model.deletedCells.shift();
      this._gridStackPanel.removeItem(id);
    }

    for (let i = 0; i < this._context.model.cells?.length; i++) {
      const model = this._context.model.cells.get(i);
      const cell = this._gridStackPanel.getItem(model.id);

      if (cell === undefined && model.value.text.length !== 0) {
        const item = this._createCell(model, true);
        item.execute(this._context.sessionContext);
        this._gridStackPanel.addItem(model.id, item);
      }
    }

    this.update();
  } */

  private _createCell(cell: ICellModel, isOutput: boolean): GridItem {
    const data = cell.metadata.get('extensions') as Record<string, any>;

    let info: DasboardCellInfo = {
      version: 1,
      views: {
        grid_default: {
          hidden: false,
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

    if (cell.type === 'code') {
      const code = new CodeCell({
        model: cell as CodeCellModel,
        rendermime: this.rendermime,
        contentFactory: this.contentFactory,
        editorConfig: this._editorConfig.code,
        updateEditorOnShow: true
      });

      code.outputArea.model.clear();

      return new GridItem(code, info, isOutput);
    } else if (cell.type === 'markdown') {
      const markdown = new MarkdownCell({
        model: cell as MarkdownCellModel,
        rendermime: this.rendermime,
        contentFactory: this.contentFactory,
        editorConfig: this._editorConfig.markdown,
        updateEditorOnShow: true
      });

      return new GridItem(markdown, info, isOutput);
    } else {
      const raw = new RawCell({
        model: cell as RawCellModel,
        contentFactory: this.contentFactory,
        editorConfig: this._editorConfig.raw,
        updateEditorOnShow: true
      });

      return new GridItem(raw, info, isOutput);
    }
  }

  save(): void {
    console.debug('save');

    /* for (let i = 0; i < this._context.model.cells?.length; i++) {
      const model = this._context.model.cells.get(i);
      const cell = this._gridStackPanel.getItem(model.id);
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
    } */

    this._context.save();
  }

  private _context: DocumentRegistry.IContext<INotebookModel>;
  private _editorConfig: StaticNotebook.IEditorConfig;
  private _notebookConfig: StaticNotebook.INotebookConfig;
  //private _gridStackPanel: GridStackPanel;
  private _notebookView: NotebookView;
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
