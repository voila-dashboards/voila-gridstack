#############################################################################
# Copyright (c) 2018, Voila Contributors                                    #
# Copyright (c) 2018, QuantStack                                            #
#                                                                           #
# Distributed under the terms of the BSD 3-Clause License.                  #
#                                                                           #
# The full license is in the file LICENSE, distributed with this software.  #
#############################################################################

import json
import os.path as osp
from ._version import __version__

from .server_extension import load_jupyter_server_extension  # noqa

HERE = osp.abspath(osp.dirname(__file__))

with open(osp.join(HERE, 'labextension', 'package.json')) as fid:
    data = json.load(fid)


def _jupyter_labextension_paths():
    return [{
        'src': 'labextension',
        'dest': data['name']
    }]


def _jupyter_nbextension_paths():
    return [dict(
        section="notebook",
        src="nbextension",
        dest="voila-gridstack",
        require="voila-gridstack/extension"
    )]

def _jupyter_server_extension_points():
    return [{
        "module": "voila_gridstack"
    }]
