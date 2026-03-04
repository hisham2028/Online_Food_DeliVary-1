import React from 'react';
import './appDownload.css';
import { assets } from '../../assets/assets';

const AppDownload = () => {
  return (
    <div className="app-download" id="app-download">
      <h2>Download Our Mobile App</h2>
      <p>
        For better experience download our mobile app <br />
        Available on both iOS and Android platforms
      </p>
      <div className="app-download-platforms">
        <img src={assets.play_store} alt="Get it on Google Play" />
        <img src={assets.app_store} alt="Download on the App Store" />
      </div>
    </div>
  );
};

export default AppDownload;
