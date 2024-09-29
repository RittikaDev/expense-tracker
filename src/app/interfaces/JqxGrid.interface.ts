export interface IDatafields {
  name: string;
  type: string;
}

export interface IColumnType {
  text: string;
  datafield: string;
  width: number | string;
  filtertype?: string;
  filteritems?: Array<string>;
  cellsformat?: string;
  cellsalign?: string;
  align?: string;
  columntype?: string;
  cellsrenderer?: Function;
  buttonclick?: (row: number) => any;
  hidden?: boolean;
  editable?: boolean;
  cellbeginedit?: Function;
  cellendedit?: Function;
  createwidget?: any;
  cellclassname?: Function;
  initeditor?: Function;
  validation?: Function;
}
