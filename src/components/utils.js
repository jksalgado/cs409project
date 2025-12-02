export const generateSongs = async (seedSong, moodSettings, apiClient) => {
  if (apiClient) {
    const { energy, danceability, valence } = moodSettings;
    const response = await apiClient.get("/v1/recommendations", {
      params: {
        seed_tracks: seedSong.id,
        target_energy: energy,
        target_danceability: danceability,
        target_valence: valence,
      },
    });
    return response.data.tracks;
  }

  return generateMockSongs(seedSong, moodSettings);
};

const generateMockSongs = (seedSong, moodSettings) => {
  const baseEnergy = moodSettings.energy;
  const baseValence = moodSettings.valence;
  const trackName = seedSong.name || seedSong.title || "your selected track";

  return [
    {
      id: "g1",
      title: "Midnight Dreams",
      artist: "Luna Wave",
      album: "Nocturnal",
      duration: "3:42",
      thumbnail:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
      reason: `Recommended because it shares ${Math.round(
        baseEnergy * 100
      )}% energy and ${Math.round(
        baseValence * 100
      )}% valence with your seed track "${trackName}".`,
      energy: Math.min(0.95, baseEnergy + 0.1),
      valence: Math.min(0.95, baseValence + 0.08),
    },
    {
      id: "g2",
      title: "Electric Horizon",
      artist: "Neon Coast",
      album: "Skywave",
      duration: "4:05",
      thumbnail:
        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop",
      reason: `Recommended because it shares ${Math.round(
        baseEnergy * 95
      )}% energy and ${Math.round(
        baseValence * 90
      )}% valence with your seed track "${trackName}".`,
      energy: Math.min(0.98, baseEnergy + 0.12),
      valence: Math.min(0.97, baseValence + 0.1),
    },
    {
      id: "g3",
      title: "Violet Echoes",
      artist: "Astral Bloom",
      album: "Reflections",
      duration: "2:58",
      thumbnail:
        "https://images.unsplash.com/photo-1507875703980-84f7b92febe1?w=400&h=400&fit=crop",
      reason: `Recommended because this track aligns with ${Math.round(
        baseEnergy * 110
      )}% of the energy profile and ${Math.round(
        baseValence * 85
      )}% of the mood of "${trackName}".`,
      energy: Math.min(0.9, baseEnergy + 0.05),
      valence: Math.min(0.93, baseValence + 0.07),
    },
    {
      id: "g4",
      title: "Chrome Streetlights",
      artist: "Echo District",
      album: "Afterglow",
      duration: "3:21",
      thumbnail:
        "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?w=400&h=400&fit=crop",
      reason: `Recommended because it closely matches the ${Math.round(
        baseEnergy * 88
      )}% energy and ${Math.round(
        baseValence * 92
      )}% valence of "${trackName}".`,
      energy: Math.min(0.94, baseEnergy + 0.09),
      valence: Math.min(0.95, baseValence + 0.11),
    },
    {
      id: "g5",
      title: "Crystal Pulse",
      artist: "Nova Circuit",
      album: "Lumina",
      duration: "3:55",
      thumbnail:
        "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=400&h=400&fit=crop",
      reason: `Recommended because it shares ${Math.round(
        baseEnergy * 102
      )}% rhythmic energy and ${Math.round(
        baseValence * 98
      )}% emotional tone with "${trackName}".`,
      energy: Math.min(0.97, baseEnergy + 0.13),
      valence: Math.min(0.96, baseValence + 0.09),
    },
    {
      id: "g6",
      title: "Silver Haze",
      artist: "Moon District",
      album: "Nebula Streets",
      duration: "4:11",
      thumbnail:
        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop",
      reason: `Recommended for its ${Math.round(
        baseEnergy * 93
      )}% energy match and ${Math.round(
        baseValence * 87
      )}% mood similarity with your track "${trackName}".`,
      energy: Math.min(0.92, baseEnergy + 0.06),
      valence: Math.min(0.9, baseValence + 0.05),
    },
  ];
};
