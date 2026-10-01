"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/lib/api";
import { getFieldError } from "@/lib/form";
import { showToast } from "@/lib/toast";
import { loginSchema } from "@/lib/validations/auth";

export function LoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      try {
        await authApi.login({
          email: value.email.trim(),
          password: value.password,
        });
        showToast.success("Welcome back!", {
          description: "You have signed in successfully.",
        });
        router.push("/properties");
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : typeof err === "object" && err !== null && "message" in err
              ? String((err as { message: unknown }).message)
              : "Invalid email or password. Please try again.";
        setErrorMessage(message);
        showToast.error(message, {
          title: "Sign in failed",
        });
      }
    },
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Welcome back
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Sign in to your DwellOS account
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
        <form.Field
          name="email"
          validators={{
            onChange: loginSchema.shape.email,
          }}
        >
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
                placeholder="you@example.com"
                error={
                  field.state.meta.isTouched && field.state.meta.errors.length
                    ? getFieldError(field.state.meta.errors)
                    : undefined
                }
              />
            </div>
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: loginSchema.shape.password,
          }}
        >
          {(field) => (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Password
                </label>
              </div>
              <Input
                id="password"
                name={field.name}
                type="password"
                autoComplete="current-password"
                required
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="••••••••"
                error={
                  field.state.meta.isTouched && field.state.meta.errors.length
                    ? getFieldError(field.state.meta.errors)
                    : undefined
                }
              />
            </div>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => [state.isSubmitting]}>
          {([isSubmitting]) => (
            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Sign in
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

      <GoogleButton label="Continue with Google" />

      <div className="text-center text-sm pt-2 text-zinc-600 dark:text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-zinc-900 dark:text-white underline underline-offset-4 hover:text-zinc-700"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
