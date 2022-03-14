import { Box, Dialog, useTheme } from "@mui/material";
import React from "react";
import { useColors } from "../../hooks";
import { Student } from "../../interfaces";
import { StudentForm } from "./StudentForm";

interface StudentFormDialogProps {
  handleDialogClose: () => void;
  open: boolean;
  selectedStudent?: Student;
  students: Student[];
}

export const StudentFormDialog: React.FC<StudentFormDialogProps> = ({
  handleDialogClose,
  open,
  selectedStudent,
  students,
}) => {
  const theme = useTheme();
  const { darkBlueBackground } = useColors();

  return (
    <Dialog
      fullScreen
      onClose={handleDialogClose}
      open={open}
      PaperProps={{
        style: {
          backgroundColor: theme.palette.mode === "light" ? "#f5f5f5" : darkBlueBackground,
          overflowX: "hidden",
        },
      }}
      sx={{
        marginLeft: "50%",
        marginTop: "1%",
        transform: "translate(-50%)",
        width: "95%",
      }}
    >
      <Box sx={{ padding: "10px" }}>
        <StudentForm handleDialogClose={handleDialogClose} selectedStudent={selectedStudent} students={students} />
      </Box>
    </Dialog>
  );
};

StudentFormDialog.defaultProps = {
  selectedStudent: undefined,
};
