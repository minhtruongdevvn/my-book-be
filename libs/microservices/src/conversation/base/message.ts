type BaseReturnType = {
  GET_ALL_BY_USER: string;
  GET_BY_ID: string;
};

export default <T extends object>(
  baseKey: string,
  extend: T = Object(),
): BaseReturnType & { [K in keyof T]: T[K] } => {
  if (extend) {
    extend = Object.keys(extend).reduce((acc, key) => {
      acc[key] = `${baseKey}_${extend[key]}`;
      return acc;
    }, {} as T);
  }

  return {
    ...extend,
    GET_ALL_BY_USER: `${baseKey}_get_all_by_user`,
    GET_BY_ID: `${baseKey}_get_by_id`,
  };
};
