/* eslint-disable typescript-sort-keys/string-enum */
export interface Student {
  academicRecords: AcademicRecord[];
  age: number | "Unknown";
  certificateRequests?: string;
  classList: ClassList;
  correspondence: Correspondence[];
  currentLevel: GenderedLevel;
  epId: number;
  gender: "M" | "F";
  imageName?: string;
  initialSession: string;
  literacy: Literacy;
  name: StudentName;
  nationality: Nationality;
  phone: WhatsappInfo;
  placement: Placement;
  status: StudentStatus;
  work: StudentWork;
  zoom?: string;
}

export interface AcademicRecord {
  attendance?: number;
  comments?: string;
  electiveClass?: string;
  exitSpeakingExam?: Grade;
  exitWritingExam?: Grade;
  finalResult?: Grade;
  level?: GenderedLevel;
  levelAudited?: GenderedLevel;
  session: string;
}

export interface Grade {
  notes?: string;
  percentage?: number;
  result: FinalResult;
}

export interface Placement {
  confDate?: string;
  noAnswerClassScheduleDate?: string;
  origPlacementData: {
    adjustment?: string;
    level: Level;
    speaking: LevelPlus;
    writing: LevelPlus;
  };
  pending?: boolean;
  photoContact?: string;
  placement?: string;
  sectionsOffered?: string;
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
  hasWhatsapp: boolean;
  otherWaBroadcastGroups?: string[];
  phoneNumbers: PhoneNumber[];
  // index of phoneNumbers
  primaryPhone: number | boolean[];
  waBroadcastSAR?: string;
  whatsappNotes?: string;
}

export interface StudentStatus {
  audit?: boolean;
  currentStatus: Status;
  droppedOutReason?: DroppedOutReason;
  finalGradeSentDate?: string;
  inviteTag: boolean;
  levelReevalDate?: string;
  noContactList: boolean;
  reactivatedDate?: string;
  withdrawDate?: string;
}

export interface ClassList {
  classListSent?: boolean;
  classListSentDate?: string;
  classListSentNotes?: string;
}

export interface StudentName {
  arabic: string;
  english: string;
}
export interface PhoneNumber {
  notes?: string;
  number: number;
}

export interface Correspondence {
  date: string;
  notes: string;
}

export type Level = "PL1" | "L1" | "L2" | "L3" | "L4" | "L5" | "L5 GRAD";

export type GenderedLevel = Level | ("PL1-M" | "PL1-W" | "L1-M" | "L1-W" | "L2-M" | "L2-W");

export type LevelPlus =
  | Level
  | ("PL1+" | "L1-" | "L1+" | "L2-" | "L2+" | "L3-" | "L3+" | "L4-" | "L4+" | "L5-");

export enum Nationality {
  JDN = "JDN",
  SYR = "SYR",
  IRQ = "IRQ",
  EGY = "EGY",
  INDNES = "INDNES",
  YEM = "YEM",
  CEAFRRE = "CEAFRRE",
  CHI = "CHI",
  KOR = "KOR",
  UNKNWN = "UNKNWN",
}

export enum Status {
  NEW = "NEW",
  RET = "RET",
  WD = "WD",
  NCL = "NCL",
}

export enum FinalResult {
  P = "P",
  F = "F",
  WD = "WD",
}

export enum DroppedOutTiming {
  DO1 = "Dropped out after 1 ses",
  DO2 = "Dropped out after 2 ses",
  DO3 = "Dropped out after 3 or more ses",
  SE = "Attended Previous Session(s) & Still Enrolled",
  SES1 = "Still in 1st Session",
  SKIP = "Attended a Session, Skipped a Session, & Returned",
  WD1 = "WD 1st ses or never returned after PE",
}

export enum DroppedOutReason {
  COVID = "COVID-19 Pandemic Related",
  FMEF = "Family Member or Employer Forbid Further Study",
  FTCLE = "Failed to Thrive in Clsrm Env",
  GRAD = "Graduated from L5",
  IP = "Illness or Pregnancy",
  JOB = "Got a Job",
  LCC = "Lack of Child-Care",
  LCM = "Lack of Commitment or Motivation",
  LFS = "Lack of Familial Support",
  LLMS = "Lack of Life Mgm Skills",
  LT = "Lack of Transport",
  MOVE = "Moved",
  TC = "Time Conflict",
  UNK = "Unknown",
  VP = "Vision Problems",
}

export const nationalities = [
  Nationality.JDN,
  Nationality.SYR,
  Nationality.EGY,
  Nationality.YEM,
  Nationality.IRQ,
  Nationality.KOR,
  Nationality.CHI,
  Nationality.INDNES,
  Nationality.CEAFRRE,
  Nationality.UNKNWN,
];

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
  "L1-",
  "L1",
  "L1+",
  "L2-",
  "L2",
  "L2+",
  "L3-",
  "L3",
  "L3+",
  "L4-",
  "L4",
  "L4+",
  "L5-",
  "L5",
  "Exempt",
];

export const statuses = [Status.NEW, Status.RET, Status.WD, Status.NCL];

export const results = [FinalResult.P, FinalResult.F, FinalResult.WD];
export const PF = [FinalResult.P, FinalResult.F];

export const withdrawReasons = [
  DroppedOutReason.COVID,
  DroppedOutReason.FMEF,
  DroppedOutReason.FTCLE,
  DroppedOutReason.GRAD,
  DroppedOutReason.IP,
  DroppedOutReason.JOB,
  DroppedOutReason.LCC,
  DroppedOutReason.LCM,
  DroppedOutReason.LFS,
  DroppedOutReason.LLMS,
  DroppedOutReason.LT,
  DroppedOutReason.MOVE,
  DroppedOutReason.TC,
  DroppedOutReason.VP,
  DroppedOutReason.UNK,
];

export const emptyStudent: Student = {
  academicRecords: [],
  age: "Unknown",
  classList: {},
  correspondence: [],
  currentLevel: "PL1",
  epId: 0,
  gender: "M",
  initialSession: "",
  literacy: {},
  name: {
    arabic: "N/A",
    english: "",
  },
  nationality: Nationality.UNKNWN,
  phone: {
    hasWhatsapp: true,
    phoneNumbers: [],
    primaryPhone: -1,
  },
  placement: {
    origPlacementData: {
      level: "PL1",
      speaking: "PL1",
      writing: "PL1",
    },
  },
  status: {
    currentStatus: Status.NEW,
    inviteTag: false,
    noContactList: false,
  },
  work: { occupation: "Unknown" },
};
