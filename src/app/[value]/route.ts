import { MongoClient } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

let cachedClient: MongoClient | null = null;
let cachedDb: ReturnType<MongoClient["db"]> | null = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(process.env.MONGODB_URI as string, {
    // Optional: Add connection options if needed
  });
  const db = client.db(process.env.DATABASE_NAME);

  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

interface UrlDoc {
  short_code: string;
  long_url: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Record<string, string> }
) {
  const { value } = params;

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection<UrlDoc>("urls");

    const urlDoc = await collection.findOne({ short_code: value });
    if (!urlDoc) {
      return NextResponse.json({ error: "Short URL not found" }, { status: 404 });
    }
    return NextResponse.redirect(urlDoc.long_url, 302);
  } catch (error) {
    console.error("Error in /[value]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}