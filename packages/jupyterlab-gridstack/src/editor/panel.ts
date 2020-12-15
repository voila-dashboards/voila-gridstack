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

import { Message } from '@lumino/messaging';

import { GridStackWidget } from './gridstack/widget';

import { GridStackModel } from './gridstack/model';

/**
 * A Widget to host and interact with gridstack.
 */
export class VoilaGridStackPanel extends Panel {
  /**
   * Construct a `VoilaGridstackPanel`.
   *
   * @param options - The options to construct `VoilaGridstackPanel`.
   */
  constructor(options: VoilaGridStackPanel.IOptions) {
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

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    this._gridstackWidget = undefined;
    Signal.clearData(this);
    super.dispose();
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
   * Getter for the notebook cell editor configuration.
   */
  get editorConfig(): StaticNotebook.IEditorConfig {
    return this._editorConfig;
  }
  /**
   * Setter for the notebook cell editor configuration.
   *
   * @param value - The `EditorConfig` of the notebook.
   */
  set editorConfig(value: StaticNotebook.IEditorConfig) {
    this._editorConfig = value;
  }
  /**
   * Getter for the notebook configuration.
   */
  get notebookConfig(): StaticNotebook.INotebookConfig {
    return this._notebookConfig;
  }
  /**
   * Setter for the notebook configuration.
   *
   * @param value - The configuration of the notebook.
   */
  set notebookConfig(value: StaticNotebook.INotebookConfig) {
    this._notebookConfig = value;
  }

  /**
   * Getter for the list of grid items widgets
   */
  get gridWidgets(): Widget[] {
    return this._gridstackWidget?.gridWidgets ?? [];
  }

  /**
   * Handle `update-request` messages sent to the widget.
   */
  protected onUpdateRequest(msg: Message): void {
    this._gridstackWidget?.update();
  }

  /**
   * Open a dialog to edit the gridstack metadata information.
   */
  info(): void {
    this._gridstackWidget?.infoEditor();
  }

  /**
   * Save the gridstack configuration into the notebook metadata.
   */
  save(): void {
    this._context.save();
  }

  private _context: DocumentRegistry.IContext<INotebookModel>;
  private _editorConfig: StaticNotebook.IEditorConfig;
  private _notebookConfig: StaticNotebook.INotebookConfig;
  private _gridstackWidget: GridStackWidget | undefined;
}

export namespace VoilaGridStackPanel {
  /**
   * Options interface for VoilaGridstackPanel
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
