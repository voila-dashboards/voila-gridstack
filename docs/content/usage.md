# Usage

To use the `gridstack` template, pass option `--template=gridstack` to the `voila` command line.

![voila-gridstack](../_static/voila-gridstack.gif)

By default the position of cells in the dashboard will be fixed. If you want them to be draggable
and resizable, you can launch voila with the `show_handles` resource set to `True`:

`voila --template=gridstack examples/ --VoilaConfiguration.resources='{"gridstack": {"show_handles": True}}'`

Note, however, that the state of the dashboard can not be persisted in the notebook.

You can change the color scheme using the `theme` resource:

`voila examples/ --template=gridstack --theme=dark`
