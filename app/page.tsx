"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { CreateLinkRequest, CreateLinkResponse } from "../lib/links";

export default function Home() {
  const [result, setResult] = useState<CreateLinkResponse | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const error = result && "error" in result ? result.error : "";
  const path = result && "path" in result ? result.path : "";
  const shortUrl = path ? new URL(path, window.location.origin).href : "";

  async function shorten(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const input: CreateLinkRequest = {
      url: String(form.get("url") ?? ""),
      alias: String(form.get("alias") ?? ""),
    };

    setResult(null);
    setCopyStatus("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data: CreateLinkResponse = await response.json();
      setResult(data);
    } catch {
      setResult({ error: "Could not connect. Try again." });
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopyStatus("Copied to clipboard.");
    } catch {
      setCopyStatus("Select the short link to copy it manually.");
    }
  }

  return (
    <main>
      <h1>URL Shortener</h1>
      <form onSubmit={shorten}>
        <label htmlFor="url">Destination URL</label>
        <input id="url" name="url" type="url" placeholder="https://example.com" required />

        <label htmlFor="alias">Custom alias</label>
        <div className="alias-field">
          <span aria-hidden="true">/r/</span>
          <input
            id="alias"
            name="alias"
            placeholder="enter link here"
            maxLength={64}
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            required
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Shorten URL"}
        </button>
        {error && <p className="error" role="alert">{error}</p>}
      </form>

      <div aria-live="polite">
        {shortUrl && (
          <section className="result">
            <label htmlFor="short-url">Your short link</label>
            <div className="copy-row">
              <input
                id="short-url"
                value={shortUrl}
                onFocus={(event) => event.currentTarget.select()}
                readOnly
              />
              <button type="button" onClick={copyLink}>Copy</button>
            </div>
            {copyStatus && <p>{copyStatus}</p>}
          </section>
        )}
      </div>
    </main>
  );
}
