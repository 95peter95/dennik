import React, { useState, useRef, useEffect } from 'react';
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import * as Tone from 'tone';
import 'react-piano/dist/styles.css';
import axios from 'axios';
import Header from '../components/Header.jsx';


const PianoRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [author, setAuthor] = useState('');
  const [subject, setSubject] = useState('');
  const [recordings, setRecordings] = useState([]);
  const recorder = useRef(null);

  // Initialize the sampler
  const sampler = useRef(new Tone.Sampler({
    urls: {
      A0: "A0.mp3",
      C1: "C1.mp3",
      "D#1": "Ds1.mp3",
      "F#1": "Fs1.mp3",
      A1: "A1.mp3",
      C2: "C2.mp3",
    },
    baseUrl: "https://tonejs.github.io/audio/salamander/",
  }).toDestination());

  // Fetch all recordings when the component mounts
  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const response = await axios.get('/api/recordings');
        setRecordings(response.data);
      } catch (error) {
        console.error('Error fetching recordings:', error);
      }
    };
    fetchRecordings();
  }, []);

  const startRecording = async () => {
    recorder.current = new Tone.Recorder();
    Tone.Destination.connect(recorder.current);
    await recorder.current.start();
    setIsRecording(true);
  };

  const stopRecording = async () => {
    const recording = await recorder.current.stop();
    setIsRecording(false);

    // Convert to Blob and send to the server
    const mp3Blob = new Blob([recording], { type: 'audio/mp3' });
    const formData = new FormData();
    formData.append("author", author);
    formData.append("subject", subject);
    formData.append("recording", mp3Blob);

    try {
      await axios.post("/api/recordings", formData);
      alert("Recording saved successfully!");
      setAuthor('');
      setSubject('');

      // Refetch recordings after successful save
      const response = await axios.get('/api/recordings');
      setRecordings(response.data);
    } catch (error) {
      console.error("Error saving recording:", error);
    }
  };

  const playNote = (midiNumber) => {
    const note = MidiNumbers.getAttributes(midiNumber).note;
    sampler.current.triggerAttackRelease(note, "8n");
  };

  const playRecording = (base64Data) => {
    const audioUrl = `data:audio/mp3;base64,${base64Data}`;
    const audio = new Audio(audioUrl);
    audio.play();
  };

  return (<>
     <Header/>
    <div style={{marginLeft: '20px'}}>
      <div style={{marginBottom:'20px', marginTop:'20px',}}>
        <input style={{borderWidth: '1px', marginRight: '10px'}}
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Meno"
        />
        <input style={{borderWidth: '1px'}}
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Popis piesni"
        />
      </div>
      <Piano
        noteRange={{ first: MidiNumbers.fromNote('c3'), last: MidiNumbers.fromNote('f5') }}
        playNote={playNote}
        stopNote={() => {}}
        width={400}
      />
      <button style={{borderWidth: '1px', marginTop:'10px'}} onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? "zastav nahravanie" : "nahravat"}
      </button>

      <h3 style={{marginTop: '20px'}}>Piesne</h3>
      <ul>
        {recordings.map((recording) => (
          <div key={recording._id}>
            <span>Autor: <strong>{recording.author}</strong> piesen: <strong>{recording.subject}</strong></span>
            <button style={{marginLeft: '10px', borderWidth: '1px'}} onClick={() => playRecording(recording.mp3)}>Prehrat</button>
          </div>
        ))}
      </ul>
    </div>
    </>
  );
};

export default PianoRecorder;
