import { useTheme } from "@mui/material";
import { grey } from "@mui/material/colors";
import { filter, join, last, map, split } from "lodash";
import React, { useMemo } from "react";
import { LabeledText } from "..";
import { useColors } from "../../hooks";
import { GenderedLevel } from "../../interfaces";
import { SessionResult } from "../../services";

export const ProgressBox = ({
  level,
  sessionResults,
}: {
  level: GenderedLevel;
  sessionResults?: SessionResult[];
}) => {
  const theme = useTheme();
  const lastSessionResult = useMemo(() => {
    return (
      last(
        filter(sessionResults, (sr) => {
          return !sr.isElective && !sr.isAudit;
        }),
      )?.result || last(sessionResults)?.result
    );
  }, [sessionResults]);

  const isDarkAndYellow =
    theme.palette.mode === "dark" && lastSessionResult === undefined && sessionResults?.length;
  const { defaultBackgroundColor, green, yellow, red } = useColors();

  return (
    <LabeledText
      containerProps={{
        sx: {
          backgroundColor:
            sessionResults?.length === 0
              ? defaultBackgroundColor
              : lastSessionResult === "P"
              ? green
              : lastSessionResult === undefined
              ? yellow
              : red,

          marginRight: "0.5vw",
          minHeight: "45px",
          minWidth: "3vw",
          padding: "0.3vw",
        },
      }}
      label={level}
      labelProps={{
        color: isDarkAndYellow ? grey[800] : theme.palette.text.secondary,
        fontWeight: "bold",
      }}
      showWhenEmpty
      textProps={{
        color: isDarkAndYellow ? grey[900] : theme.palette.text.primary,
      }}
    >
      {join(
        map(
          filter(sessionResults, (sr) => {
            return !sr.isElective;
          }),
          (sr) => {
            const sessionStr = `${sr.session}${sr.isAudit ? " audit" : ""}`;
            return sr.result === "WD"
              ? // https://stackoverflow.com/questions/18285291/how-to-do-strike-through-string-for-javascript
                `\u0336${join(
                  map(split(sessionStr, ""), (char) => {
                    return `${char}\u0336`;
                  }),
                  "",
                )}`
              : sessionStr;
          },
        ),
        ", ",
      )}
    </LabeledText>
  );
};

ProgressBox.defaultProps = {
  sessionResults: [],
};
