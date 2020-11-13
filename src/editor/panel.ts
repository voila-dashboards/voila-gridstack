import {
  INotebookModel,
  NotebookPanel,
  StaticNotebook
} from '@jupyterlab/notebook';

import { IEditorMimeTypeService } from '@jupyterlab/codeeditor';

import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { Panel, Widget } from '@lumino/widgets';

import { Signal } from '@lumino/signaling';

import { GridStackWidget } from './gridstack/gridstackWidget';

import { GridStackModel } from './gridstack/gridstackModel';

export class EditorPanel extends Panel {
  constructor(options: EditorPanel.IOptions) {
    super();
    this.addClass('grid-panel');

    this._context = options.context;
    this.rendermime = options.rendermime;
    this.contentFactory = options.contentFactory;
    this.mimeTypeService = options.mimeTypeService;
    this._editorConfig = options.editorConfig;
    this._notebookConfig = options.notebookConfig;

    const gridModel = new GridStackModel({
      context: this._context,
      rendermime: this.rendermime,
      contentFactory: this.contentFactory,
      mimeTypeService: this.mimeTypeService,
      editorConfig: this._editorConfig,
      notebookConfig: this._notebookConfig
    });

    this._gridstackWidget = new GridStackWidget(gridModel);
    this.addWidget(this._gridstackWidget);
  }

  dispose(): void {
    this._gridstackWidget = null;
    Signal.clearData(this);
    super.dispose();
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
    this._gridstackWidget.update();
  }

  get gridWidgets(): Widget[] {
    return this._gridstackWidget.gridWidgets;
  }

  info(): void {
    this._gridstackWidget.infoEditor();
  }

  save(): void {
    this._context.save();
  }

  private _context: DocumentRegistry.IContext<INotebookModel>;
  private _editorConfig: StaticNotebook.IEditorConfig;
  private _notebookConfig: StaticNotebook.INotebookConfig;
  private _gridstackWidget: GridStackWidget;
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
