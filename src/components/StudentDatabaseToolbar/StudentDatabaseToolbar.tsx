import { FilterAlt, MoreHoriz } from "@mui/icons-material";
import { AppBar, Box, Divider, IconButton, TablePagination, Toolbar, Tooltip } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";
import { FilterDrawer, Searchbar } from ".";
import { saveLocal, useColors } from "../../hooks";
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
  searchString: string;
  setShowActions: Dispatch<SetStateAction<boolean>>;
  showActions: boolean;
  students: Student[];
}

export const StudentDatabaseToolbar: React.FC<StudentDatabaseToolbarProps> = ({
  students,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleSearchStringChange,
  showActions,
  setShowActions,
  searchString,
}) => {
  const [filterAnchorEl, setFilterAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const { iconColor } = useColors();

  return (
    <AppBar color="default" elevation={0} position="sticky">
      <Toolbar
        sx={{
          justifyContent: "space-between",
          paddingTop: "1vh",
        }}
      >
        <Box width="10vw">
          <Tooltip arrow placement="right" title={`${showActions ? "Hide" : "Show"} Actions`}>
            <IconButton
              onClick={() => {
                saveLocal("showActions", !showActions);
                setShowActions(!showActions);
              }}
            >
              <MoreHoriz color="primary" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box margin="auto">
          <Searchbar
            handleSearchStringChange={handleSearchStringChange}
            placeholder="Search students"
            searchString={searchString}
          />
          <Tooltip arrow title="Filter Students">
            <IconButton onClick={handlePopoverClick(setFilterAnchorEl)}>
              <FilterAlt sx={{ color: iconColor }} />
            </IconButton>
          </Tooltip>
          <FilterDrawer anchorEl={filterAnchorEl} handleClose={handlePopoverClose(setFilterAnchorEl)} />
        </Box>
        <Box width="33vw">
          <TablePagination
            component="div"
            count={students.length}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10, 50, 100, 200, { label: "All", value: -1 }]}
          />
        </Box>
      </Toolbar>
      <Divider />
    </AppBar>
  );
};
