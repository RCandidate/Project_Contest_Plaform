import { TransformFnParams } from "class-transformer";

export const trim = ({ value }: TransformFnParams) =>
  typeof value === "string" ? value.trim() : value;

export const trimOrUndefined = ({ value }: TransformFnParams) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};
