import React from 'react';
import './stylesheet.scss';
import logoBig from '../../assets/logo-big.png';
import logoSmall from '../../assets/logo-small.png';
import { classes } from '../../common/utils';

function Splash({ className }) {
  return (
    <div className={classes('Splash', className)}>
      <div className="logo-container">
        <img src={logoBig} className="logo-big"/>
        <img src={logoSmall} className="logo-small"/>
      </div>
    </div>
  );
}

export default Splash;
