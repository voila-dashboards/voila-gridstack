import {
  CodeMirrorMimeTypeService,
  CodeMirrorEditorFactory
} from '@jupyterlab/codemirror';

import { CodeEditor, CodeEditorWrapper } from '@jupyterlab/codeeditor';

import { ICellModel } from '@jupyterlab/cells';

import { Panel } from '@lumino/widgets';

import * as nbformat from '@jupyterlab/nbformat';

export default class CellView extends Panel {
  constructor(cell: ICellModel, info: nbformat.ILanguageInfoMetadata) {
    super();

    this._cell = cell;
    this._editor = new CodeEditorWrapper({
      model: new CodeEditor.Model({
        value: this._cell.value.text,
        mimeType: new CodeMirrorMimeTypeService().getMimeTypeByLanguage(info)
      }),
      factory: new CodeMirrorEditorFactory().newInlineEditor,
      config: { readOnly: true, codeFolding: false },
      updateOnShow: true
    });

    this._editor.addClass('jp-InputArea-editor');
    this.addWidget(this._editor);
    this.addClass('grid-stack-item-content');
  }

  onUpdateRequest(): void {
    this._editor.editor.refresh();
  }

  private _cell: ICellModel;
  private _editor: CodeEditorWrapper;
}
