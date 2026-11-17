import { MongoClient } from "mongodb";

type Link = {
  _id: string;
  url: string;
};

let client: MongoClient | undefined;

export function linksCollection() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is missing");

  client ??= new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  return client.db("cs303_mp5").collection<Link>("links");
}
