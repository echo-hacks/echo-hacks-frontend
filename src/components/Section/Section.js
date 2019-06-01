import React from 'react';
import './stylesheet.scss';
import { classes } from '../../common/utils';
import sampleVideo from '../../assets/speech/can_you_turn_left_here.mp4';

function Section({ className, word }) {
  return (
    <div className={classes('Section', className)}>
      <span className="word">{word}</span>
      <span className="pronunciation">
          You need to go straight.
        </span>
      <video width="480" height="360" controls>
        <source src={sampleVideo} type="video/mp4"/>
        Your browser does not support the video tag.
      </video>
      <div>
        Pitch and volume graph
      </div>
    </div>
  );
}

export default Section;
