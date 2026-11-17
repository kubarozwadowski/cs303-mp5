import { redirect } from "next/navigation";
import { linksCollection } from "../../../lib/db";
import { aliasPattern } from "../../../lib/links";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ alias: string }> },
) {
  const { alias } = await params;
  const link = aliasPattern.test(alias)
    ? await linksCollection().findOne({ _id: alias })
    : null;

  if (!link) return new Response("Short link not found.", { status: 404 });

  redirect(link.url);
}
