import { IWidgetTracker } from '@jupyterlab/apputils';

import { DocumentWidget, DocumentRegistry } from '@jupyterlab/docregistry';

import { INotebookModel } from '@jupyterlab/notebook';

import { Token } from '@lumino/coreutils';

import { VoilaGridStackPanel } from './panel';

import Compact from './toolbar/compact';

import Save from './toolbar/save';

import Edit from './toolbar/edit';

//import Revert from './toolbar/revert';

import Voila from './toolbar/voila';

import Undo from './toolbar/undo';

import Redo from './toolbar/redo';

/**
 * A `DocumentWidget` for Voila GridStack to host the toolbar and content area.
 */
export class VoilaGridStackWidget extends DocumentWidget<
  VoilaGridStackPanel,
  INotebookModel
> {
  /**
   * Construct a `VoilaGridStackWidget`.
   *
   * @param context - The Notebook context.
   * @param content - The `VoilaGridStackPanel` to render in the widget.
   */
  constructor(
    context: DocumentRegistry.IContext<INotebookModel>,
    content: VoilaGridStackPanel
  ) {
    super({ context, content });
    this.title.label = context.localPath;
    this.title.closable = true;
    this.title.iconClass = 'jp-MaterialIcon jp-VoilaIcon';

    this.addClass('jp-NotebookPanel');

    // Adding the buttons to the widget toolbar
    this.toolbar.addItem('save', new Save(this.content));
    this.toolbar.addItem('edit', new Edit(this.content));
    this.toolbar.addItem('undo', new Undo(this.context.model));
    this.toolbar.addItem('redo', new Redo(this.context.model));
    //this.toolbar.addItem('revert', new Revert(this.content));
    this.toolbar.addItem('compact', new Compact(this.content));
    this.toolbar.addItem('voila', new Voila(this.context.path));
  }

  undo(): void {
    this.context.model.sharedModel.undo();
  }

  redo(): void {
    this.context.model.sharedModel.redo();
  }
}

/**
 * A class that tracks Voila GridStack widgets.
 */
export interface IVoilaGridStackTracker
  extends IWidgetTracker<VoilaGridStackWidget> {}

/**
 * The Voila GridStack tracker token.
 */
export const IVoilaGridStackTracker = new Token<IVoilaGridStackTracker>(
  '@voila-dashboards/jupyterlab-gridstack:IVoilaGridstackTracker'
);
