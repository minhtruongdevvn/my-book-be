import { AnyFunction } from './any-function';

/**
 * Exclude specified data type of an object or class alike.
 * @remarks HOC type
 */
export type ExcludeTypePattern<Entity, Pattern> = Pick<
  Entity,
  ExtractKeys<Entity, Pattern>
>;
export type ExtractClassProperties<
  Entity,
  ExtraOmit extends keyof Entity = never,
> = Omit<
  Writeable<Pick<Entity, ExtractKeys<Entity, AnyFunction>>>,
  'constructor' | ExtraOmit
>;

// helper
type ExtractKeys<T, ExcludePattern> = {
  [Key in keyof T]: T[Key] extends ExcludePattern ? never : Key;
}[keyof T];

type Writeable<T> = { -readonly [P in keyof T]: T[P] };
