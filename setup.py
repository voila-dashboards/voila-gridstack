import os
import sys

from setuptools import setup
from setuptools.command.develop import develop

pjoin = os.path.join


# these are based on jupyter_core.paths
def jupyter_config_dir():
    """Get the Jupyter config directory for this platform and user.

    Returns JUPYTER_CONFIG_DIR if defined, else ~/.jupyter
    """

    env = os.environ
    home_dir = get_home_dir()

    if env.get('JUPYTER_NO_CONFIG'):
        return _mkdtemp_once('jupyter-clean-cfg')

    if env.get('JUPYTER_CONFIG_DIR'):
        return env['JUPYTER_CONFIG_DIR']

    return pjoin(home_dir, '.jupyter')


def user_dir():
    homedir = os.path.expanduser('~')
    # Next line will make things work even when /home/ is a symlink to
    # /usr/home as it is on FreeBSD, for example
    homedir = os.path.realpath(homedir)
    if sys.platform == 'darwin':
        return os.path.join(homedir, 'Library', 'Jupyter')
    elif os.name == 'nt':
        appdata = os.environ.get('APPDATA', None)
        if appdata:
            return os.path.join(appdata, 'jupyter')
        else:
            return os.path.join(jupyter_config_dir(), 'data')
    else:
        # Linux, non-OS X Unix, AIX, etc.
        xdg = env.get("XDG_DATA_HOME", None)
        if not xdg:
            xdg = pjoin(home, '.local', 'share')
        return pjoin(xdg, 'jupyter')


class DevelopCmd(develop):
    prefix_targets = [
        ("nbconvert/templates", 'gridstack'),
        ("voila/templates", 'gridstack')
    ]
    def run(self):
        target_dir = os.path.join(sys.prefix, 'share', 'jupyter')
        if '--user' in sys.prefix:  # TODO: is there a better way to find out?
            target_dir = user_dir()
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
    'url': 'https://github.com/QuantStack/voila-gridstack/',
    'cmdclass': {
        'develop': DevelopCmd,
    },
}

if __name__ == '__main__':
    setup(**setup_args)
