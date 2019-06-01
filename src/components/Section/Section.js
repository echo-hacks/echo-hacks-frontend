import React from 'react';
import './stylesheet.scss';
import { classes } from '../../common/utils';
import sampleVideo from '../../assets/speech/can_you_turn_left_here.mov';

function Section({ className }) {
  return (
    <div className={classes('Section', className)}>
      <span className="word">
        You need to go straight.
      </span>
      <span className="pronunciation">
          You need to go straight.
        </span>
      <video width="480" height="360" controls>
        <source src={sampleVideo} type="video/mov"/>
        Your browser does not support the video tag.
      </video>
      <div>
        Pitch and volume graph
      </div>
    </div>
  );
}

export default Section;
