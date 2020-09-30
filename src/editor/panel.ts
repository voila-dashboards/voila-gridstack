import {
  INotebookModel,
  NotebookPanel,
  StaticNotebook
} from '@jupyterlab/notebook';

import {
  CodeCell,
  CodeCellModel,
  MarkdownCell,
  MarkdownCellModel
} from '@jupyterlab/cells';

import { IEditorMimeTypeService } from '@jupyterlab/codeeditor';

import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { ReadonlyPartialJSONValue } from '@lumino/coreutils';

import { Panel } from '@lumino/widgets';

import { Signal } from '@lumino/signaling';

import { GridStackPanel, DasboardInfo } from './views/gridstackPanel';

import { GridItem, DasboardCellInfo } from './components/cell';

export default class EditorPanel extends Panel {
  constructor(options: EditorPanel.IOptions) {
    super();
    this._context = options.context;
    this.rendermime = options.rendermime;
    this.contentFactory = options.contentFactory;
    this.mimeTypeService = options.mimeTypeService;
    this._editorConfig = options.editorConfig;
    this._notebookConfig = options.notebookConfig;

    this._context.model.stateChanged.connect(() => {
      this._checkMetadata();
    });

    this._context.model.contentChanged.connect(() => {
      this._contentChanged();
    });

    this._gridStackPanel = new GridStackPanel();
    this.addWidget(this._gridStackPanel);
  }

  dispose(): void {
    console.debug('Dispose');
    super.dispose();
    this._gridStackPanel = null;
    Signal.clearData(this._context.model);
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
    this._gridStackPanel.update();
  }

  private _checkMetadata(): void {
    //console.debug("_checkMetadata");
    //console.debug(this._context.model);

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

  private _contentChanged(): void {
    //console.debug('_contentChanged');
    //console.debug(this._context.model);

    for (let i = 0; i < this._context.model.cells?.length; i++) {
      const cell = this._context.model.cells.get(i);
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
        const codeCell = new CodeCell({
          model: cell as CodeCellModel,
          rendermime: this.rendermime,
          contentFactory: this.contentFactory,
          editorConfig: this._editorConfig.code,
          updateEditorOnShow: true
        });

        this._gridStackPanel.addItem(cell.id, new GridItem(codeCell, info));
      } else if (cell.type === 'markdown') {
        const markdownCell = new MarkdownCell({
          model: cell as MarkdownCellModel,
          rendermime: this.rendermime,
          contentFactory: this.contentFactory,
          editorConfig: this._editorConfig.markdown,
          updateEditorOnShow: true
        });

        markdownCell.rendered = true;
        markdownCell.inputHidden = false;

        this._gridStackPanel.addItem(cell.id, new GridItem(markdownCell, info));
      }
    }

    this.update();
  }

  save(): void {
    console.debug('save');

    for (let i = 0; i < this._context.model.cells?.length; i++) {
      const cell = this._context.model.cells.get(i);
      const data = cell.metadata.get('extensions') as Record<string, any>;

      if (data) {
        data['jupyter_dashboards'] = this._gridStackPanel.getItem(cell.id).info;
        cell.metadata.set('extensions', data as ReadonlyPartialJSONValue);
        this._context.model.cells.set(i, cell);
      } else {
        const data = {
          jupyter_dashboards: this._gridStackPanel.getItem(cell.id).info
        };
        cell.metadata.set('extensions', data as ReadonlyPartialJSONValue);
        this._context.model.cells.set(i, cell);
      }
    }

    this._context.save();
  }

  private _context: DocumentRegistry.IContext<INotebookModel>;
  private _editorConfig: StaticNotebook.IEditorConfig;
  private _notebookConfig: StaticNotebook.INotebookConfig;
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
