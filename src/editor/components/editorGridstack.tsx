import { ReactWidget } from '@jupyterlab/apputils';

import * as React from 'react';

import { DashboardView } from '../format';

export class EditorGridstack extends ReactWidget {
  constructor(info: DashboardView) {
    super();
    this._info = info;
  }

  get info(): DashboardView {
    return this._info;
  }

  render(): JSX.Element {
    const handleName = (event: React.ChangeEvent<HTMLInputElement>): void => {
      this._info.name = event.target.value;
      this.update();
    };

    const handleMargin = (event: React.ChangeEvent<HTMLInputElement>): void => {
      this._info.cellMargin = parseInt(event.target.value, 10);
      this.update();
    };

    const handleHeight = (event: React.ChangeEvent<HTMLInputElement>): void => {
      const height = parseInt(event.target.value, 10);
      this._info.defaultCellHeight = height < 40 ? 40 : height;
      this.update();
    };

    const handleColumns = (
      event: React.ChangeEvent<HTMLInputElement>
    ): void => {
      let col = parseInt(event.target.value, 10);
      col = col > 12 ? 12 : col;
      col = col < 1 ? 1 : col;
      this._info.maxColumns = col;
      this.update();
    };

    return (
      <form className="jp-Input-Dialog jp-Dialog-body">
        <div className="row">
          <label className="col-25">Name:</label>
          <input
            type="text"
            name="name"
            className="jp-mod-styled col-75"
            value={this._info.name}
            onChange={handleName}
          />
        </div>

        <div className="row">
          <label className="col-25">Type:</label>
          <input
            type="text"
            name="name"
            className="jp-mod-styled col-75"
            value={this._info.type}
            disabled
          />
        </div>

        <div className="row">
          <label className="col-25">Cell Margin:</label>
          <input
            type="number"
            name="margin"
            className="jp-mod-styled col-75"
            value={this._info.cellMargin}
            onChange={handleMargin}
          />
        </div>

        <div className="row">
          <label className="col-25">Cell Height:</label>{' '}
          <input
            type="number"
            name="height"
            className="jp-mod-styled col-75"
            value={this._info.defaultCellHeight}
            onChange={handleHeight}
          />
        </div>

        <div className="row">
          <label className="col-25">Number of columns:</label>{' '}
          <input
            type="number"
            name="columns"
            className="jp-mod-styled col-75"
            value={this._info.maxColumns}
            onChange={handleColumns}
            disabled={true}
          />
        </div>
      </form>
    );
  }

  private _info: DashboardView;
}
