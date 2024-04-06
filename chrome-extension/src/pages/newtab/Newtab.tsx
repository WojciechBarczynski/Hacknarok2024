import withErrorBoundary from '@root/src/shared/hoc/withErrorBoundary';
import withSuspense from '@root/src/shared/hoc/withSuspense';
import 'react-calendar-heatmap/dist/styles.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import './Newtab.css';

const Newtab = () => {
  const getRandomValuesArr = length => Array.from({ length }, () => Math.floor(Math.random() * 100) + 1);
  const getRandomProfilePic = () => `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg`;

  const profilePic = getRandomProfilePic();
  const activity = getRandomValuesArr(30);
  const friend1Activity = getRandomValuesArr(30);
  const friend2Activity = getRandomValuesArr(30);

  const chartData = activity.map((value, index) => ({
    date: new Date(new Date('2022-01-01').getTime() + index * 24 * 60 * 60 * 1000),
    count: value,
    friend1: friend1Activity[index],
    friend2: friend2Activity[index],
  }));

  const heatmapData = activity.map((value, index) => ({
    date: new Date(new Date('2022-01-01').getTime() + index * 24 * 60 * 60 * 1000),
    count: value,
  }));

  return (
    <div className="App">
      <div className="profile">
        <img src={profilePic} alt="Profile Picture" className="profile-pic" />
        <div className="profile-info">
          <h1 className="profile-name">Bjorn Ironside</h1>
          <p className="profile-bio">Viking</p>
        </div>
      </div>
      <div className="data-container">
        <div className="chart">
          <LineChart width={800} height={200} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="friend1" stroke="#82ca9d" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="friend2" stroke="#ffc658" activeDot={{ r: 8 }} />
          </LineChart>
        </div>
        <div className="heatmap">
          <CalendarHeatmap
            startDate={new Date('2022-01-01')}
            endDate={new Date('2022-01-31')}
            values={heatmapData}
            horizontal={false}
            gutterSize={0.5}
            showOutOfRangeDays={false}
          />
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Newtab, <div> Loading ... </div>), <div> Error Occur </div>);
