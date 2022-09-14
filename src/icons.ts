import { LabIcon } from '@jupyterlab/ui-components';

// icon svg import statements
import compact from '../style/icons/compact.svg';
import dashboard from '../style/icons/dashboard.svg';

export const compactIcon = new LabIcon({
  name: '@voila-dashboards/jupyterlab-gridstack:icon-compact',
  svgstr: compact,
});

export const dashboardIcon = new LabIcon({
  name: '@voila-dashboards/jupyterlab-gridstack:icon-dashboard',
  svgstr: dashboard,
});
