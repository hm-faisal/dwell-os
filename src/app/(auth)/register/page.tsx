import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create an account | DwellOS",
  description:
    "Sign up for DwellOS to find rental housing or manage your properties.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
