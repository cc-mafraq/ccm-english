import { values } from "lodash";

/* eslint-disable typescript-sort-keys/string-enum */
export interface Student {
  academicRecords: AcademicRecord[];
  age: number | "Unknown";
  certificateRequests?: string;
  correspondence: Correspondence[];
  covidVaccine: Covid;
  currentLevel: GenderedLevel;
  epId: number;
  familyCoordinatorEntry?: string;
  gender: "M" | "F";
  imageName?: string;
  initialSession: string;
  literacy: Literacy;
  name: StudentName;
  nationality: Nationality;
  origPlacementData: {
    adjustment?: string;
    examFile?: string;
    level: Level;
    speaking: LevelPlus;
    writing: LevelPlus;
  };
  phone: WhatsappInfo;
  photoContact?: string;
  placement: Placement[];
  status: StudentStatus;
  work: StudentWork;
  zoom?: string;
}

export interface AcademicRecord {
  attendance?: number;
  comments?: string;
  exitSpeakingExam?: Grade;
  exitWritingExam?: Grade;
  finalGrade?: Grade;
  finalGradeReportNotes?: string;
  finalGradeSentDate?: string;
  level?: string;
  levelAudited?: string;
  overallResult?: FinalResult;
  session: string;
}

export interface Covid {
  date?: string;
  imageName?: string;
  reason?: string;
  status: CovidStatus;
  suspectedFraud?: boolean;
  suspectedFraudReason?: string;
}

export interface Grade {
  notes?: string;
  percentage?: number;
  result?: FinalResult;
}

export interface SectionPlacement {
  classListNotes?: Correspondence[];
  date?: string;
  level: string;
  notes?: string;
  section?: string;
  timestamp?: string;
}

export interface Placement {
  classScheduleSentDate: string[];
  noAnswerClassScheduleWpm?: boolean;
  pending?: boolean;
  placement: SectionPlacement[];
  sectionsOffered?: string;
  session: string;
}

export interface StudentWork {
  englishTeacherLocation?: string;
  isEnglishTeacher?: boolean;
  isTeacher?: boolean;
  lookingForJob?: string;
  occupation: string;
  teachingSubjectAreas?: string;
}

export interface Literacy {
  illiterateAr?: boolean;
  illiterateEng?: boolean;
  tutorAndDate?: string;
}

export interface WhatsappInfo {
  otherWaBroadcastGroups?: string[];
  phoneNumbers: PhoneNumber[];
  // index of phoneNumbers
  primaryPhone: number | boolean[];
  waBroadcastSAR?: string;
}

export interface StudentStatus {
  cheatingSessions?: string[];
  currentStatus: Status;
  droppedOutReason?: DroppedOutReason;
  idCardInBox?: boolean;
  inviteTag: boolean;
  levelReevalDate?: string;
  noContactList: boolean;
  reactivatedDate: string[];
  withdrawDate: string[];
}

export interface StudentName {
  arabic: string;
  english: string;
}
export interface PhoneNumber {
  notes?: string;
  number: number | null;
}

export interface Correspondence {
  date: string | null;
  notes: string;
}

export interface Withdraw {
  droppedOutReason?: DroppedOutReason;
  inviteTag: boolean;
  noContactList: boolean;
  withdrawDate: string;
}

export type Level = "PL1" | "L1" | "L2" | "L3" | "L4" | "L5" | "L5 GRAD";

export type GenderedLevel = "PL1-M" | "PL1-W" | "L1-M" | "L1-W" | "L2-M" | "L2-W" | "L3" | "L4" | "L5" | "L5 GRAD";

export type LevelPlus = Level | ("PL1+" | "L1-" | "L1+" | "L2-" | "L2+" | "L3-" | "L3+" | "L4-" | "L4+" | "L5-");

export enum CovidStatus {
  NORPT = "Not Reported",
  FULL = "Fully Vaccinated",
  PART = "Partially Vaccinated",
  UNV = "Unvaccinated",
  BOOST = "Boosted (Three Doses)",
  EXEMPT = "Exempt from Vaccine",
  DECL = "Declined to Provide Vaccine Info",
  UNCL = "Answered but Answer Unclear",
}

export enum Nationality {
  JDN = "Jordanian",
  SYR = "Syrian",
  ARG = "Argentinian",
  CEAFRRE = "Central African",
  CHI = "Chinese",
  EGY = "Egyptian",
  INDNES = "Indonesian",
  IRQ = "Iraqi",
  ITL = "Italian",
  KOR = "Korean",
  YEM = "Yemeni",
  UNKNWN = "Unknown",
}

export enum Status {
  NEW = "NEW",
  RET = "RET",
  WD = "WD",
}

export enum FinalResult {
  P = "P",
  F = "F",
  WD = "WD",
}

export enum StatusDetails {
  NORET = "Never returned after placement exam",
  WD1 = "Dropped out during 1st session",
  DO1 = "Dropped out after 1 session",
  DO2 = "Dropped out after 2 sessions",
  DO3 = "Dropped out after 3 or more sessions",
  SE = "Attended previous session & still enrolled",
  NEW = "Recently took placement exam, waiting to join next session",
  SES1 = "Still in 1st session",
  NEWWD = "Still in 1st session, but not the initial session of their placement exam",
  RETWD = "Returned after dropping out, but hasn't completed a session",
  SKIP = "Attended a session, skipped 1 or more sessions, & returned",
  ERR = "Error computing status details",
}

export enum DroppedOutReason {
  COVID = "COVID-19 Pandemic Related",
  FMEF = "Family Member or Employer Forbid Further Study",
  FTCLE = "Failed to Thrive in Classroom Environment",
  GRAD = "Graduated from L5",
  IP = "Illness or Pregnancy",
  JOB = "Got a Job",
  LCC = "Lack of Child-Care",
  LCM = "Lack of Commitment or Motivation",
  LFS = "Lack of Familial Support",
  LLMS = "Lack of Life Management Skills",
  LT = "Lack of Transport",
  MOVE = "Moved",
  TAW = "Tawjihi",
  TC = "Time Conflict",
  UNK = "Unknown",
  VP = "Vision Problems",
}

export const nationalities = values(Nationality);

export const genderedLevels: GenderedLevel[] = [
  "PL1-M",
  "PL1-W",
  "L1-M",
  "L1-W",
  "L2-M",
  "L2-W",
  "L3",
  "L4",
  "L5",
];

export const levels: Level[] = ["PL1", "L1", "L2", "L3", "L4", "L5"];

export const levelsPlus: (LevelPlus | "Exempt")[] = [
  "PL1",
  "PL1+",
  "L1",
  "L1-",
  "L1+",
  "L2",
  "L2-",
  "L2+",
  "L3",
  "L3-",
  "L3+",
  "L4",
  "L4-",
  "L4+",
  "L5",
  "L5-",
  "Exempt",
];

export const statuses = values(Status);
export const statusDetails = values(StatusDetails);
export const covidStatuses = values(CovidStatus);

export const results = values(FinalResult);
export const PF = [FinalResult.P, FinalResult.F];

export const withdrawReasons = values(DroppedOutReason);

export const emptyStudent: Student = {
  academicRecords: [],
  age: "Unknown",
  correspondence: [],
  covidVaccine: {
    status: CovidStatus.NORPT,
  },
  currentLevel: "PL1-M",
  epId: 0,
  gender: "M",
  initialSession: "",
  literacy: {},
  name: {
    arabic: "N/A",
    english: "",
  },
  nationality: Nationality.UNKNWN,
  origPlacementData: {
    level: "PL1",
    speaking: "PL1",
    writing: "PL1",
  },
  phone: {
    phoneNumbers: [],
    primaryPhone: -1,
  },
  placement: [],
  status: {
    currentStatus: Status.NEW,
    inviteTag: false,
    noContactList: false,
    reactivatedDate: [],
    withdrawDate: [],
  },
  work: { occupation: "Unknown" },
};

export const emptyAcademicRecord: AcademicRecord = {
  session: "",
};

export const emptyPlacement: Placement = {
  classScheduleSentDate: [],
  placement: [],
  session: "",
};
