export type AppConfig = {
  nodeEnv: string;
  backendDomain: string;
};

export type SQLDatabaseConfig = {
  url?: string;
  type?: string;
  host?: string;
  port?: number;
  password?: string;
  name?: string;
  username?: string;
  synchronize?: boolean;
  maxConnections: number;
  sslEnabled?: boolean;
  rejectUnauthorized?: boolean;
  ca?: string;
  key?: string;
  cert?: string;
};

export type NoSQLDatabaseConfig = {
  name?: string;
  username?: string;
  password?: string;
  host?: string;
  port?: number;
  ca?: string;
  key?: string;
  cert?: string;
};

export type AllConfigType = {
  database: SQLDatabaseConfig;
  helper_database: NoSQLDatabaseConfig;
};
