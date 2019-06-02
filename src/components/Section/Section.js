import React from 'react';
import './stylesheet.scss';
import { classes } from '../../common/utils';

function Section({ className, word, pronunciation, videoRef, children }) {
  return (
    <div className={classes('Section', className)}>
      <span className="word">{word}</span>
      <span className="pronunciation">{pronunciation || '...'}</span>
      {children}
    </div>
  );
}

export default Section;
