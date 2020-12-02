import { IWidgetTracker } from '@jupyterlab/apputils';

import { DocumentWidget, DocumentRegistry } from '@jupyterlab/docregistry';

import { INotebookModel } from '@jupyterlab/notebook';

import { Token } from '@lumino/coreutils';

import { VoilaGridStackPanel } from './panel';

import Save from './toolbar/save';

import Edit from './toolbar/edit';

import Voila from './toolbar/voila';

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
    this.id = 'jupyterlab-gridstack/editor:widget';
    this.title.label = context.localPath;
    this.title.closable = true;
    this.title.iconClass = 'jp-MaterialIcon jp-VoilaIcon';

    // Adding the buttons to the widget toolbar
    this.toolbar.addItem('save', new Save(this.content));
    this.toolbar.addItem('edit', new Edit(this.content));
    this.toolbar.addItem('voila', new Voila(this.context.path));
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
  'jupyterlab-gridstack:IVoilaGridstackTracker'
);
