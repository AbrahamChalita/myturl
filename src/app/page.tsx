"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Copy, ExternalLink, Link as LinkIcon, ArrowRight } from "lucide-react"
 
export default function Home() {
  const [shortUrl, setShortUrl] = useState("")
  const [longUrl, setLongUrl] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function shortenURL() {
    if (!longUrl) {
      setMessage("Please enter a URL!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ long_url: longUrl }),
      });
      const data = await res.json();
      setShortUrl(data.short_url || data.error);
      setMessage("");
      setLoading(false);
    } catch (err) {
      setMessage("Error shortening URL");
      setLoading(false);
    }
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-500 via-blue-900 to-black">
      <Card className="p-24">
        <h1 className="text-3xl font-bold text-center mb-6 text-black">My Tiny URL</h1>
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Input type="url" placeholder="Enter your long URL here" className="w-[100%]" 
              onChange={(e) => setLongUrl(e.target.value)}
              value={longUrl}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 ease-in-out w-[100%]"
              onClick={shortenURL}
            >
              <ArrowRight className="h-4 w-4" />
              <span>
                {loading ? "Shortening..." : "Shorten"}
              </span>
            </Button>
          </div>
          {message && (
            <div className="text-sm text-red-500 text-center">{message}</div>
          )}
          {shortUrl && (
            <div className="bg-blue-100 rounded-md p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <LinkIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">{shortUrl}</span>
              </div>
              <div className="space-x-2">
                <Button variant="ghost" size="sm"
                  onClick={
                    () => {
                      navigator.clipboard.writeText(shortUrl);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? <span className="text-green-500">Copied!</span>: <Copy className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm"
                  onClick={() => window.open(shortUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}