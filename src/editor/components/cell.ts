import { Widget } from '@lumino/widgets';
import { CodeMirrorMimeTypeService, CodeMirrorEditorFactory } from '@jupyterlab/codemirror';
import * as nbformat from '@jupyterlab/nbformat';

import {
  CodeEditor,
  CodeEditorWrapper,
  IEditorServices,
} from '@jupyterlab/codeeditor';

export default class CellView extends Widget {

  constructor(info: nbformat.ILanguageInfoMetadata, code: string) {
    super();
    //this.addClass("jp-CodeMirrorEditor jp-Editor jp-InputArea-editor");

    const editor = new CodeEditorWrapper({
      model: new CodeEditor.Model({
        value: code,
        mimeType: new CodeMirrorMimeTypeService().getMimeTypeByLanguage(info),
      }),
      factory: new CodeMirrorEditorFactory().newInlineEditor,
      config: { readOnly: true }
    });
    
  }
}