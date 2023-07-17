/**
 * Alternative for {@link Function} interface, which to avoid bad practice but
 * also provide the ability to have matching types.
 * @remarks Utility type
 */
export type AnyFunction = (...args: any[]) => any;
