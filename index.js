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

function playKickDrum(audioContext) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "square"; // You can experiment with different waveform types
  oscillator.frequency.setValueAtTime(100, audioContext.currentTime); // Adjust the frequency for the desired kick tone

  gainNode.gain.setValueAtTime(1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.2
  ); // Quick decay for the kick

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3); // Adjust the duration as needed
}

function playChord(frequencies, duration) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let oscillators = [];
  if (!audioContext) {
    throw "Web Audio API is not supported in this browser.";
  }

  for (const frequency of frequencies) {
    const oscillator = audioContext.createOscillator();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
    oscillators.push(oscillator);
  }
  chordProgInt >= chords.length - 1 ? (chordProgInt = 0) : (chordProgInt += 1);
  oscillators[oscillators.length - 1].onended = () => {
    // Define your next set of frequencies for the next chord
    const nextChordFrequencies = chords[chordProgInt];
    playChord(nextChordFrequencies, duration); // Play the next chord
  };
  if (!kickSet) {
    //unintentionally poly rythmic
    setInterval(() => {
      playKickDrum(audioContext);
    }, 1000);

    kickSet = true;
  }
}

function resize() {
  document.getElementById("art").remove();
  canvasConfig();
  doArt();
}

window.addEventListener("resize", () => {
  resize();
});
//start globals
const tokenData = generateRandomTokenData()
console.log(tokenData)
const R = new Random(); //Prohb random initialization

const chords = [
  [261.63, 329.63, 392.0],
  [440.0, 523.25, 659.26],
  [349.23, 440.0, 523.25],
  [392.0, 493.88, 587.33],
  [293.66, 369.99, 440.0],
  [329.63, 415.3, 493.88, 659.26],
]; // C Major chord
const chordDuration = 1;
let chordProgInt = 0;
let kickSet = false;

window.addEventListener("load", () => {
  playChord(chords[chordProgInt], chordDuration);
});
