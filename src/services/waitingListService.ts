import {
  countBy,
  filter,
  findIndex,
  flatten,
  get,
  groupBy,
  includes,
  map,
  orderBy,
  slice,
  sum,
  values,
} from "lodash";
import moment from "moment";
import { HighPriority, Student, WaitingListEntry, WaitlistOutcome } from "../interfaces";
import { MOMENT_FORMAT } from "./studentFormService";

export const sortWaitingList = (waitingList: WaitingListEntry[]) => {
  const orderedList = flatten(
    orderBy(
      values(
        groupBy(
          orderBy(
            waitingList,
            [
              "waiting",
              "highPriority",
              (wle) => {
                return moment(wle.entryDate, MOMENT_FORMAT);
              },
              "timestamp",
            ],
            ["desc", "desc", "asc", "asc"],
          ),
          "primaryPhone",
        ),
      ),
      [
        (wle) => {
          return wle[0].waiting;
        },
        (wle) => {
          return wle[0].highPriority;
        },
        (wle) => {
          return moment(wle[0].entryDate, MOMENT_FORMAT);
        },
        (wle) => {
          return wle[0].timestamp;
        },
      ],
      ["desc", "desc", "asc", "asc"],
    ),
  );
  return orderedList;
};

export const getPosition = (waitingList: WaitingListEntry[], wlEntry: WaitingListEntry) => {
  const index = findIndex(waitingList, (wle) => {
    return wle.id === wlEntry.id;
  });
  return index + 1 - (get(countBy(map(slice(waitingList, 0, index), "waiting")), "false") || 0);
};

export interface WaitingListTimeStats {
  avgNumPeoplePerEntry: number;
  eligibleNewStudentRate: number;
  newStudentRate: number;
  numHighPriority: number;
  numSpotsPerMonth: number;
}

export const getWaitingListTimeStats = (
  waitingList: WaitingListEntry[],
  students: Student[],
): WaitingListTimeStats => {
  const newOutcomeEntries = filter(waitingList, (wle) => {
    return wle.outcome === WaitlistOutcome.N;
  });

  const newOutcomeNotWaitingEntries = filter(newOutcomeEntries, (wle) => {
    return !wle.waiting;
  });

  const notWaitingLength = newOutcomeNotWaitingEntries.length;

  const newStudentRate =
    newOutcomeEntries.length /
    filter(waitingList, (wle) => {
      return wle.outcome !== undefined;
    }).length;

  const newStudentsPerMonth = students.length / moment().diff(moment("09-01-2017"), "months");

  const numNewPastHighPriority = filter(newOutcomeEntries, (wle) => {
    return wle.highPriority === HighPriority.PAST;
  }).length;

  const overallHighPriorityRate = numNewPastHighPriority / notWaitingLength;

  const reactivatedRate =
    filter(newOutcomeEntries, (wle) => {
      return (
        includes(wle.placementExam, "NS") ||
        (includes(wle.placementExam, "NO RESPONSE") &&
          moment(wle.transferDbDate).diff(wle.entryDate, "months") > 24)
      );
    }).length / notWaitingLength;

  const numPreviousNewEligible = filter(newOutcomeEntries, (wle) => {
    return wle.eligible && !wle.waiting;
  }).length;

  const eligibleNewStudentRate =
    numPreviousNewEligible > 50
      ? numPreviousNewEligible /
        filter(waitingList, (wle) => {
          return wle.eligible && !wle.waiting;
        }).length
      : 2 / 3;

  const numHighPriority = filter(waitingList, (wle) => {
    return wle.highPriority !== HighPriority.NO && wle.waiting && wle.outcome === WaitlistOutcome.N;
  }).length;

  const numSpotsPerMonth =
    // number of spots available to non-high priority, non-reactivated entries per month
    newStudentsPerMonth * (1 - (overallHighPriorityRate + reactivatedRate));

  const recentNewOutcomeNotWaitingEntries = filter(newOutcomeNotWaitingEntries, (wle) => {
    return moment(wle.entryDate, MOMENT_FORMAT).isSameOrAfter(moment("01-01-2022"));
  });

  const avgNumPeoplePerEntry =
    sum(
      map(recentNewOutcomeNotWaitingEntries, (wle) => {
        return wle.numPeople || 1;
      }),
    ) / recentNewOutcomeNotWaitingEntries.length;

  return { avgNumPeoplePerEntry, eligibleNewStudentRate, newStudentRate, numHighPriority, numSpotsPerMonth };
};

export const getNumActiveEligibleInFront = (waitingList: WaitingListEntry[], wlEntry: WaitingListEntry) => {
  return filter(waitingList, (wle) => {
    return (
      wle.eligible &&
      wle.waiting &&
      wle.highPriority === HighPriority.NO &&
      moment(wle.entryDate, MOMENT_FORMAT) < moment(wlEntry.entryDate, MOMENT_FORMAT) &&
      (moment(wle.entryDate, MOMENT_FORMAT) !== moment(wlEntry.entryDate, MOMENT_FORMAT) ||
        (wle.timestamp ?? 0) < (wlEntry.timestamp ?? 1))
    );
  }).length;
};
