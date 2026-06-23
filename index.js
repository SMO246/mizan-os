import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Lock from './Lock';

function Root() {
  const [unlocked, setUnlocked] = React.useState(
    sessionStorage.getItem('mizan_auth') === 'true'
  );
  return unlocked ? <App /> : <Lock onUnlock={() => { sessionStorage.setItem('mizan_auth','true'); setUnlocked(true); }} />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><Root /></React.StrictMode>);
