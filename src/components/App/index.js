import React, { useEffect, useState } from 'react';
import './stylesheet.scss';
import Splash from '../Splash';
import { classes } from '../../common/utils';
import Main from '../Main';

function App() {
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setSplash(false), /*150*/0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="App">
      {
        !splash &&
        <Main/>
      }
      <Splash className={classes('splash', splash && 'on')}/>
    </div>
  );
}

export default App;
