import { yupResolver } from "@hookform/resolvers/yup";
import { Edit } from "@mui/icons-material";
import {
  Box,
  Breakpoint,
  Button,
  IconButton,
  Tooltip,
  Typography,
  TypographyProps,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { green as materialGreen, red as materialRed } from "@mui/material/colors";
import { findIndex, forOwn, map, reverse } from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import {
  AccordionList,
  editFn,
  FormAcademicRecordsItem,
  FormDialog,
  LabeledContainer,
  LabeledText,
  ProgressBox,
} from "..";
import { useAppStore, useColors, useStudentStore } from "../../hooks";
import { AcademicRecord, emptyAcademicRecord, FinalResult, GenderedLevel, Grade, Student } from "../../interfaces";
import {
  academicRecordsSchema,
  getAllSessions,
  getProgress,
  removeNullFromObject,
  setData,
  SPACING,
} from "../../services";

interface AcademicRecordsProps {
  data: Student;
}

interface GradeInfoProps {
  grade?: Grade;
  label: string;
}

const labelProps: TypographyProps = { fontWeight: "normal", variant: "subtitle1" };

const GradeInfo: React.FC<GradeInfoProps> = ({ grade, label }) => {
  const { green, red } = useColors();

  const gradeContainerProps = (result?: FinalResult) => {
    return {
      sx: {
        backgroundColor: result === "P" ? green : red,
      },
    };
  };

  return (
    <LabeledContainer label={label} labelProps={labelProps}>
      <LabeledText containerProps={gradeContainerProps(grade?.result)} label="Result">
        {grade?.result ? FinalResult[grade.result] : undefined}
      </LabeledText>
      <LabeledText label="Percentage">
        {grade?.percentage !== undefined ? `${grade.percentage}%` : undefined}
      </LabeledText>
      <LabeledText label="Notes">{grade?.notes}</LabeledText>
    </LabeledContainer>
  );
};

GradeInfo.defaultProps = {
  grade: undefined,
};

interface AcademicRecordAccordionSummaryProps {
  data: AcademicRecord;
  handleEditClick?: editFn;
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
  data: AcademicRecord;
}

const AcademicRecordAccordionDetails: React.FC<AcademicRecordAccordionDetailsProps> = ({
  data: academicRecord,
}) => {
  return (
    <>
      <GradeInfo grade={academicRecord.finalGrade} label="Class Grade" />
      <GradeInfo grade={academicRecord.exitWritingExam} label="Exit Writing Exam" />
      <GradeInfo grade={academicRecord.exitSpeakingExam} label="Exit Speaking Exam" />
      <LabeledContainer label="Attendance" labelProps={labelProps}>
        <LabeledText label="">
          {academicRecord.attendance !== undefined ? `${academicRecord.attendance}%` : undefined}
        </LabeledText>
      </LabeledContainer>
      <LabeledContainer label="Teacher Comments" labelProps={labelProps}>
        <LabeledText label="" textProps={{ fontSize: "11pt" }}>
          {academicRecord.comments}
        </LabeledText>
      </LabeledContainer>
      <LabeledContainer label="Final Grade Report Sent" labelProps={labelProps}>
        <LabeledText label="">{academicRecord.finalGradeSentDate}</LabeledText>
      </LabeledContainer>
      <LabeledContainer label="Final Grade Report Notes" labelProps={labelProps}>
        <LabeledText label="">{academicRecord.finalGradeReportNotes}</LabeledText>
      </LabeledContainer>
    </>
  );
};

const FormAcademicRecordsMemo = React.memo(() => {
  return (
    <Box paddingRight={SPACING * 2}>
      <FormAcademicRecordsItem />
    </Box>
  );
});
FormAcademicRecordsMemo.displayName = "Academic Records Form";

export const AcademicRecords: React.FC<AcademicRecordsProps> = ({ data: student }) => {
  const students = useStudentStore((state) => {
    return state.students;
  });
  const role = useAppStore((state) => {
    return state.role;
  });
  const progress = useMemo(() => {
    return getProgress(student, getAllSessions(students));
  }, [student, students]);
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedAcademicRecord, setSelectedAcademicRecord] = useState<AcademicRecord | null>(null);
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));

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

  const onSubmit = useCallback(
    (data: AcademicRecord) => {
      const dataNoNull = removeNullFromObject(data) as AcademicRecord;
      if (selectedAcademicRecord) {
        const recordIndex = findIndex(student.academicRecords, selectedAcademicRecord);
        student.academicRecords[recordIndex] = dataNoNull;
      } else {
        student.academicRecords.push(dataNoNull);
      }
      setData(student, "students", "epId");
      handleDialogClose();
    },
    [handleDialogClose, selectedAcademicRecord, student],
  );

  const dialogProps = useMemo(() => {
    const breakpoint: Breakpoint = "lg";
    return { maxWidth: breakpoint };
  }, []);

  const useFormProps = useMemo(() => {
    return {
      defaultValues: selectedAcademicRecord || emptyAcademicRecord,
      resolver: yupResolver(academicRecordsSchema),
    };
  }, [selectedAcademicRecord]);

  const PB = useMemo(() => {
    return map(forOwn(progress), (v, k) => {
      return <ProgressBox key={k} level={k as GenderedLevel} sessionResults={v} />;
    });
  }, [progress]);

  return (
    <Box sx={greaterThanSmall ? { display: "flex", flexDirection: "column" } : undefined}>
      <LabeledContainer
        label="Progress"
        parentContainerProps={{ minHeight: "100px", width: "100%" }}
        showWhenEmpty
      >
        {PB}
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
          dataList={reverse([...student.academicRecords])}
          DetailsComponent={AcademicRecordAccordionDetails}
          handleEditClick={handleEditClick}
          SummaryComponent={AcademicRecordAccordionSummary}
        />
        <LabeledText label="Certificate Requests">{student?.certificateRequests}</LabeledText>
      </LabeledContainer>
      <FormDialog<AcademicRecord>
        dialogProps={dialogProps}
        handleDialogClose={handleDialogClose}
        onSubmit={onSubmit}
        open={open}
        useFormProps={useFormProps}
      >
        <FormAcademicRecordsMemo />
      </FormDialog>
    </Box>
  );
};
