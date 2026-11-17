import { MongoServerError } from "mongodb";
import { linksCollection } from "../../../lib/db";
import { aliasPattern, parseDestination } from "../../../lib/links";
import type { CreateLinkResponse } from "../../../lib/links";

function respond(body: CreateLinkResponse, status: number) {
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !("url" in body)) {
    return respond({ error: "Enter a valid HTTP or HTTPS URL." }, 400);
  }

  const url = parseDestination(body.url);
  if (!url) return respond({ error: "Enter a valid HTTP or HTTPS URL." }, 400);

  const alias = "alias" in body && typeof body.alias === "string" ? body.alias.trim() : "";
  if (!aliasPattern.test(alias)) {
    return respond({ error: "Use 1–64 letters, numbers, hyphens, or underscores for the alias." }, 400);
  }

  try {
    // Using the alias as the ID lets MongoDB reject duplicates.
    await linksCollection().insertOne({ _id: alias, url });
    return respond({ path: `/r/${alias}` }, 201);
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return respond({ error: "That alias is already taken." }, 409);
    }

    console.error("Could not save the short link.");
    return respond({ error: "Could not save the link. Try again later." }, 500);
  }
}
