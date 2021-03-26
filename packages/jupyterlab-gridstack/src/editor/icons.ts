import { LabIcon } from '@jupyterlab/ui-components';

import deleteIconSvgStr from '../../style/icons/delete.svg';

import pinIconSvgStr from '../../style/icons/pin.svg';

export const deleteIcon = new LabIcon({
  name: 'jupyterlab-gridstack:delete',
  svgstr: deleteIconSvgStr
});

export const pinIcon = new LabIcon({
  name: 'jupyterlab-gridstack:pin',
  svgstr: pinIconSvgStr
});
