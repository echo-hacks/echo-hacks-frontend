import React, { useEffect, useState } from 'react';
import './stylesheet.scss';
import Splash from '../Splash';
import { classes } from '../../common/utils';
import Main from '../Main';
import { Route } from 'react-router-dom';
import Learn from '../Learn';

function App() {
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="App">
      <Route path="/" exact component={Main}/>
      <Route path="/learn/:category/:item" exact component={Learn}/>
      <Splash className={classes('splash', splash && 'on')}/>
    </div>
  );
}

export default App;
