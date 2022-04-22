import { Close } from "@mui/icons-material";
import { Grid, IconButton } from "@mui/material";
import moment from "moment";
import React from "react";
import { GridItemDatePicker, GridItemTextField } from "../..";
import { useColors } from "../../../../hooks";
import { FormItem, MOMENT_FORMAT, SPACING } from "../../../../services";

export const FormCorrespondenceItem: React.FC<FormItem> = ({ index, removeItem, name }) => {
  const { iconColor } = useColors();

  return (
    <>
      <Grid container>
        <GridItemDatePicker
          gridProps={{ margin: SPACING, xs: 2 }}
          label="Date"
          name={`${name}.date`}
          textFieldProps={{ required: true }}
          value={moment().format(MOMENT_FORMAT)}
        />
        <GridItemTextField
          gridProps={{ marginTop: SPACING }}
          label="Correspondence"
          name={`${name}.notes`}
          textFieldProps={{ multiline: true, required: true, rows: 4 }}
        />
        <IconButton onClick={removeItem && removeItem(index)} sx={{ color: iconColor, height: "30%" }}>
          <Close />
        </IconButton>
      </Grid>
    </>
  );
};
