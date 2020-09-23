import {
  DocumentRegistry,
  ABCWidgetFactory,
  Context
} from '@jupyterlab/docregistry';
import { INotebookModel } from '@jupyterlab/notebook';

import VoilaEditor from './widget';
import EditorPanel from './panel';

export default class VoilaWidgetFactory extends ABCWidgetFactory<
  VoilaEditor,
  INotebookModel
> {
  protected createNewWidget(
    context: DocumentRegistry.IContext<INotebookModel>,
    source?: VoilaEditor
  ): VoilaEditor {
    const contextNotebook = context as Context<INotebookModel>;
    return new VoilaEditor(contextNotebook, new EditorPanel(contextNotebook));
  }
}
