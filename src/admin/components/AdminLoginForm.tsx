"use client";

import { useAuth } from "@/admin/context/AdminAuthContext";
import { Button, FieldError, Input, Label } from "@/shared/ui";
import { useId, useState } from "react";

export function AdminLoginForm() {
  const { login, loginError, clearLoginError, status } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const baseId = useId();
  const userFieldId = `${baseId}-username`;
  const passwordFieldId = `${baseId}-password`;

  const busy = status === "loading";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearLoginError();
    await login(username.trim(), password);
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="flex w-full flex-col gap-6"
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-primary">
          Admin sign in
        </h1>
        <p className="text-sm leading-relaxed text-secondary">
          Use your administrator username and password.
        </p>
      </div>

      {loginError ? <FieldError>{loginError}</FieldError> : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor={userFieldId} requiredIndicator>
          Username
        </Label>
        <Input
          id={userFieldId}
          name="username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={busy}
          aria-invalid={!!loginError}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={passwordFieldId} requiredIndicator>
          Password
        </Label>
        <Input
          id={passwordFieldId}
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={busy}
          aria-invalid={!!loginError}
        />
      </div>

      <Button type="submit" variant="primary" className="w-full" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
