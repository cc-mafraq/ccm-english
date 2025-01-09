import { cloneDeep, get, includes, indexOf, isUndefined, set } from "lodash";
import { useState } from "react";
import { DefaultValues, FieldValues, Path, PathValue, UseFormReturn } from "react-hook-form";
import { useStudentStore } from "./useStores";

export const useFormList = <T extends FieldValues>(
  initialState: unknown[],
  listPath: string,
  methods: UseFormReturn<T, object>,
): [unknown[], () => void, (index?: number) => () => void] => {
  const [list, setList] = useState(initialState);

  const addListItem = () => {
    setList([...list, {}]);
  };

  const removeListItem = (index?: number) => {
    return () => {
      if (isUndefined(index)) return;
      const newList = cloneDeep(methods.getValues(listPath as unknown as Path<T>[]));
      newList.splice(index, 1);
      setList(newList);
      const resetObject = {};
      set(resetObject, listPath, []);
      methods.reset(resetObject as DefaultValues<T>, { keepValues: true });
      methods.setValue(listPath as Path<T>, newList as PathValue<T, Path<T>>);
      if (includes(listPath, "phone")) {
        const subPath = includes(listPath, ".") ? listPath.substring(0, indexOf(listPath, ".") + 1) : "";
        const currentPrimaryPhoneList = get(methods.getValues(), `${subPath}primaryPhone`);
        currentPrimaryPhoneList.splice(index, 1);
        methods.setValue(`${subPath}primaryPhone` as Path<T>, currentPrimaryPhoneList);
      }
    };
  };

  return [list, addListItem, removeListItem];
};

export const useDateInitialState = <T>(datePath: Path<T>) => {
  const selectedStudent = useStudentStore((state) => {
    return state.selectedStudent;
  });
  const dateArr = get(selectedStudent, datePath) as unknown as string[];

  return selectedStudent && dateArr && dateArr?.length > 0 ? dateArr : [""];
};
