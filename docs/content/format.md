# Format

The template uses metadata defined in the notebook file (`.ipynb`) to configure the layout.
The specification of the metadata was defined by a now defunct project `jupyter-dashboards`.
The specification is described in `jupyter-dashboards`
[docs](https://jupyter-dashboards-layout.readthedocs.io/en/latest/metadata.html).

The voila renderer behaves as a "display-only renderer without authoring capabilitiy" as defined in
the specs. However, there are a few differences compared to the original implmentation:

- if no metadata is found in the notebook voilà will render the notebook as `grid` layout,
- it can not persist the state of the cells (i.e. the re-configuration of the layout will
  be lost, when the user closes the voila page),
- if the cell does not contain view configuration for the particular view type (`grid` or
  `report`) or `hidden` attribute is not defined, voilà will treat it as **visible**.
