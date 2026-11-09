"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import styles from "./login.module.css";

type Mode = "login" | "register";
type Message = { kind: "error" | "success"; text: string } | null;

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [message, setMessage] = useState<Message>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already logged in? Go straight to the dashboard.
  useEffect(() => {
    api
      .me()
      .then((me) => me.authenticated && router.replace("/dashboard"))
      .catch(() => {});
  }, [router]);

  function toggle() {
    setMode((m) => (m === "login" ? "register" : "login"));
    setMessage(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const fd = new FormData(e.currentTarget);
    const field = (name: string) => String(fd.get(name) ?? "");

    if (mode === "register" && field("password") !== field("passwordConfirm")) {
      setMessage({ kind: "error", text: "Passwords do not match" });
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        await api.login(field("username"), field("password"));
        setMessage({ kind: "success", text: "Login successful! Redirecting..." });
      } else {
        await api.register(field("username"), field("email"), field("password"));
        setMessage({ kind: "success", text: "Registration successful! Redirecting to dashboard..." });
      }
      setTimeout(() => router.replace("/dashboard"), 800);
    } catch (error) {
      setMessage({ kind: "error", text: errorMessage(error) });
      setSubmitting(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        {message && (
          <div className={message.kind === "error" ? styles.error : styles.success} role="alert">
            {message.text}
          </div>
        )}

        {/* `key` resets the form fields when switching modes */}
        <form key={mode} onSubmit={handleSubmit}>
          <h1 className={styles.title}>PushPace {isLogin ? "Login" : "Register"}</h1>

          <div className={styles.group}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder={isLogin ? "Enter your username" : "Choose a username"}
              required
            />
          </div>

          {!isLogin && (
            <div className={styles.group}>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" placeholder="Enter your email" required />
            </div>
          )}

          <div className={styles.group}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder={isLogin ? "Enter your password" : "Create a password (min 6 chars)"}
              minLength={isLogin ? undefined : 6}
              required
            />
          </div>

          {!isLogin && (
            <div className={styles.group}>
              <label htmlFor="passwordConfirm">Confirm Password</label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm your password"
                required
              />
            </div>
          )}

          <div className={styles.buttons}>
            <button type="submit" className={`${styles.btn} ${styles.primary}`} disabled={submitting}>
              {isLogin ? "Login" : "Register"}
            </button>
            <button type="button" className={`${styles.btn} ${styles.secondary}`} onClick={toggle}>
              {isLogin ? "Register" : "Back to Login"}
            </button>
          </div>

          <div className={styles.toggleText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" className={styles.link} onClick={toggle}>
              {isLogin ? "Register here" : "Login here"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
