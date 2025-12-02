import React, { useState } from "react";
import axios from "axios";
import { generateSongs } from "./utils";
import DropdownOption from "./DropdownOption";
import "./Searcher.css";

const MOCK_TRACKS = [
  {
    id: "s1",
    name: "Blinding Lights",
    artists: [{ name: "The Weeknd" }],
    album: {
      images: [
        {
          url: "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=400&h=400&fit=crop",
        },
      ],
    },
  },
  {
    id: "s2",
    name: "Save Your Tears",
    artists: [{ name: "The Weeknd" }],
    album: {
      images: [
        {
          url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=400&fit=crop",
        },
      ],
    },
  },
];

function Searcher(props) {
  const [searchKey, setSearchKey] = useState("");
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [moodSettings, setMoodSettings] = useState({
    energy: 0.5,
    danceability: 0.5,
    valence: 0.5,
  });
  const [generatedSongs, setGeneratedSongs] = useState([]);

  const access_token = props.token;
  const apiClient = props.apiClient;

  const searchSong = async () => {
    const query = searchKey.trim().toLowerCase();

    if (!query) {
      setTracks([]);
      return;
    }

    if (!access_token) {
      const filtered = MOCK_TRACKS.filter((track) => {
        const name = track.name.toLowerCase();
        const artistNames = track.artists
          .map((a) => a.name.toLowerCase())
          .join(" ");
        return name.includes(query) || artistNames.includes(query);
      });
      setTracks(filtered);
      return;
    }

    try {
      const { data } = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        params: {
          q: searchKey,
          type: "track",
        },
      });

      if (data && data.tracks && data.tracks.items) {
        setTracks(data.tracks.items);
      }
    } catch (err) {
      console.error("Spotify search error:", err);
      const filtered = MOCK_TRACKS.filter((track) => {
        const name = track.name.toLowerCase();
        const artistNames = track.artists
          .map((a) => a.name.toLowerCase())
          .join(" ");
        return name.includes(query) || artistNames.includes(query);
      });
      setTracks(filtered);
    }
  };

  const handleSongSelect = (track) => {
    setSelectedTrack(track);
    setGeneratedSongs([]);
  };

  const handleGenerateClick = async () => {
    if (!selectedTrack) return;

    try {
      const songs = await generateSongs(selectedTrack, moodSettings, apiClient);
      setGeneratedSongs(songs);
      console.log("Generated Songs:", songs);
    } catch (e) {
      console.error("Error generating songs:", e);
    }
  };

  return (
    <div className="searcher">
      <div className="searcher__background">
        <div className="searcher__orb searcher__orb--1"></div>
        <div className="searcher__orb searcher__orb--2"></div>
        <div className="searcher__orb searcher__orb--3"></div>
      </div>

      <div className="searcher__content">
        <header className="searcher__header">
          <img
            src="/logo-bg-removed.png"
            alt="Cadence"
            className="searcher__logo-img"
          />
          <p className="searcher__tagline">
            Discover music that matches your mood
          </p>
        </header>

        <div className="searcher__layout">
          <div className="searcher__main">
            <div className="search-box">
              <div className="search-box__input-wrapper">
                <svg
                  className="search-box__icon"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M16 16L20 20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  className="search-box__input"
                  type="text"
                  placeholder="Search for a song or artist..."
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") searchSong();
                  }}
                />
                <button className="search-box__button" onClick={searchSong}>
                  Search
                </button>
              </div>
            </div>

            <div className="results">
              {tracks.length > 0 && (
                <div className="results__list">
                  {tracks.map((track, index) => (
                    <div
                      key={track.id}
                      className={`results__item ${
                        selectedTrack && selectedTrack.id === track.id
                          ? "results__item--active"
                          : ""
                      }`}
                      onClick={() => handleSongSelect(track)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <DropdownOption track={track} />
                    </div>
                  ))}
                </div>
              )}

              {tracks.length === 0 && searchKey.trim() !== "" && (
                <div className="results__empty">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="results__empty-icon"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M8 15s1.5 2 4 2 4-2 4-2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle cx="9" cy="10" r="1" fill="currentColor" />
                    <circle cx="15" cy="10" r="1" fill="currentColor" />
                  </svg>
                  <span>No tracks found</span>
                </div>
              )}
            </div>
          </div>

          <div className="searcher__sidebar">
            {selectedTrack && (
              <div className="seed-card">
                <div className="seed-card__badge">Seed Track</div>
                <div className="seed-card__content">
                  {selectedTrack.album?.images?.[0]?.url && (
                    <div className="seed-card__cover-wrapper">
                      <img
                        src={selectedTrack.album.images[0].url}
                        alt={selectedTrack.name}
                        className="seed-card__cover"
                      />
                      <div className="seed-card__cover-glow"></div>
                    </div>
                  )}
                  <div className="seed-card__info">
                    <h3 className="seed-card__title">{selectedTrack.name}</h3>
                    <p className="seed-card__artist">
                      {selectedTrack.artists?.map((a) => a.name).join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedTrack && (
              <div className="mood-panel">
                <h2 className="mood-panel__title">Tune Your Mood</h2>

                <div className="mood-slider">
                  <div className="mood-slider__header">
                    <span className="mood-slider__label">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="mood-slider__icon"
                      >
                        <path
                          d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Energy
                    </span>
                    <span className="mood-slider__value">
                      {Math.round(moodSettings.energy * 100)}%
                    </span>
                  </div>
                  <div className="mood-slider__track">
                    <div
                      className="mood-slider__fill mood-slider__fill--energy"
                      style={{ width: `${moodSettings.energy * 100}%` }}
                    ></div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(moodSettings.energy * 100)}
                      onChange={(e) =>
                        setMoodSettings({
                          ...moodSettings,
                          energy: Number(e.target.value) / 100,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="mood-slider">
                  <div className="mood-slider__header">
                    <span className="mood-slider__label">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="mood-slider__icon"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M12 6v6l4 2"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      Danceability
                    </span>
                    <span className="mood-slider__value">
                      {Math.round(moodSettings.danceability * 100)}%
                    </span>
                  </div>
                  <div className="mood-slider__track">
                    <div
                      className="mood-slider__fill mood-slider__fill--dance"
                      style={{ width: `${moodSettings.danceability * 100}%` }}
                    ></div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(moodSettings.danceability * 100)}
                      onChange={(e) =>
                        setMoodSettings({
                          ...moodSettings,
                          danceability: Number(e.target.value) / 100,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="mood-slider">
                  <div className="mood-slider__header">
                    <span className="mood-slider__label">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="mood-slider__icon"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M8 14s1.5 2 4 2 4-2 4-2"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <circle cx="9" cy="10" r="1" fill="currentColor" />
                        <circle cx="15" cy="10" r="1" fill="currentColor" />
                      </svg>
                      Valence
                    </span>
                    <span className="mood-slider__value">
                      {Math.round(moodSettings.valence * 100)}%
                    </span>
                  </div>
                  <div className="mood-slider__track">
                    <div
                      className="mood-slider__fill mood-slider__fill--valence"
                      style={{ width: `${moodSettings.valence * 100}%` }}
                    ></div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(moodSettings.valence * 100)}
                      onChange={(e) =>
                        setMoodSettings({
                          ...moodSettings,
                          valence: Number(e.target.value) / 100,
                        })
                      }
                    />
                  </div>
                </div>

                <button
                  className="mood-panel__generate"
                  onClick={handleGenerateClick}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="mood-panel__generate-icon"
                  >
                    <path
                      d="M12 3v18M3 12h18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Generate Recommendations
                </button>
              </div>
            )}

            {generatedSongs.length > 0 && (
              <div className="generated">
                <h2 className="generated__title">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="generated__title-icon"
                  >
                    <path
                      d="M9 18V5l12-2v13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="6"
                      cy="18"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="18"
                      cy="16"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                  Your Recommendations
                </h2>
                <ul className="generated__list">
                  {generatedSongs.map((song, index) => (
                    <li
                      key={song.id}
                      className="generated__item"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div className="generated__number">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="generated__info">
                        <div className="generated__song-title">
                          {song.title}
                        </div>
                        <div className="generated__artist">{song.artist}</div>
                        <div className="generated__reason">{song.reason}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Searcher;
