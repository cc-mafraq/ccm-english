import { Autocomplete, AutocompleteProps, Grid, GridProps, TextField } from "@mui/material";
import React from "react";
import { Controller, FieldError, useFormContext } from "react-hook-form";
import { useInput } from "../../hooks/useInput";

interface GridItemAutocomplete {
  defaultValue?: string[];
  gridProps?: GridProps;
  label: string;
  name?: string;
}

/* A text field to be used on forms */
export const GridItemAutocomplete = (
  props: GridItemAutocomplete &
    Omit<AutocompleteProps<unknown, boolean, boolean, boolean>, "renderInput">,
) => {
  const { defaultValue, label, name, gridProps } = props;
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { name: nameFallback, errorMessage } = useInput(label, errors as FieldError);

  return (
    <Grid direction="column" item xs {...gridProps}>
      <Controller
        control={control}
        defaultValue={defaultValue}
        name={name ?? nameFallback}
        render={({ field: { onChange, onBlur, ref } }) => {
          return (
            <Autocomplete
              ref={ref}
              autoSelect
              onBlur={onBlur}
              onChange={(e, data) => {
                return onChange(data);
              }}
              openOnFocus
              renderInput={(params) => {
                return (
                  <TextField
                    label={label}
                    {...params}
                    error={!!errorMessage}
                    helperText={errorMessage}
                    variant="outlined"
                  />
                );
              }}
              {...props}
            />
          );
        }}
      />
    </Grid>
  );
};

GridItemAutocomplete.defaultProps = {
  defaultValue: undefined,
  gridProps: undefined,
  name: undefined,
};
