import { forEach, includes, map, replace, split, toLower, trim, zip } from "lodash";
import {
  DroppedOutReason,
  GenderedLevel,
  Level,
  Nationality,
  Status,
  Student,
} from "../interfaces";
import { ValidFields } from "./spreadsheetService";

const separatorRegex = /[;,]/g;
const dateRegex = /\d{1,2}([/.-])\d{1,2}\1\d{2}/g;

const splitAndTrim = (value: string, separator?: string | RegExp): string[] => {
  const sep = separator || separatorRegex;
  const splitValues = split(value, sep);
  const trimmedSplitValues = map(splitValues, (v) => {
    return trim(v);
  });
  return trimmedSplitValues;
};

// https://stackoverflow.com/questions/14743536/multiple-key-names-same-pair-value
export const expand = (obj: ValidFields) => {
  const keys = Object.keys(obj);
  forEach(keys, (key) => {
    const subkeys = key.split(/,\s?/);
    const target = obj[key];
    delete obj[key];
    subkeys.forEach((subkey) => {
      obj[subkey] = target;
    });
  });
  return obj;
};

export const parseEnglishName = (key: string, value: string, student: Student) => {
  student.name.english = value;
};

export const parseArabicName = (key: string, value: string, student: Student) => {
  student.name.arabic = value;
};

export const parseID = (key: string, value: string, student: Student) => {
  student.epId = Number(value);
};

export const parseWaPrimPhone = (key: string, value: string, student: Student) => {
  student.phone.primaryPhone = Number(value);
};

export const parseNationality = (key: string, value: string, student: Student) => {
  if (Number(value) === 1) {
    student.nationality = Nationality[key as keyof typeof Nationality];
  }
};

export const parseInviteTag = (key: string, value: string, student: Student) => {
  student.status.inviteTag = !!value;
};

export const parseNCL = (key: string, value: string, student: Student) => {
  student.status.noCallList = !!value;
};

export const parseCurrentLevel = (key: string, value: string, student: Student) => {
  student.currentLevel = value as GenderedLevel;
};

export const parseAudit = (key: string, value: string, student: Student) => {
  if (Number(value) === 1) {
    student.status.audit = true;
  }
};

export const parseFgrDate = (key: string, value: string, student: Student) => {
  student.status.finalGradeSentDate = value;
};

export const parseLevelRevealDate = (key: string, value: string, student: Student) => {
  student.status.levelRevealDate = value;
};

export const parseSectionsOffered = (key: string, value: string, student: Student) => {
  student.status.sectionsOffered = splitAndTrim(value);
};

export const parseReactivatedDate = (key: string, value: string, student: Student) => {
  student.status.reactivatedDate = splitAndTrim(value);
};

export const parseWithdrawDate = (key: string, value: string, student: Student) => {
  student.status.withdrawDate = splitAndTrim(value);
};

export const parseCurrentStatus = (key: string, value: string, student: Student) => {
  student.status.currentStatus = Status[key as keyof typeof Status];
};

export const parsePhotoContact = (key: string, value: string, student: Student) => {
  student.placement.photoContact = splitAndTrim(value);
};

export const parsePlacement = (key: string, value: string, student: Student) => {
  student.placement.placement = splitAndTrim(value);
};

export const parseNotified = (key: string, value: string, student: Student) => {
  student.placement.notified = !!value;
};

export const parsePlacementConfDate = (key: string, value: string, student: Student) => {
  student.placement.confDate = splitAndTrim(value);
};

export const parsePendingPlacement = (key: string, value: string, student: Student) => {
  if (Number(value) === 1) {
    student.placement.pending = true;
  }
};

export const parseNoAnswerClassSchedule = (key: string, value: string, student: Student) => {
  student.placement.noAnswerClassScheduleDate = value;
};

export const parseCorrespondence = (key: string, value: string, student: Student) => {
  const splitCorrespondence = splitAndTrim(replace(value, ":", ""), dateRegex);
  const dates = value.match(dateRegex);
  forEach(zip(dates, splitCorrespondence), ([date, notes]) => {
    if (date !== undefined && notes !== undefined) {
      student.correspondence.push({
        date,
        notes,
      });
    }
  });
};

export const parseClassListSent = (key: string, value: string, student: Student) => {
  student.classList.classListSent =
    value !== "N/A" && value !== "NA" && value !== "No WA" && value !== "";
  student.classList.classListSentNotes = value;
};

export const parseClassListSentDate = (key: string, value: string, student: Student) => {
  student.classList.classListSentDate = value;
};

export const parseGender = (key: string, value: string, student: Student) => {
  Number(value) === 1 ? (student.gender = "M") : (student.gender = "F");
};

export const parseAge = (key: string, value: string, student: Student) => {
  student.age = Number(value);
};

export const parseOccupation = (key: string, value: string, student: Student) => {
  student.work.occupation = value;
};

export const parseLookingForJob = (key: string, value: string, student: Student) => {
  student.work.lookingForJob = value;
};

export const parseTeacher = (key: string, value: string, student: Student) => {
  if (Number(value) === 1) {
    student.work.isTeacher = true;
  }
};

export const parseTeachingSubjectAreas = (key: string, value: string, student: Student) => {
  student.work.teachingSubjectAreas = value;
};

export const parseEnglishTeacher = (key: string, value: string, student: Student) => {
  if (Number(value) === 1) {
    student.work.isEnglishTeacher = true;
  }
};

export const parseEnglishTeacherLocation = (key: string, value: string, student: Student) => {
  student.work.englishTeacherLocation = value;
};

export const parsePhone = (key: string, value: string, student: Student) => {
  const phoneRegex = /\d{9,10}/;
  const insideParenRegex = /\((.+)\)/;
  const phoneNumber = value.match(phoneRegex);
  const phoneNumberNotes = value.match(insideParenRegex);
  forEach(zip(phoneNumber, phoneNumberNotes), ([phone, notes]) => {
    if (phone) {
      student.phone.phoneNumbers.push({
        notes,
        number: Number(phone),
      });
    }
  });
};

export const parseWAStatus = (key: string, value: string, student: Student) => {
  const lowerValue = toLower(value);
  student.phone.hasWhatsapp =
    includes(lowerValue, "has whatsapp") || includes(lowerValue, "has WA");
  student.phone.whatsappNotes = value;
};

export const parseWABroadcastSAR = (key: string, value: string, student: Student) => {
  student.phone.waBroadcastSAR = value;
};

export const parseWABroadcasts = (key: string, value: string, student: Student) => {
  if (Number(value) === 1) {
    student.phone.otherWaBroadcastGroups
      ? student.phone.otherWaBroadcastGroups.push(key)
      : (student.phone.otherWaBroadcastGroups = [key]);
  }
};

export const parseInitialSession = (key: string, value: string, student: Student) => {
  if (Number(value) === 1) {
    student.initialSession = key;
  }
};

export const parseArabicLiteracy = (key: string, value: string, student: Student) => {
  if (Number(value) === 1) {
    student.literacy.illiterateAr = true;
  }
};

export const parseEnglishLiteracy = (key: string, value: string, student: Student) => {
  if (Number(value) === 1) {
    student.literacy.illiterateEng = true;
  }
};

export const parseLiteracyTutor = (key: string, value: string, student: Student) => {
  student.literacy.tutorAndDate = value;
};

export const parseZoomTutor = (key: string, value: string, student: Student) => {
  student.zoom = value;
};

export const parseCertRequests = (key: string, value: string, student: Student) => {
  student.certificateRequests = value;
};

export const parseOrigPlacementWriting = (key: string, value: string, student: Student) => {
  student.placement.origPlacementData.writing = value as Level;
};

export const parseOrigPlacementSpeaking = (key: string, value: string, student: Student) => {
  student.placement.origPlacementData.speaking = value as Level;
};

export const parseOrigPlacementLevel = (key: string, value: string, student: Student) => {
  student.placement.origPlacementData.level = value as Level;
};

export const parseOrigPlacementAdjustment = (key: string, value: string, student: Student) => {
  student.placement.origPlacementData.adjustment = value;
};

export const parseDropoutReason = (key: string, value: string, student: Student) => {
  student.droppedOutReason = DroppedOutReason[key as keyof typeof DroppedOutReason];
  // switch (key) {
  //   case "Lack of Child-Care":
  //     student.droppedOutReason = DroppedOutReason.LCC;
  //     break;
  //   case "Lack of Transport":
  //     student.droppedOutReason = DroppedOutReason.LT;
  //     break;
  //   case "Time Conflict":
  //     student.droppedOutReason = DroppedOutReason.TC;
  //     break;
  //   case "Illness or Pregnancy":
  //     student.droppedOutReason = DroppedOutReason.IP;
  //     break;
  //   case "Vision Problems":
  //     student.droppedOutReason = DroppedOutReason.VP;
  //     break;
  //   case "Got a Job":
  //     student.droppedOutReason = DroppedOutReason.JOB;
  //     break;
  //   case "Moved":
  //     student.droppedOutReason = DroppedOutReason.MOVE;
  //     break;
  //   case "Graduated from L5":
  //     student.droppedOutReason = DroppedOutReason.GRAD;
  //     break;
  //   case "Failed to Thrive in Clsrm Env":
  //     student.droppedOutReason = DroppedOutReason.FTCLE;
  //     break;
  //   case "Lack of Life Mgm Skills":
  //     student.droppedOutReason = DroppedOutReason.LLMS;
  //     break;
  //   case "Lack of Familial Support":
  //     student.droppedOutReason = DroppedOutReason.LFS;
  //     break;
  //   case "Lack of Commitment or Motivation":
  //     student.droppedOutReason = DroppedOutReason.LCM;
  //     break;
  //   case "Family Member or Employer Forbid Further Study":
  //     student.droppedOutReason = DroppedOutReason.FMEF;
  //     break;
  //   case "COVID-19 Pandemic Related":
  //     student.droppedOutReason = DroppedOutReason.COVID;
  //     break;
  //   case "Unknown":
  //     student.droppedOutReason = DroppedOutReason.UNK;
  //     break;
  //   default:
  //     break;
  // }
};
