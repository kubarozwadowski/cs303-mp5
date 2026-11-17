export type CreateLinkRequest = {
  url: string;
  alias: string;
};

export type CreateLinkResponse = { path: string } | { error: string };

export const aliasPattern = /^[a-zA-Z0-9_-]{1,64}$/;

export function parseDestination(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const input = value.trim();
  if (!/^https?:\/\/[^/\s?#]/i.test(input) || /[\s\\]/.test(input)) {
    return null;
  }

  const url = URL.parse(input);
  return url && !url.username && !url.password ? url.href : null;
}
