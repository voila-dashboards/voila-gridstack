#############################################################################
# Copyright (c) 2018, Voila Contributors                                    #
# Copyright (c) 2018, QuantStack                                            #
#                                                                           #
# Distributed under the terms of the BSD 3-Clause License.                  #
#                                                                           #
# The full license is in the file LICENSE, distributed with this software.  #
#############################################################################

from jupyter_server.utils import url_path_join

from voila.paths import STATIC_ROOT, collect_template_paths
from voila.handler import VoilaHandler
from voila.configuration import VoilaConfiguration


def load_jupyter_server_extension(server_app):
    """ Extension to create an URL for voila-dashboard using GridStack, to be able to call it from Jupyter Notebook

    """

    web_app = server_app.web_app

    nbconvert_template_paths = []
    static_paths = [STATIC_ROOT]
    template_paths = []

    voila_configuration = VoilaConfiguration(parent=server_app)
    voila_configuration.template = "gridstack"
    voila_configuration.config.VoilaConfiguration.resources = {"gridstack": {"show_handles": False, "extension": True}}

    collect_template_paths(
        nbconvert_template_paths,
        static_paths,
        template_paths,
        voila_configuration.template
    )

    host_pattern = '.*$'
    base_url = url_path_join(web_app.settings['base_url'])

    web_app.add_handlers(host_pattern, [
        (url_path_join(base_url, '/voila/dashboard/(.*)'), VoilaHandler, {
            'config': server_app.config,
            'nbconvert_template_paths': nbconvert_template_paths,
            'voila_configuration': voila_configuration
        }),
    ])

