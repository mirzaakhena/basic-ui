export type DateOrString = Date | string;

const getDate = (x: DateOrString): Date => {
  //
  let date: Date;

  if (x instanceof Date) {
    date = x;
  } else if (typeof x === "string") {
    date = new Date(x);

    if (isNaN(date.getTime())) {
      throw new Error("Invalid date string");
    }
  } else {
    throw new Error("Invalid input type");
  }

  return date;
};

export const formatDateWithSecond = (ds: DateOrString) => {
  //

  const date = getDate(ds);

  const year = date.getFullYear().toString().slice(-2).padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  const second = date.getSeconds().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};
