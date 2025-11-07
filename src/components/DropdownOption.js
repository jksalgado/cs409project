import React from 'react';
import './DropdownOption.css'

const DropdownOption = ({ track }) => {
  return (
    <div className="DropdownOption">
      <div className="OptionImageContainer">
        <img src={track.album.images[0].url} alt="Album Cover" className="OptionImage" />
      </div>
      <div className="OptionDetails">
        <div className="OptionTitle">{track.name}</div>
        <div className="OptionArtist">{track.artists.map((artist) => artist.name).join(', ')}</div>
      </div>
    </div>
  );
};

export default DropdownOption;