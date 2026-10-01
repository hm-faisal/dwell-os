import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in | DwellOS",
  description:
    "Sign in to your DwellOS account to manage properties and rooms.",
};

export default function LoginPage() {
  return <LoginForm />;
}
