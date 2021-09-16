"""
voila-gridstack setup
"""
import os
import sys
import json
from pathlib import Path

import setuptools

try:
    import jupyter_core.paths as jupyter_core_paths
except:
    jupyter_core_paths = None
    
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
    str(HERE / "share/jupyter/nbconvert/templates/base/gridstack/gridstack.js.j2"),
]

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

js_command = combine_commands(
    install_npm(lab_extension_source, build_cmd="build:prod", npm=["jlpm"]),
    ensure_targets(jstargets),
)

is_repo = os.path.exists(os.path.join(HERE, ".git"))
if is_repo:
    cmdclass["jsdeps"] = js_command
else:
    cmdclass["jsdeps"] = skip_if_exists(ensured_targets, js_command)

base_develop_cmd = cmdclass['develop']


class DevelopCmd(base_develop_cmd):
    prefix_targets = [
        ("nbconvert/templates", 'gridstack'),
        ("voila/templates", 'gridstack')
    ]
    def run(self):
        target_dir = os.path.join(sys.prefix, 'share', 'jupyter')
        if '--user' in sys.prefix:  # TODO: is there a better way to find out?
            target_dir = jupyter_core_paths.user_dir()
        target_dir = os.path.join(target_dir)

        for prefix_target, name in self.prefix_targets:
            source = os.path.join('share', 'jupyter', prefix_target, name)
            target = os.path.join(target_dir, prefix_target, name)
            target_subdir = os.path.dirname(target)
            if not os.path.exists(target_subdir):
                os.makedirs(target_subdir)
            rel_source = os.path.relpath(os.path.abspath(source), os.path.abspath(target_subdir))
            try:
                os.remove(target)
            except:
                pass
            print(rel_source, '->', target)
            os.symlink(rel_source, target)

        super(DevelopCmd, self).run()


cmdclass['develop'] = DevelopCmd if jupyter_core_paths else base_develop_cmd

long_description = (HERE / "README.md").read_text()

# Get the package info from package.json
pkg_json = json.loads((HERE / "package.json").read_bytes())

setup_args = dict(
    name=NAME,
    version=pkg_json["version"],
    url=pkg_json["homepage"],
    author=pkg_json["author"]["name"],
    author_email=pkg_json["author"]["email"],
    description=pkg_json["description"],
    license=pkg_json["license"],
    long_description=long_description,
    long_description_content_type="text/markdown",
    cmdclass=cmdclass,
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
    #entry_points={"console_scripts": ["voila-gridstack = voila_gridstack.app.main:main"]},
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

try:
    from jupyter_packaging import (
        wrap_installers,
        npm_builder,
        get_data_files
    )
    post_develop = npm_builder(
        build_cmd="install:extension", source_dir="src", build_dir=lab_path
    )
    setup_args['cmdclass'] = wrap_installers(post_develop=post_develop, ensured_targets=ensured_targets)
    setup_args['data_files'] = get_data_files(data_files_spec)
except ImportError as e:
    pass

if __name__ == "__main__":
    setuptools.setup(**setup_args)
