import { find, first, includes, isEmpty, range, some } from "lodash";
import React, { useCallback, useMemo } from "react";
import { useAppStore, useStudentStore } from "../../hooks";
import {
  Student,
  covidStatuses,
  genderedLevels,
  levels,
  nationalities,
  statusDetails,
  statuses,
} from "../../interfaces";
import {
  FilterField,
  getAllInitialSessions,
  getCurrentSession,
  getSessionsWithResults,
  getStatusDetails,
} from "../../services";
import { FilterDrawer } from "../reusables";

interface StudentFilterProps {
  anchorEl?: HTMLButtonElement | null;
  handleClose?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  tooltipObjectName?: string;
}

const booleanCheckboxOptions = ["Yes", "No"];

export const StudentFilter: React.FC<StudentFilterProps> = ({ anchorEl, handleClose, tooltipObjectName }) => {
  const students = useStudentStore((state) => {
    return state.students;
  });
  const role = useAppStore((state) => {
    return state.role;
  });
  const filter = useStudentStore((state) => {
    return state.filter;
  });
  const setFilter = useStudentStore((state) => {
    return state.setFilter;
  });

  const sessionsWithResults = getSessionsWithResults(students);
  const currentSession = getCurrentSession(students);
  const isAdmin = role === "admin";
  const isAdminOrFaculty = isAdmin || role === "faculty";

  const statusDetailsFn = useCallback(
    (student: Student) => {
      return getStatusDetails({ sessions: sessionsWithResults, student, students })[0];
    },
    [sessionsWithResults, students],
  );

  const sessionsAttendedFn = useCallback(
    (student: Student) => {
      return getStatusDetails({ sessions: sessionsWithResults, student, students })[1];
    },
    [sessionsWithResults, students],
  );

  const pendingAcademicRecordFn = useCallback((student: Student) => {
    return some(student.academicRecords, (ar) => {
      return ar.overallResult === undefined;
    });
  }, []);

  const whatsAppGroupFn = useCallback((student: Student) => {
    const includesRemove = includes(student.phone.waBroadcastSAR?.toLowerCase(), "remove");
    if (includes(student.phone.waBroadcastSAR?.toLowerCase(), "group") && !includesRemove) {
      return (
        `SAR ${first(student.phone.waBroadcastSAR?.match(/Group \d/))}` ||
        `SAR Group ${first(student.phone.waBroadcastSAR?.match(/\d/))}`
      );
    }
    if (includes(student.phone.waBroadcastSAR, "Y") && !includesRemove) {
      return "SAR Group 1";
    }
    return "None";
  }, []);

  const placementExamFileFn = useCallback((student: Student) => {
    return !isEmpty(student.origPlacementData.examFile);
  }, []);

  const pendingPlacementFn = useCallback(
    (student: Student) => {
      return find(student.placement, (p) => {
        return p.session === currentSession;
      })?.pending;
    },
    [currentSession],
  );

  const noAnswerCSPlacementFn = useCallback(
    (student: Student) => {
      return find(student.placement, (p) => {
        return p.session === currentSession;
      })?.noAnswerClassScheduleWpm;
    },
    [currentSession],
  );

  const handleClearFilters = useCallback(() => {
    setFilter([]);
  }, [setFilter]);

  const filterFields: FilterField<Student>[] = useMemo(() => {
    return [
      { condition: isAdmin, name: "Invite", path: "status.inviteTag", values: booleanCheckboxOptions },
      { name: "Current Level", path: "currentLevel", values: [...genderedLevels, "L5 GRAD"] },
      { name: "Current Status", path: "status.currentStatus", values: statuses },
      {
        condition: isAdmin,
        fn: pendingPlacementFn,
        name: "Placement Pending",
        path: "placement.pending",
        values: ["Yes", "No"],
      },
      {
        condition: isAdmin,
        fn: noAnswerCSPlacementFn,
        name: "No Answer Class Schedule WPM",
        path: "placement.noAnswerClassScheduleWpm",
        values: ["Yes", "No"],
      },
      {
        condition: isAdminOrFaculty,
        fn: pendingAcademicRecordFn,
        name: "Pending Academic Record",
        path: "academicRecords",
        values: ["Yes", "No"],
      },
      { name: "Original Placement Level", path: "origPlacementData.level", values: levels },
      { condition: isAdmin, name: "NCL", path: "status.noContactList", values: booleanCheckboxOptions },
      { condition: isAdminOrFaculty, name: "ID Card in Box", path: "status.idCardInBox", values: ["Yes", "No"] },
      { condition: isAdminOrFaculty, name: "Teacher", path: "work.isTeacher", values: ["Yes", "No"] },
      {
        condition: isAdminOrFaculty,
        name: "English Teacher",
        path: "work.isEnglishTeacher",
        values: ["Yes", "No"],
      },
      { name: "Initial Session", path: "initialSession", values: getAllInitialSessions(students) },
      { name: "Nationality", path: "nationality", values: nationalities },
      { name: "Gender", path: "gender", values: ["Male", "Female"] },
      {
        fn: placementExamFileFn,
        name: "Has Placement Exam Scan",
        path: "origPlacementData.examFile",
        values: ["Yes", "No"],
      },
      {
        condition: isAdmin,
        fn: whatsAppGroupFn,
        name: "WA BC Group",
        path: "phone.waBroadcastSAR",
        values: [
          "None",
          "SAR Group 1",
          "SAR Group 2",
          "SAR Group 3",
          "SAR Group 4",
          "SAR Group 5",
          "SAR Group 6",
          "SAR Group 7",
        ],
      },
      { condition: isAdmin, name: "COVID Vaccine Status", path: "covidVaccine.status", values: covidStatuses },
      {
        condition: isAdminOrFaculty,
        fn: statusDetailsFn,
        name: "Status Details",
        path: "statusDetails",
        values: statusDetails,
      },
      { condition: isAdminOrFaculty, name: "Withdraw Reason", path: "status.droppedOutReason" },
      { fn: sessionsAttendedFn, name: "Sessions Attended", path: "sessionsAttended", values: range(15) },
    ];
  }, [
    isAdmin,
    pendingPlacementFn,
    noAnswerCSPlacementFn,
    isAdminOrFaculty,
    pendingAcademicRecordFn,
    students,
    placementExamFileFn,
    whatsAppGroupFn,
    statusDetailsFn,
    sessionsAttendedFn,
  ]);
  return (
    <FilterDrawer
      anchorEl={anchorEl}
      data={students}
      filter={filter}
      filterFields={filterFields}
      handleClearFilters={handleClearFilters}
      handleClose={handleClose}
      setFilter={setFilter}
      tooltipObjectName={tooltipObjectName}
    />
  );
};

StudentFilter.defaultProps = {
  anchorEl: null,
  handleClose: undefined,
  tooltipObjectName: undefined,
};
