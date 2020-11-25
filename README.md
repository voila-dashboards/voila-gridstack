# jupyterlab-gridstack

![Github Actions Status](https://github.com/hbcarlos/voila-editor/workflows/Build/badge.svg)[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/hbcarlos/voila-edito/master?urlpath=lab)

A JupyterLab extension to create voila dashboards.

## Requirements

- JupyterLab >= 3.0

## Install

```bash
pip install jupyterlab-gridstack
```

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the jupyterlab-gridstack directory

# create a new environment
mamba create -n jupyterlab-gridstack -c conda-forge/label/jupyterlab_rc -c conda-forge/label/jupyterlab_server_rc -c conda-forge/label/jupyterlab_widgets_rc -c conda-forge jupyterlab=3 ipywidgets jupyterlab_widgets nodejs python -y
conda activate jupyterlab-gridstack

# Install package in development mode
pip install -e .

# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite

# Rebuild extension Typescript source after making changes
jlpm run build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm run watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

To run the tests:

```bash
jlpm run build:test
jlpm run test
```

### Uninstall

```bash
pip uninstall jupyterlab-gridstack
jupyter labextension uninstall jupyterlab-gridstack
```
