import React, { useState } from "react";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

function App() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShortUrl("");

    try {
      const res = await fetch(`${BASE_URL}/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to shorten URL");
        return;
      }

      setShortUrl(`${BASE_URL}/${data.data.short_code}`);
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>URL Shortener</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          placeholder="Enter URL"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          style={{ width: "300px", marginRight: "10px" }}
        />
        <button type="submit">Shorten</button>
      </form>
      {shortUrl && (
        <div style={{ marginTop: 20 }}>
          Short URL: <a href={shortUrl} target="_blank">{shortUrl}</a>
        </div>
      )}
      {error && <div style={{ color: "red", marginTop: 20 }}>{error}</div>}
    </div>
  );
}

export default App;