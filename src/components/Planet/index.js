import React from 'react';
import './stylesheet.scss';
import { classes } from '../../common/utils';
import { Link } from 'react-router-dom';

function Planet({ alphabet, word, sentence, more, className, item, children }) {
  return (
    <Link to={`/learn/${alphabet ? 'alphabet' : word ? 'word' : sentence ? 'sentence' : '???'}/${item}`}
          className={classes('Planet', alphabet && 'alphabet', word && 'word', sentence && 'sentence', more && 'more', className)}>
      {children}
    </Link>
  );
}

export default Planet;
