import { Box, Typography, TypographyProps, useTheme } from "@mui/material";
import { blue, blueGrey, deepOrange, green, lightGreen, pink, purple, yellow } from "@mui/material/colors";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartMeta,
  Legend,
  LinearScale,
  PluginOptionsByType,
  Title,
  Tooltip,
} from "chart.js";
import { _DeepPartialObject } from "chart.js/dist/types/utils";
import ChartDataLabels, { Context } from "chartjs-plugin-datalabels";
import {
  filter,
  get,
  includes,
  isEmpty,
  keys,
  map,
  rangeRight,
  round,
  sortBy,
  sum,
  toString,
  values,
} from "lodash";
import moment from "moment";
import React, { useEffect, useMemo } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { LabeledNumberBox, PlacementPrediction } from "../components/Statistics";
import { useAppStore, useStatistics, useStudentStore } from "../hooks";
import { genderedLevels, Nationality, StatusDetails } from "../interfaces";
import { getAllInitialSessions, sortObjectByValues } from "../services";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels, Title, CategoryScale, LinearScale, BarElement);

const INDENT = 3;
const pieChartSizeProps = {
  height: "50vh",
  maxHeight: "500px",
  maxWidth: "500px",
  minHeight: "350px",
  minWidth: "250px",
  width: "33vw",
};

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

  const chartPlugins = (
    title: string,
    noLabels?: boolean,
  ): _DeepPartialObject<PluginOptionsByType<"pie" | "bar">> => {
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
          return percentage > 3.5 ? `${noLabels ? "" : `${label}\n`}${percentage.toFixed(1)}%` : "";
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

  const initialSessions = useMemo(() => {
    return getAllInitialSessions(students);
  }, [students]);

  useEffect(() => {
    if (!statistics.totalRegistered) navigate("/epd", { replace: true });
  }, [navigate, statistics]);

  return statistics.totalRegistered && (role === "admin" || role === "faculty") ? (
    <Box paddingBottom={5}>
      <Box display="flex" flexDirection="row" flexWrap="wrap">
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
        <Box {...pieChartSizeProps}>
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
              maintainAspectRatio: false,
              plugins: chartPlugins("Active Students by Nationality"),
            }}
          />
        </Box>
        <Box {...pieChartSizeProps}>
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
              maintainAspectRatio: false,
              plugins: chartPlugins("All Students by Nationality"),
            }}
          />
        </Box>
      </Box>
      <Typography variant="h5" {...textProps} marginLeft="3%">
        Levels
      </Typography>
      <Box display="flex" flexDirection="row">
        <Box {...pieChartSizeProps}>
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
              maintainAspectRatio: false,
              plugins: chartPlugins("Active Students by Level"),
            }}
          />
        </Box>
        <Box {...pieChartSizeProps}>
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
              maintainAspectRatio: false,
              plugins: chartPlugins("All Students by Level"),
            }}
          />
        </Box>
      </Box>
      <Typography variant="h5" {...textProps} marginLeft="3%">
        Gender
      </Typography>
      <Box display="flex" flexDirection="row">
        <Box {...pieChartSizeProps}>
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
              maintainAspectRatio: false,
              plugins: chartPlugins("Active Students by Gender"),
            }}
          />
        </Box>
        <Box {...pieChartSizeProps}>
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
              maintainAspectRatio: false,
              plugins: chartPlugins("All Students by Gender"),
            }}
          />
        </Box>
      </Box>
      <Typography variant="h5" {...textProps} marginLeft="3%">
        Sessions Completed
      </Typography>
      <Box display="flex" flexDirection="row">
        <Box {...pieChartSizeProps}>
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
              maintainAspectRatio: false,
              plugins: chartPlugins("Active Students by Number of Sessions Completed"),
            }}
          />
        </Box>
        <Box {...pieChartSizeProps}>
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
              maintainAspectRatio: false,
              plugins: chartPlugins("All Students by Number of Sessions Completed"),
            }}
          />
        </Box>
      </Box>
      <Typography variant="h5" {...textProps} marginLeft="3%">
        Active Student Status
      </Typography>
      <Box display="flex" flexDirection="row">
        <Box {...pieChartSizeProps}>
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
              maintainAspectRatio: false,
              plugins: chartPlugins("Active Students by Status"),
            }}
          />
        </Box>
        <Box {...pieChartSizeProps}>
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
              maintainAspectRatio: false,
              plugins: chartPlugins("Active Students by Status Details", true),
            }}
          />
        </Box>
      </Box>
      <Typography variant="h5" {...textProps} marginLeft="3%">
        Initial Sessions
      </Typography>
      <Box display="flex" flexDirection="row">
        <Box {...pieChartSizeProps}>
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
              maintainAspectRatio: false,
              plugins: chartPlugins("Active Students by Initial Year"),
            }}
          />
        </Box>
        <Box height="50vh" maxHeight="500px" width="60vw">
          <Bar
            data={{
              datasets: [
                {
                  backgroundColor: colors,
                  data: map(initialSessions, (session) => {
                    return get(statistics.sessionCounts, session);
                  }),
                },
              ],
              labels: initialSessions,
            }}
            options={{
              maintainAspectRatio: false,
              plugins: {
                datalabels: {
                  font: {
                    weight: "bold",
                  },
                },
                legend: {
                  display: false,
                },
                title: {
                  color: theme.palette.text.primary,
                  display: true,
                  text: "Initial Sessions",
                },
              },
            }}
          />
        </Box>
      </Box>
      <Typography variant="h5" {...textProps} marginLeft="3%">
        Overall Results
      </Typography>
      <Box display="flex" flexDirection="row" flexWrap="wrap">
        <Box {...pieChartSizeProps}>
          <Pie
            data={{
              datasets: [
                {
                  backgroundColor: colors,
                  data: [
                    statistics.overallResultCounts.P,
                    statistics.overallResultCounts.F,
                    statistics.overallResultCounts.WD,
                  ],
                },
              ],
              labels: ["Pass", "Fail", "Withdraw"],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: chartPlugins("All Overall Results"),
            }}
          />
        </Box>
        <Box height="50vh" width="60vw">
          <Bar
            data={{
              datasets: [
                {
                  backgroundColor: colors[0],
                  data: map(genderedLevels, (level) => {
                    return get(statistics.overallResultCountsByLevel, `${level}.P`);
                  }),
                  label: "Pass",
                  stack: "overallResults",
                },
                {
                  backgroundColor: colors[1],
                  data: map(genderedLevels, (level) => {
                    return get(statistics.overallResultCountsByLevel, `${level}.F`);
                  }),
                  label: "Fail",
                  stack: "overallResults",
                },
                {
                  backgroundColor: colors[2],
                  data: map(genderedLevels, (level) => {
                    return get(statistics.overallResultCountsByLevel, `${level}.WD`);
                  }),
                  label: "Withdraw",
                  stack: "overallResults",
                },
              ],
              labels: genderedLevels,
            }}
            options={{
              maintainAspectRatio: false,
              plugins: {
                datalabels: {
                  font: {
                    weight: "bold",
                  },
                  formatter: (value: number, context: Context) => {
                    const label = get(context.chart.data.labels, context.dataIndex);
                    const passDatasetIsHidden = context.chart.getDatasetMeta(0)?.hidden;
                    const failDatasetIsHidden = context.chart.getDatasetMeta(1)?.hidden;
                    const withdrawDatasetIsHidden = context.chart.getDatasetMeta(2)?.hidden;
                    const passValue = passDatasetIsHidden
                      ? 0
                      : Number(get(statistics.overallResultCountsByLevel, `${toString(label)}.P`));
                    const failValue = failDatasetIsHidden
                      ? 0
                      : Number(get(statistics.overallResultCountsByLevel, `${toString(label)}.F`));
                    const withdrawValue = withdrawDatasetIsHidden
                      ? 0
                      : Number(get(statistics.overallResultCountsByLevel, `${toString(label)}.WD`));
                    const percentage = (value * 100) / (passValue + failValue + withdrawValue);
                    return `${percentage.toFixed(0)}%`;
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
                  text: "Overall Results by Level",
                },
              },
            }}
          />
        </Box>
      </Box>
      <Typography variant="h5" {...textProps} marginLeft="3%">
        Original Placement Levels
      </Typography>
      <Box {...pieChartSizeProps}>
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
            maintainAspectRatio: false,
            plugins: chartPlugins("Original Placement Levels"),
          }}
        />
      </Box>
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
      <Box width="67%">
        <Bar
          data={{
            datasets: [
              {
                backgroundColor: colors,
                data: values(statistics.droppedOutReasonCounts),
              },
            ],
            labels: keys(statistics.droppedOutReasonCounts),
          }}
          options={{
            maintainAspectRatio: false,
            plugins: {
              datalabels: {
                font: {
                  weight: "bold",
                },
              },
              legend: {
                display: false,
              },
              title: {
                color: theme.palette.text.primary,
                display: true,
                text: "Withdraw Reasons",
              },
            },
          }}
        />
      </Box>
      <Box display="flex" flexDirection="row" flexWrap="wrap">
        <LabeledNumberBox
          color={colors[6]}
          containerProps={{ marginLeft: "10px" }}
          label="Average Age at Program Entry"
          number={Number(round(statistics.averageAge, 1).toFixed(1))}
        />
        <LabeledNumberBox color={colors[6]} label="Teachers" number={statistics.totalTeachers} />
        <LabeledNumberBox color={colors[6]} label="English Teachers" number={statistics.totalEnglishTeachers} />
        <LabeledNumberBox color={colors[6]} label="Illiterate Arabic" number={statistics.totalIlliterateArabic} />
        <LabeledNumberBox
          color={colors[6]}
          label="Illiterate English"
          number={statistics.totalIlliterateEnglish}
        />
      </Box>
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
