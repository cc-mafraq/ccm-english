import { AppAction, AppState } from "../interfaces";

/*
  Provides a function to perform multiple setState updates
  at once that depend on each other.
  Can be initialized with a callback to be performed on
  any completed action.
*/
export const reducer = (actionCallback: (item: AppState) => void) => {
  return (state: AppState, action: AppAction): AppState => {
    let newState: AppState;
    switch (action.type) {
      case "setDataVisibility": {
        if (action.payload.dataVisibility) {
          newState = {
            ...state,
            dataVisibility: action.payload.dataVisibility,
          };
          break;
        } else {
          return state;
        }
      }
      case "setStudents": {
        if (action.payload.students) {
          newState = {
            ...state,
            students: action.payload.students,
          };
          break;
        } else {
          return state;
        }
      }
      case "setSelectedStudent": {
        if (action.payload.selectedStudent) {
          newState = {
            ...state,
            selectedStudent: action.payload.selectedStudent,
          };
          break;
        } else {
          return state;
        }
      }
      default:
        return state;
    }
    actionCallback(newState);
    return newState;
  };
};
