import { useState } from "react";
import "./App.css";


function App() {
  const [view, setView] = useState("home"); // "home" or "history"

  const [character, setCharacter] = useState("");
  const [location, setLocation] = useState("");
  const [theme, setTheme] = useState("");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [stories, setStories] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const generateStory = async () => {
    setLoading(true);
    setStory("");
    setSaved(false);

    const response = await fetch("http://localhost:3000/api/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ character, location, theme }),
    });

    const data = await response.json();
    setStory(data.story);
    setLoading(false);
  };

  const saveStory = async () => {
    setSaving(true);

    await fetch("http://localhost:3000/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ character, location, theme, story }),
    });

    setSaving(false);
    setSaved(true);
  };

  const loadHistory = async () => {
    setView("history");
    setLoadingHistory(true);

    const response = await fetch("http://localhost:3000/api/stories");
    const data = await response.json();
    setStories(data);

    setLoadingHistory(false);
  };

  const deleteStory = async (id) => {
    await fetch(`http://localhost:3000/api/stories/${id}`, {
      method: "DELETE",
    });

    setStories(stories.filter((s) => s.id !== id));
  };

  return (
    <div className="page">
      <div className="card">
        <div className="nav">
          <button className="navBtn" onClick={() => setView("home")}>
            🏠 Home
          </button>
          <button className="navBtn" onClick={loadHistory}>
            📚 History
          </button>
        </div>

        {view === "home" && (
          <>
            <h1>🌙 AI Bedtime Story Generator</h1>
            <p className="subtitle">Tell me who, where, and what it's about</p>

            <input
              className="input"
              placeholder="Character (e.g. Dragon)"
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
            />
            <input
              className="input"
              placeholder="Place (e.g. Magic Forest)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <input
              className="input"
              placeholder="Theme (e.g. Friendship)"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            />

            <button className="button" onClick={generateStory} disabled={loading}>
              {loading ? "Generating..." : "✨ Generate Story"}
            </button>

            {story && (
              <>
                <div className="story">{story}</div>
                <button
                  className="button saveButton"
                  onClick={saveStory}
                  disabled={saving || saved}
                >
                  {saved ? "✅ Saved!" : saving ? "Saving..." : "💾 Save Story"}
                </button>
              </>
            )}
          </>
        )}

        {view === "history" && (
          <>
            <h1>📚 Saved Stories</h1>

            {loadingHistory && <p>Loading...</p>}

            {!loadingHistory && stories.length === 0 && (
              <p className="subtitle">No saved stories yet.</p>
            )}

            {stories.map((s) => (
              <div key={s.id} className="historyItem">
                <p className="historyMeta">
                  {s.character_name} • {s.location_name} • {s.theme}
                </p>
                <p className="historyStory">{s.story}</p>
                <button className="deleteButton" onClick={() => deleteStory(s.id)}>
                  🗑️ Delete
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default App;