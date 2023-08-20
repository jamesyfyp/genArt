
// Token Gen
function generateRandomTokenData() {
  // Generate a random 128-bit hexadecimal value
  const random128BitHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  return {
    hash: `0x${random128BitHex}`
  };
}
const tokenData = generateRandomTokenData();
// Prohibition Deterministic Random
class Random {
  constructor() {
    this.useA = false;
    let sfc32 = function (uint128Hex) {
      let a = parseInt(uint128Hex.substring(0, 8), 16);
      let b = parseInt(uint128Hex.substring(8, 16), 16);
      let c = parseInt(uint128Hex.substring(16, 24), 16);
      let d = parseInt(uint128Hex.substring(24, 32), 16);
      return function () {
        a |= 0;
        b |= 0;
        c |= 0;
        d |= 0;
        let t = (((a + b) | 0) + d) | 0;
        d = (d + 1) | 0;
        a = b ^ (b >>> 9);
        b = (c + (c << 3)) | 0;
        c = (c << 21) | (c >>> 11);
        c = (c + t) | 0;
        return (t >>> 0) / 4294967296;
      };
    };
    // seed prngA with first half of tokenData.hash
    this.prngA = new sfc32(tokenData.hash.substring(2, 34));
    // seed prngB with second half of tokenData.hash
    this.prngB = new sfc32(tokenData.hash.substring(34, 66));
    for (let i = 0; i < 1e6; i += 2) {
      this.prngA();
      this.prngB();
    }
  }
  // random number between 0 (inclusive) and 1 (exclusive)
  random_dec() {
    this.useA = !this.useA;
    return this.useA ? this.prngA() : this.prngB();
  }
  // random number between a (inclusive) and b (exclusive)
  random_num(a, b) {
    return a + (b - a) * this.random_dec();
  }
  // random integer between a (inclusive) and b (inclusive)
  // requires a < b for proper probability distribution
  random_int(a, b) {
    return Math.floor(this.random_num(a, b + 1));
  }
  // random boolean with p as percent liklihood of true
  random_bool(p) {
    return this.random_dec() < p;
  }
  // random value in an array of items
  random_choice(list) {
    return list[this.random_int(0, list.length - 1)];
  }
}

const R = new Random(); // Prohb random initialization

///start set up
function canvasConfig() {
  const body = document.querySelector("body");
  body.style.background = "black";
  body.style.margin = "0px";
  body.style.padding = "0px";
  const width = window.innerWidth;
  const height = window.innerHeight;
  const taller = height > width ? true : false;
  let container = document.createElement("div");
  container.id = "art";
  container.style.display = "flex";
  container.style.justifyContent = "center";
  container.style.alignItems = "center";
  container.style.height = "100vh";
  let canvas = document.createElement("canvas");
  canvas.id = "canvas";
  body.appendChild(container);
  container.appendChild(canvas);
  canvas.width = taller ? width : height;
  canvas.height = taller ? width : height;
}
canvasConfig();

function doArt(color) {
  const ctx = document.getElementById("canvas").getContext("2d");
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
doArt("red");
// drawing line

function draw() {
  requestAnimationFrame(draw);
  analyser.getByteTimeDomainData(dataArray);

  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgb(0, 255, 111, .2)";

  ctx.beginPath();

  const sliceWidth = (canvas.width * 1.0) / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * canvas.height) / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  }

  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
}

function draw2() {
  requestAnimationFrame(draw2);
  analyser2.getByteTimeDomainData(dataArray2);

  ctx.lineWidth = 10;
  ctx.strokeStyle = "rgb(250, 250, 250, .2)";

  ctx.beginPath();

  const sliceWidth = (canvas.width * 1.0) / bufferLength2;
  let x = 0;

  for (let i = 0; i < bufferLength2; i++) {
    const v = dataArray2[i] / 128.0;
    const y = (v * canvas.height) / 2;

    if (i === 0) {
      ctx.moveTo(y, x);
    } else {
      ctx.lineTo(y, x);
    }
    x += sliceWidth;
  }

  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
}


// get initial value
function getRandomFrequencyInRange() {
  return Math.pow(2, R.random_dec(0.1, .99) * 9) * 27.5; // A0 to C8 frequency range
}
//generate chord progression values 
function generateRandomChordProgression(numChords) {
  const randomChordProgression = [];
  
  for (let i = 0; i < numChords; i++) {
    let randomBaseFrequency;

    do {
      randomBaseFrequency = getRandomFrequencyInRange();
    } while (randomChordProgression.some(chord => chord.includes(randomBaseFrequency)));

    const randomChord = [];

    randomChord.push(randomBaseFrequency);

    const consonantFrequencies = [randomBaseFrequency * 4 / 3, randomBaseFrequency * 5 / 4];

    for (const freq of consonantFrequencies) {
      if (freq >= 27.5 && freq <= 4186.01) { // Check if frequency is within the piano range
        randomChord.push(freq);
      }
    }

    if (randomChord.length < 3) {
      randomChord.push(consonantFrequencies[0]); // Fallback to first consonant frequency
    }

    randomChordProgression.push(randomChord);
  }

  return randomChordProgression;
}

function getRandomFrequencyInRange() {
  return Math.pow(2, Math.random() * 9) * 27.5; // A0 to C8 frequency range
}
class AudioGenerator {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (!this.audioContext) {
      throw "Web Audio API is not supported in this browser.";
    }
  }

  createBuffer(frequencies, duration, type = "sawtooth", volume = 1) {
    const sampleRate = this.audioContext.sampleRate;
    const bufferSize = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const time = i / sampleRate;
      let value = 0;

      for (const frequency of frequencies) {
        value += Math.sin(2 * Math.PI * frequency * time);
      }

      data[i] = value * volume;
    }

    return buffer;
  }

  playBuffer(buffer, startTime) {
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start(startTime);
  }

  createBufferLoop(frequencies, duration, type = "sawtooth", volume = 1) {
    const source = this.audioContext.createBufferSource();
    const buffer = this.createBuffer(frequencies, duration, type, volume);
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.audioContext.destination);
    return source;
  }
}

const audioGenerator = new AudioGenerator();
const analyser = audioGenerator.audioContext.createAnalyser();
const analyser2 = audioGenerator.audioContext.createAnalyser();
// Define frequencies for different sounds
const kickFrequencies = [R.random_num(.1, 75)];
const snareFrequencies = [R.random_num(.1, 75)];;
let chordProgression = generateRandomChordProgression( 6)
const colorProg = [
   "rgba(255, 0, 0, 0.3)",
   "rgba(255, 165, 0, 0.3)",
   "rgba(255, 255, 0, 0.3)",
   'rgba(0, 128, 0, 0.3)',
   "rgba(0, 0, 255, 0.3)",
   "rgba(128, 0, 128, 0.3)",
]
let currentChordIndex = 0;

// Create audio buffers for different sounds
const kickBuffer = audioGenerator.createBuffer(kickFrequencies, 0.1);
const snareBuffer = audioGenerator.createBuffer(snareFrequencies, 0.2);

// Play functions for different sounds
function playChordProgression(startTime) {
  const chordBuffer = audioGenerator.createBuffer(
    chordProgression[currentChordIndex], 
    chordDuration
  );

  const chordSource = audioGenerator.audioContext.createBufferSource();
  chordSource.buffer = chordBuffer;
  chordSource.connect(audioGenerator.audioContext.destination);
  
  // Schedule the chord source to start at the given startTime
  chordSource.start(startTime);
  chordSource.connect(analyser2)
  // Move to the next chord in the progression
  currentChordIndex = (currentChordIndex + 1) % chordProgression.length;

  // Schedule the next chord change after the duration of the current chord
  const nextStartTime = startTime + chordDuration;
  chordSource.onended = () => {
    console.log("chord on end")
    playChordProgression(nextStartTime);
    playDrumLoop(nextStartTime)
    doArt(currentChordIndex)
    ctx.fillStyle = colorProg[currentChordIndex];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
}

function playDrumLoop(startTime) {
  const drumInterval = chordDuration * 200; 
  const drumSource = audioGenerator.audioContext.createBufferSource();
  drumSource.buffer = audioGenerator.createBuffer(
    [...kickFrequencies, ...snareFrequencies], 
    drumInterval / 500, 
  );
  drumSource.connect(audioGenerator.audioContext.destination);
  drumSource.connect(analyser)
  // Schedule the drum source to start at the given startTime
  drumSource.start(startTime);
}

function resize() {
  document.getElementById("art").remove();
  canvasConfig();
  doArt();
}

window.addEventListener("resize", () => {
  resize();
});

// Start globals
let chordDuration = R.random_num(.01, 2);
let ctx = document.getElementById("canvas").getContext("2d");
analyser.fftSize = 2048;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
analyser.getByteTimeDomainData(dataArray);
analyser2.fftSize = 2048;
const bufferLength2 = analyser2.frequencyBinCount;
const dataArray2 = new Uint8Array(bufferLength2);
analyser2.getByteTimeDomainData(dataArray2);
draw()
draw2()


window.addEventListener('load', () => {
  const startTime = audioGenerator.audioContext.currentTime;
  playChordProgression(startTime);
  playDrumLoop(startTime); 
});