"""
voila-gridstack setup
"""

import setuptools
from pathlib import Path

HERE = Path(__file__).parent.resolve()

# The name of the project
NAME = "voila-gridstack"
PACKAGE = NAME.replace('-', '_')

labext_name = "@voila-dashboards/jupyterlab-gridstack"
lab_extension_dest = (HERE / PACKAGE / "labextension")

# Representative files that should exist after a successful build
ensured_targets = [
    str(lab_extension_dest / "package.json"),
    str(lab_extension_dest / "static" / "style.js"),
    str(HERE / "share/jupyter/nbconvert/templates/gridstack/gridstack.js.j2")
]

data_files_spec = [
    ("etc/jupyter/jupyter_server_config.d", "etc/jupyter/jupyter_server_config.d", "voila-gridstack.json"),
    ("etc/jupyter/jupyter_notebook_config.d", "etc/jupyter/jupyter_notebook_config.d", "voila-gridstack.json"),
    ("etc/jupyter/nbconfig/notebook.d", "etc/jupyter/nbconfig/notebook.d", "voila-gridstack.json"),
    ("share/jupyter/nbextensions/voila-gridstack", f"{PACKAGE}/static", "**"),
    ("share/jupyter/labextensions/%s" % labext_name, str(lab_extension_dest), "**"),
    ("share/jupyter/labextensions/%s" % labext_name, HERE, "install.json"),
    ("share/jupyter/nbconvert/templates/gridstack", "share/jupyter/nbconvert/templates/gridstack", "**")
]

try:
    from jupyter_packaging import (
        wrap_installers,
        npm_builder,
        get_data_files
    )

    post_develop = npm_builder(build_cmd='install:dev', npm='jlpm', force=True)
    cmdclass = wrap_installers(post_develop=post_develop, ensured_targets=ensured_targets)
    setup_args = dict(cmdclass=cmdclass, data_files=get_data_files(data_files_spec))
except ImportError:
    setup_args = dict()

if __name__ == "__main__":
    setuptools.setup(**setup_args)
