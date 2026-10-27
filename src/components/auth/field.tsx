import type { ComponentProps, ReactNode } from "react";

export const inputClass =
  "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-pea-primary focus:outline-none focus:ring-2 focus:ring-pea-primary/20 aria-[invalid=true]:border-red-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:aria-[invalid=true]:border-red-400";

export const errorId = (name: string) => `${name}-error`;

// Wires aria-invalid / aria-describedby so screen readers announce the error with the field (AS-08).
export const invalidProps = (name: string, error?: string) =>
  error ? { "aria-invalid": true, "aria-describedby": errorId(name) } : {};

export function FieldError({ name, error }: { name: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={errorId(name)} className="mt-1 text-sm text-red-700 dark:text-red-400">
      {error}
    </p>
  );
}

// A labelled text input with its error message underneath.
export function TextField({
  name,
  label,
  error,
  hint,
  ...props
}: { name: string; label: string; error?: string; hint?: ReactNode } & ComponentProps<"input">) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {label}
      </label>
      <input id={name} name={name} className={inputClass} {...invalidProps(name, error)} {...props} />
      {hint ? <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p> : null}
      <FieldError name={name} error={error} />
    </div>
  );
}

export function FormMessage({ message }: { message?: string }) {
  return (
    <div role="alert" aria-live="assertive">
      {message ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {message}
        </p>
      ) : null}
    </div>
  );
}

export function SubmitButton({ pending, children }: { pending: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-pea-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-pea-primary-dark disabled:opacity-60"
    >
      {pending ? "กำลังดำเนินการ…" : children}
    </button>
  );
}
