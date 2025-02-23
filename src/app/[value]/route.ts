import { MongoClient } from "mongodb";

let cachedClient: MongoClient | null = null;
let cachedDb: ReturnType<MongoClient['db']> | null = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(process.env.MONGODB_URI as string)
  const db = client.db(process.env.DATABASE_NAME)

  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

interface RequestParams {
  params: {
    value: string;
  };
}

interface UrlDoc {
  short_code: string;
  long_url: string;
}

export async function GET(request: Request, { params }: RequestParams): Promise<Response> {
  const { value } = params;

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection<UrlDoc>("urls");

    const urlDoc = await collection.findOne({ short_code: value });
    if (!urlDoc) {
      return new Response(
        JSON.stringify({ error: "Short URL not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(null, {
      status: 302,
      headers: { Location: urlDoc.long_url },
    });
  } catch (error) {
    console.error("Error in /[value]:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}