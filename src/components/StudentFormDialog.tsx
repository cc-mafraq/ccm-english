import { Box, Dialog } from "@mui/material";
import React from "react";
import { StudentForm } from ".";
import { Student } from "../interfaces";

interface StudentFormDialogProps {
  handleDialogClose: () => void;
  open: boolean;
  students: Student[];
}

export const StudentFormDialog: React.FC<StudentFormDialogProps> = ({
  handleDialogClose,
  open,
  students,
}) => {
  return (
    <Dialog
      fullScreen
      onClose={handleDialogClose}
      open={open}
      PaperProps={{ style: { backgroundColor: "#f5f5f5", overflowX: "hidden" } }}
      sx={{
        marginLeft: "50%",
        marginTop: "1%",
        transform: "translate(-50%)",
        width: "95%",
      }}
    >
      <Box sx={{ padding: "10px" }}>
        <StudentForm handleDialogClose={handleDialogClose} students={students} />
      </Box>
    </Dialog>
  );
};
