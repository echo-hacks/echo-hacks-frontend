import React, { useEffect, useState } from 'react';
import './stylesheet.scss';
import Splash from '../Splash';
import { classes } from '../../common/utils';

function App() {
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  console.log(classes('splash', splash && 'on'));

  return (
    <div className="App">
      <Splash className={classes('splash', splash && 'on')}/>
    </div>
  );
}

export default App;
