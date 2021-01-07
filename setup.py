"""
voila-gridstack setup
"""
import os
import sys

from jupyter_packaging import (
    create_cmdclass, install_npm, ensure_targets,
    combine_commands, skip_if_exists
)
import setuptools

try:
    import jupyter_core.paths as jupyter_core_paths
except:
    jupyter_core_paths = None

HERE = os.path.abspath(os.path.dirname(__file__))

# The name of the project
name="voila-gridstack"

labext_name = "@voila-dashboards/jupyterlab-gridstack"
lab_extension_dest = os.path.join(HERE, name, "labextension")
lab_extension_source = os.path.join(HERE, "packages", "jupyterlab-gridstack")

# Representative files that should exist after a successful build
jstargets = [
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

js_command = combine_commands(
    install_npm(lab_extension_source, build_cmd="build:prod", npm=["jlpm"]),
    ensure_targets(jstargets),
)

is_repo = os.path.exists(os.path.join(HERE, ".git"))
if is_repo:
    cmdclass["jsdeps"] = js_command
else:
    cmdclass["jsdeps"] = skip_if_exists(jstargets, js_command)

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

with open("README.md", "r") as fh:
    long_description = fh.read()

setup_args = dict(
    name=name,
    version="0.1.0",
    url="https://github.com/voila-dashboards/voila-gridstack",
    author="Voila Development Team",
    author_email="jupyter@googlegroups.com",
    description="A GridStack template for Voila.",
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
