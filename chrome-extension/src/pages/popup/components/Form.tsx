import React, { useState, useEffect } from 'react';
import { Messages } from '../../background';

const Form = ({
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

  const parseTime = () => {
    const tempStartTime = startTime.split(":")
    const tempEndTime = endTime.split(":")

    let hours = +tempEndTime[0] - (+tempStartTime[0])
    let minutes = +tempEndTime[1] - (+tempStartTime[1])

    if (minutes < 0) {
      hours -= 1
      minutes += 60
    }

    return hours * 60 * 60 + minutes * 60
  }

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
        onSend()
        const time = parseTime();
        chrome.runtime.sendMessage({ command: Messages.START, time: time })
      }}>
        Begin working
      </button>
    </>
  );
};

export default Form
