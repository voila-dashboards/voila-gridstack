from setuptools import setup
import os

data_files = []
for root, dirs, files in os.walk('share'):
    root_files = [os.path.join(root, i) for i in files]
    data_files.append((root, root_files))

setup_args = {
    'name': 'voila-gridstack',
    'version': '0.0.6',
    'packages': [],
    'data_files': data_files,
    'install_requires': [
        'voila>=0.1.6,<0.2'
    ],
    'author': 'QuantStack',
    'author_email': 'info@quantstack.net',
    'url': 'https://github.com/QuantStack/voila-gridstack/'
}

if __name__ == '__main__':
    setup(**setup_args)
