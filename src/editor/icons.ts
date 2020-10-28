import { LabIcon } from '@jupyterlab/ui-components';

import deleteIconSvgStr from '../../style/icons/delete.svg';

export const deleteIcon = new LabIcon({
  name: 'voila-editor:delete',
  svgstr: deleteIconSvgStr
});
