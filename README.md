# Voila Editor

A JupyterLab extension to create voila dashboards.

[![Binder](https://mybinder.org/badge_logo.svg)]()

## Requirements

* python >= 3.7
* JupyterLab >= 3.0
* npm >= 6.13.4

## Install

```bash
# Create a new environment with the dependencies
mamba create -n test -c conda-forge python nodejs jupyterlab=3.0.0b0
conda activate test
```

## Contributing

### Install

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
git clone https://github.com/...
# Move to jupyterlab-ros directory
cd jupyterlab-ros

# Install server extension in editable mode
pip install -e .
# Register server extension
jupyter-serverextension enable --py --sys-prefix voila_editor_server

# Move to js folder
cd js/
# Link your development version of the extension with JupyterLab
jupyter-labextension link .
```

You can watch the source directory and run JupyterLab in watch mode to watch for changes in the extension's source and automatically rebuild the extension and application.

```bash
# Watch the source directory in another terminal tab
jlpm watch
# Run jupyterlab in watch mode in one terminal tab
jupyter-lab --no-browser --ip=192.168.64.6 --watch
```

### Uninstall

```bash
# Uninstalling the frontend extension
jupyter-labextension unlink voila-editor
jupyter-labextension uninstall voila-editor

# Uninstalling the server extension
jupyter-serverextension disable voila_editor_server
pip uninstall voila_editor_server

# Cleaning jupyterlab
jupyter lab clean
jupyter lab build
```