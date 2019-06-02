// pinch = 음정 값. 0~512. 소리가 너무 작을경우 -1
// volume = 소리 크기 값. 0~255
// onDataReceived : 125ms마다 실시간으로 인식된 값을 전달함
let pinchList = [];
let volumeList = [];
let canvas = null;

export const setWaveCanvas = el => canvas = el;

function onDataReceived(pinch, volume) {
  if (!canvas) return;
  pinchList.push(pinch);
  volumeList.push(volume);

  let ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#1a0f35';

  for (let i = 0; i < volumeList.length; i++) {
    ctx.fillRect(i * 5, 100 - volumeList[i] / 2, 5, volumeList[i]);
  }
  ctx.strokeStyle = '#6eb4e3';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 150 - pinchList[0] / 0.9);
  for (let i = 1; i < pinchList.length - 1; i++) {
    ctx.lineTo(i * 5, 150 - pinchList[i] / 0.9);
  }
  // ctx.moveTo(pinchList.length*10, pinchList[pinchList.length-1]);
  ctx.stroke();
  if (pinchList.length > 96) {
    pinchList.shift();
    volumeList.shift();
  }

}

// onGraphDataReceived : 3초마다 125ms 단위로 기록된 24개의 데이터를 리턴함
function onGraphDataReceived(pinchList, volumeList) {
  console.log(pinchList, volumeList);
}

//////////////////////////////////////////////////////
// 음성데이터 추출 부분
//////////////////////////////////////////////////////
function Microphone(_fft) {

  function map(value, flag, peak_volume, min, max) {
    return [value, flag, peak_volume, min, max];
  }

  let FFT_SIZE = _fft || 1024;

  this.spectrum = new Uint8Array(FFT_SIZE / 2);
  this.data = [];
  this.volume = this.vol = 0;
  this.peak_volume = 0;

  let self = this;
  let audioContext = new AudioContext();

  let SAMPLE_RATE = audioContext.sampleRate;
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

  window.addEventListener('load', init, false);

  function init() {
    try {
      startMic(new AudioContext());
    } catch (e) {
      console.error(e);
      alert('Web Audio API is not supported in this browser');
    }
  }

  let pinchList = [];
  let volumeList = [];

  function startMic(context) {

    navigator.getUserMedia({ audio: true }, processSound, error);

    function processSound(stream) {

      console.log('processSound');
      // analyser extracts frequency, waveform, and other data
      let analyser = context.createAnalyser();
      analyser.smoothingTimeConstant = 0.2;
      analyser.fftSize = FFT_SIZE;

      let node = context.createScriptProcessor(FFT_SIZE * 2, 1, 1);
      node.onaudioprocess = function () {
        // console.log("bass" + self.getBass())
        // getByteFrequencyData returns the amplitude for each frequency
        // mixData = self.getMix()
        // bass = self.getMapRMS(mixData.bass)
        // mid = self.getMapRMS(mixData.mids)
        // high = self.getMapRMS(mixData.highs)
        // console.log("bass : " + parseInt(bass) + " mid : " + parseInt(mid) + " high : " + parseInt(high))
        // console.log("spectrum : " + self.spectrum)


        analyser.getByteFrequencyData(self.spectrum);
        self.data = adjustFreqData(self.spectrum);

        // getByteTimeDomainData gets volumes over the sample time
        //analyser.getByteTimeDomainData(dataArray);
        self.vol = self.getRMS(self.spectrum);
        // get peak
        if (self.vol > self.peak_volume) self.peak_volume = self.vol;
        self.volume = self.vol;


        let max = -1;
        let index = -1;
        let threshold = 90;
        for (let i = 0; i < self.spectrum.length; i++) {
          if (self.spectrum[i] < threshold) continue;
          if (max < self.spectrum[i]) {
            max = self.spectrum[i];
            index = i;
          }
        }
        let pinch = index;

        pinchList.push(pinch);
        volumeList.push(self.volume);
        onDataReceived(pinch, self.volume);
        if (pinchList.length >= 8 * 3) {
          onGraphDataReceived(pinchList, volumeList);
          pinchList = [];
          volumeList = [];
        }
      };

      let input = context.createMediaStreamSource(stream);

      input.connect(analyser);
      analyser.connect(node);
      node.connect(context.destination);

    }

    function error() {
      console.log('error');
      console.log(arguments);
    }

  }

  ///////////////////////////////////////////////
  ////////////// SOUND UTILITIES  //////////////
  /////////////////////////////////////////////
  this.mapSound = function (_me, _total, _min, _max) {

    if (self.spectrum.length > 0) {

      let min = _min || 0;
      let max = _max || 100;
      //actual new freq
      let new_freq = Math.floor(_me / _total * self.data.length);
      //console.log(self.spectrum[new_freq]);
      // map the volumes to a useful number
      return map(self.data[new_freq], 0, self.peak_volume, min, max);
    } else {
      return 0;
    }

  };

  this.mapRawSound = function (_me, _total, _min, _max) {

    if (self.spectrum.length > 0) {

      let min = _min || 0;
      let max = _max || 100;
      //actual new freq
      let new_freq = Math.floor(_me / _total * (self.spectrum.length) / 2);
      //console.log(self.spectrum[new_freq]);
      // map the volumes to a useful number
      return map(self.spectrum[new_freq], 0, self.peak_volume, min, max);
    } else {
      return 0;
    }

  };

  this.getVol = function () {

    // map total volume to 100 for convenience
    self.volume = map(self.vol, 0, self.peak_volume, 0, 100);
    return self.volume;
  };

  this.getVolume = function () {
    return this.getVol();
  };

  //A more accurate way to get overall volume
  this.getRMS = function (spectrum) {
    let rms = 0;
    for (let i = 0; i < spectrum.length; i++) {
      rms += spectrum[i] * spectrum[i];
    }
    rms /= spectrum.length;
    rms = Math.sqrt(rms);
    return rms;
  };
  this.getMapRMS = function (spectrum) {
    let rms = 0;
    for (let i = 0; i < spectrum.length; i++) {
      rms += spectrum[i][0] * spectrum[i][0];
    }
    rms /= spectrum.length;
    rms = Math.sqrt(rms);
    return rms;
  };

  //freq = n * SAMPLE_RATE / MY_FFT_SIZE
  function mapFreq(i) {
    let freq = i * SAMPLE_RATE / FFT_SIZE;
    return freq;
  }

  // getMix function. Computes the current frequency with
  // computeFreqFromFFT, then returns bass, mids and his
  // sub bass : 0 > 100hz
  // mid bass : 80 > 500hz
  // mid range: 400 > 2000hz
  // upper mid: 1000 > 6000hz
  // high freq: 4000 > 12000hz
  // Very high freq: 10000 > 20000hz and above

  this.getMix = function () {
    let highs = [];
    let mids = [];
    let bass = [];
    for (let i = 0; i < self.spectrum.length; i++) {
      let band = mapFreq(i);
      let v = map(self.spectrum[i], 0, self.peak_volume, 0, 100);
      if (band < 500) {
        bass.push(v);
      }
      if (band > 400 && band < 6000) {
        mids.push(v);
      }
      if (band > 4000) {
        highs.push(v);
      }
    }
    //console.log(bass);
    return { bass: bass, mids: mids, highs: highs };
  };


  this.getBass = function () {
    return this.getMix().bass;
  };

  this.getMids = function () {
    return this.getMix().mids;
  };

  this.getHighs = function () {
    return this.getMix().highs;
  };

  this.getHighsVol = function (_min, _max) {
    let min = _min || 0;
    let max = _max || 100;
    let v = map(this.getRMS(this.getMix().highs), 0, self.peak_volume, min, max);
    return v;
  };

  this.getMidsVol = function (_min, _max) {
    let min = _min || 0;
    let max = _max || 100;
    let v = map(this.getRMS(this.getMix().mids), 0, self.peak_volume, min, max);
    return v;
  };

  this.getBassVol = function (_min, _max) {
    let min = _min || 0;
    let max = _max || 100;
    let v = map(this.getRMS(this.getMix().bass), 0, self.peak_volume, min, max);
    return v;
  };


  function adjustFreqData(frequencyData, ammt) {
    // get frequency data, remove obsolete
    //analyserNode.getByteFrequencyData(frequencyData);

    frequencyData.slice(0, frequencyData.length / 2);
    let new_length = ammt || 16;
    let newFreqs = [], prevRangeStart = 0, prevItemCount = 0;
    // looping for my new 16 items
    for (let j = 1; j <= new_length; j++) {
      // define sample size
      let pow, itemCount, rangeStart;
      if (j % 2 === 1) {
        pow = (j - 1) / 2;
      } else {
        pow = j / 2;
      }
      itemCount = Math.pow(2, pow);
      if (prevItemCount === 1) {
        rangeStart = 0;
      } else {
        rangeStart = prevRangeStart + (prevItemCount / 2);
      }

      // get average value, add to new array
      let newValue = 0, total = 0;
      for (let k = rangeStart; k < rangeStart + itemCount; k++) {
        // add up items and divide by total
        total += frequencyData[k];
        newValue = total / itemCount;
      }
      newFreqs.push(newValue);
      // update
      prevItemCount = itemCount;
      prevRangeStart = rangeStart;
    }
    return newFreqs;
  }

  return this;

}

let Mic = new Microphone();
