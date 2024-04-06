import React, { useState, useEffect, useCallback } from 'react';
import { Messages } from '../../background/helpers';

const Work = ({
  // eslint-disable-next-line react/prop-types
  onSend
}) => {
  const [percentage, setPercentage] = useState(0)
  const [time, setTime] = useState({seconds: 0, minutes: 0, hours: 0})
  const [startAndEnd, setStartAndEnd] = useState({start: "0:00", end: "0:45"})

  const handleTime = useCallback((res) => {
    if (res.state === "done"){
      onSend()
    }
    else{
      setPercentage(res.percentage)
      setTime({seconds: res.seconds, minutes: res.minutes, hours: res.hours})
    }
  }, [onSend])

  useEffect(() => {
    chrome.runtime.sendMessage({command: Messages.GETTIME})
      .then(handleTime)
    
    chrome.runtime.sendMessage({command: Messages.GETSTARTANDEND})
    .then(res => setStartAndEnd({start: res.start, end: res.end}))


    const interval = setInterval(() => {
      chrome.runtime.sendMessage({command: Messages.GETTIME})
      .then(handleTime)
    }, 1000)

    return () => clearInterval(interval)
  }, [handleTime])

  return (
    <>
      <span><b>Focus</b>App</span>
      <div>
        Time left: <b>{`${time.hours}h ${time.minutes}m ${time.seconds}s`}</b><br />
      </div>

      <div className="progress-bar-labels">
        <div>{startAndEnd.start}</div>
        <div>{startAndEnd.end}</div>
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
