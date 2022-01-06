# Making a new release of Voilà GridStack

## Automated Releases with `jupyter_releaser`

The recommended way to make a release is to use
[`jupyter_releaser`](https://jupyter-releaser.readthedocs.io/en/latest/).

### Steps:

1. Clone [Jupyter Releaser](https://github.com/jupyter-server/jupyter_releaser) or make sure that your fork is up to date.

![Pull Upstream](assets/releaser-merge.png)

2. From your fork, run the action "Draft Changelog"

![Draft Changelog](assets/release-draft-changelog.png)

3. In the [Voila-Gridstack repo](https://github.com/voila-dashboards/voila-gridstack/pulls) you will see a new PR to update the changelog.
   Make sure the PR is correct and merge it.

![Changelog PR](assets/release-changelog-pr.png)

4. From your fork, run the action "Full Release"

![Full Release](assets/release-full-release.png)

5. The most important part, make sure the released packages work as expected!
