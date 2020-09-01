import { JupyterFrontEndPlugin } from '@jupyterlab/application';

import { editor } from './editor';

const voilaEditor: JupyterFrontEndPlugin<any>[] = [
  editor
];

export default voilaEditor;