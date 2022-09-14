import { validateDashboardCellView } from '../editor/format';

describe('format', () => {
  it('should validate an empty dashboard cell view', () => {
    const valid = validateDashboardCellView({});
    expect(valid).toBe(false);
  });

  it('should validate a correct dashboard cell view', () => {
    const valid = validateDashboardCellView({
      hidden: false,
      row: 0,
      col: 0,
      width: 100,
      height: 100,
      locked: true,
    });
    expect(valid).toBe(true);
  });
});
