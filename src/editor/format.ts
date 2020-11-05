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
