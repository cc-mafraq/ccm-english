import { FilterAlt, MoreHoriz, VisibilityOff } from "@mui/icons-material";
import { AppBar, Box, Divider, IconButton, TablePagination, Toolbar } from "@mui/material";
import React from "react";
import { Searchbar } from ".";
import { DataVisibilityPopover } from "..";
import { useColors } from "../../hooks";
import { Student } from "../../interfaces";

const handlePopoverClick = (setFn: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>) => {
  return (event: React.MouseEvent<HTMLButtonElement>) => {
    setFn(event.currentTarget);
  };
};

const handlePopoverClose = (setFn: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>) => {
  return () => {
    setFn(null);
  };
};

interface StudentDatabaseToolbarProps {
  handleChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSearchStringChange: (value: string) => void;
  page: number;
  rowsPerPage: number;
  students: Student[];
}

export const StudentDatabaseToolbar: React.FC<StudentDatabaseToolbarProps> = ({
  students,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleSearchStringChange,
}) => {
  const [dataFilterAnchorEl, setDataFilterAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const { iconColor } = useColors();

  return (
    <AppBar color="default" elevation={0} position="sticky">
      <Toolbar
        sx={{
          justifyContent: "space-between",
          paddingTop: "1vh",
        }}
      >
        <IconButton>
          <MoreHoriz color="primary" />
        </IconButton>
        <Box>
          <Searchbar handleSearchStringChange={handleSearchStringChange} />
          <IconButton>
            <FilterAlt sx={{ color: iconColor }} />
          </IconButton>
          <IconButton onClick={handlePopoverClick(setDataFilterAnchorEl)}>
            <VisibilityOff sx={{ color: iconColor }} />
          </IconButton>
          <DataVisibilityPopover
            anchorEl={dataFilterAnchorEl}
            handleClose={handlePopoverClose(setDataFilterAnchorEl)}
          />
        </Box>
        <TablePagination
          component="div"
          count={students.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 50, 100, 200, 1000]}
        />
      </Toolbar>
      <Divider />
    </AppBar>
  );
};
