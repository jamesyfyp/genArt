function canvasConfig(){
    const body = document.querySelector('body')
    body.style.background = 'black'
    body.style.margin = "0px"
    body.style.padding = "0px"
    const width = window.innerWidth
    const height = window.innerHeight
    const taller = height > width ? true : false;
    let container = document.createElement('div')
    container.id = "art"
    container.style.display = "flex"
    container.style.justifyContent = "center"
    container.style.alignItems = "center"
    container.style.height = "100vh"
    let canvas = document.createElement('canvas')
    canvas.id = "canvas"
    body.appendChild(container)
    container.appendChild(canvas)
    canvas.width = taller ? width : height;
    canvas.height = taller ? width : height;
}
canvasConfig();

function doArt(color){
    const ctx = document.getElementById('canvas').getContext("2d")
    ctx.fillStyle = color
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}
doArt('red')

function playKickDrum(audioContext) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine'; // You can experiment with different waveform types
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime); // Adjust the frequency for the desired kick tone

    gainNode.gain.setValueAtTime(1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2); // Quick decay for the kick

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3); // Adjust the duration as needed
}

let kickSet = false
function playChord(frequencies, duration) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let oscillators = []
    if (!audioContext) {
        throw "Web Audio API is not supported in this browser.";
    }

    for (const frequency of frequencies) {
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
        oscillators.push(oscillator);
    }
    chordProgInt >= chords.length-1 ? chordProgInt = 0 : chordProgInt += 1
    oscillators[oscillators.length - 1].onended = () => {
        // Define your next set of frequencies for the next chord
        const nextChordFrequencies = chords[chordProgInt];
        playChord(nextChordFrequencies, duration); // Play the next chord
    };
    if (!kickSet) {

        //unintentionally poly rythmic
        setInterval(()=>{
            playKickDrum(audioContext)
        }, 1000)
        
        
        kickSet = true
    }
     

    
}



function resize(){
    document.getElementById("art").remove()
    canvasConfig()
    doArt()
}

window.addEventListener('resize', ()=>{
    resize()
})
//start globals 
const chords = [[261.63, 329.63, 392.00],[ 440.00,  523.25, 659.26],[349.23,440.00,523.25],[392.00,493.88, 587.33],[293.66, 369.99, 440.00],[329.63, 415.30, 493.88, 659.26]]; // C Major chord
const chordDuration = 1; 
let chordProgInt = 0

window.addEventListener('load', ()=>{
    playChord(chords[chordProgInt], chordDuration)

    
})

