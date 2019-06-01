import React, { useEffect, useState } from 'react';
import './stylesheet.scss';
import { classes } from '../../common/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';

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
        <div className="row row-alphabet">
          <div className="planet">
            Consonants Pt. 1
          </div>
          <div className="planet">
            Consonants Pt. 2
          </div>
        </div>
        <div className="row row-alphabet">
          <div className="planet">
            Vowels
          </div>
        </div>
        <div className="row row-word">
          <div className="planet">
            Numbers
          </div>
        </div>
        <div className="row row-word">
          <div className="planet">
            Directions
          </div>
        </div>
        <div className="row row-sentence">
          <div className="planet">
            Asking for Direction
          </div>
        </div>
        <div className="row row-sentence">
          <div className="planet">
            Ordering Food
          </div>
        </div>
        <div className="row row-sentence">
          <div className="planet">
            Common Phrases Pt. 1
          </div>
          <div className="planet">
            Common Phrases Pt. 2
          </div>
        </div>
        <div className="row row-more">
          <div className="planet">
            Coming Soon
          </div>
        </div>
      </div>
      <div className="logOut">
        <FontAwesomeIcon fixedWidth icon={faTimes}/>
      </div>
    </div>
  );
}

export default Main;
