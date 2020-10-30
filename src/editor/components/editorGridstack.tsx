import { ReactWidget } from '@jupyterlab/apputils';

import * as React from 'react';

import { DashboardView } from '../views/gridstackPanel';

export default class EditorGridstack extends ReactWidget {
  constructor(info: DashboardView) {
    super();
    this._info = info;
  }

  get info(): DashboardView {
    return this._info;
  }

  render(): JSX.Element {
    /* const submit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      //this._gridStackPanel.info = this._info;
    } */

    const handleName = (event: React.ChangeEvent<HTMLInputElement>) => {
      this._info.name = event.target.value;
      this.update();
    };

    const handleMargin = (event: React.ChangeEvent<HTMLInputElement>) => {
      this._info.cellMargin = parseInt(event.target.value, 10);
      this.update();
    };

    const handleHeight = (event: React.ChangeEvent<HTMLInputElement>) => {
      this._info.cellHeight = parseInt(event.target.value, 10);
      this.update();
    };

    const handleColumns = (event: React.ChangeEvent<HTMLInputElement>) => {
      this._info.numColumns = parseInt(event.target.value, 10);
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
            value={this._info.cellHeight}
            onChange={handleHeight}
          />
        </div>

        <div className="row">
          <label className="col-25">Number of columns:</label>{' '}
          <input
            type="number"
            name="columns"
            className="jp-mod-styled col-75"
            value={this._info.numColumns}
            onChange={handleColumns}
          />
        </div>

        {/* <div className="row">
          <input type="submit" value="Submit" className="jp-Dialog-button jp-mod-accept jp-mod-styled" />
        </div> */}
      </form>
    );
  }

  private _info: DashboardView;
}
