import { collection, onSnapshot } from "firebase/firestore";
import { forEach, sortBy } from "lodash";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FinalGradeReportDialog,
  StudentDatabaseToolbar,
  StudentFormDialog,
  StudentList,
} from "../components";
import { Student } from "../interfaces";
import { db, getStudentPage, logout, searchStudents } from "../services";
import { spreadsheetToStudentList } from "../services/spreadsheetService";

interface SetStateOptions {
  newPage?: number;
  newRowsPerPage?: number;
  newSearchString?: string;
  newStudents?: Student[];
  shouldFilter?: boolean;
}

export const StudentDatabasePage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [studentsPage, setStudentsPage] = useState<Student[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [openFGRDialog, setOpenFGRDialog] = useState(false);
  const [openStudentDialog, setOpenStudentDialog] = useState(false);
  const [searchString, setSearchString] = useState<string>("");
  const navigate = useNavigate();

  const setState = ({
    newRowsPerPage,
    newPage,
    newSearchString,
    shouldFilter,
    newStudents,
  }: SetStateOptions) => {
    const filStudents = shouldFilter
      ? searchStudents(
          newStudents !== undefined ? newStudents : students,
          newSearchString !== undefined ? newSearchString : searchString,
        )
      : filteredStudents;
    shouldFilter && setFilteredStudents(filStudents);
    newStudents !== undefined && setStudents(newStudents);
    newPage !== undefined && setPage(newPage);
    newRowsPerPage !== undefined && setRowsPerPage(newRowsPerPage);
    newSearchString !== undefined && setSearchString(newSearchString);
    setStudentsPage(
      getStudentPage(
        filStudents,
        newPage !== undefined ? newPage : page,
        newRowsPerPage !== undefined ? newRowsPerPage : rowsPerPage,
      ),
    );
  };

  useEffect(() => {
    onSnapshot(collection(db, "students"), {
      error: (e) => {
        if (e.code === "permission-denied") {
          logout();
          navigate("/");
        }
      },
      next: (snapshot) => {
        const studentData: Student[] = [];
        forEach(snapshot.docs, (d) => {
          studentData.push({ ...d.data() } as Student);
        });
        const sortedStudentData = sortBy(studentData, (student) => {
          return student.name.english;
        });
        setState({
          newStudents: sortedStudentData,
          shouldFilter: true,
        });
      },
    });
  }, []);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setState({ newPage });
    window.scrollTo(0, 0);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setState({ newPage: 0, newRowsPerPage });
  };

  const handleSearchStringChange = (value: string) => {
    setState({ newPage: 0, newSearchString: value, shouldFilter: true });
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file: File | null = e.target.files && e.target.files[0];
    const reader = new FileReader();

    file && reader.readAsText(file);

    reader.onloadend = async () => {
      const studentListString = String(reader.result);
      const studentList = spreadsheetToStudentList(studentListString);
      setState({ newStudents: studentList, shouldFilter: true });
    };
  };

  const handleAddStudentClick = () => {
    setOpenStudentDialog(true);
  };

  const handleStudentDialogClose = () => {
    setOpenStudentDialog(false);
  };

  const handleGenerateFGRClick = () => {
    setOpenFGRDialog(true);
  };

  const handleFGRDialogClose = () => {
    setOpenFGRDialog(false);
  };

  return (
    <>
      <StudentDatabaseToolbar
        handleAddStudentClick={handleAddStudentClick}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        handleGenerateFGRClick={handleGenerateFGRClick}
        handleImportClick={onInputChange}
        handleSearchStringChange={handleSearchStringChange}
        page={page}
        rowsPerPage={rowsPerPage}
        students={filteredStudents}
      />
      {students.length > 0 ? (
        <FinalGradeReportDialog
          handleDialogClose={handleFGRDialogClose}
          open={openFGRDialog}
          students={students}
        />
      ) : (
        <></>
      )}
      <StudentFormDialog handleDialogClose={handleStudentDialogClose} open={openStudentDialog} />
      <StudentList studentsPage={studentsPage} />
    </>
  );
};
