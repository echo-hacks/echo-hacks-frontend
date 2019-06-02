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
import * as faceapi from 'face-api.js';
import { faStop } from '@fortawesome/free-solid-svg-icons/faStop';
import { setWaveCanvas } from './hmm';
import wave from '../../assets/wave.png';
import SpeechRecognition from 'react-speech-recognition';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { Link } from 'react-router-dom';

const dict = {};
ipaDict.split('\n').forEach(line => {
  const [eng, ipa] = line.split(/\s+/);
  dict[eng] = ipa;
});

faceapi.nets.ssdMobilenetv1.load('/')
  .then(() => console.log('Neural network loaded.'))
  .catch(console.error);

const toIpa = sentence => sentence.split(' ').map(v => dict[v.toLowerCase().replace(/\W/g, '')] || v).join(' ');
const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1);

const exampleRef = createRef();
const previewRef = createRef();
const recordingRef = createRef();
const canvasRef = createRef();
const voiceRef = createRef();

let recordingTimeMS = 5000;
let chunks = null;
let recorder = null;
let currentStage = 'learn';

function log(msg) {
  console.log(msg);
}

function startRecording(stream, lengthInMS) {
  recorder = new MediaRecorder(stream);
  chunks = [];

  recorder.ondataavailable = event => chunks.push(event.data);
  recorder.start();
  recorder.onerror = console.error;

  return recorder;
}

function stop(stream) {
  stream.getTracks().forEach(track => track.stop());
}

const data = {
  'word': {
    'directions': [{
      word: 'Go',
      example: 'go.mp4',
    }, {
      word: 'Left',
      example: 'left.mp4',
    }, {
      word: 'Right',
      example: 'right.mp4',
    }],
  },
  'sentence': {
    'giving-direction': [{
      word: 'It is over there',
      example: 'it_is_over_there.mp4',
    }, {
      word: 'You need to go straight',
      example: 'you_need_to_go_straight.mp4',
    }, {
      word: 'Can you turn left here',
      example: 'can_you_turn_left_here.mp4',
    }],
  },
};

const similarity = (s1, s2) => {
  let longer = s1;
  let shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  const longerLength = longer.length;
  if (longerLength === 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
};

const editDistance = (s1, s2) => {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0)
        costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
};


function Learn({ className, match, transcript, startListening, stopListening, recognition }) {
  const [stage, setStage] = useState('learn'); // learn / record / preview
  const [step, setStep] = useState(0);

  const { category, item } = match.params;
  const steps = (data[category] && data[category][item]) || data['sentence']['giving-direction'];
  const { word, example } = steps[step];

  useEffect(() => {
    let count = 0;
    let lastBox = { top: 0, left: 0, width: 1, height: 1 };
    let timeout = null;

    function onPlay() {
      const video = currentStage === 'record' ? previewRef.current : recordingRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return null;
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
            if (detection) lastBox = detection.relativeBox;
          }).catch(console.error);
      }
      timeout = window.setTimeout(() => onPlay(), 30);
    }

    recognition.lang = 'en-US';
    previewRef.current.onloadedmetadata = () => onPlay();

    return () => window.clearTimeout(timeout);
  }, []);

  const matching = stage === 'preview' && similarity(word, transcript);

  return (
    <div className={classes('Learn', stage, className)}>
      <div className={classes('sectionContainer')}>
        <Section className="sectionExample" word={word}
                 pronunciation={toIpa(word)}>

          <div className="videoContainer">
            <video width="480" height="360" key={example} ref={exampleRef} autoPlay
                   onClick={() => exampleRef.current.play()}>
              <source src={`/speech/${example}`} type="video/mp4"/>
              Your browser does not support the video tag.
            </video>
          </div>
          <img src={wave} className="voice" width="480" height="160"/>
        </Section>
        <div className="divider"/>
        <Section className="sectionAttempt" word={capitalize(transcript)} pronunciation={toIpa(transcript)}>
          <video className="preview" width="480" height="360" controls ref={previewRef} autoPlay muted/>
          <video className="recording" width="480" height="360" controls ref={recordingRef} autoPlay/>
          <div className="videoContainer">
            <canvas className="canvas" width="480" height="360" ref={canvasRef}
                    onClick={() => (currentStage === 'record' ? previewRef.current : recordingRef.current).play()}/>
          </div>
          <canvas className="voice" ref={voiceRef} width="480" height="160"/>
        </Section>
      </div>
      <div className="icon prev" onClick={() => {
        setStep((step + 1) % steps.length);
        setStage('learn');
      }}>
        <FontAwesomeIcon icon={faChevronLeft} fixedWidth/>
      </div>
      <div className="icon next" onClick={() => {
        setStep((step + steps.length - 1) % steps.length);
        setStage('learn');
      }}>
        <FontAwesomeIcon icon={faChevronRight} fixedWidth/>
      </div>
      <div className="icon mic" onClick={() => {
        if (stage === 'learn') {
          currentStage = 'record';
          setStage(currentStage);
        } else if (stage === 'record') {
          currentStage = 'preview';
          setStage(currentStage);
        } else if (stage === 'preview') {
          currentStage = 'record';
          setStage(currentStage);
        }

        if (currentStage === 'record') {
          setWaveCanvas(voiceRef.current);
          const preview = previewRef.current;
          preview.srcObject = null;
          navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          }).then(stream => {
            preview.srcObject = stream;
            preview.captureStream = preview.captureStream || preview.mozCaptureStream;
            return new Promise(resolve => preview.onplaying = resolve);
          }).then(() => {
            startRecording(preview.captureStream(), recordingTimeMS);
          });
          startListening();
        } else if (currentStage === 'preview') {
          setWaveCanvas(null);
          const recording = recordingRef.current;
          const preview = previewRef.current;
          if (recorder && recorder.state === 'recording') recorder.stop();
          recording.src = null;
          stop(preview.srcObject);
          window.setTimeout(() => {
            let recordedBlob = new Blob(chunks, { type: 'video/webm' });
            recording.src = URL.createObjectURL(recordedBlob);

            log('Successfully recorded ' + recordedBlob.size + ' bytes of ' +
              recordedBlob.type + ' media.');
          }, 500);
          stopListening();
        }
      }} style={stage === 'preview' ? {
        backgroundColor: `rgba(${(1 - matching) * 255}, ${matching * 255}, 0)`,
      } : {}}>
        {
          stage === 'record' ?
            <FontAwesomeIcon icon={faStop} fixedWidth/> :
            stage === 'learn' ?
              <FontAwesomeIcon icon={faMicrophone} fixedWidth/> :
              <span>{matching * 100 | 0}%</span>
        }
      </div>
      <Link className="close" to="/">
        <FontAwesomeIcon fixedWidth icon={faTimes}/>
      </Link>
    </div>
  );
}

export default SpeechRecognition({ autoStart: false, continuous: false })(Learn);
