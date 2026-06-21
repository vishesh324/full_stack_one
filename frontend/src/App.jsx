import { useState } from "react";
import "./App.css";

const API_URL = "https://bedtime-story-backend-3scv.onrender.com";

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

  const [speakingId, setSpeakingId] = useState(null); // tracks which story is currently being read aloud

  const generateStory = async () => {
    setLoading(true);
    setStory("");
    setSaved(false);
    stopSpeaking();

    const response = await fetch(`${API_URL}/api/story`, {
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

    await fetch(`${API_URL}/api/save`, {
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
    stopSpeaking();

    const response = await fetch(`${API_URL}/api/stories`);
    const data = await response.json();
    setStories(data);

    setLoadingHistory(false);
  };

  const deleteStory = async (id) => {
    await fetch(`${API_URL}/api/stories/${id}`, {
      method: "DELETE",
    });

    setStories(stories.filter((s) => s.id !== id));
  };

  // Stops any speech currently playing
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeakingId(null);
  };

  // Reads the given text aloud, or stops if this same id is already speaking
  const speakStory = (text, id) => {
    // If this exact story is already being read, clicking again stops it
    if (speakingId === id) {
      stopSpeaking();
      return;
    }

    // Cancel any other speech first
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // slightly slower, gentler pace for a bedtime story
    utterance.pitch = 1;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    window.speechSynthesis.speak(utterance);
    setSpeakingId(id);
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

                <div className="storyActions">
                  <button
                    className="button saveButton"
                    onClick={saveStory}
                    disabled={saving || saved}
                  >
                    {saved ? "✅ Saved!" : saving ? "Saving..." : "💾 Save Story"}
                  </button>

                  <button
                    className="button speakButton"
                    onClick={() => speakStory(story, "current")}
                  >
                    {speakingId === "current" ? "⏹ Stop" : "🔊 Read Aloud"}
                  </button>
                </div>
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

                <div className="historyActions">
                  <button
                    className="speakButton small"
                    onClick={() => speakStory(s.story, s.id)}
                  >
                    {speakingId === s.id ? "⏹ Stop" : "🔊 Read Aloud"}
                  </button>
                  <button className="deleteButton" onClick={() => deleteStory(s.id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default App;