import { IWidgetTracker } from '@jupyterlab/apputils';

import { DocumentWidget, DocumentRegistry } from '@jupyterlab/docregistry';

import { INotebookModel } from '@jupyterlab/notebook';

import { Token } from '@lumino/coreutils';

import { VoilaGridstackPanel } from './panel';

import Save from './toolbar/save';

import Edit from './toolbar/edit';

import Voila from './toolbar/voila';

/**
 * A `DocumentWidget` for Voila Gridstack to host the toolbar and content area.
 */
export class VoilaGridstackWidget extends DocumentWidget<
  VoilaGridstackPanel,
  INotebookModel
> {
  /**
   * Construct a `VoilaGridstackWidget`.
   *
   * @param context - The Notebook context.
   * @param content - The `VoilaGridstackPanel` to render in the widget.
   */
  constructor(
    context: DocumentRegistry.IContext<INotebookModel>,
    content: VoilaGridstackPanel
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
 * A class that tracks Voila Gridstack widgets.
 */
export interface IVoilaGridstackTracker
  extends IWidgetTracker<VoilaGridstackWidget> {}

/**
 * The Voila Gridstack tracker token.
 */
export const IVoilaGridstackTracker = new Token<IVoilaGridstackTracker>(
  'jupyterlab-gridstack:IVoilaGridstackTracker'
);
