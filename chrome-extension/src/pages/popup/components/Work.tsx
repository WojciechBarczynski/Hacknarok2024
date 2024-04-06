import React, { useState, useEffect } from 'react';
import background from '@assets/img/background.png';
import { Messages } from '../../background';

const Work = ({
  onSend
}) => {
  const currentTime = (() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
  })();

  const [startTime, setStartTime] = useState(currentTime)
  const [endTime, setEndTime] = useState(undefined)

  return (
    <>
      <span><b>Focus</b>App</span>
      <div className="inputWithLabel">
        <label htmlFor="startTime" className="label">Start Time</label>
        <input id="startTime" className="timeInput" type="time" required value={startTime} onChange={e => setStartTime(e?.target?.value)} />
      </div>
      <div className="inputWithLabel">
        <label htmlFor="endTime" className="label">End Time</label>
        <input id="endTime" className="timeInput" type="time" required value={endTime} onChange={e => setEndTime(e?.target?.value)} />
      </div>
      <button onClick={() => {
        chrome.runtime.sendMessage({command: Messages.END})
        onSend()
        }}>
        Zakończ
      </button>
    </>
  );
};

export default Work
