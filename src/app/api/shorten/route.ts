import { MongoClient } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: ReturnType<MongoClient['db']> | null = null;

async function connectToDatabase() {
    if(cachedClient && cachedDb) {
        return {
            client: cachedClient,
            db: cachedDb
        }
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI as string)
    const db = client.db(process.env.DATABASE_NAME)

    cachedClient = client;
    cachedDb = db;

    return { client, db }
}

function generateShortId() {
    return Math.random().toString(36).substring(2, 8)
}

interface PostRequest {
    json: () => Promise<{ long_url: string }>;
}

interface UrlDocument {
    long_url: string;
    short_code: string;
    created_at: Date;
    clicks: number;
}

export async function POST(request: PostRequest): Promise<Response> {
    try {
        const { long_url } = await request.json();

        if (!long_url || !/^https?:\/\//.test(long_url)) {
            return new Response(
                JSON.stringify({ error: "Please provide a valid URL starting with http:// or https://" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const { db } = await connectToDatabase();
        const collection = db.collection<UrlDocument>("urls");

        const existing = await collection.findOne(
            { 
                long_url 
            }
        );

        if (existing) {
            return new Response(
                JSON.stringify({ short_url: `http://localhost:3000/${existing.short_code}` }),
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        }


        let short_code: string;
        do {
            short_code = generateShortId();
        } while (await collection.findOne(
            { 
                short_code 
            }
        ));

        await collection.insertOne(
            { 
                long_url, 
                short_code, 
                created_at: new Date(), 
                clicks: 0 
            }
        );

        const short_url = `http://localhost:3000/${short_code}`;
        return new Response(
            JSON.stringify({ short_url }),
            { 
                status: 201, 
                headers: { 
                    "Content-Type": "application/json" 
                } 
            }
        );
    } catch (error) {
        console.error("Error in /api/shorten:", error);
        return new Response(
            JSON.stringify(
                { 
                    error: "Internal server error" 
                }),
            { 
                status: 500, 
                headers: { 
                    "Content-Type": "application/json" 
                }
            }
        );
    }
}