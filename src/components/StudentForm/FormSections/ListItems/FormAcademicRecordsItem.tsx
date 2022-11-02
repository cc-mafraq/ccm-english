import { Close } from "@mui/icons-material";
import { Grid, IconButton, Tooltip } from "@mui/material";
import React, { useContext } from "react";
import {
  FormGrade,
  FormLabel,
  GridContainer,
  GridItemAutocomplete,
  GridItemDatePicker,
  GridItemTextField,
} from "../../..";
import { useColors } from "../../../../hooks";
import { AppContext, genderedLevels } from "../../../../interfaces";
import { FormItem, getAllSessions, SPACING } from "../../../../services";

export const FormAcademicRecordsItem: React.FC<FormItem> = ({ index, removeItem, name }) => {
  const {
    appState: { students },
  } = useContext(AppContext);

  const { iconColor } = useColors();

  return (
    <>
      <Grid container marginLeft={SPACING}>
        <FormLabel textProps={{ marginTop: SPACING }}>
          Session {index === undefined ? "" : Number(index) + 1}
        </FormLabel>
        {removeItem && (
          <Tooltip arrow title="Remove Session">
            <IconButton
              onClick={removeItem(index)}
              sx={{ color: iconColor, marginTop: "1.5vh", position: "absolute", right: "1.5vh" }}
            >
              <Close />
            </IconButton>
          </Tooltip>
        )}
      </Grid>
      <GridContainer marginBottom={SPACING / 2} marginLeft={0}>
        <GridItemAutocomplete
          freeSolo
          label="Session"
          name={name ? `${name}.session` : "session"}
          options={getAllSessions(students)}
          textFieldProps={{ required: true }}
        />
        <GridItemAutocomplete
          freeSolo
          label="Level"
          name={name ? `${name}.level` : "level"}
          options={genderedLevels}
        />
        <GridItemTextField label="Attendance Percentage" name={name ? `${name}.attendance` : "attendance"} />
        <GridItemAutocomplete
          autoSelect={false}
          freeSolo
          label="Level Audited"
          name={name ? `${name}.levelAudited` : "levelAudited"}
          options={genderedLevels}
        />
      </GridContainer>
      <FormGrade gradePath={name ? `${name}.finalResult` : "finalResult"} label="Final Grade" />
      <FormGrade gradePath={name ? `${name}.exitWritingExam` : "exitWritingExam"} label="Exit Writing Exam" />
      <FormGrade gradePath={name ? `${name}.exitSpeakingExam` : "exitSpeakingExam"} label="Exit Speaking Exam" />
      <GridContainer marginBottom={0} marginLeft={0}>
        <GridItemTextField
          label="Teacher Comments"
          name={name ? `${name}.comments` : "comments"}
          textFieldProps={{ multiline: true, rows: 4 }}
        />
      </GridContainer>
      <GridContainer marginBottom={0} marginLeft={0}>
        <GridItemDatePicker
          gridProps={{ xs: 3 }}
          label="Final Grade Report Sent"
          name={name ? `${name}.finalGradeSentDate` : "finalGradeSentDate"}
        />
      </GridContainer>
    </>
  );
};
