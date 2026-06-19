import type { Metadata } from "next";

import { AuthRedirect } from "@/components/auth/auth-redirect";
import { sanitizeCallbackUrl } from "@/lib/callback-url";

import { FirebaseSignUpForm } from "./_components/firebase-signup-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new account",
};

type SignUpPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { callbackUrl } = await searchParams;
  const redirectTo = sanitizeCallbackUrl(callbackUrl);

  return (
    <AuthRedirect callbackUrl={redirectTo}>
      <FirebaseSignUpForm callbackUrl={redirectTo} />
    </AuthRedirect>
  );
}
