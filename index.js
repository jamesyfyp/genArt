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

// Token Gen
function generateRandomTokenData() {
  // Generate a random 128-bit hexadecimal value
  const random128BitHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  return {
    hash: `0x${random128BitHex}`
  };
}

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

// Define frequencies for different sounds
const kickFrequencies = [60];
const snareFrequencies = [100];
const chordProgression = [
  [261.63, 329.63, 392.0], 
  [349.23, 440.0, 523.25], 
  [392.0, 493.88, 587.33], 
];
const colorProg = [
    "red",
    "orange",
    "yellow"
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
const tokenData = generateRandomTokenData();
const R = new Random(); // Prohb random initialization
let chordDuration = 1;
let ctx = document.getElementById("canvas").getContext("2d");


window.addEventListener('load', () => {
  const startTime = audioGenerator.audioContext.currentTime;
  playChordProgression(startTime);
  playDrumLoop(startTime); 
});