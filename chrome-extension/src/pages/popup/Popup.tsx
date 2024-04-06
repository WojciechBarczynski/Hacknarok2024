import React, { useState } from 'react';
import background from '@assets/img/background.png';
import '@pages/popup/Popup.css';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import Form from './components/Form';
import Work from './components/Work';

const Popup = () => {
  const [screen, setScreen] = useState<string>("form")

  return (
    <div
      className="App"
    >
      <img src={background} className="App-logo" alt="logo" />
      <div className="container">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
        {screen === "form" && <Form onSend={() => {
          setScreen("work")
        }} />}
        {screen === "work" && <Work onSend={() => {
          setScreen("form")
        }} />}
        <hr />
        <button>
          <span className="material-symbols-outlined">
            account_circle
          </span> Show Profile
        </button>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
