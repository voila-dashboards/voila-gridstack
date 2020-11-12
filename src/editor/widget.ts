import { IWidgetTracker } from '@jupyterlab/apputils';

import { DocumentWidget, DocumentRegistry } from '@jupyterlab/docregistry';

import { INotebookModel } from '@jupyterlab/notebook';

import { Token } from '@lumino/coreutils';

import { EditorPanel } from './panel';

import Save from './toolbar/save';

import Edit from './toolbar/edit';

import Voila from './toolbar/voila';

export class VoilaEditor extends DocumentWidget<EditorPanel, INotebookModel> {
  constructor(
    context: DocumentRegistry.IContext<INotebookModel>,
    content: EditorPanel
  ) {
    super({ context, content });
    this.id = 'voila-editor/editor:widget';
    this.title.label = context.localPath;
    this.title.closable = true;
    this.title.iconClass = "jp-MaterialIcon jp-VoilaIcon"

    // Adding the buttons to the widget toolbar
    this.toolbar.addItem('save', new Save(this.content));
    this.toolbar.addItem('edit', new Edit(this.content));
    this.toolbar.addItem('voila', new Voila(this.context.path));
  }

  dispose(): void {
    super.dispose();
  }
}

/**
 * A class that tracks Voila Editor widgets.
 */
export interface IVoilaEditorTracker extends IWidgetTracker<VoilaEditor> {}

/**
 * The Voila Editor tracker token.
 */
export const IVoilaEditorTracker = new Token<IVoilaEditorTracker>(
  'voila-editor:IVoilaEditorTracker'
);
