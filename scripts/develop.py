# -*- coding: utf-8 -*-

# Copyright (c) Voila contributors.
# Distributed under the terms of the Modified BSD License.import click

import os
import sys
import shutil
import argparse

from pathlib import Path

HERE = Path(__file__).parent.parent.resolve()

LOCAL_TEMPLATE_DIR  = ( HERE / "voila_gridstack/template" )
SYS_TEMPLATE_DIR = Path(sys.prefix, "share/jupyter/nbconvert/templates/gridstack")

def link():
    """Install template"""

    assert LOCAL_TEMPLATE_DIR.exists()

    if os.path.isfile(SYS_TEMPLATE_DIR) :
        os.remove(SYS_TEMPLATE_DIR)
    
    elif os.path.islink(SYS_TEMPLATE_DIR) :
        os.remove(SYS_TEMPLATE_DIR)

    elif os.path.isdir(SYS_TEMPLATE_DIR) :
        clean_dir(SYS_TEMPLATE_DIR)
        shutil.rmtree(SYS_TEMPLATE_DIR)
    
    os.symlink(LOCAL_TEMPLATE_DIR, SYS_TEMPLATE_DIR)
    print(f"""Symlink created:
    Ori:  {LOCAL_TEMPLATE_DIR}
    Dest: {SYS_TEMPLATE_DIR}
    """)

def unlink():
    """Uninstall template"""
    
    if os.path.isfile(SYS_TEMPLATE_DIR) :
        os.remove(SYS_TEMPLATE_DIR)
    
    elif os.path.islink(SYS_TEMPLATE_DIR) :
        os.remove(SYS_TEMPLATE_DIR)

    elif os.path.isdir(SYS_TEMPLATE_DIR) :
        clean_dir(SYS_TEMPLATE_DIR)
        shutil.rmtree(SYS_TEMPLATE_DIR)

def clean_dir(dir_path):
    file_list = os.listdir(dir_path)

    for file in file_list:
        file_path = os.path.join(dir_path, file)

        if os.path.isfile(file_path) :
            os.remove(file_path)

        elif os.path.islink(file_path) :
            os.remove(file_path)

        elif os.path.isdir(file_path) :
            clean_dir(file_path)
            shutil.rmtree(file_path)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--link', action='store_true', default=None, help='Install template')
    parser.add_argument('--unlink', action='store_true', default=None, help='Uninstall template')
    args = parser.parse_args()

    if (args.link) :
        link()
    elif (args.unlink) :
        unlink()