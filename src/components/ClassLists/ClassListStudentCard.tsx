import { Box, useMediaQuery, useTheme } from "@mui/material";
import { findIndex, nth } from "lodash";
import React, { useMemo } from "react";
import { PhoneNumbers, StudentCardHeader, StudentCardImage } from "..";
import { SectionPlacement, Status, Student, emptyStudent } from "../../interfaces";
import { getClassName, getRepeatNum } from "../../services";
import { CorrespondenceList, CustomCard, LabeledContainer, LabeledText } from "../reusables";

const ClassListStudentInfoMemo: React.FC<{ allSameGender: boolean; allSameLevel: boolean; data: Student }> =
  React.memo(({ data, allSameLevel, allSameGender }) => {
    const repeatNum = useMemo(() => {
      return getRepeatNum(data);
    }, [data]);
    const theme = useTheme();
    const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));

    return (
      <Box sx={greaterThanSmall ? { display: "flex", flexWrap: "wrap" } : undefined}>
        <LabeledContainer label="Student Information">
          {!allSameLevel && <LabeledText label="Current Level">{data.currentLevel}</LabeledText>}
          <LabeledText label="Status">{Status[data.status.currentStatus]}</LabeledText>
          <LabeledText label="Nationality">{data.nationality}</LabeledText>
          {!allSameGender && <LabeledText label="Gender">{data.gender === "M" ? "Male" : "Female"}</LabeledText>}
          <LabeledText label="Repeat">{repeatNum}</LabeledText>
        </LabeledContainer>
        <PhoneNumbers data={data} noWhatsapp />
      </Box>
    );
  });
ClassListStudentInfoMemo.displayName = "Class List Student Info";

interface ClassListStudentCardProps {
  allSameGender: boolean;
  allSameLevel: boolean;
  data?: Student;
  selectedClass?: SectionPlacement;
  selectedSession: string;
}

export const ClassListStudentCard: React.FC<ClassListStudentCardProps> = (props) => {
  const { allSameGender, allSameLevel, data, selectedClass, selectedSession } = props;
  const sessionIndex = useMemo(() => {
    return findIndex(data?.placement, (placement) => {
      return placement.session === selectedSession;
    });
  }, [data?.placement, selectedSession]);
  const classIndex = useMemo(() => {
    return findIndex(nth(data?.placement, sessionIndex)?.placement, (sectionPlacement) => {
      return getClassName(selectedClass) === getClassName(sectionPlacement);
    });
  }, [data?.placement, selectedClass, sessionIndex]);

  const theme = useTheme();
  const greaterThanMedium = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <CustomCard
      data={emptyStudent}
      header={<StudentCardHeader data={emptyStudent} />}
      image={
        <StudentCardImage
          data={emptyStudent}
          imageContainerProps={{ marginLeft: "15px" }}
          imageWidth={greaterThanMedium ? 65 : 95}
          loadingIconSize="32px"
          noBorder
          noButtons
          noMinWidth
          smallBreakpointScaleDown={1.5}
        />
      }
      tabContents={[
        {
          component: (
            <ClassListStudentInfoMemo
              allSameGender={allSameGender}
              allSameLevel={allSameLevel}
              data={emptyStudent}
            />
          ),
          label: "Student Information",
        },
        {
          component: (
            <CorrespondenceList
              collectionName="students"
              correspondencePath={`placement[${sessionIndex}].placement[${classIndex}].classListNotes`}
              data={emptyStudent}
              idPath="epId"
              itemName="Note"
            />
          ),
          label: "Notes",
        },
      ]}
      {...props}
    />
  );
};

ClassListStudentCard.defaultProps = {
  data: undefined,
  selectedClass: undefined,
};
