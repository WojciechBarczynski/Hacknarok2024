import { useState, useEffect, useCallback } from "react"
import withErrorBoundary from '@root/src/shared/hoc/withErrorBoundary';
import withSuspense from '@root/src/shared/hoc/withSuspense';
import 'react-calendar-heatmap/dist/styles.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import './Newtab.css';
import background from '@assets/img/background.png';
import { Messages } from "../background/helpers";

const today = new Date();

const Newtab = () => {
  const [randomValues, setRandomValues] = useState(getRange(365).map(index => {
    return {
      date: shiftDate(today, -index),
      count: getRandomInt(1, 5),
    };
  }));

  const [people, setPeople] = useState([])
  const [percentage, setPercentage] = useState(0)
  const [startAndEnd, SetStartAndEnd] = useState({start: "0:00", end: "0:00"})

  const getRandomProfilePic = () => `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg`;

  const handleTime = useCallback((res) => {
    console.log(res)
    if (res.state === "done"){
      return
    }
    else{
      setPercentage(res.percentage)
    }
  }, [])

  useEffect(() => {
    chrome.runtime.sendMessage({command: Messages.GETTIME})
      .then(handleTime)
    
    chrome.runtime.sendMessage({command: Messages.GETSTARTANDEND})
    .then(res => SetStartAndEnd({start: res.start, end: res.end}))


    const interval = setInterval(() => {
      chrome.runtime.sendMessage({command: Messages.GETTIME})
      .then(handleTime)
    }, 1000)

    return () => clearInterval(interval)
  }, [handleTime])


  const [profilePic, setProfilePic] = useState(getRandomProfilePic())

  const generatePeople = (number) => {
    for (let i = 0; i < number; i++) {
      fetch('https://randomuser.me/api/')
        .then(response => response.json())
        .then(data => {
          const user = data.results[0];
          const name = `${user.name.title} ${user.name.first} ${user.name.last}`;
          const img = user.picture.large;

          setPeople(prev => [...prev, {
            nick: name,
            points: Math.floor(Math.random() * 100000), // Generate random points
            img: img
          }])
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
          return null;
        })
    }
  }

  useEffect(() => {
    generatePeople(10)
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="imageBox">
          <img src={background} className="App-logo" alt="logo" />
          <div className="imageOverlay">
            <div className="profile">
              <div className="profile-pic">
                <img src={profilePic} alt="Profile Picture" />
              </div>
              <div className="profile-details">
                <div>Welcome, <b>Blondyna</b><br /></div>
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
              </div>
            </div>
          </div>
        </div>
        <div className="data-container">
          <h1>Point earnings</h1>
          <div className="heatmap">
            <CalendarHeatmap
              startDate={shiftDate(today, -365)}
              endDate={today}
              values={randomValues}
              horizontal={true}
              gutterSize={0.5}
              showOutOfRangeDays={false}
              classForValue={value => {
                if (!value) {
                  return 'color-empty';
                }
                return `color-${Math.min(value.count, 4)}`;
              }}
            />
          </div>
          <h1>Rankings</h1>
          <div className="rankings">
            <div className="switches">
              <div>Daily</div>
              <div>Weekly</div>
              <div>Monthly</div>
              <div>All time</div>
            </div>
            <div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Friend Name</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    people.sort((a, b) => a.points < b.points ? 1 : -1).map((item, index) => <tr>
                      <td className="profPic"><img src={item.img} alt="Profile Picture" /></td>
                      <td>{item.nick}</td>
                      <td>{item.points}</td>
                    </tr>)
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function shiftDate(date, numDays) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + numDays);
  return newDate;
}

function getRange(count) {
  return Array.from({ length: count }, (_, i) => i);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default withErrorBoundary(withSuspense(Newtab, <div> Loading ... </div>), <div> Error Occur </div>);
