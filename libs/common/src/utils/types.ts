export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;
export type DBErrorParse = { isInternal: boolean; clientError?: string };
