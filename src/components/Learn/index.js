import React, { createRef, useEffect, useState } from 'react';
import './stylesheet.scss';
import { classes } from '../../common/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons/faMicrophone';
import Section from '../Section/Section';
/* eslint import/no-webpack-loader-syntax: off */
import ipaDict from '!raw-loader!./ipadict.txt';
import sampleVideo from '../../assets/speech/can_you_turn_left_here.mp4';
import SpeechRecognition from 'react-speech-recognition';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

const dict = {};
ipaDict.split('\n').forEach(line => {
  const [eng, ipa] = line.split(/\s+/);
  dict[eng] = ipa;
});

faceapi.nets.ssdMobilenetv1.load('/')
  .then(() => console.log('Neural network loaded.'))
  .catch(console.error);

const toIpa = sentence => sentence.split(' ').map(v => dict[v.toLowerCase().replace(/\W/g, '')] || v).join(' ');

const videoRef = createRef();
const canvasRef = createRef();

function Learn({ className, transcript, startListening, stopListening, recognition }) {
  const [attempting, setAttempting] = useState(false);

  useEffect(() => {
    let count = 0;
    let lastBox = { top: 0, left: 0, width: 1, height: 1 };

    function onPlay() {
      // console.log('onPlay()');
      const video = videoRef.current.video;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      const { left, top, width, height } = lastBox;
      const W = 480;
      const H = 360;
      const factor = 640 / 480;
      context.drawImage(video, (left + width / 2 - 1 / 2 * height / 2) * W * factor, (top + height / 2) * H * factor, height / 2 * W * factor, height / 2 * H * factor, 0, 0, W, H);

      if (++count > 5) {
        count = 0;
        faceapi.detectSingleFace(video)
          .then(detection => {
            lastBox = detection.relativeBox;
          }).catch(console.error);
      }
      setTimeout(() => onPlay(), 30);
    }

    recognition.lang = 'en-US';
    videoRef.current.video.onloadedmetadata = () => onPlay();
  });

  return (
    <div className={classes('Learn', className)}>
      <div className={classes('sectionContainer', attempting && 'attempting')}>
        <Section word="You need to go straight."
                 pronunciation={toIpa('You need to go straight.')}>

          <video width="480" height="360" controls>
            <source src={sampleVideo} type="video/mp4"/>
            Your browser does not support the video tag.
          </video>
        </Section>
        <div className="divider"/>
        <Section word={transcript} pronunciation={toIpa(transcript)}>
          <Webcam className="webcam" width="480" height="360" ref={videoRef}/>
          <canvas width="480" height="360" ref={canvasRef}/>
        </Section>
      </div>
      <div className="icon prev">
        <FontAwesomeIcon icon={faChevronLeft} fixedWidth/>
      </div>
      <div className="icon next">
        <FontAwesomeIcon icon={faChevronRight} fixedWidth/>
      </div>
      <div className="icon mic" onClick={() => {
        setAttempting(!attempting);
        if (!attempting) {
          startListening();
        } else {
          stopListening();
        }
      }}>
        <FontAwesomeIcon icon={faMicrophone} fixedWidth/>
      </div>
    </div>
  );
}

export default SpeechRecognition({ autoStart: false, continuous: false })(Learn);
