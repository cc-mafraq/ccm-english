import { filter, includes, isEmpty, map, some, toLower } from "lodash";
import { Student, WaitingListEntry } from "../interfaces";
import { sortWaitingList } from "./waitingListService";

export const phoneConditionFn = (searchString: string) => {
  return (n: number) => {
    return (
      n?.toString().match(new RegExp(`${searchString}$`)) || n?.toString().match(new RegExp(`^${searchString}`))
    );
  };
};

export const searchStudents = (students: Student[], searchString: string): Student[] => {
  const searchStringRegEx = new RegExp(`^${toLower(searchString)}`);
  return filter(students, (s) => {
    return (
      isEmpty(searchString) ||
      !!toLower(s.name.english).match(searchStringRegEx) ||
      includes(s.name.arabic, searchString) ||
      s.epId.toString() === searchString ||
      some(map(s.phone.phoneNumbers, "number"), phoneConditionFn(searchString)) ||
      !!toLower(s.familyCoordinatorEntry).match(searchStringRegEx)
    );
  });
};

export const searchWaitingList = (wlEntries: WaitingListEntry[], searchString: string) => {
  return sortWaitingList(
    filter(wlEntries, (wle) => {
      return (
        isEmpty(searchString) ||
        includes(toLower(wle.name), toLower(searchString)) ||
        includes(toLower(wle.referral), toLower(searchString)) ||
        some(map(wle.phoneNumbers, "number"), phoneConditionFn(searchString))
      );
    }),
  );
};
