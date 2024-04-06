import React, { useState, useEffect } from 'react';
import logo from '@assets/img/logo.svg';
import background from '@assets/img/background.png';
import '@pages/popup/Popup.css';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';

const Popup = () => {
  const currentTime = (() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
  })();

  const [startTime, setStartTime] = useState(currentTime)
  const [endTime, setEndTime] = useState()

  return (
    <div
      className="App"
    >
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
      <img src={background} className="App-logo" alt="logo" />
      <div className="container">
        <span><b>Focus</b>App</span>
        <div className="inputWithLabel">
          <label htmlFor="startTime" className="label">Start Time</label>
          <input id="startTime" className="timeInput" type="time" required value={startTime} onChange={e => setStartTime(e?.target?.value)} />
        </div>
        <div className="inputWithLabel">
          <label htmlFor="endTime" className="label">End Time</label>
          <input id="endTime" className="timeInput" type="time" required value={endTime} onChange={e => setEndTime(e?.target?.value)} />
        </div>
        <button>
          Rozpocznij
        </button>
        <hr />
        <button>
          <span class="material-symbols-outlined">
            account_circle
          </span> Wyświetl Profil
        </button>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
