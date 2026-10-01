"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/lib/api";
import { getFieldError } from "@/lib/form";
import { showToast } from "@/lib/toast";
import { registerSchema } from "@/lib/validations/auth";

export function RegisterForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "TENANT" as "TENANT" | "OWNER",
      password: "",
      confirmPassword: "",
      agreeToTerms: true,
    },
    validators: {
      onSubmit: registerSchema,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      try {
        await authApi.register({
          name: value.name.trim(),
          email: value.email.trim(),
          phone: value.phone?.trim() || undefined,
          role: value.role,
          password: value.password,
        });

        showToast.success("Account created successfully!", {
          description:
            "Welcome to DwellOS. A verification email has been sent.",
        });
        router.push("/properties");
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : typeof err === "object" && err !== null && "message" in err
              ? String((err as { message: unknown }).message)
              : "Registration failed. Please check your details and try again.";
        setErrorMessage(message);
        showToast.error(message, {
          title: "Registration failed",
        });
      }
    },
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Create an account
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Get started with DwellOS today
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 text-sm rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300">
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field name="name">
          {(field) => (
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Full name
              </label>
              <Input
                id="name"
                name={field.name}
                type="text"
                required
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Jane Doe"
                error={
                  field.state.meta.isTouched && field.state.meta.errors.length
                    ? getFieldError(field.state.meta.errors)
                    : undefined
                }
              />
            </div>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Email address
              </label>
              <Input
                id="email"
                name={field.name}
                type="email"
                autoComplete="email"
                required
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="jane@example.com"
                error={
                  field.state.meta.isTouched && field.state.meta.errors.length
                    ? getFieldError(field.state.meta.errors)
                    : undefined
                }
              />
            </div>
          )}
        </form.Field>

        <form.Field name="phone">
          {(field) => (
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Phone number (optional)
              </label>
              <Input
                id="phone"
                name={field.name}
                type="tel"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="+1 555-0199"
                error={
                  field.state.meta.isTouched && field.state.meta.errors.length
                    ? getFieldError(field.state.meta.errors)
                    : undefined
                }
              />
            </div>
          )}
        </form.Field>

        <form.Field name="role">
          {(field) => (
            <div>
              <span className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                I want to
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => field.handleChange("TENANT")}
                  className={`py-2 px-3 text-sm font-medium rounded-lg border text-center transition-colors cursor-pointer ${
                    field.state.value === "TENANT"
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                      : "border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  Rent a Home
                </button>
                <button
                  type="button"
                  onClick={() => field.handleChange("OWNER")}
                  className={`py-2 px-3 text-sm font-medium rounded-lg border text-center transition-colors cursor-pointer ${
                    field.state.value === "OWNER"
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                      : "border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  List Properties
                </button>
              </div>
            </div>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Password
              </label>
              <Input
                id="password"
                name={field.name}
                type="password"
                autoComplete="new-password"
                required
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Create a strong password"
                error={
                  field.state.meta.isTouched && field.state.meta.errors.length
                    ? getFieldError(field.state.meta.errors)
                    : undefined
                }
              />
              <PasswordStrengthIndicator password={field.state.value} />
            </div>
          )}
        </form.Field>

        <form.Field name="confirmPassword">
          {(field) => (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name={field.name}
                type="password"
                autoComplete="new-password"
                required
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Confirm your password"
                error={
                  field.state.meta.isTouched && field.state.meta.errors.length
                    ? getFieldError(field.state.meta.errors)
                    : undefined
                }
              />
            </div>
          )}
        </form.Field>

        <form.Field name="agreeToTerms">
          {(field) => (
            <div className="pt-1">
              <label className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  name={field.name}
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-zinc-900 border-zinc-300 focus:ring-zinc-900"
                />
                <span>
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="underline text-zinc-900 dark:text-zinc-200"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="underline text-zinc-900 dark:text-zinc-200"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {field.state.meta.isTouched &&
                field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    {getFieldError(field.state.meta.errors)}
                  </p>
                )}
            </div>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => [state.isSubmitting]}>
          {([isSubmitting]) => (
            <Button
              type="submit"
              className="w-full mt-4"
              isLoading={isSubmitting}
            >
              Create account
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-zinc-900 px-3 text-zinc-500 dark:text-zinc-400 font-medium">
            Or continue with
          </span>
        </div>
      </div>

      <GoogleButton label="Sign up with Google" />

      <div className="text-center text-sm pt-2 text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-zinc-900 dark:text-white underline underline-offset-4 hover:text-zinc-700"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
