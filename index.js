
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

const linkElement = document.createElement("link");
linkElement.rel = "stylesheet";
linkElement.href = "https://fonts.googleapis.com/css2?family=Space+Mono&display=swap";
document.head.appendChild(linkElement);

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
  container.style.position = "relative"
  container.style.alignItems = "center";
  container.style.height = "100vh";
  
  body.appendChild(container);
  let filter = document.createElement("div")
  filter.id = "filter_1"
  filter.style.zIndex = 100
  filter.style.width = taller ? `${width}px` : `${height}px`;
  filter.style.position = "absolute"
  filter.style.height =  taller ? `${width}px` : `${height}px`;
  container.appendChild(filter);
  let filter2 = document.createElement("div")
  filter2.id = "filter_2"
  filter2.style.zIndex = 110
  filter2.style.width = taller ? `${width}px` : `${height}px`;
  filter2.style.position = "absolute"
  filter2.style.height =  taller ? `${width}px` : `${height}px`;
  container.appendChild(filter2);
  let canvas = document.createElement("canvas");
  canvas.id = "canvas";
  canvas.style.position = "absolute"
  container.appendChild(canvas);
  canvas.width = taller ? width : height;
  canvas.height = taller ? width : height;
}
canvasConfig();

let canvasDimensions = document.getElementById("canvas").getBoundingClientRect()
// add vol slider
let volumeContainer = document.createElement("div")
volumeContainer.style.position = "relative"
volumeContainer.style.bottom = `${canvasDimensions.height/2 -30}px`
volumeContainer.style.border = "2px solid rgba(255, 255, 255, .7)"
volumeContainer.style.borderRadius = "20px"
volumeContainer.style.boxShadow = "inset 10px 10px 20px rgba(190, 190, 190, .7), inset -10px -10px 20px rgba(255, 255, 255, .2"
volumeContainer.style.transform = "scale(.7)"
// incase we want it to the right/left volumeContainer.style.left = `${canvasDimensions.width/2 -60}px`
volumeContainer.style.zIndex = 200
volumeContainer.style.height = "40px"
volumeContainer.style.width = "130px"
volumeContainer.style.background = "rgba(255, 255, 255, .5)"
volumeContainer.style.display = "flex" 
volumeContainer.style.transition = "transform .3s ease"
let currentVol = document.createElement("p")
currentVol.id = "volumeDisplay"
currentVol.style.fontFamily = "Space Mono, monospace";
currentVol.style.fontWeight = "1000"
currentVol.style.color = "rgba(255, 255, 255, .7)"
currentVol.style.width = "33%"
currentVol.style.textAlign = "center"
currentVol.style.margin = "auto"
currentVol.style.userSelect = "none"
currentVol.innerText = "0"
volumeContainer.appendChild(currentVol)
let volumeUp = document.createElement("div")
volumeUp.style.width = "33%"
volumeUp.style.transition = "background-color 0.5s"; 
volumeUp.id = "volumeUp"
//create svg +
const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svgElement.setAttribute("width", "30");
svgElement.setAttribute("height", "30");
svgElement.style.marginLeft = "6px"
svgElement.style.marginTop = "5px"
const horizontalLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
horizontalLine.style.transition = "fill 0.5"
horizontalLine.setAttribute("x1", "5");
horizontalLine.setAttribute("y1", "15");
horizontalLine.setAttribute("x2", "25");
horizontalLine.setAttribute("y2", "15");
horizontalLine.setAttribute("stroke", "rgba(255, 255, 255, .7");
horizontalLine.setAttribute("stroke-width", "3");
const verticalLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
verticalLine.style.transition = "fill 0.5"
verticalLine.setAttribute("x1", "15");
verticalLine.setAttribute("y1", "5");
verticalLine.setAttribute("x2", "15");
verticalLine.setAttribute("y2", "25");
verticalLine.setAttribute("stroke", "rgba(255, 255, 255, .7");
verticalLine.setAttribute("stroke-width", "3");
svgElement.appendChild(horizontalLine);
svgElement.appendChild(verticalLine);
function setVolumeUp(){
  event.preventDefault()
  audioGenerator.setGain(audioGenerator.masterGainNode.gain.value + .1)
}
volumeUp.addEventListener("click", setVolumeUp)
volumeUp.addEventListener("mouseenter", () => {
  volumeUp.style.backgroundColor = "rgba(255, 255, 255, .8)"; // Invert color on hover
  horizontalLine.setAttribute("stroke", "grey");
  verticalLine.setAttribute("stroke", "grey");
});

volumeUp.addEventListener("mouseleave", () => {
  volumeUp.style.backgroundColor = "rgba(255, 255, 255, .0)"; // Revert color on hover out
  horizontalLine.setAttribute("stroke", "rgba(255, 255, 255, .7");
  verticalLine.setAttribute("stroke", "rgba(255, 255, 255, .7");
});

volumeUp.appendChild(svgElement)
volumeContainer.appendChild(volumeUp)
let volumeDown = document.createElement("div")
volumeDown.style.borderTopRightRadius = "30px"
volumeDown.style.borderBottomRightRadius = "30px"
volumeDown.style.transition = "background-color 0.5s"; 
volumeDown.id = "volumeDown"
const svgElement2 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svgElement2.setAttribute("width", "30");
svgElement2.setAttribute("height", "30");
svgElement2.style.marginLeft = "5px"
svgElement2.style.marginTop = "5px"
const horizontalLine2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
horizontalLine2.style.transition = "fill 0.3"
horizontalLine2.setAttribute("x1", "5");
horizontalLine2.setAttribute("y1", "15");
horizontalLine2.setAttribute("x2", "25");
horizontalLine2.setAttribute("y2", "15");
horizontalLine2.setAttribute("stroke", "rgba(255, 255, 255, .7");
horizontalLine2.setAttribute("stroke-width", "3");
svgElement2.appendChild(horizontalLine2);
volumeDown.appendChild(svgElement2)
function setVolumeDown () {
   audioGenerator.setGain(audioGenerator.masterGainNode.gain.value - .1)
}
volumeDown.addEventListener("click", setVolumeDown)
volumeDown.addEventListener("mouseenter", () => {
  volumeDown.style.backgroundColor = "rgba(255, 255, 255, .8)"; // Invert color on hover
  horizontalLine2.setAttribute("stroke", "grey");
});
volumeDown.addEventListener("mouseleave", () => {
  volumeDown.style.backgroundColor = "rgba(255, 255, 255, .0)"; // Revert color on hover out
  horizontalLine2.setAttribute("stroke", "rgba(255, 255, 255, .7");
});
volumeContainer.appendChild(volumeDown)
document.getElementById("art").append(volumeContainer)
volumeDown.style.width = "33%"

volumeContainer.addEventListener("mouseenter", ()=>{
  volumeContainer.style.transform = "scale(.7) "
})

volumeContainer.addEventListener("mouseleave", ()=>{

  volumeContainer.style.transform = "scale(.3) translateY(-2em)"
})


//set up drawing
function doArt(color) {
  const ctx = document.getElementById("canvas").getContext("2d");
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
// drawing line and filters (the line update creates the loop for the background update)

let filterValue_1 = R.random_int(0,25000)
let filterValue_2 = R.random_int(0,1000)
const interval = R.random_int(100, 5000)
let direction = false
function draw() {
  requestAnimationFrame(draw);
  analyser.getByteTimeDomainData(dataArray);

  ctx.lineWidth = R.random_int(5,30);
  ctx.strokeStyle = colorProg[currentChordIndex][2];

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

   if (filterValue_1 > interval*chordProgression.length) {
    direction = true
  } 
  if (filterValue_1 < -interval*chordProgression.length) {
    direction = false
  } 
  if (direction2) {
    filterValue_2 = filterValue_2 - interval
    filterValue_1 = filterValue_1 - interval
  } else {
    filterValue_2 = filterValue_2 + interval
    filterValue_1 = filterValue_1 + interval
  }
  filter1Update(colorProg[currentChordIndex][4], colorProg[currentChordIndex][5], Math.abs(filterValue_1), Math.abs(filterValue_2))
}

function filter1Update(color_1, color_2, px1, px2){
  const filter = document.getElementById("filter_1")

  filter.style.background = `repeating-conic-gradient(${color_1} 0 .00015%,${color_2} 0 .00020%) 0 0/${px1}px ${px2}px`;
}

function filter2Update(color_1, color_2, px1, px2){
  const filter = document.getElementById("filter_2")
 filter.style.background = `repeating-conic-gradient(${color_1} 0 .00015%,${color_2} 0 .00020%) 0 0/${px1}px ${px2}px`;
}

let filter2Value_1 = R.random_int(100,200)
let filter2Value_2 = R.random_int(200,300)
const interval2 = R.random_int(100, 5000)
let direction2 = false

function draw2() {
  requestAnimationFrame(draw2);
  analyser2.getByteTimeDomainData(dataArray2);

  ctx.lineWidth = R.random_int(5,30);
  ctx.strokeStyle = ctx.strokeStyle = colorProg[currentChordIndex][1];

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
  if (filter2Value_1 > interval2*chordProgression.length) {
    direction2 = true
  } 
  if (filter2Value_1 < -interval2*chordProgression.length) {
    direction2 = false
  } 
  if (direction2) {
    filter2Value_2 = filter2Value_2 - interval
    filter2Value_1 = filter2Value_1 - interval
  } else {
    filter2Value_2 = filter2Value_2 + interval
    filter2Value_1 = filter2Value_1 + interval
  }
  
  filter2Update(colorProg[currentChordIndex][6], colorProg[currentChordIndex][7], Math.abs(filter2Value_1), Math.abs(filter2Value_2))
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

function mapValue(value, fromMin, fromMax, toMin, toMax) {
  return (value - fromMin) * (toMax - toMin) / (fromMax - fromMin) + toMin;
}

function generateColorsFromChord(chord) {
  // Convert frequency to hue value
  const h = mapValue(chord[0], 27.5, 4186.01, 0, 360);

  // Saturation (0 - 100)
  const s = 100;

  // Lightness (0 - 100)
  const l = 50;
 
  // Opacity (0 - 1)
  const a = 0.2;

  // Generate complementary hue
  const complementaryHue = (h + 180) % 360;

  // Generate additional hues by shifting by 30 and 60 degrees
  const hueShift1 = (h + 30) % 360;
  const hueShift2 = (h + 60) % 360;

  // Generate 4 more hues by shifting by 120, 150, 180, and 210 degrees
  const hueShift3 = (h + 120) % 360;
  const hueShift4 = (h + 150) % 360;
  const hueShift5 = (h + 180) % 360;
  const hueShift6 = (h + 210) % 360;

  // Construct color strings for all 8 hues
  const mainColor = `hsla(${h}, ${s}%, ${l}%, ${a})`;
  const complementaryColor = `hsla(${complementaryHue}, ${s}%, ${l}%, ${a})`;
  const additionalColor1 = `hsla(${hueShift1}, ${s}%, ${l}%, ${a})`;
  const additionalColor2 = `hsla(${hueShift2}, ${s}%, ${l}%, ${a})`;
  const additionalColor3 = `hsla(${hueShift3}, ${s}%, ${l}%, ${a + .03})`;
  const additionalColor4 = `hsla(${hueShift4}, ${s}%, ${l}%, ${a + .03})`;
  const additionalColor5 = `hsla(${hueShift5}, ${s}%, ${l}%, ${a + .07})`;
  const additionalColor6 = `hsla(${hueShift6}, ${s}%, ${l}%, ${a + .07})`;

  return [
    mainColor,
    complementaryColor,
    additionalColor1,
    additionalColor2,
    additionalColor3,
    additionalColor4,
    additionalColor5,
    additionalColor6
  ];
}

class AudioGenerator {
   constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (!this.audioContext) {
      throw "Web Audio API is not supported in this browser.";
    }
    this.masterGainNode = this.audioContext.createGain();
    this.masterGainNode.connect(this.audioContext.destination);
    this.setGain(0); // Mute by default
  }

  setGain(value) {
    let val = Math.round(value * 10) / 10;
    if (val >= 1 ) {
      document.getElementById("volumeUp").removeEventListener("click", setVolumeUp)
      document.getElementById("volumeUp").style.filter = "invert(1)"
    } else {
      document.getElementById("volumeUp").addEventListener("click", setVolumeUp)
      document.getElementById("volumeUp").style.filter = "none"
    }
    if (val <= 0 ) {
      document.getElementById("volumeDown").removeEventListener("click", setVolumeDown)
      document.getElementById("volumeDown").style.filter = "invert(1)"
    } else {
      document.getElementById("volumeDown").addEventListener("click", setVolumeDown)
      document.getElementById("volumeDown").style.filter = "none"
    }
  
    document.getElementById("volumeDisplay") && (document.getElementById("volumeDisplay").innerText = val * 10);
    
    this.masterGainNode.gain.setValueAtTime(val, this.audioContext.currentTime);
    
  }

  mute() {
    this.setGain(0);
  }

  unmute() {
    this.setGain(.1);
  }

  createBuffer(frequencies, duration) {
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
      data[i] = value;
    }
  
    return buffer;
  }

  playBuffer(buffer, startTime) {
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start(startTime);
  }

  createBufferLoop(frequencies, duration, type = "sawtooth") {
    const source = this.audioContext.createBufferSource();
    const buffer = this.createBuffer(frequencies, duration, type);
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
let chordProgression = generateRandomChordProgression(R.random_int(8, 16))
let colorProg = []
chordProgression.map(chord=>{colorProg.push(generateColorsFromChord(chord))})
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
  chordSource.connect(audioGenerator.masterGainNode)

 
  
  // Schedule the chord source to start at the given startTime
  chordSource.start(startTime);
  chordSource.connect(analyser2)
  // Move to the next chord in the progression
  currentChordIndex = (currentChordIndex + 1) % chordProgression.length;

  // Schedule the next chord change after the duration of the current chord
  const nextStartTime = startTime + chordDuration;
  chordSource.onended = () => {
    chordDuration = R.random_int(1, 2);
    playChordProgression(nextStartTime);
    playDrumLoop(nextStartTime)
    doArt(currentChordIndex)
    ctx.fillStyle = colorProg[currentChordIndex][0];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
}

function playDrumLoop(startTime) {
  const drumInterval = chordDuration * R.random_num(500, 5000); 
  const drumSource = audioGenerator.audioContext.createBufferSource();
  drumSource.buffer = audioGenerator.createBuffer(
    [...kickFrequencies, ...snareFrequencies], 
    drumInterval / R.random_num(100,1000), 
  );
  drumSource.connect(audioGenerator.masterGainNode);
  drumSource.connect(analyser)
  // Schedule the drum source to start at the given startTime
  drumSource.start(startTime);
}

// Start
let chordDuration = R.random_num(.1, 2);
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


let clicked = false
window.addEventListener('load', () => {
  const startTime = audioGenerator.audioContext.currentTime;
  // Enable sound when the user interacts
  const body = document.querySelector("body");
  body.addEventListener("click", () => {
    if (!clicked) {
      playChordProgression(startTime);
      clicked = true;
    } 
  });
});