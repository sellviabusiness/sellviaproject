"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthFlowForm } from "@/components/auth/auth-flow-form";
import { AuthFooter } from "@/components/auth/auth-footer";
import { AuthLink } from "@/components/auth/auth-link";
import { PasswordInput } from "@/components/ui/password-input";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ResetPasswordView() {
  const router = useRouter();
  const [confirmValue, setConfirmValue] = useState("");
  const [mismatch, setMismatch] = useState(false);

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader heading="Set a new password" subheading="Enter your new password below." />

        {/*
          "Confirm password" is a client-only convenience field — it has no `name`, so it's
          never part of the submitted FormData; the provider only ever receives `password`.
          Checked here (capture phase, before AuthFlowForm's own submit handler runs) by
          comparing against the real password input's live DOM value.
        */}
        <div
          onSubmitCapture={(e) => {
            const form = e.target as HTMLFormElement;
            const passwordInput = form.querySelector<HTMLInputElement>('input[name="password"]');
            if (passwordInput && passwordInput.value !== confirmValue) {
              e.preventDefault();
              e.stopPropagation();
              setMismatch(true);
            } else {
              setMismatch(false);
            }
          }}
        >
          <AuthFlowForm
            kind="settings"
            extraFields={
              <PasswordInput
                label="Confirm password"
                required
                autoComplete="new-password"
                value={confirmValue}
                onChange={(e) => {
                  setConfirmValue(e.target.value);
                  if (mismatch) setMismatch(false);
                }}
                invalid={mismatch}
                errorText={mismatch ? "Passwords don't match." : undefined}
              />
            }
            successBanner={(flow) =>
              flow.state === "success" ? (
                <div className="space-y-4">
                  <Alert variant="success">Your password has been updated.</Alert>
                  <Button className="w-full" onClick={() => router.push("/dashboard")}>
                    Continue
                  </Button>
                </div>
              ) : null
            }
          />
        </div>
      </AuthCard>

      <AuthFooter>
        <AuthLink href="/login" emphasis>Back to login</AuthLink>
      </AuthFooter>
    </AuthLayout>
  );
}
