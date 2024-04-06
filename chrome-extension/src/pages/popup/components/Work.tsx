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
  const [endTime, setEndTime] = useState()
  const [percentage, setPercentage] = useState(30)

  return (
    <>
      <span><b>Focus</b>App</span>
      <div>
        Time left: <b>2h 5m</b><br />
      </div>

      <div className="progress-bar-labels">
        <div>14:00</div>
        <div>16:35</div>
      </div>
      <div className="progress-bar-container">
        <div
          className="progress-bar"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <button onClick={() => onSend()}>
        Work finished
      </button>
    </>
  );
};

export default Work
