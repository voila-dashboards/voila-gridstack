from setuptools import setup, find_packages
import os


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
    'version': '0.0.9',
    'packages': find_packages(),
    'data_files': get_data_files(),
    'package_data': {
        'voila-gridstack': [
            'static/*'
        ]
    },
    'install_requires': [
        'voila>=0.1.18,<0.2'
    ],
    'extras_require': {
        'test': [
            'pytest',
            'pytest-tornado',
            'lxml'
        ]
    },
    'author': 'Voila Development team',
    'author_email': 'jupyter@googlegroups.com',
    'url': 'https://github.com/voila-dashboards/voila-gridstack/'
}

if __name__ == '__main__':
    setup(**setup_args)
