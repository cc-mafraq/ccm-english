import { Box, Typography, useTheme } from "@mui/material";
import React from "react";

interface LabeledNumberBoxProps {
  color: string;
  label: string;
  number: number;
}

export const LabeledNumberBox: React.FC<LabeledNumberBoxProps> = ({ color, label, number }) => {
  const theme = useTheme();

  return (
    <Box display="flex" flexDirection="column" marginLeft="4%" marginTop="1%" minWidth="150px" textAlign="center">
      <Box bgcolor={color} paddingLeft={1} paddingRight={1}>
        <Typography fontSize={14}>{label}</Typography>
      </Box>
      <Box border={2} borderColor={color}>
        <Typography color={theme.palette.text.primary} fontSize={50} fontWeight="bold">
          {number}
        </Typography>
      </Box>
    </Box>
  );
};
