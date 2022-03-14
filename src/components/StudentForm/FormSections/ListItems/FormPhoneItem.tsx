import CloseIcon from "@mui/icons-material/Close";
import { Grid, IconButton } from "@mui/material";
import React from "react";
import { GridItemTextField, LabeledCheckbox } from "../..";
import { FormItem, SPACING } from "../../../../services";

export const FormPhoneItem: React.FC<FormItem> = ({ index, removeItem }) => {
  const phoneName = `phone.phoneNumbers[${index}]`;
  return (
    <>
      <Grid item padding={SPACING} xs>
        <Grid container>
          <GridItemTextField label={`Phone Number ${Number(index) + 1}`} name={`${phoneName}.number`} />
        </Grid>
        <GridItemTextField
          gridProps={{ marginTop: SPACING / 2 }}
          label={`Phone Notes ${Number(index) + 1}`}
          name={`${phoneName}.notes`}
        />
        <LabeledCheckbox errorName="phone.primaryPhone" label="Primary" name={`phone.primaryPhone[${index}]`} />
      </Grid>
      <IconButton
        onClick={removeItem && removeItem(index)}
        sx={{ height: "15%", marginLeft: -1, marginTop: SPACING }}
      >
        <CloseIcon />
      </IconButton>
    </>
  );
};
