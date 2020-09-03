import { INotebookModel } from '@jupyterlab/notebook';
import { Panel } from '@lumino/widgets';
import * as nbformat from '@jupyterlab/nbformat';

import { CodeMirrorMimeTypeService, CodeMirrorEditorFactory } from '@jupyterlab/codemirror';

import { CodeEditor, CodeEditorWrapper } from '@jupyterlab/codeeditor';

export default class NotebookPanel extends Panel {
  private nb: INotebookModel = null;

  constructor(model: INotebookModel) {
    super();
    this.nb = model;
    this.addClass('jp-Notebook');
    this.nb.stateChanged.connect( () => { this.addCells() });
  }

  addCells = () => {
    const info = this.nb.metadata.get('language_info') as nbformat.ILanguageInfoMetadata;

    this.widgets.forEach( w => {
      w.parent = null;
      w.dispose();
      console.debug(this.widgets);
    });

    for (let i = 0; i < this.nb.cells.length; i++) {
      const cell = this.nb.cells.get(i);

      const editor = new CodeEditorWrapper({
        model: new CodeEditor.Model({
          value: cell.value.text,
          mimeType: new CodeMirrorMimeTypeService().getMimeTypeByLanguage(info),
        }),
        factory: new CodeMirrorEditorFactory().newInlineEditor,
        config: { readOnly: true }
      });

      const aux = new Panel();
      aux.addClass("jp-Cell");
      aux.addClass("jp-CodeCell");
      aux.addClass("jp-Notebook-cell");

      editor.addClass("jp-InputArea-editor");
      aux.addWidget(editor);
      this.addWidget(aux);
    }

    this.update();
  }
}