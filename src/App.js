import React from "react";
import Tone from "tone";
import "./styles.css";

const drums = new Tone.Sampler({
  c0: "kick.wav",
  d0: "clap.wav",
  e0: "hat.wav",
  f0: "808Kick3.wav",
  g0: "808Snare3.wav"
}).toMaster();

const synth = new Tone.PolySynth().toMaster();
const synth2 = new Tone.Synth().toMaster();
const trackIndex = ["c0", "d0", "e0", "f0", "g0"];
const tracks = ["Kick", "Clap", "Hat", "808Kick3", "808Snare3", "Synth"];
Tone.Transport.bpm.value = 110;

const generateSteps = () => {
  let steps = [];
  for (let i = 0; i < 16; i++) {
    steps.push(0);
  }
  return steps;
};

const initialSteps = tracks.map((t) => ({
  name: t,
  steps: generateSteps()
}));

export default function App() {
  let [playing, setPlaying] = React.useState(false);
  let [currTempo, setTempo] = React.useState(Tone.Transport.bpm.value);
  let [currSwing, setSwing] = React.useState(Tone.Transport.swing);
  let [tracks, setTracks] = React.useState(initialSteps);
  let stepIndex = React.useRef(0);

  React.useEffect(() => {
    if (playing) {
      Tone.Transport.start();
    } else {
      Tone.Transport.stop();
    }
  }, [playing]);

  React.useEffect(() => {
    Tone.Transport.cancel();
    Tone.Transport.scheduleRepeat(function (time) {
      tracks.forEach((track, index) => {
        let step = track.steps[stepIndex.current];
        if (step === 1) {
          if (index === 5) {
            let chord =
              stepIndex.current < 7 ? ["c4", "d#4", "g4"] : ["a#3", "d4", "g4"];
            synth.triggerAttackRelease(chord, 0.5);
          } else {
            drums.triggerAttack(trackIndex[index]);
          }
        }
      });

      stepIndex.current = stepIndex.current > 14 ? 0 : stepIndex.current + 1;
    }, "16n");
  }, [tracks]);

  function handleHat() {
    setPlaying((playing) => !playing);
  }
  function handleFaster() {
    Tone.Transport.bpm.value = Tone.Transport.bpm.value + 1;
    setTempo(Tone.Transport.bpm.value);
  }
  function handleSlower() {
    Tone.Transport.bpm.value = Tone.Transport.bpm.value - 1;
    setTempo(Tone.Transport.bpm.value);
  }

  const updateStep = React.useCallback(
    function (trackIndex, stepIndex) {
      let newTracks = [...tracks];

      newTracks[trackIndex].steps[stepIndex] =
        newTracks[trackIndex].steps[stepIndex] === 0 ? 1 : 0;
      setTracks(newTracks);
    },
    [tracks, setTracks]
  );

  // make it a little more grid like:
  function getPadColor(s, index) {
    if ((index >= 0 && index <= 3) || (index >= 8 && index <= 11)) {
      return s === 0 ? "lightblue" : "blue";
    } else {
      return s === 0 ? "grey" : "blue";
    }
  }
  function getTempo() {
    return Math.floor(currTempo);
  }
  function getSwing() {
    return Math.floor(currSwing);
  }
  function moreSwing() {
    Tone.Transport.swing = Tone.Transport.swing + 1;
    setSwing(Tone.Transport.swing);
  }
  function lessSwing() {
    Tone.Transport.swing = Tone.Transport.swing - 1;
    setSwing(Tone.Transport.swing);
  }
  function playSynthC4() {
    synth2.triggerAttackRelease("c4", "8n");
  }
  function playSynthC3() {
    synth2.triggerAttackRelease("c3", "8n");
  }
  function playSynthC2() {
    synth2.triggerAttackRelease("c2", "8n");
  }
  return (
    <React.Fragment>
      <button type="button" onClick={handleHat}>
        {playing ? "Stop" : "Play"}
      </button>
      <button type="button" onClick={playSynthC2}>
        {" c2 "}
      </button>
      <button type="button" onClick={playSynthC3}>
        {" c3 "}
      </button>
      <button type="button" onClick={playSynthC4}>
        {" c4 "}
      </button>

      <div style={{ border: "1px solid gray", padding: 10, marginTop: 20 }}>
        {tracks.map((track, index) => {
          return (
            <div
              key={`track-${index}`}
              style={{ display: "flex", alignItems: "center" }}
            >
              <div style={{ width: 100 }}>{track.name}</div>
              {track.steps.map((s, stepIndex) => {
                return (
                  <div
                    key={`step-${index}-${stepIndex}`}
                    onClick={() => {
                      updateStep(index, stepIndex);
                    }}
                    style={{
                      height: 20,
                      width: 15,
                      margin: 2,
                      background: getPadColor(s, stepIndex),
                      cursor: "pointer"
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
      <strong>Tempo : {getTempo()} </strong>
      <button type="button" onClick={handleFaster}>
        {" + "}
      </button>
      <button type="button" onClick={handleSlower}>
        {" - "}
      </button>
      <strong> Swing : {getSwing()} </strong>
      <button type="button" onClick={moreSwing}>
        {" + "}
      </button>
      <button type="button" onClick={lessSwing}>
        {" - "}
      </button>
      <div id="myContent">Make a beat!</div>
    </React.Fragment>
  );
}
