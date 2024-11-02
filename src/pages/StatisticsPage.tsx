import { Box, Typography, TypographyProps, useTheme } from "@mui/material";
import { blue, blueGrey, deepOrange, green, lightGreen, pink, purple, yellow } from "@mui/material/colors";
import { ArcElement, Chart as ChartJS, ChartMeta, Legend, PluginOptionsByType, Title, Tooltip } from "chart.js";
import { _DeepPartialObject } from "chart.js/dist/types/utils";
import ChartDataLabels, { Context } from "chartjs-plugin-datalabels";
import { filter, get, includes, isEmpty, keys, map, rangeRight, round, sortBy, sum, values } from "lodash";
import moment from "moment";
import React, { useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { LabeledNumberBox, PlacementPrediction } from "../components/Statistics";
import { useAppStore, useStatistics, useStudentStore } from "../hooks";
import { Nationality, StatusDetails } from "../interfaces";
import { getAllInitialSessions, sortObjectByValues } from "../services";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels, Title);

const INDENT = 3;

export const StatisticsPage = () => {
  const students = useStudentStore((state) => {
    return state.students;
  });
  const role = useAppStore((state) => {
    return state.role;
  });
  const navigate = useNavigate();

  const theme = useTheme();
  const statistics = useStatistics();
  const textProps: TypographyProps = {
    color: theme.palette.text.primary,
    marginTop: 1,
  };
  const colors = [
    blue[400],
    deepOrange[400],
    purple[300],
    green[500],
    yellow[600],
    pink[300],
    blueGrey[300],
    lightGreen[500],
    blueGrey[100],
  ];

  const pieChartPlugins = (title: string, noLabels?: boolean): _DeepPartialObject<PluginOptionsByType<"pie">> => {
    return {
      datalabels: {
        font: {
          weight: "bold",
        },
        formatter: (value: number, context: Context) => {
          const label = get(context.chart.data.labels, context.dataIndex);
          const { chart } = context;
          const metaData: ChartMeta<"pie"> = chart.getDatasetMeta(0);
          const { total } = metaData;
          const percentage = (value * 100) / (total ?? 1);
          return percentage > 3.5
            ? `${noLabels ? "" : `${label}\n`}${((value * 100) / (total ?? 1)).toFixed(1)}%`
            : "";
        },
      },
      legend: {
        labels: {
          color: theme.palette.text.primary,
        },
      },
      title: {
        color: theme.palette.text.primary,
        display: true,
        text: title,
      },
    };
  };

  const totalWaitingListOutcomes =
    sum(values(statistics.waitingListOutcomeCounts)) - (statistics.waitingListOutcomeCounts.undefined ?? 0);

  useEffect(() => {
    if (!statistics.totalRegistered) navigate("/epd", { replace: true });
  }, [navigate, statistics]);

  return statistics.totalRegistered && (role === "admin" || role === "faculty") ? (
    <Box paddingBottom={5}>
      <Typography variant="h5" {...textProps} marginLeft="3%">
        Program Numbers
      </Typography>
      <Box display="flex" flexDirection="row">
        <LabeledNumberBox color={colors[4]} label="Total Enrollment" number={statistics.totalEnrollment} />
        <LabeledNumberBox color={colors[0]} label="Active Students" number={statistics.totalActive} />
        <LabeledNumberBox color={colors[1]} label="Total Eligible" number={statistics.totalEligible} />
        <LabeledNumberBox color={colors[2]} label="Total Registered" number={statistics.totalRegistered} />
        <LabeledNumberBox color={colors[3]} label="Pending Enrollment" number={statistics.totalPending} />
        <LabeledNumberBox
          color={colors[5]}
          label="New Students Next Session"
          number={statistics.totalNewNextSession}
        />
      </Box>
      <Typography variant="h5" {...textProps} marginLeft="3%">
        Nationalities
      </Typography>
      <Box display="flex" flexDirection="row" marginTop="5px">
        <Box width="33%">
          <Pie
            data={{
              datasets: [
                {
                  backgroundColor: colors,
                  data: [
                    statistics.activeNationalityCounts[Nationality.JDN],
                    statistics.activeNationalityCounts[Nationality.SYR],
                    sum(values(statistics.activeNationalityCounts)) -
                      statistics.activeNationalityCounts[Nationality.JDN] -
                      statistics.activeNationalityCounts[Nationality.SYR] -
                      (statistics.activeNationalityCounts[Nationality.UNKNWN] ?? 0),
                    statistics.activeNationalityCounts[Nationality.UNKNWN],
                  ],
                },
              ],
              labels: [Nationality.JDN, Nationality.SYR, "Other", "Unknown"],
            }}
            options={{
              plugins: pieChartPlugins("Active Students by Nationality"),
            }}
          />
        </Box>
        <Box width="33%">
          <Pie
            data={{
              datasets: [
                {
                  backgroundColor: colors,
                  data: [
                    statistics.nationalityCounts[Nationality.JDN],
                    statistics.nationalityCounts[Nationality.SYR],
                    sum(values(statistics.nationalityCounts)) -
                      statistics.nationalityCounts[Nationality.JDN] -
                      statistics.nationalityCounts[Nationality.SYR] -
                      (statistics.nationalityCounts[Nationality.UNKNWN] ?? 0),
                    statistics.nationalityCounts[Nationality.UNKNWN],
                  ],
                },
              ],
              labels: [Nationality.JDN, Nationality.SYR, "Other", "Unknown"],
            }}
            options={{
              plugins: pieChartPlugins("All Students by Nationality"),
            }}
          />
        </Box>
        <Box width="33%" />
      </Box>
      <Typography variant="h5" {...textProps} marginLeft="3%">
        Levels
      </Typography>
      <Box display="flex" flexDirection="row">
        <Box width="33%" />
        <Box width="33%">
          <Pie
            data={{
              datasets: [
                {
                  backgroundColor: colors,
                  data: map(
                    sortBy(
                      map(keys(statistics.activeLevelCounts), (key, i) => {
                        return [key, values(statistics.activeLevelCounts)[i]];
                      }),
                      ([key]: [string]) => {
                        return key === "PL1" ? "L0" : key;
                      },
                    ),
                    ([, value]: [string, number]) => {
                      return value;
                    },
                  ),
                },
              ],
              labels: sortBy(keys(statistics.activeLevelCounts), (level) => {
                return level === "PL1" ? "L0" : level;
              }),
            }}
            options={{
              plugins: pieChartPlugins("Active Students by Level"),
            }}
          />
        </Box>
        <Box width="33%">
          <Pie
            data={{
              datasets: [
                {
                  backgroundColor: colors,
                  data: map(
                    sortBy(
                      map(keys(statistics.levelCounts), (key, i) => {
                        return [key, values(statistics.levelCounts)[i]];
                      }),
                      ([key]: [string]) => {
                        return key === "PL1" ? "L0" : key;
                      },
                    ),
                    ([, value]: [string, number]) => {
                      return value;
                    },
                  ),
                },
              ],
              labels: sortBy(keys(statistics.levelCounts), (level) => {
                return level === "PL1" ? "L0" : level;
              }),
            }}
            options={{
              plugins: pieChartPlugins("All Students by Level"),
            }}
          />
        </Box>
      </Box>
      <Typography variant="h5" {...textProps} marginLeft="3%">
        Gender
      </Typography>
      <Box display="flex" flexDirection="row">
        <Box width="33%">
          <Pie
            data={{
              datasets: [
                {
                  backgroundColor: colors,
                  data: [statistics.activeGenderCounts.M, statistics.activeGenderCounts.F],
                },
              ],
              labels: ["M", "F"],
            }}
            options={{
              plugins: pieChartPlugins("Active Students by Gender"),
            }}
          />
        </Box>
        <Box width="33%">
          <Pie
            data={{
              datasets: [
                {
                  backgroundColor: colors,
                  data: [statistics.genderCounts.M, statistics.genderCounts.F],
                },
              ],
              labels: ["M", "F"],
            }}
            options={{
              plugins: pieChartPlugins("All Students by Gender"),
            }}
          />
        </Box>
        <Box width="33%" />
      </Box>
      <Typography variant="h5" {...textProps} marginLeft="3%">
        Sessions Completed
      </Typography>
      <Box display="flex" flexDirection="row">
        <Box width="33%" />

        <Box width="33%">
          <Pie
            data={{
              datasets: [
                {
                  backgroundColor: colors,
                  data: [
                    statistics.activeSessionsAttendedCounts["0"],
                    statistics.activeSessionsAttendedCounts["1"],
                    statistics.activeSessionsAttendedCounts["2"],
                    sum(values(statistics.activeSessionsAttendedCounts)) -
                      statistics.activeSessionsAttendedCounts["0"] -
                      statistics.activeSessionsAttendedCounts["1"] -
                      statistics.activeSessionsAttendedCounts["2"],
                  ],
                },
              ],
              labels: ["0 sessions", "1 session", "2 sessions", "3+ sessions"],
            }}
            options={{
              plugins: pieChartPlugins("Active Students by Number of Sessions Completed"),
            }}
          />
        </Box>
        <Box width="33%">
          <Pie
            data={{
              datasets: [
                {
                  backgroundColor: colors,
                  data: [
                    statistics.sessionsAttendedCounts["0"],
                    statistics.sessionsAttendedCounts["1"],
                    statistics.sessionsAttendedCounts["2"],
                    sum(values(statistics.sessionsAttendedCounts)) -
                      statistics.sessionsAttendedCounts["0"] -
                      statistics.sessionsAttendedCounts["1"] -
                      statistics.sessionsAttendedCounts["2"],
                  ],
                },
              ],
              labels: ["0 sessions", "1 session", "2 sessions", "3+ sessions"],
            }}
            options={{
              plugins: pieChartPlugins("All Students by Number of Sessions Completed"),
            }}
          />
        </Box>
      </Box>
      <Typography variant="h5" {...textProps} marginLeft="3%">
        Active Student Status
      </Typography>
      <Box display="flex" flexDirection="row">
        <Box width="33%">
          <Pie
            data={{
              datasets: [
                {
                  backgroundColor: colors,
                  data: [statistics.activeStatusCounts.RET, statistics.activeStatusCounts.NEW],
                },
              ],
              labels: ["RET", "NEW"],
            }}
            options={{
              plugins: pieChartPlugins("Active Students by Status"),
            }}
          />
        </Box>
        <Box width="33%">
          <Pie
            data={{
              datasets: [
                {
                  backgroundColor: [colors[0], colors[2], colors[3], colors[4], colors[1]],
                  data: map(
                    filter(
                      [
                        StatusDetails.SE,
                        StatusDetails.SKIP,
                        StatusDetails.RETWD,
                        StatusDetails.NEWWD,
                        StatusDetails.SES1,
                      ],
                      (statusDetail) => {
                        return includes(keys(statistics.activeStatusDetailsCounts), statusDetail);
                      },
                    ),
                    (statusDetail) => {
                      return get(statistics.activeStatusDetailsCounts, statusDetail);
                    },
                  ),
                },
              ],
              labels: filter(
                [
                  StatusDetails.SE,
                  StatusDetails.SKIP,
                  StatusDetails.RETWD,
                  StatusDetails.NEWWD,
                  StatusDetails.SES1,
                ],
                (statusDetail) => {
                  return includes(keys(statistics.activeStatusDetailsCounts), statusDetail);
                },
              ),
            }}
            options={{
              plugins: pieChartPlugins("Active Students by Status Details", true),
            }}
          />
        </Box>
        <Box width="33%" />
      </Box>
      <Typography variant="h5" {...textProps} marginLeft="3%">
        Placement Levels and Initial Sessions
      </Typography>
      <Box display="flex" flexDirection="row">
        <Box width="33%" />
        <Box width="33%">
          <Pie
            data={{
              datasets: [
                {
                  backgroundColor: colors,
                  data: map(
                    sortBy(
                      map(keys(statistics.placementLevelCounts), (key, i) => {
                        return [key, values(statistics.placementLevelCounts)[i]];
                      }),
                      ([key]: [string]) => {
                        return key === "PL1" ? "L0" : key;
                      },
                    ),
                    ([, value]: [string, number]) => {
                      return value;
                    },
                  ),
                },
              ],
              labels: sortBy(keys(statistics.placementLevelCounts), (level) => {
                return level === "PL1" ? "L0" : level;
              }),
            }}
            options={{
              plugins: pieChartPlugins("Original Placement Levels"),
            }}
          />
        </Box>
        <Box width="33%">
          <Pie
            data={{
              datasets: [
                {
                  backgroundColor: colors,
                  data: map(rangeRight(2017, moment().year() + 1), (year) => {
                    return get(statistics.activeInitialYearCounts, year.toString());
                  }),
                },
              ],
              labels: rangeRight(2017, moment().year() + 1),
            }}
            options={{
              plugins: pieChartPlugins("Active Students by Initial Year"),
            }}
          />
        </Box>
      </Box>
      <Typography {...textProps} fontWeight="bold">
        Initial Sessions
      </Typography>
      {map(getAllInitialSessions(students), (key) => {
        return (
          <Typography {...textProps} key={`session-${key}`} marginLeft={INDENT}>
            {key}: {get(statistics.sessionCounts, key)}
          </Typography>
        );
      })}
      <Typography {...textProps} fontWeight="bold">
        Placement Registration Rates by Status
      </Typography>
      {map(statistics.placementRegistrationCounts, (placementRegistrationSessionCounts) => {
        return (
          <>
            <Typography {...textProps} fontWeight="bold" marginLeft={INDENT}>
              {placementRegistrationSessionCounts.session}
            </Typography>
            {map(keys(placementRegistrationSessionCounts.inviteCounts), (key) => {
              return (
                <Typography {...textProps} marginLeft={INDENT * 2}>
                  {key}: {get(placementRegistrationSessionCounts.registrationCounts, key)} of{" "}
                  {get(placementRegistrationSessionCounts.inviteCounts, key)} (
                  {(
                    round(
                      get(placementRegistrationSessionCounts.registrationCounts, key) /
                        get(placementRegistrationSessionCounts.inviteCounts, key),
                      2,
                    ) * 100
                  ).toFixed(0)}
                  %)
                </Typography>
              );
            })}
          </>
        );
      })}
      <Typography {...textProps} fontWeight="bold">
        Withdraw Reasons
      </Typography>
      {map(keys(sortObjectByValues(statistics.droppedOutReasonCounts)).reverse(), (key) => {
        return (
          <Typography {...textProps} key={`withdraw-reason-${key}`} marginLeft={INDENT}>
            {key}: {get(statistics.droppedOutReasonCounts, key)}
          </Typography>
        );
      })}
      <Typography {...textProps}>
        Average Age at Program Entry: {round(statistics.averageAge, 1).toFixed(1)}
      </Typography>
      <Typography {...textProps}>Total Teachers: {statistics.totalTeachers}</Typography>
      <Typography {...textProps}>Total English Teachers: {statistics.totalEnglishTeachers}</Typography>
      <Typography {...textProps}>Total Illiterate Arabic: {statistics.totalIlliterateArabic}</Typography>
      <Typography {...textProps}>Total Illiterate English: {statistics.totalIlliterateEnglish}</Typography>
      <PlacementPrediction INDENT={INDENT} textProps={textProps} />
      <Typography {...textProps} fontWeight="bold">
        Waiting List Outcomes
      </Typography>
      {!isEmpty(statistics.waitingListOutcomeCounts) ? (
        map(keys(sortObjectByValues(statistics.waitingListOutcomeCounts)).reverse(), (key) => {
          return (
            key !== "undefined" && (
              <Typography {...textProps} key={`waiting-list0outcome-${key}`} marginLeft={INDENT}>
                Total {key}: {get(statistics.waitingListOutcomeCounts, key)} (
                {(
                  round(get(statistics.waitingListOutcomeCounts, key) / totalWaitingListOutcomes, 2) * 100
                ).toFixed(0)}
                %)
              </Typography>
            )
          );
        })
      ) : (
        <Typography {...textProps} textAlign="center">
          Please go to the Waiting List page then return here to view Waiting List statistics
        </Typography>
      )}
    </Box>
  ) : (
    <></>
  );
};
