import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic Anime-Inspired Form
// Dark:  labels #A2AAB8 · error #D67C7C · desc #6F7785
// Light: labels #6C7380 · error #C76B6B · desc #9AA1AE
// ─────────────────────────────────────────────────────────────────────────────

const Form = FormProvider;

// ─── Context ──────────────────────────────────────────────────────────────────

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  if (!itemContext) {
    throw new Error("useFormField should be used within <FormItem>");
  }

  const fieldState = getFieldState(fieldContext.name, formState);
  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue | null>(null);

// ─── FormItem ─────────────────────────────────────────────────────────────────

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId();

    return (
      <FormItemContext.Provider value={{ id }}>
        <div
          ref={ref}
          className={cn(
            "flex flex-col gap-1.5",
            className,
          )}
          {...props}
        />
      </FormItemContext.Provider>
    );
  },
);
FormItem.displayName = "FormItem";

// ─── FormLabel ────────────────────────────────────────────────────────────────

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(
        // Base label style
        "text-xs font-semibold uppercase tracking-widest",
        "text-muted-foreground dark:text-[#A2AAB8]",
        "transition-colors duration-150",
        // Error state — dusty rose
        error && "text-destructive dark:text-[#D67C7C]",
        className,
      )}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

// ─── FormControl ──────────────────────────────────────────────────────────────

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      // Propagate error state as data attribute so inputs can style themselves
      data-invalid={error ? "" : undefined}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

// ─── FormDescription ──────────────────────────────────────────────────────────

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn(
        "text-xs leading-relaxed",
        "text-[#9AA1AE] dark:text-[#6F7785]",
        className,
      )}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

// ─── FormMessage ──────────────────────────────────────────────────────────────

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : children;

  if (!body) return null;

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn(
        // Layout — sits below the input with a subtle left accent
        "flex items-center gap-1.5",
        "text-xs font-medium leading-relaxed",
        // Dusty Rose error color
        "text-destructive dark:text-[#D67C7C]",
        className,
      )}
      {...props}
    >
      {/* Small error dot indicator */}
      <span
        className="inline-block h-1 w-1 shrink-0 rounded-full bg-destructive dark:bg-[#D67C7C]"
        aria-hidden
      />
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};

// ─────────────────────────────────────────────────────────────────────────────
// USAGE EXAMPLE
// ─────────────────────────────────────────────────────────────────────────────

/*
// Pair with a styled input — the FormControl passes data-invalid for border color:

// In your input component, handle the error state like:
// className={cn(
//   "rounded-xl border px-3.5 py-2.5 text-sm",
//   "bg-[#F4F6FB] dark:bg-[#252C3D]",
//   "border-[#D9DEE8] dark:border-[#2C3445]",
//   "focus:border-[#6E8EF7] dark:focus:border-[#7DA2FF]",
//   "data-[invalid]:border-[#C76B6B] dark:data-[invalid]:border-[#D67C7C]",
//   "data-[invalid]:ring-2 data-[invalid]:ring-[#C76B6B]/15",
// )}

const MyForm = () => {
  const form = useForm({ resolver: zodResolver(schema) });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                We'll only use this to send you important updates.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <input placeholder="cinematic_user" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <button type="submit">Submit</button>
      </form>
    </Form>
  );
};
*/