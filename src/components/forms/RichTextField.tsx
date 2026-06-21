"use client";

import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";

import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { FormField } from "@/components/forms/FormField";

export interface RichTextFieldProps<T extends FieldValues> {
  readonly name: FieldPath<T>;
  readonly control: Control<T>;
  readonly id: string;
  readonly label: string;
  readonly error?: string | undefined;
  readonly placeholder?: string;
  readonly minHeight?: number;
  readonly showStats?: boolean;
}

export function RichTextField<T extends FieldValues>({
  name,
  control,
  id,
  label,
  error,
  placeholder,
  minHeight,
  showStats,
}: RichTextFieldProps<T>): React.JSX.Element {
  return (
    <FormField id={id} label={label} error={error}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <RichTextEditor
            id={id}
            value={field.value ?? null}
            onChange={field.onChange}
            onBlur={field.onBlur}
            {...(placeholder ? { placeholder } : {})}
            {...(minHeight !== undefined ? { minHeight } : {})}
            {...(showStats !== undefined ? { showStats } : {})}
            error={Boolean(error)}
          />
        )}
      />
    </FormField>
  );
}
