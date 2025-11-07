import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import DropdownOption from './DropdownOption';
import './Searcher.css'

function Searcher(props) {
  const [searchKey, setSearchKey] = useState('');
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);

  const access_token = props.token;

  const searchSong = async () => {
    const { data } = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
      params: {
        q: searchKey,
        type: 'track',
      },
    });

    if (data && data.tracks && data.tracks.items) {
      setTracks(data.tracks.items);
    }
  };

  const handleSongSelect = (selectedTrack) => {
    setSelectedTrack(selectedTrack);
  };

  return (
    <div className="SearchContainer">
      <div className="SearchInput">
        <input
          className="Name"
          class = "searchInput"
          type="text"
          placeholder="Search By Song Name ..."
          onChange={(e) => {
            setSearchKey(e.target.value);
          }}
        />
        <button className="searchButton" onClick={searchSong}>Search</button>
      </div>
      <div className="SongsBox">
        {tracks.length > 0 && (
          <div className="Dropdown">
            {tracks.map((track) => (
              <div key={track.id} onClick={() => handleSongSelect(track)}>
                <DropdownOption track={track} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Searcher;
