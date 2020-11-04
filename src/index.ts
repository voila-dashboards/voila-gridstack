import { JupyterFrontEndPlugin } from '@jupyterlab/application';

import { editor } from './editor';

import { widgets } from './widgets';

const plugins: JupyterFrontEndPlugin<any>[] = [editor, widgets];

export default plugins;
