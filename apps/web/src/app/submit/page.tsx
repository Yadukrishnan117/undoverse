"use client";

import Link from "next/link";
import { useState } from "react";

type FieldErrors = Partial<
  Record<"projectName" | "tagline" | "conceptUrl" | "repoUrl", string>
>;

const TAGLINE_MAX = 90;

export default function SubmitPage() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [serverMsg, setServerMsg] = useState<string>("");
  const [tagline, setTagline] = useState("");

  function validate(form: HTMLFormElement): {
    ok: boolean;
    data: Record<string, string>;
    errs: FieldErrors;
  } {
    const fd = new FormData(form);
    const data = Object.fromEntries(
      [...fd.entries()].map(([k, v]) => [k, String(v).trim()]),
    ) as Record<string, string>;

    const errs: FieldErrors = {};
    if (!data.projectName) errs.projectName = "Your project needs a name.";
    if (!data.tagline) errs.tagline = "One line on what it does — keep it sharp.";
    else if (data.tagline.length > TAGLINE_MAX)
      errs.tagline = `Tagline is ${data.tagline.length} chars — trim to ${TAGLINE_MAX} or fewer.`;

    const urlOk = (u: string) => /^https?:\/\/.+\..+/.test(u);
    if (data.conceptUrl && !urlOk(data.conceptUrl))
      errs.conceptUrl = "That doesn't look like a full URL (include https://).";
    if (data.repoUrl && !urlOk(data.repoUrl))
      errs.repoUrl = "That doesn't look like a full URL (include https://).";
    if (!data.conceptUrl && !data.repoUrl)
      errs.repoUrl = "Give us at least one link — a demo or the repo.";

    return { ok: Object.keys(errs).length === 0, data, errs };
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const { ok, data, errs } = validate(form);
    setErrors(errs);
    if (!ok) {
      setStatus("idle");
      return;
    }

    setStatus("sending");
    setServerMsg("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setServerMsg(
          json.error ??
            "Something went sideways on our end. Give it another go in a minute?",
        );
        return;
      }
      setStatus("done");
      form.reset();
      setTagline("");
    } catch {
      setStatus("error");
      setServerMsg(
        "Couldn't reach the server. Check your connection and try once more.",
      );
    }
  }

  if (status === "done") {
    return (
      <div className="container-content py-24">
        <div className="card mx-auto max-w-lg p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--ok)]/15">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="m5 13 4 4L19 7"
                stroke="var(--ok)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-bold">Submission received 🌴</h1>
          <p className="mt-3 text-[var(--muted)]">
            Thanks for adding to the verse. A human from 72BPM will take a look,
            and you&apos;ll hear back once it&apos;s reviewed. No bots, no black box.
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <Link href="/#projects" className="btn btn-ghost">
              Back to projects
            </Link>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setStatus("idle")}
            >
              Submit another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-content py-16">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="text-sm text-[var(--muted)] hover:text-[var(--fg-strong)]"
        >
          ← Back home
        </Link>

        <h1 className="mt-6 text-3xl font-extrabold sm:text-4xl">
          Submit your undo
        </h1>
        <p className="mt-3 text-lg text-[var(--muted)]">
          Built a small site that fixes one real, annoyingly-specific problem? Tell
          us about it. We review every submission by hand — if it fits the ethos, it
          gets a subdomain in the verse.
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-10 space-y-6">
          <Field
            name="projectName"
            label="Project name"
            placeholder="e.g. busundo"
            error={errors.projectName}
            required
          />

          <div>
            <label htmlFor="tagline" className="label">
              Tagline <span className="text-[var(--muted)]">(one line)</span>
            </label>
            <input
              id="tagline"
              name="tagline"
              className="input"
              placeholder="What does it do, in one breath?"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              maxLength={TAGLINE_MAX + 20}
              aria-invalid={!!errors.tagline}
              aria-describedby={errors.tagline ? "tagline-err" : "tagline-help"}
              required
            />
            <div className="mt-1.5 flex items-center justify-between text-xs">
              {errors.tagline ? (
                <span id="tagline-err" className="text-[var(--danger)]">
                  {errors.tagline}
                </span>
              ) : (
                <span id="tagline-help" className="text-[var(--muted)]">
                  Make it impossible to misunderstand.
                </span>
              )}
              <span
                className={`tabular-nums ${
                  tagline.length > TAGLINE_MAX
                    ? "text-[var(--danger)]"
                    : "text-[var(--muted)]"
                }`}
              >
                {tagline.length}/{TAGLINE_MAX}
              </span>
            </div>
          </div>

          <Field
            name="conceptUrl"
            label="Live demo / concept URL"
            placeholder="https://your-project.example.com"
            error={errors.conceptUrl}
            type="url"
          />

          <Field
            name="repoUrl"
            label="Repository URL"
            placeholder="https://github.com/you/your-project"
            error={errors.repoUrl}
            type="url"
            help="A demo or a repo — at least one is required."
          />

          {status === "error" && (
            <p
              role="alert"
              className="rounded-md border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]"
            >
              {serverMsg}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={status === "sending"}
            >
              {status === "sending" ? "Sending…" : "Submit for review"}
            </button>
            <p className="text-xs text-[var(--muted)]">
              Reviewed by a human. We&apos;ll never auto-reject.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  placeholder,
  error,
  type = "text",
  required = false,
  help,
}: {
  name: string;
  label: string;
  placeholder?: string;
  error?: string;
  type?: string;
  required?: boolean;
  help?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}{" "}
        {!required && <span className="text-[var(--muted)]">(optional)</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className="input"
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-err` : help ? `${name}-help` : undefined}
        required={required}
      />
      {error ? (
        <p id={`${name}-err`} className="mt-1.5 text-xs text-[var(--danger)]">
          {error}
        </p>
      ) : help ? (
        <p id={`${name}-help`} className="mt-1.5 text-xs text-[var(--muted)]">
          {help}
        </p>
      ) : null}
    </div>
  );
}
