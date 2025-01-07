import {
  countBy,
  Dictionary,
  filter,
  flatMap,
  forEach,
  includes,
  join,
  last,
  map,
  omit,
  reduce,
  slice,
} from "lodash";
import { useCallback, useMemo } from "react";
import {
  AcademicRecord,
  CovidStatus,
  DroppedOutReason,
  FinalResult,
  GenderedLevel,
  genderedLevels,
  Level,
  Nationality,
  Status,
  StatusDetails,
  Student,
  StudentStatus,
  WaitlistOutcome,
} from "../interfaces";
import {
  getCurrentSession,
  getPlacementRegistrationCounts,
  getSessionsWithoutSummer,
  getStatusDetails,
  isActive,
} from "../services";
import { useStudentStore, useWaitingListStore } from "./useStores";

interface Statistics {
  activeGenderCounts: { [key in Student["gender"]]: number };
  activeInitialYearCounts: { [key in Student["initialSession"]]: number };
  activeLevelCounts: { [key in Level]: number };
  activeNationalityCounts: { [key in Nationality]: number };
  activeSessionsAttendedCounts: Dictionary<number>;
  activeStatusCounts: { [key in Status]: number };
  activeStatusDetailsCounts: { [key in StatusDetails]: number };
  averageAge: number;
  covidStatusCounts: { [key in CovidStatus]: number };
  droppedOutReasonCounts: { [key in DroppedOutReason]: number };
  fullVaccineNationalityCounts: { [key in Nationality]: number };
  genderCounts: { [key in Student["gender"]]: number };
  levelCounts: { [key in Level]: number };
  nationalityCounts: { [key in Nationality]: number };
  overallResultCounts: { [key in FinalResult]: number };
  overallResultCountsByLevel: {
    [key1 in GenderedLevel]: {
      [key2 in FinalResult]: number;
    };
  };
  placementLevelCounts: { [key in Level]: number };
  placementRegistrationCounts: {
    inviteCounts: { [key in StudentStatus["currentStatus"]]: number };
    registrationCounts: { [key in StudentStatus["currentStatus"]]: number };
    session: Student["initialSession"];
  }[];
  sessionCounts: { [key in Student["initialSession"]]: number };
  sessionsAttendedCounts: Dictionary<number>;
  statusCounts: { [key in Status]: number };
  totalActive: number;
  totalEligible: number;
  totalEnglishTeachers: number;
  totalEnrollment: number;
  totalIlliterateArabic: number;
  totalIlliterateEnglish: number;
  totalNCL: number;
  totalNewNextSession: number;
  totalPending: number;
  totalRegistered: number;
  totalTeachers: number;
  waitingListOutcomeCounts: { [key in WaitlistOutcome | "undefined"]: number };
}

const getLevelCounts = (genderedLevelCounts: { [key in GenderedLevel]: number }) => {
  return {
    L1: genderedLevelCounts["L1-M"] + genderedLevelCounts["L1-W"],
    L2: genderedLevelCounts["L2-M"] + genderedLevelCounts["L2-W"],
    L3: genderedLevelCounts.L3,
    L4: genderedLevelCounts.L4,
    L5: genderedLevelCounts.L5,
    "L5 GRAD": genderedLevelCounts["L5 GRAD"],
    PL1: genderedLevelCounts["PL1-M"] + genderedLevelCounts["PL1-W"],
  };
};

export const useStatistics = (): Statistics => {
  const students = useStudentStore((state) => {
    return state.students;
  });
  const waitingList = useWaitingListStore((state) => {
    return state.waitingList;
  });
  const currentSession = getCurrentSession(students);

  const activeStudents = useMemo(() => {
    return filter(students, (s: Student) => {
      return isActive(s) && includes(map(s.academicRecords, "session"), currentSession);
    });
  }, [currentSession, students]);

  const allAcademicRecords = useMemo(() => {
    return flatMap(students, "academicRecords");
  }, [students]);

  const filterFullVaccine = useCallback(() => {
    return filter(students, (s) => {
      return s.covidVaccine.status === CovidStatus.FULL;
    });
  }, [students]);

  const sessions = getSessionsWithoutSummer(students);

  const statistics: Statistics = {
    activeGenderCounts: countBy(activeStudents, "gender") as { [key in Student["gender"]]: number },
    activeInitialYearCounts: countBy(
      map(activeStudents, (student) => {
        return `20${join(slice(student.initialSession, -2), "")}`;
      }),
    ) as {
      [key in Student["initialSession"]]: number;
    },
    activeLevelCounts: getLevelCounts(
      countBy(activeStudents, "currentLevel") as { [key in GenderedLevel]: number },
    ),
    activeNationalityCounts: countBy(activeStudents, "nationality") as { [key in Nationality]: number },
    activeSessionsAttendedCounts: countBy(
      map(activeStudents, (student) => {
        return getStatusDetails({ sessions, student, students })[1];
      }),
    ),
    activeStatusCounts: countBy(activeStudents, "status.currentStatus") as { [key in Status]: number },
    activeStatusDetailsCounts: countBy(
      map(activeStudents, (student) => {
        return getStatusDetails({ sessions, student, students })[0];
      }),
    ) as { [key in StatusDetails]: number },
    averageAge: 0,
    covidStatusCounts: countBy(students, "covidVaccine.status") as { [key in CovidStatus]: number },
    droppedOutReasonCounts: omit(countBy(students, "status.droppedOutReason"), "undefined") as {
      [key in DroppedOutReason]: number;
    },
    fullVaccineNationalityCounts: countBy(filterFullVaccine(), "nationality") as {
      [key in Nationality]: number;
    },
    genderCounts: countBy(students, "gender") as { [key in Student["gender"]]: number },
    levelCounts: getLevelCounts(countBy(students, "currentLevel") as { [key in GenderedLevel]: number }),
    nationalityCounts: countBy(students, "nationality") as { [key in Nationality]: number },
    overallResultCounts: countBy(allAcademicRecords, "overallResult") as {
      [key in FinalResult]: number;
    },
    overallResultCountsByLevel: reduce(
      genderedLevels,
      (prevObject, genderedLevel) => {
        prevObject[genderedLevel] = countBy(
          filter(allAcademicRecords, (ar) => {
            return ar?.level === genderedLevel;
          }),
          "overallResult",
        ) as { [key in FinalResult]: number };
        return prevObject;
      },
      {
        "L1-M": { F: 0, P: 0, WD: 0 },
        "L1-W": { F: 0, P: 0, WD: 0 },
        "L2-M": { F: 0, P: 0, WD: 0 },
        "L2-W": { F: 0, P: 0, WD: 0 },
        L3: { F: 0, P: 0, WD: 0 },
        L4: { F: 0, P: 0, WD: 0 },
        L5: { F: 0, P: 0, WD: 0 },
        "L5 GRAD": { F: 0, P: 0, WD: 0 },
        "PL1-M": { F: 0, P: 0, WD: 0 },
        "PL1-W": { F: 0, P: 0, WD: 0 },
      },
    ),
    placementLevelCounts: countBy(students, "origPlacementData.level") as { [key in Level]: number },
    placementRegistrationCounts: getPlacementRegistrationCounts(students),
    sessionCounts: omit(countBy(students, "initialSession"), "") as {
      [key in Student["initialSession"]]: number;
    },
    sessionsAttendedCounts: countBy(
      map(students, (student) => {
        return getStatusDetails({ sessions, student, students })[1];
      }),
    ),
    statusCounts: countBy(students, "status.currentStatus") as { [key in Status]: number },
    totalActive: activeStudents.length,
    totalEligible: 0,
    totalEnglishTeachers: 0,
    totalEnrollment: 0,
    totalIlliterateArabic: 0,
    totalIlliterateEnglish: 0,
    totalNCL: 0,
    totalNewNextSession: 0,
    totalPending: 0,
    totalRegistered: 0,
    totalTeachers: 0,
    waitingListOutcomeCounts: countBy(waitingList, "outcome") as {
      [key in WaitlistOutcome | "undefined"]: number;
    },
  };

  let numStudentsWithAge = 0;
  forEach(students, (student) => {
    if (student.age) {
      const ageNum = Number(student.age);
      if (!Number.isNaN(ageNum)) {
        statistics.averageAge += ageNum;
        numStudentsWithAge += 1;
      }
    }
    if (student.status.inviteTag) statistics.totalEligible += 1;
    if (student.work.isEnglishTeacher) statistics.totalEnglishTeachers += 1;
    if (student.literacy.illiterateAr) statistics.totalIlliterateArabic += 1;
    if (student.literacy.illiterateEng) statistics.totalIlliterateEnglish += 1;
    if (student.status.noContactList) statistics.totalNCL += 1;
    if (last(student.placement)?.pending) statistics.totalPending += 1;
    if (student.work.isTeacher) statistics.totalTeachers += 1;
    if (student.status.currentStatus === Status.NEW && student.academicRecords.length === 0)
      statistics.totalNewNextSession += 1;
    const activeAcademicRecords = filter(student.academicRecords, (ar: AcademicRecord) => {
      return ar.session === currentSession && ar.overallResult === undefined;
    });
    statistics.totalEnrollment += activeAcademicRecords.length;
  });
  statistics.averageAge /= numStudentsWithAge;

  statistics.totalRegistered = students.length;
  return statistics;
};
