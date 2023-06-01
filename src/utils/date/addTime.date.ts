export const addTimeFromNow = (time: number, unit: 's' | 'm' | 'd') => {
  const date = new Date();
  if (unit === 's') {
    date.setSeconds(date.getSeconds() + time);
  }
  if (unit === 'm') {
    date.setMinutes(date.getMinutes() + time);
  }
  if (unit === 'd') {
    date.setDate(date.getDate() + time);
  }
  return date;
};
