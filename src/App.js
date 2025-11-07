import React, { useState, useEffect } from 'react';
import Searcher from './components/Searcher';
import './App.css'; 


function App() {
    const CLIENT_ID = "0ee094bb5b544998a735400b357f542f"
    const REDIRECT_URI = "http://localhost:3000"
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
    const RESPONSE_TYPE = "token"
  

    const [token, setToken] = useState("");

    useEffect(() => { 
        const hash = window.location.hash;
        let token = window.localStorage.getItem("token");
  
        if (hash && hash) {
          const token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];
            window.location.hash = "";
            window.localStorage.setItem("token", token);
        }

        setToken(token)
    }, [])

    const logout = () => {
        setToken("");
        window.localStorage.removeItem("token");
    }

    return (
      <div className="App">
        <header className="App-header">
          <div className="LoginContainer">
            <h2>Musical Matchmaker</h2>
            {!token ? 
              <div > 
                <a className = "logInButton" href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>
                 Login to Spotify
               </a>
              </div> 
              :
              <div> 
                <Searcher token={token} />
                <button className= "logOut"onClick={logout}>Logout</button> 
              </div>
            }
          </div>
        </header>
      </div>
    );
}

export default App;