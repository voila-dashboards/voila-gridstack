/**
 * The Notebook metadata info for dashboards.
 */
export type DashboardInfo = {
  /**
   * Format version.
   */
  version: number;
  /**
   * Default dashboard view for the notebook.
   */
  activeView: string;
  /**
   * Dictionary of dashboard views used in the notebook.
   */
  views: { [id: string]: DashboardView };
};

/**
 * The Notebook metadata for a specific dashboard view.
 */
export type DashboardView = {
  /**
   * User-assigned, unique human readable name.
   */
  name: string;
  /**
   * Layout algorithm to use.
   */
  type: string;
  /**
   * Total number of logical columns.
   */
  maxColumns: number;
  /**
   * Margin between cells in pixels.
   */
  cellMargin: number;
  /**
   * Height in pixels of a logical row.
   */
  defaultCellHeight: number;
};

/**
 * The Cell metadata info for dashboards.
 */
export type DashboardCellInfo = {
  /**
   * Format version.
   */
  version: number;
  /**
   * Dictionary of dashboard views used in the notebook.
   */
  views: { [id: string]: DashboardCellView };
};

/**
 * The Cell metadata for a specific dashboard view.
 */
export type DashboardCellView = {
  /**
   * If cell output+widget are visible in the layout.
   */
  hidden: boolean;
  /**
   * Logical row position.
   */
  row: number;
  /**
   * Logical column position.
   */
  col: number;
  /**
   * Logical width.
   */
  width: number;
  /**
   * Logical height.
   */
  height: number;
  /**
   * Lock item.
   */
  locked: boolean;
};

/**
 * Signal argument for cell change.
 */
export type CellChange = {
  /**
   * Cell id.
   */
  id: string;
  /**
   * Cell view info.
   */
  info: DashboardCellView;
};

/**
 * Validate that the DashboardView Notebook's metadata is correct.
 *
 * @param view - The json schema.
 */
export function validateDashboardView(view: Partial<DashboardView>): boolean {
  if (
    view &&
    'name' in view &&
    'type' in view &&
    'maxColumns' in view &&
    'cellMargin' in view &&
    'defaultCellHeight' in view
  ) {
    return true;
  } else {
    return false;
  }
}

/**
 * Validate that the DashboardCellView Notebook's cell metadata is correct.
 *
 * @param view - The json schema.
 */
export function validateDashboardCellView(
  view: Partial<DashboardCellView>
): boolean {
  if (
    view &&
    'hidden' in view &&
    'row' in view &&
    'col' in view &&
    'width' in view &&
    'height' in view &&
    'locked' in view
  ) {
    return true;
  } else {
    return false;
  }
}
