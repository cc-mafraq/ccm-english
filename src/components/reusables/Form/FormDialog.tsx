import { Close } from "@mui/icons-material";
import { Box, Button, Dialog, DialogProps, Grid, IconButton, Tooltip, Typography, useTheme } from "@mui/material";
import { green, grey } from "@mui/material/colors";
import { isEqual } from "lodash";
import React, { CSSProperties, PropsWithChildren, useState } from "react";
import {
  DeepPartial,
  DefaultValues,
  FieldValues,
  FormProvider,
  SubmitHandler,
  UseFormProps,
  useForm,
} from "react-hook-form";
import { useColors } from "../../../hooks";
import { SPACING } from "../../../services";
import { FormErrorDialog } from "./FormErrorDialog";

interface FormDialogProps<T extends FieldValues> {
  dialogProps?: Partial<DialogProps>;
  handleDialogClose: () => void;
  onSubmit: SubmitHandler<T>;
  onlyLoadWhenOpen?: boolean;
  open: boolean;
  paperStyleProps?: CSSProperties;
  stickySubmit?: boolean;
  useFormProps: UseFormProps<T>;
}

export const FormDialog = <T extends FieldValues>({
  open,
  handleDialogClose,
  onSubmit,
  useFormProps,
  dialogProps,
  paperStyleProps,
  children,
  stickySubmit,
  onlyLoadWhenOpen,
}: PropsWithChildren<FormDialogProps<T>>) => {
  const { popoverColor } = useColors();
  const theme = useTheme();
  const methods = useForm<T>({ criteriaMode: "all", ...useFormProps });
  const { reset } = methods;

  const [openErrorDialog, setOpenErrorDialog] = useState(false);

  const closeErrorDialog = () => {
    setOpenErrorDialog(false);
  };

  const [prevDefaultValues, setPrevDefaultValues] = useState<DeepPartial<T> | undefined>(undefined);
  if (open && !isEqual(useFormProps.defaultValues, prevDefaultValues)) {
    useFormProps.defaultValues ? reset(useFormProps.defaultValues as DefaultValues<T>) : reset({} as T);
    setPrevDefaultValues(useFormProps.defaultValues as DefaultValues<T>);
  }

  return (
    <Dialog
      fullWidth
      onClose={handleDialogClose}
      open={open}
      PaperProps={{
        style: {
          backgroundColor: popoverColor,
          overflowX: "hidden",
          ...paperStyleProps,
        },
      }}
      {...dialogProps}
    >
      <Box sx={{ padding: "10px", position: "relative" }}>
        <Tooltip arrow title="Close Dialog">
          <IconButton onClick={handleDialogClose} sx={{ position: "absolute", right: "1.5vh", top: "1.5vh" }}>
            <Close />
          </IconButton>
        </Tooltip>
        {(!onlyLoadWhenOpen || open) && (
          <FormProvider {...methods}>
            <form>
              {children}
              <Box sx={stickySubmit ? { bottom: 10, position: "fixed", zIndex: 1 } : undefined}>
                <Button
                  className="update-button"
                  onClick={methods.handleSubmit(
                    (data, e) => {
                      onSubmit(data, e);
                      reset({} as T);
                    },
                    () => {
                      setOpenErrorDialog(true);
                    },
                  )}
                  sx={{
                    "&:hover": {
                      backgroundColor: green[900],
                    },
                    backgroundColor: green[800],
                    color: theme.palette.mode === "light" ? "white" : grey[200],
                    marginTop: SPACING,
                  }}
                  type="submit"
                  variant="contained"
                >
                  Submit
                </Button>
              </Box>
              <Grid item sx={{ float: stickySubmit ? "right" : undefined }}>
                <Typography variant="caption">
                  Tip: use <b>tab</b> and <b>shift + tab</b> to navigate, <b>space bar</b> to select checkboxes,{" "}
                  <b>arrow keys</b> to select radio buttons, and <b>return</b> to submit and click buttons.
                </Typography>
              </Grid>
            </form>
            <FormErrorDialog handleDialogClose={closeErrorDialog} open={openErrorDialog} />
          </FormProvider>
        )}
      </Box>
    </Dialog>
  );
};

FormDialog.defaultProps = {
  dialogProps: undefined,
  onlyLoadWhenOpen: undefined,
  paperStyleProps: undefined,
  stickySubmit: undefined,
};
