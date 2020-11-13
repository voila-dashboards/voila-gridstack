export type DashboardInfo = {
  version: number;
  activeView: string;
  views: { [id: string]: DashboardView };
};

export type DashboardView = {
  name: string;
  type: string;
  cellMargin: number;
  cellHeight: number;
  numColumns: number;
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
