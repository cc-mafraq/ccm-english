import { Edit } from "@mui/icons-material";
import {
  Box,
  BoxProps,
  Button,
  IconButton,
  Tooltip,
  Typography,
  TypographyProps,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { grey, green as materialGreen, red as materialRed } from "@mui/material/colors";
import chroma from "chroma-js";
import Color from "color";
import { forOwn, map, reverse } from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import { AccordionList, EditFn, FormAcademicRecordsDialog, LabeledContainer, LabeledText, ProgressBox } from "..";
import { useAppStore, useColors, useStudentStore } from "../../hooks";
import { AcademicRecord, FinalResult, GenderedLevel, Grade, Student } from "../../interfaces";
import { getAllSessionsWithRecord, getProgress, isElective } from "../../services";

interface AcademicRecordsProps {
  data: Student;
}

interface ResultBoxProps {
  containerProps?: BoxProps;
  result?: FinalResult;
  showEmpty?: boolean;
}

export const ResultBox: React.FC<ResultBoxProps> = ({ result, showEmpty, containerProps }) => {
  const { green, red } = useColors();

  const gradeContainerProps = () => {
    return {
      sx: {
        backgroundColor: result === "P" ? green : result === "F" || result === "WD" ? red : undefined,
      },
    };
  };

  return (
    <LabeledText
      containerProps={{ ...gradeContainerProps(), ...containerProps }}
      label="Result"
      showWhenEmpty={showEmpty}
    >
      {result ? FinalResult[result] : undefined}
    </LabeledText>
  );
};

ResultBox.defaultProps = {
  containerProps: undefined,
  result: undefined,
  showEmpty: undefined,
};

interface GradeInfoProps {
  bold?: boolean;
  grade?: Grade;
  label: string;
}

const labelProps: TypographyProps = { fontWeight: "normal", variant: "subtitle1" };

export const GradeInfo: React.FC<GradeInfoProps> = ({ grade, label, bold }) => {
  const labelPropsWithBold = { ...labelProps, fontWeight: bold ? "bold" : undefined };

  return (
    <LabeledContainer label={label} labelProps={labelPropsWithBold} showWhenEmpty={grade?.result !== undefined}>
      <ResultBox result={grade?.result} />
      <LabeledText label="Percentage">
        {grade?.percentage !== undefined ? `${grade.percentage}%` : undefined}
      </LabeledText>
      <LabeledText label="Notes">{grade?.notes}</LabeledText>
    </LabeledContainer>
  );
};

GradeInfo.defaultProps = {
  bold: undefined,
  grade: undefined,
};

interface AcademicRecordAccordionSummaryProps {
  data: AcademicRecord;
  handleEditClick?: EditFn;
  i: number;
}

const AcademicRecordAccordionSummary: React.FC<AcademicRecordAccordionSummaryProps> = ({
  data: academicRecord,
  i,
  handleEditClick,
}) => {
  const role = useAppStore((state) => {
    return state.role;
  });
  const theme = useTheme();
  const { red, green } = useColors();

  return (
    <>
      <Typography sx={{ marginLeft: "10vw", width: "20vw" }} variant="h6">
        {academicRecord.session}
      </Typography>
      <Box sx={{ width: "20vw" }}>
        {academicRecord.level ? (
          <Typography sx={{ width: "20vw" }} variant="h6">
            {academicRecord.level}
          </Typography>
        ) : (
          academicRecord.levelAudited && <Typography variant="h6">{academicRecord.levelAudited} Audit</Typography>
        )}
      </Box>
      <Box sx={{ width: "20vw" }}>
        {academicRecord.overallResult && (
          <Typography
            color={
              academicRecord.overallResult === FinalResult.P
                ? theme.palette.mode === "light"
                  ? materialGreen[600]
                  : green
                : theme.palette.mode === "light"
                ? materialRed[600]
                : red
            }
            sx={{ fontWeight: "bold" }}
            variant="h6"
          >
            {academicRecord.overallResult}
          </Typography>
        )}
      </Box>
      {role === "admin" && (
        <Tooltip arrow title="Edit Academic Record">
          <IconButton onClick={handleEditClick && handleEditClick(i)}>
            <Edit />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
};

AcademicRecordAccordionSummary.defaultProps = {
  handleEditClick: undefined,
};

interface AcademicRecordAccordionDetailsProps {
  bold?: boolean;
  data: AcademicRecord;
}

export const AcademicRecordAccordionDetails: React.FC<AcademicRecordAccordionDetailsProps> = ({
  data: academicRecord,
  bold,
}) => {
  const labelPropsWithBold = { ...labelProps, fontWeight: bold ? "bold" : undefined };

  return (
    <>
      <GradeInfo bold={bold} grade={academicRecord.finalGrade} label="Class Grade" />
      <GradeInfo bold={bold} grade={academicRecord.exitWritingExam} label="Exit Writing Exam" />
      <GradeInfo bold={bold} grade={academicRecord.exitSpeakingExam} label="Exit Speaking Exam" />
      <LabeledContainer label="Attendance" labelProps={labelPropsWithBold}>
        <LabeledText label="">
          {academicRecord.attendance !== undefined ? `${academicRecord.attendance}%` : undefined}
        </LabeledText>
      </LabeledContainer>
      <LabeledContainer label="Teacher Comments" labelProps={labelPropsWithBold}>
        <LabeledText label="" textProps={{ fontSize: "11pt" }}>
          {academicRecord.comments}
        </LabeledText>
      </LabeledContainer>
      <LabeledContainer label="Final Grade Report Sent" labelProps={labelPropsWithBold}>
        <LabeledText label="">{academicRecord.finalGradeSentDate}</LabeledText>
      </LabeledContainer>
      <LabeledContainer label="Final Grade Report Notes" labelProps={labelPropsWithBold}>
        <LabeledText label="">{academicRecord.finalGradeReportNotes}</LabeledText>
      </LabeledContainer>
    </>
  );
};

AcademicRecordAccordionDetails.defaultProps = {
  bold: undefined,
};

export const AcademicRecords: React.FC<AcademicRecordsProps> = ({ data: student }) => {
  const students = useStudentStore((state) => {
    return state.students;
  });
  const role = useAppStore((state) => {
    return state.role;
  });
  const progress = useMemo(() => {
    return getProgress(student, getAllSessionsWithRecord(students));
  }, [student, students]);
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedAcademicRecord, setSelectedAcademicRecord] = useState<AcademicRecord | null>(null);
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));
  const { red, yellow, green } = useColors();

  const handleDialogOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setOpen(false);
    setSelectedAcademicRecord(null);
  }, []);

  const handleEditClick = useCallback(
    (index: number) => {
      return (e: React.MouseEvent) => {
        setSelectedAcademicRecord(reverse([...student.academicRecords])[index]);
        handleDialogOpen();
        e.stopPropagation();
      };
    },
    [handleDialogOpen, student.academicRecords],
  );

  const PB = useMemo(() => {
    return map(forOwn(progress), (v, k) => {
      return <ProgressBox key={k} level={k as GenderedLevel} sessionResults={v} />;
    });
  }, [progress]);

  const getAttendanceColor = chroma.scale([red, yellow, green]);
  const scaleAttendancePercentageForColor = (attendance: AcademicRecord["attendance"]) => {
    return ((attendance ?? 0) / 100 - 0.4) * (1 / 0.6);
  };

  return (
    <Box sx={greaterThanSmall ? { display: "flex", flexDirection: "column" } : undefined}>
      <LabeledContainer
        label="Progress"
        parentContainerProps={{ minHeight: "100px", width: "100%" }}
        showWhenEmpty
      >
        {PB}
      </LabeledContainer>
      <LabeledContainer label="Attendance Record">
        {map(student.academicRecords, (ar) => {
          const attendanceColor = getAttendanceColor(scaleAttendancePercentageForColor(ar.attendance)).toString();
          return ar.attendance === undefined && ar.overallResult !== FinalResult.WD ? (
            <></>
          ) : (
            <LabeledText
              containerProps={{
                sx: {
                  backgroundColor: attendanceColor,
                },
              }}
              label={isElective(ar.level ?? ar.levelAudited) ? `(${ar.session})` : ar.session}
              labelProps={
                theme.palette.mode === "dark"
                  ? {
                      color: Color(attendanceColor).isLight() ? grey[800] : theme.palette.text.secondary,
                    }
                  : {}
              }
              textProps={
                theme.palette.mode === "dark"
                  ? {
                      color: Color(attendanceColor).isLight() ? grey[900] : theme.palette.text.secondary,
                    }
                  : {}
              }
            >
              {ar.attendance ?? 0}%
            </LabeledText>
          );
        })}
      </LabeledContainer>
      <LabeledContainer label="Academic Records" showWhenEmpty>
        {role === "admin" && (
          <Box marginBottom={1} marginTop={1} width="100%">
            <Button color="secondary" onClick={handleDialogOpen} variant="contained">
              Add Session
            </Button>
          </Box>
        )}
        <AccordionList
          dataList={student.academicRecords ? reverse([...student.academicRecords]) : []}
          DetailsComponent={AcademicRecordAccordionDetails}
          handleEditClick={handleEditClick}
          SummaryComponent={AcademicRecordAccordionSummary}
          width="100%"
        />
        <LabeledText label="Certificate Requests">{student?.certificateRequests}</LabeledText>
      </LabeledContainer>
      <FormAcademicRecordsDialog
        handleDialogClose={handleDialogClose}
        open={open}
        selectedAcademicRecord={selectedAcademicRecord}
        student={student}
      />
    </Box>
  );
};
