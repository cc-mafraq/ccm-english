import {
  concat,
  countBy,
  filter,
  find,
  first,
  flatten,
  forEach,
  includes,
  isEmpty,
  isUndefined,
  keyBy,
  last,
  lowerCase,
  map,
  mapValues,
  nth,
  omit,
  orderBy,
  replace,
  reverse,
  set,
  some,
  sortBy,
  split,
  sum,
  uniq,
  uniqBy,
} from "lodash";
import {
  AcademicRecord,
  FinalResult,
  GenderedLevel,
  Level,
  SectionPlacement,
  Status,
  StatusDetails,
  Student,
  levels,
} from "../interfaces";
import { getLevelAtSession } from "./fgrService";

export const JOIN_STR = ", ";

export type StudentProgress = {
  [key in Level]?: SessionResult[];
};

export interface SessionResult {
  isAudit?: boolean;
  level?: string;
  result?: FinalResult;
  session?: string;
}

export interface FilterField<T> {
  condition?: boolean;
  fn?: (data: T) => unknown;
  ignoreValueMappings?: boolean;
  name: string;
  path: string;
  values?: unknown[];
}

export const getRepeatNum = (student: Student): string | undefined => {
  const levelsTaken = map(
    filter(student.academicRecords, (ar) => {
      return ar?.overallResult !== FinalResult.WD;
    }),
    "level",
  );
  const levelCounts = countBy(levelsTaken);
  const lastResult = last(student.academicRecords)?.overallResult;
  const repeatNum = levelCounts[student.currentLevel] - 1; // - 1 to not include initial session (not repeated)
  return lastResult === FinalResult.P || !repeatNum ? undefined : `${repeatNum}x`;
};

export const isActive = (student: Student): boolean => {
  return student.status.currentStatus === Status.NEW || student.status.currentStatus === Status.RET;
};

export const getProgress = (student: Student, sessionOptions: string[]): StudentProgress => {
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  const progress: StudentProgress = { PL1: [], L1: [], L2: [], L3: [], L4: [], L5: [], "L5 GRAD": [] };
  forEach(student.academicRecords, (ar) => {
    let level: GenderedLevel;
    if (!ar.level && !ar.levelAudited) return;
    switch (ar.level) {
      case "PL1-M":
      case "PL1-W":
        level = "PL1";
        break;
      case "L1-M":
      case "L1-W":
        level = "L1";
        break;
      case "L2-M":
      case "L2-W":
        level = "L2";
        break;
      default:
        level = (ar.levelAudited as Level) || ar.level;
    }
    if (!level) return;
    const isCoreClass =
      find(levels, (l) => {
        return level.includes(l);
      }) !== undefined;
    const electiveOrAuditLevel = first(
      filter(levels, (l) => {
        return (
          (level.includes(l) && !level.includes(`${l}-`)) || (ar.level?.includes(l) && !ar.level.includes(`${l}-`))
        );
      }) as Level[],
    );
    progress[
      isCoreClass || electiveOrAuditLevel
        ? electiveOrAuditLevel || level
        : getLevelAtSession(ar.session, student, sessionOptions, true)
    ]?.push({
      isAudit: !isUndefined(ar.levelAudited) && isUndefined(ar.level),
      level: isCoreClass ? undefined : level,
      result:
        isCoreClass ||
        (!isCoreClass && (ar.overallResult === "F" || ar.overallResult === "WD" || !ar.finalGrade?.percentage))
          ? ar.overallResult
          : FinalResult.P,
      session: ar.session,
    });
  });
  progress.L5 = concat(progress.L5 || [], progress["L5 GRAD"] || []);
  return omit(progress, "L5 GRAD");
};

export const filterBySession = (students: Student[], session: Student["initialSession"]): Student[] => {
  return filter(students, (s) => {
    return includes(map(s.academicRecords, "session"), session);
  });
};

export const filterOutById = (students: Student[], id: Student["epId"]): Student[] => {
  return filter(students, (s) => {
    return s.epId !== id;
  });
};

export const sortBySession = (session: Student["initialSession"]) => {
  const sessionParts = session?.split(" ");
  return `${nth(sessionParts, 2)} ${replace(
    replace(replace(lowerCase(nth(sessionParts, 0)), "fa", "3"), "su", "2"),
    "sp",
    "1",
  )} ${nth(sessionParts, 1)}`;
};

const filterSession = (s: Student["initialSession"]) => {
  return !isEmpty(s) && !!s.match(/^(Fa|Sp|Su) (I|II) \d{2}$/);
};

export const getAllInitialSessions = (students: Student[]): string[] => {
  return filter(reverse(sortBy(uniq(map(students, "initialSession")), sortBySession)), filterSession);
};

export const getAllSessionsWithRecord = (students: Student[]): string[] => {
  return filter(
    reverse(sortBy(uniq(map(flatten(map(students, "academicRecords")), "session")), sortBySession)),
    filterSession,
  );
};

export const getAllSessionsWithPlacement = (students: Student[]): string[] => {
  return filter(
    reverse(sortBy(uniq(map(flatten(map(students, "placement")), "session")), sortBySession)),
    filterSession,
  );
};

export const getCurrentSession = (students: Student[]) => {
  return first(getAllSessionsWithPlacement(students));
};

export const getClassOptions = (students: Student[], session?: Student["initialSession"]) => {
  if (session === undefined) return [];
  return sortBy(
    uniqBy(
      flatten(
        map(
          filter(flatten(map(students, "placement")), (placement) => {
            return placement && placement.session === session;
          }),
          "placement",
        ),
      ),
      (sectionPlacement) => {
        return (
          (sectionPlacement.section === "MW"
            ? sectionPlacement.level.substring(0, sectionPlacement.level.length - 2)
            : sectionPlacement.level) + sectionPlacement.section
        );
      },
    ),
    "level",
  );
};

export const getClassName = (placement?: SectionPlacement) => {
  return placement?.section
    ? placement?.section === "CSWL"
      ? `${placement.section} ${placement.level}`
      : `${replace(placement.level, placement.section === "MW" ? /-(.)/ : "-", "")}-${placement.section}`
    : placement?.level;
};

export const getClassFromClassName = (className: string): SectionPlacement | undefined => {
  if (isEmpty(className) || className === "All") return undefined;
  const splitClassName = split(className, includes(className, "CSWL") ? " " : "-");
  const level = nth(splitClassName, 0) || className;
  const section = nth(splitClassName, 1);
  const genderedSections = ["M", "W"];
  return level === "CSWL"
    ? { level: section || className, section: level }
    : includes(genderedSections, section) || section === undefined
    ? { level: className }
    : includes(level, "M") || includes(level, "W")
    ? { level: `${level.substring(0, level.length - 1)}-${level.charAt(level.length - 1)}`, section }
    : { level, section };
};

export const getSectionPlacement = (
  student: Student,
  selectedSession?: Student["initialSession"],
  selectedClass?: SectionPlacement,
) => {
  if (selectedClass === undefined || selectedSession === undefined) return undefined;
  return find(
    find(student.placement, (placement) => {
      return placement.session === selectedSession;
    })?.placement,
    (sectionPlacement) => {
      return (
        sectionPlacement.level ===
          (selectedClass.section === "MW"
            ? `${selectedClass.level}-${student.gender === "F" ? "W" : "M"}`
            : selectedClass.level) && sectionPlacement.section === selectedClass.section
      );
    },
  );
};

export const getAcademicRecordByPlacement = (
  student?: Student,
  selectedSession?: Student["initialSession"],
  selectedClass?: SectionPlacement,
) => {
  return (
    find(student?.academicRecords, (academicRecord: AcademicRecord) => {
      return (
        academicRecord.session === selectedSession &&
        (includes(academicRecord.level, selectedClass?.level) ||
          includes(academicRecord.levelAudited, selectedClass?.level))
      );
    }) ?? null
  );
};

export const generateId = (students: Student[]): number => {
  const randomId = Math.floor(Math.random() * 90000 + 10000);
  const studentIds = map(students, "epId");
  if (includes(studentIds, randomId)) {
    return generateId(students);
  }
  return randomId;
};

export const sortStudents = (students: Student[]) => {
  return orderBy(students, ["status.inviteTag", "name.english"], ["desc", "asc"]);
};

export const getStudentOptions = (students: Student[]): string[] => {
  return map(students, (student) => {
    return `${student.epId} - ${student.name.english}`;
  });
};

export const getStudentById = (id: Student["epId"], students: Student[]): Student | null => {
  return find(students, { epId: id }) || null;
};

export const getSessionsWithResults = (students: Student[]) => {
  const allSessions = getAllSessionsWithRecord(students);
  return filter(allSessions, (session) => {
    return some(
      map(
        filter(flatten(map(students, "academicRecords")), (ar) => {
          return ar?.session === session;
        }),
        "overallResult",
      ),
    );
  });
};

export const getStatusDetails = ({
  student,
  students,
  sessions,
}: {
  sessions?: Student["initialSession"][];
  student: Student;
  students?: Student[];
}): [StatusDetails, number] => {
  const sessionsWithResults = sessions || (students && getSessionsWithResults(students));
  const sessionsAttended = mapValues(keyBy(sessionsWithResults), () => {
    return false;
  });
  forEach(student.academicRecords, (ar) => {
    if (ar?.overallResult !== FinalResult.WD && includes(sessionsWithResults, ar.session)) {
      set(sessionsAttended, ar.session, true);
    }
  });
  const progress = Object.values(sessionsAttended);
  const numSessionsAttended = sum(progress);
  if (
    (numSessionsAttended === 1 && progress[0]) ||
    // Return 1st Session if the student's ar has a session in the future (not inclded in sessionWithResults) and they have no sessions in the past
    (student.academicRecords?.length === 0 &&
      numSessionsAttended === 0 &&
      student.initialSession === first(getAllInitialSessions(students ?? [])))
  )
    return [StatusDetails.SES1, numSessionsAttended];
  if (numSessionsAttended === 1 && !progress[0]) return [StatusDetails.DO1, numSessionsAttended];
  if (numSessionsAttended === 2 && !progress[0]) return [StatusDetails.DO2, numSessionsAttended];
  if (numSessionsAttended > 2 && !progress[0]) return [StatusDetails.DO3, numSessionsAttended];
  if (numSessionsAttended > 1 && progress[0] && progress[1]) return [StatusDetails.SE, numSessionsAttended];
  if (numSessionsAttended === 0) return [StatusDetails.WD1, numSessionsAttended];
  return [StatusDetails.SKIP, numSessionsAttended];
};

export const getStudentIDByPhoneNumber = (students: Student[], phoneNumber: number) => {
  const matchedStudent = find(students, (student: Student) => {
    return includes(map(student.phone.phoneNumbers, "number"), phoneNumber);
  });
  return matchedStudent?.epId;
};
