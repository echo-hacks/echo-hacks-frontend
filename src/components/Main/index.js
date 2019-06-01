import React, { useEffect, useState } from 'react';
import './stylesheet.scss';
import { classes } from '../../common/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import Planet from '../Planet';

function Main({ className }) {
  const [rotate, setRotate] = useState(0);

  useEffect(() => {
    let _rotate = 0;
    const listener = e => {
      _rotate += e.deltaX;
      setRotate(_rotate);
      return false;
    };
    document.addEventListener('wheel', listener, true);
    return () => document.removeEventListener('wheel', listener);
  }, []);

  return (
    <div className={classes('Main', className)}>
      <div className="axis">
        <div className="earth" style={{ transform: `rotate(${rotate / 8}deg)` }}/>
        <div className="clouds" style={{ transform: `rotate(${rotate / 24}deg)` }}/>
      </div>
      <div className="planets" style={{ marginLeft: `${rotate / 2}px` }}>
        <div className="row">
          <Planet alphabet item="consonants-1">
            Consonants Pt. 1
          </Planet>
          <Planet alphabet item="consonants-2">
            Consonants Pt. 2
          </Planet>
        </div>
        <div className="row">
          <Planet alphabet item="vowels">
            Vowels
          </Planet>
        </div>
        <div className="row">
          <Planet word item="cardinal-numbers">
            Cardinal Numbers
          </Planet>
          <Planet word item="ordinal-numbers">
            Ordinal Numbers
          </Planet>
        </div>
        <div className="row">
          <Planet word item="directions">
            Directions
          </Planet>
        </div>
        <div className="row">
          <Planet sentence item="giving-direction">
            Giving Direction
          </Planet>
        </div>
        <div className="row">
          <Planet sentence item="ordering-food">
            Ordering Food
          </Planet>
        </div>
        <div className="row">
          <Planet sentence item="common-phrases-1">
            Common Phrases Pt. 1
          </Planet>
          <Planet sentence item="common-phrases-2">
            Common Phrases Pt. 2
          </Planet>
        </div>
        <div className="row">
          <Planet more>
            Coming Soon
          </Planet>
        </div>
      </div>
      <div className="logOut">
        <FontAwesomeIcon fixedWidth icon={faTimes}/>
      </div>
    </div>
  );
}

export default Main;
