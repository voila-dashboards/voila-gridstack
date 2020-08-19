from setuptools import setup, find_packages
from setuptools.command.develop import develop
import os
import sys

try:
    import jupyter_core.paths as jupyter_core_paths
except:
    jupyter_core_paths = None


pjoin = os.path.join


class DevelopCmd(develop):
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



def get_data_files():
    """ Get all data files for the package
    """
    data_files = [
        ('etc/jupyter/jupyter_server_config.d', ['etc/jupyter/jupyter_server_config.d/voila-gridstack.json']),
        ('etc/jupyter/jupyter_notebook_config.d', ['etc/jupyter/jupyter_notebook_config.d/voila-gridstack.json']),
        ('etc/jupyter/nbconfig/notebook.d', ['etc/jupyter/nbconfig/notebook.d/voila-gridstack.json']),
        ('share/jupyter/nbextensions/voila-gridstack', ['voila-gridstack/static/extension.js',
                                                        'voila-gridstack/static/voila-gridstack.js',
                                                        'voila-gridstack/static/voila-gridstack.css',
                                                        'voila-gridstack/static/gridstack.js',
                                                        'voila-gridstack/static/gridstack.jqueryUI_require.js'
                                                        ])
    ]
    # Add all the templates
    for root, dirs, files in os.walk('share'):
        root_files = [os.path.join(root, i) for i in files]
        data_files.append((root, root_files))

    return data_files


setup_args = {
    'name': 'voila-gridstack',
    'version': '0.1.0a5',
    'packages': find_packages(),
    'data_files': get_data_files(),
    'package_data': {
        'voila-gridstack': [
            'static/*'
        ]
    },
    'install_requires': [
        'voila==0.2.0a3'
    ],
    'extras_require': {
        'test': [
            'pytest',
            'pytest-tornasync',
            'lxml'
        ]
    },
    'author': 'Voila Development team',
    'author_email': 'jupyter@googlegroups.com',
    'url': 'https://github.com/voila-dashboards/voila-gridstack/',
    'cmdclass': {
        'develop': DevelopCmd,
    } if jupyter_core_paths else {},
}

if __name__ == '__main__':
    setup(**setup_args)
