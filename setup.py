"""
voila-gridstack setup
"""
import json
import setuptools
from pathlib import Path

HERE = Path(__file__).parent.resolve()

# The name of the project
NAME = "voila-gridstack"
PY_NAME = NAME.replace('-', '_')

lab_path = (HERE / PY_NAME / "labextension")

labext_name = "@voila-dashboards/jupyterlab-gridstack"
lab_extension_dest = (HERE / NAME / "labextension")
lab_extension_source = (HERE / "packages" / "jupyterlab-gridstack")

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
    ("share/jupyter/nbextensions/voila-gridstack", "voila-gridstack/static", "**"),
    ("share/jupyter/labextensions/%s" % labext_name, str(lab_extension_dest), "**"),
    ("share/jupyter/labextensions/%s" % labext_name, HERE, "install.json"),
    ("share/jupyter/nbconvert/templates/gridstack", "share/jupyter/nbconvert/templates/gridstack", "**")
]

# Get the package info from package.json
pkg_json = json.loads((HERE / "packages/jupyterlab-gridstack/package.json").read_bytes())
long_description = (HERE / "README.md").read_text()

setup_args = dict(
    name=NAME,
    version=pkg_json["version"],
    url=pkg_json["homepage"],
    author=pkg_json["author"],
    description=pkg_json["description"],
    license=pkg_json["license"],
    license_file="LICENSE",
    long_description=long_description,
    long_description_content_type="text/markdown",
    packages=setuptools.find_packages(),
    install_requires=[
        "jupyterlab_widgets~=1.0",
        "voila>=0.2.0,<0.3.0"
    ],
    extras_require={
        "test": [
            'ipykernel',
            'pytest',
            'pytest-tornasync',
            'lxml'
        ]
    },
    # entry_points={"console_scripts": ["voila-gridstack = voila_gridstack.app.main:main"]},
    zip_safe=False,
    include_package_data=True,
    python_requires=">=3.6",
    platforms="Linux, Mac OS X, Windows",
    keywords=["Jupyter", "JupyterLab", "Voila"],
    classifiers=[
        "License :: OSI Approved :: BSD License",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Framework :: Jupyter",
    ],
)

try:
    from jupyter_packaging import (
        wrap_installers,
        npm_builder,
        get_data_files
    )

    post_develop = npm_builder(build_cmd="install:dev", npm='jlpm', force=True)
    setup_args['cmdclass'] = wrap_installers(post_develop=post_develop, ensured_targets=ensured_targets)
    setup_args['data_files'] = get_data_files(data_files_spec)
except ImportError as e:
    pass

if __name__ == "__main__":
    setuptools.setup(**setup_args)
