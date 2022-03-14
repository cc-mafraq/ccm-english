import { createTheme, PaletteMode, ThemeProvider } from "@mui/material";
import React, { useReducer } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MenuBar } from "./components";
import { useLocal } from "./hooks";
import { AppContext, getDesignTokens, initialAppState, voidFn } from "./interfaces";
import { LoginPage, StudentDatabasePage } from "./pages";
import { reducer } from "./reducers";

export const ColorModeContext = React.createContext({
  toggleColorMode: voidFn,
});

export const App = () => {
  const { save } = useLocal("appState");
  const [appState, appDispatch] = useReducer(reducer(save), initialAppState);
  const [mode, setMode] = React.useState<PaletteMode>("dark");
  const colorMode = React.useMemo(() => {
    return {
      toggleColorMode: () => {
        setMode((prevMode: PaletteMode) => {
          return prevMode === "light" ? "dark" : "light";
        });
      },
    };
  }, []);

  const theme = React.useMemo(() => {
    return createTheme(getDesignTokens(mode));
  }, [mode]);

  return (
    <div style={{ background: theme.palette.background.default }}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <AppContext.Provider value={{ appDispatch, appState }}>
            <BrowserRouter>
              <Routes>
                <Route
                  element={
                    <>
                      <MenuBar />
                      <StudentDatabasePage />
                    </>
                  }
                  path="/epd"
                />
                <Route element={<LoginPage />} path="/" />
              </Routes>
            </BrowserRouter>
          </AppContext.Provider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </div>
  );
};
