import {
  CodeMirrorMimeTypeService,
  CodeMirrorEditorFactory
} from '@jupyterlab/codemirror';
import { CodeEditor, CodeEditorWrapper } from '@jupyterlab/codeeditor';
import { ICellModel } from '@jupyterlab/cells';
import { Panel } from '@lumino/widgets';

import * as nbformat from '@jupyterlab/nbformat';

export default class CellView extends Panel {
  private cell: ICellModel;
  private editor: CodeEditorWrapper;

  constructor(cell: ICellModel, info: nbformat.ILanguageInfoMetadata) {
    super();
    this.addClass('grid-stack-item-content');

    this.cell = cell;

    this.editor = new CodeEditorWrapper({
      model: new CodeEditor.Model({
        value: this.cell.value.text,
        mimeType: new CodeMirrorMimeTypeService().getMimeTypeByLanguage(info)
      }),
      factory: new CodeMirrorEditorFactory().newInlineEditor,
      config: { readOnly: true, codeFolding: false },
      updateOnShow: true
    });

    this.editor.addClass('jp-InputArea-editor');
    this.addWidget(this.editor);
  }

  onUpdateRequest = () => {
    //console.debug("onUpdateRequest cell:", this.editor);
    this.editor.editor.refresh();
  };
}
