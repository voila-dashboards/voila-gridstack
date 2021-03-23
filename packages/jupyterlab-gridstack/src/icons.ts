import { LabIcon } from '@jupyterlab/ui-components';

// icon svg import statements
import pullRequest from '../style/icons/dashboard.svg';

export const dashboardIcon = new LabIcon({
  name: '@voila-dashboards/jupyterlab-gridstack:icon-dashboard',
  svgstr: pullRequest
});
