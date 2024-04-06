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
  const [endTime, setEndTime] = useState(undefined)

  return (
    <>
      <span><b>Focus</b>App</span>
      Progress Bar
      <button onClick={() => onSend()}>
        Zakończ
      </button>
    </>
  );
};

export default Work
