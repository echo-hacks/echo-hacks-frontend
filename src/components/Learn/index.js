import React, { useState } from 'react';
import './stylesheet.scss';
import { classes } from '../../common/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons/faMicrophone';
import Section from '../Section/Section';

function Learn({ className }) {
  const [attempting, setAttempting] = useState(false);

  return (
    <div className={classes('Learn', className)}>
      <div className={classes('sectionContainer', attempting && 'attempting')}>
        <Section/>
        {
          attempting &&
          <div className="divider"/>
        }
        {
          attempting &&
          <Section/>
        }
      </div>
      <div className="icon prev">
        <FontAwesomeIcon icon={faChevronLeft} fixedWidth/>
      </div>
      <div className="icon next">
        <FontAwesomeIcon icon={faChevronRight} fixedWidth/>
      </div>
      <div className="icon mic" onClick={() => setAttempting(!attempting)}>
        <FontAwesomeIcon icon={faMicrophone} fixedWidth/>
      </div>
    </div>
  );
}

export default Learn;
