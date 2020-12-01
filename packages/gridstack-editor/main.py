"""
Copyright (c) Jupyter Development Team.
Distributed under the terms of the Modified BSD License.

This file was bootstrapped from the JupyterLab examples:
https://github.com/jupyterlab/jupyterlab/tree/master/examples

"""
import os
import json
from jupyter_server.base.handlers import JupyterHandler
from jupyter_server.extension.handler import ExtensionHandlerMixin, ExtensionHandlerJinjaMixin
from jupyterlab_server import LabServerApp
from jupyter_server.utils import url_path_join as ujoin

HERE = os.path.dirname(__file__)

with open(os.path.join(HERE, 'package.json')) as fid:
    version = json.load(fid)['version']

def _jupyter_server_extension_points():
    return [
        {
            'module': __name__,
            'app': GridStackApp
        }
    ]

class GridStackHandler(
    ExtensionHandlerJinjaMixin,
    ExtensionHandlerMixin,
    JupyterHandler
    ):

    def get(self):
        config_data = {
            "appVersion": version,
            'baseUrl': self.base_url,
            'token': self.settings['token'],
            'fullStaticUrl': ujoin(self.base_url, 'static', self.name),
            'frontendUrl': ujoin(self.base_url, 'gridstack/'),
        }
        return self.write(
            self.render_template(
                'index.html',
                static=self.static_url,
                base_url=self.base_url,
                token=self.settings['token'],
                page_config=config_data
                )
            )


class GridStackApp(LabServerApp):

    extension_url = '/gridstack'
    app_url = "/gridstack"
    # allow other server extensions such as Voila
    load_other_extensions = True
    name = __name__
    app_name = 'GridStack Editor'
    static_dir = os.path.join(HERE, 'build')
    templates_dir = os.path.join(HERE, 'templates')
    app_version = version
    app_settings_dir = os.path.join(HERE, 'build', 'application_settings')
    schemas_dir = os.path.join(HERE, 'build', 'schemas')
    themes_dir = os.path.join(HERE, 'build', 'themes')
    user_settings_dir = os.path.join(HERE, 'build', 'user_settings')
    workspaces_dir = os.path.join(HERE, 'build', 'workspaces')


    def initialize_handlers(self):
        super().initialize_handlers()
        self.handlers.append(('/gridstack', GridStackHandler))


if __name__ == '__main__':
    GridStackApp.launch_instance()
