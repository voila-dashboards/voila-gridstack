import { INotebookModel } from '@jupyterlab/notebook';
import { Cell, CodeCell, MarkdownCell, RawCell, isCodeCellModel, isMarkdownCellModel, isRawCellModel } from '@jupyterlab/cells';
import { IEditorMimeTypeService, CodeEditor } from '@jupyterlab/codeeditor';
import { renderText } from '@jupyterlab/rendermime';
import { ReactWidget } from '@jupyterlab/apputils';
import { Panel } from '@lumino/widgets';

import React from 'react'

export default class EditorPanel extends Panel {
  private nb: INotebookModel = null;

  constructor(model: INotebookModel) {
    super();
    this.nb = model;
  }

  addCells = () => {
    for (let i = 0; i < this.nb.cells.length; i++) {
      const cell = this.nb.cells.get(i);
      const widget = new Cell({ model: cell });
      widget.addClass('jp-Cell');
      this.addWidget(widget);
    }
  }

  render(): JSX.Element {
    
    return (
      <div>
        <div>Hello World</div>
        { this.addCells() }
      </div>
    );
  }
}