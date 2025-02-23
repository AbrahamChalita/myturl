interface Request {
    // Define the properties of the Request interface as needed
}

interface ResponseInit {
    status: number;
    headers: { [key: string]: string };
}

export async function GET(request: Request): Promise<Response> {
    return new Response(JSON.stringify({ message: "Hello from the Next.js API!" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    } as ResponseInit);
}