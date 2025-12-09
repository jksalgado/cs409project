const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config(); // reads .env in project root

const app = express();
app.use(cors());
app.use(express.json());

// ------------------------
// Spotify auth config
// ------------------------
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

// ------------------------
// Neon / Postgres config
// ------------------------
const DATABASE_URL = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Neon
});

// ------------------------
// Spotify auth callback
// ------------------------
app.post("/api/auth/callback", async (req, res) => {
  const { code } = req.body;

  try {
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    res.json(tokenResponse.data);
  } catch (error) {
    console.error(
      "Token exchange error:",
      error.response?.data || error.message
    );
    res.status(400).json({ error: "Failed to exchange code for token" });
  }
});

// ------------------------
// Save mix + songs to Neon
// ------------------------
app.post("/api/save-mix", async (req, res) => {
  try {
    const {
      spotify_user_id,
      seed_track_id,
      seed_track_name,
      energy,
      danceability,
      valence,
      songs,
    } = req.body;

    if (
      !spotify_user_id ||
      !seed_track_id ||
      !seed_track_name ||
      !Array.isArray(songs) ||
      songs.length === 0
    ) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const mixResult = await client.query(
        `
        INSERT INTO mixes 
          (spotify_user_id, seed_track_id, seed_track_name, energy, danceability, valence)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
        `,
        [
          spotify_user_id,
          seed_track_id,
          seed_track_name,
          energy,
          danceability,
          valence,
        ]
      );

      const mixId = mixResult.rows[0].id;

      for (const song of songs) {
        await client.query(
          `
          INSERT INTO mix_songs 
            (mix_id, spotify_track_id, title, artist)
          VALUES ($1, $2, $3, $4)
          `,
          [mixId, song.id, song.title, song.artist]
        );
      }

      await client.query("COMMIT");
      res.json({ ok: true, mixId });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error in /api/save-mix transaction:", err);
      res.status(500).json({ ok: false, error: "Failed to save mix" });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error in /api/save-mix:", err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// ------------------------
// Load saved mixes for a user
// ------------------------
app.get("/api/mixes/:spotifyUserId", async (req, res) => {
  const { spotifyUserId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT id,
             seed_track_id,
             seed_track_name,
             energy,
             danceability,
             valence
      FROM mixes
      WHERE spotify_user_id = $1
      ORDER BY id DESC
      LIMIT 10
      `,
      [spotifyUserId]
    );

    res.json({ ok: true, mixes: result.rows });
  } catch (err) {
    console.error("Error in /api/mixes:", err);
    res.status(500).json({ ok: false, error: "Failed to load mixes" });
  }
});

// ------------------------
// Load songs for a specific mix
// ------------------------
app.get("/api/mixes/:mixId/songs", async (req, res) => {
  const mixId = Number(req.params.mixId);
  if (Number.isNaN(mixId)) {
    return res.status(400).json({ ok: false, error: "Invalid mix id" });
  }

  try {
    const result = await pool.query(
      `
      SELECT spotify_track_id, title, artist
      FROM mix_songs
      WHERE mix_id = $1
      ORDER BY id ASC
      `,
      [mixId]
    );

    res.json({ ok: true, songs: result.rows });
  } catch (err) {
    console.error("Error in /api/mixes/:mixId/songs:", err);
    res.status(500).json({ ok: false, error: "Failed to load mix songs" });
  }
});

// ------------------------
// Startup
// ------------------------
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Spotify auth + Neon server running on port ${PORT}`);
});
