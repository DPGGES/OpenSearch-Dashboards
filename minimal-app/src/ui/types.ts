export type AuthType = 'basic' | 'apiKey';

export interface ConnectionInfo {
  url: string;
  authType: AuthType;
  username: string;
  password: string;
  apiKey: string;
}

export interface IndexInfo {
  name: string;
  docsCount: number;
  health: string;
  status: string;
}

export interface DataView {
  id: string;
  title: string;
  indexPattern: string;
}

export type Screen = 'connect' | 'indices' | 'dashboards';

export interface AppState {
  screen: Screen;
  connection: ConnectionInfo;
  indices: IndexInfo[];
  dataViews: DataView[];
  errors: string[];
}
