# Making a new release of Voilà GridStack

## Getting a clean environment

Creating a new environment can help avoid pushing local changes and any extra tag.

```bash
mamba create -q -y -n voila-gridstack-release -c conda-forge twine nodejs keyring pip matplotlib jupyter-packaging jupyterlab
conda activate voila-gridstack-release
```

Alternatively, the local repository can be cleaned with:

```bash
git clean -fdx
```

## Releasing on PyPI

Make sure the `dist/` folder is empty.

1. Update [setup.py](./setup.py) with the new version number
2. `python setup.py sdist bdist_wheel`
3. Double check the size of the bundles in the `dist/` folder
4. Run the tests
5. `export TWINE_USERNAME=mypypi_username`
6. `twine upload dist/*`

## Releasing on conda-forge

The simplest is to wait for the bot to automatically open the PR.

Alternatively, to do the update manually:

1. Open a new PR on https://github.com/conda-forge/voila-gridstack-feedstock to update the `version` and the `sha256` hash (see [example](https://github.com/conda-forge/voila-gridstack-feedstock/pull/12/files))
2. Wait for the tests
3. Merge the PR

The new version will be available on `conda-forge` soon after.

## Committing and tagging

Commit the changes, create a new release tag, and update the `stable` branch (for Binder), where `x.y.z` denotes the new version:

```bash
git checkout master
git add setup.py
git commit -m "Release x.y.z"
git tag x.y.z
git checkout stable
git reset --hard master
git push origin master stable x.y.z
```
