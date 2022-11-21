import { yupResolver } from "@hookform/resolvers/yup";
import { Logout } from "@mui/icons-material";
import { Box, Breakpoint, IconButton, Tooltip } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import { FinalResult, Status, Student, Withdraw } from "../../interfaces";
import { setData, SPACING, withdrawSchema } from "../../services";
import { FormDialog } from "../reusables";
import { FormWithdraw } from "../StudentForm";

interface WithdrawButtonProps {
  student: Student;
}

const FormWithdrawMemo = React.memo(() => {
  return (
    <Box paddingRight={SPACING * 2}>
      <FormWithdraw />
    </Box>
  );
});
FormWithdrawMemo.displayName = "Withdraw Form";

export const WithdrawButton: React.FC<WithdrawButtonProps> = ({ student }) => {
  const [open, setOpen] = useState(false);

  const handleDialogOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setOpen(false);
  }, []);

  const onSubmit = useCallback(
    (data: Withdraw) => {
      student.status.inviteTag = data.inviteTag;
      student.status.noContactList = data.noContactList;
      student.status.withdrawDate.push(data.withdrawDate);
      if (data.droppedOutReason !== null) {
        student.status.droppedOutReason = data.droppedOutReason;
      }
      student.status.currentStatus = Status.WD;
      student.academicRecords[student.academicRecords.length - 1].overallResult = FinalResult.WD;
      setData(student, "students", "epId");
      handleDialogClose();
    },
    [handleDialogClose, student],
  );

  const dialogProps = useMemo(() => {
    const breakpoint: Breakpoint = "lg";
    return { maxWidth: breakpoint };
  }, []);

  const paperStyleProps = useMemo(() => {
    return { paddingLeft: "15px" };
  }, []);

  const useFormProps = useMemo(() => {
    return {
      defaultValues: {
        inviteTag: false,
        noContactList: student.status.noContactList,
      },
      resolver: yupResolver(withdrawSchema),
    };
  }, [student.status.noContactList]);

  return (
    <Box marginBottom="20px">
      <Tooltip arrow title="Withdraw Student">
        <IconButton
          onClick={handleDialogOpen}
          sx={{ marginLeft: "50%", marginTop: "30px", transform: "scale(1.25) translate(-50%)" }}
        >
          <Logout />
        </IconButton>
      </Tooltip>
      <FormDialog<Withdraw>
        dialogProps={dialogProps}
        handleDialogClose={handleDialogClose}
        onSubmit={onSubmit}
        open={open}
        paperStyleProps={paperStyleProps}
        useFormProps={useFormProps}
      >
        <FormWithdrawMemo />
      </FormDialog>
    </Box>
  );
};
