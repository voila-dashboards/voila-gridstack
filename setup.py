"""
voila-gridstack setup
"""
import os

from jupyter_packaging import (
    create_cmdclass, install_npm, ensure_targets,
    combine_commands
)
import setuptools

HERE = os.path.abspath(os.path.dirname(__file__))

# The name of the project
name="voila-gridstack"

labext_name = "jupyterlab-gridstack"
lab_extension_dest = os.path.join(HERE, name, "labextension")
lab_extension_source = os.path.join(HERE, "packages", labext_name)

# Representative files that should exist after a successful build
jstargets = [
    os.path.join(lab_extension_source, "lib", "index.js"),
    os.path.join(lab_extension_dest, "package.json"),
]

package_data_spec = {
    name: [
        "*"
    ]
}


data_files_spec = [
    ("share/jupyter/labextensions/%s" % labext_name, lab_extension_dest, "**"),
    ("share/jupyter/labextensions/%s" % labext_name, HERE, "install.json"),
    ("etc/jupyter/jupyter_server_config.d", "etc/jupyter/jupyter_server_config.d", "voila-gridstack.json"),
    ("etc/jupyter/jupyter_notebook_config.d", "etc/jupyter/jupyter_notebook_config.d", "voila-gridstack.json"),
    ("etc/jupyter/nbconfig/notebook.d", "etc/jupyter/nbconfig/notebook.d", "voila-gridstack.json"),
    ("share/jupyter/nbextensions/voila-gridstack", "voila-gridstack/static", "**"),
    ("share/jupyter/nbconvert/templates/gridstack", "share/jupyter/nbconvert/templates/gridstack", "**")
]


cmdclass = create_cmdclass("jsdeps",
    package_data_spec=package_data_spec,
    data_files_spec=data_files_spec
)

cmdclass["jsdeps"] = combine_commands(
    install_npm(lab_extension_source, build_cmd="build:prod", npm=["jlpm"]),
    ensure_targets(jstargets),
)

with open("README.md", "r") as fh:
    long_description = fh.read()

setup_args = dict(
    name=name,
    version="0.0.12",
    url="https://github.com/voila-dashboards/voila-gridstack",
    author="Voila Development Team",
    author_email="jupyter@googlegroups.com",
    description="A GridStack template for Voila.",
    long_description= long_description,
    long_description_content_type="text/markdown",
    cmdclass=cmdclass,
    packages=setuptools.find_packages(),
    install_requires=[
        "jupyterlab_widgets>=1.0.0a6",
        "voila>=0.2.0,<0.3.0"
    ],
    extras_require={
        "test": [
            'ipykernel',
            'jupyter_server~=1.0.1',
            'pytest',
            'pytest-tornasync',
            'lxml'
        ]
    },
    zip_safe=False,
    include_package_data=True,
    python_requires=">=3.6",
    license="BSD-3-Clause",
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


if __name__ == "__main__":
    setuptools.setup(**setup_args)
