export type DashboardInfo = {
  version: number;
  activeView: string;
  views: { [id: string]: DashboardView };
};

export type DashboardView = {
  name: string;
  type: string;
  maxColumns: number;
  cellMargin: number;
  defaultCellHeight: number;
};

export type DashboardCellInfo = {
  version: number;
  views: { [id: string]: DashboardCellView };
};

export type DashboardCellView = {
  hidden: boolean;
  row: number;
  col: number;
  width: number;
  height: number;
};
