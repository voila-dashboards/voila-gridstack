import { LabIcon } from '@jupyterlab/ui-components';

import deleteIconSvgStr from '../../style/icons/delete.svg';
import pinIconSvgStr from '../../style/icons/pin.svg';
import unPinIconSvgStr from '../../style/icons/unpin.svg';

export const deleteIcon = new LabIcon({
  name: '@voila-dashboards/jupyterlab-gridstack:icon-delete',
  svgstr: deleteIconSvgStr,
});

export const pinIcon = new LabIcon({
  name: '@voila-dashboards/jupyterlab-gridstack:icon-pin',
  svgstr: pinIconSvgStr,
});

export const unPinIcon = new LabIcon({
  name: '@voila-dashboards/jupyterlab-gridstack:icon-unPin',
  svgstr: unPinIconSvgStr,
});
