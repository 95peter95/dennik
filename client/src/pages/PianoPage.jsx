import React, { useState, useRef, useEffect } from 'react';
import { Piano, MidiNumbers } from 'react-piano';
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
  const audioChunks = useRef([]);
  const audioRef = useRef(null); // Ref to track the currently playing audio

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
    const stream = Tone.Destination.stream;
    recorder.current = new MediaRecorder(stream, { mimeType: 'audio/mp3' }); // Use mp3 for compatibility
    
    recorder.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };

    recorder.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/mp3' }); // Store as mp3
      const formData = new FormData();
      formData.append("author", author);
      formData.append("subject", subject);
      formData.append("recording", audioBlob);

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

    recorder.current.start();
    setIsRecording(true);
  };

  const stopRecording = async () => {
    recorder.current.stop();
    setIsRecording(false);
  };

  const playNote = (midiNumber) => {
    const note = MidiNumbers.getAttributes(midiNumber).note;
    sampler.current.triggerAttackRelease(note, "8n");
  };

  const playRecording = (base64Data) => {
    // Stop the previous recording if it's still playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset playback position
    }

    const audioUrl = `data:audio/mp3;base64,${base64Data}`; // Ensure we are using MP3
    const audio = new Audio(audioUrl);
    
    // Set the audio reference to the current audio object
    audioRef.current = audio;

    audio.play().catch(error => {
      console.error("Playback error:", error);
      alert("Playback failed, possibly due to compatibility issues.");
    });
  };

  return (
    <>
      <Header />
      <div style={{ marginLeft: '20px' }}>
        <div style={{ marginBottom: '20px', marginTop: '20px' }}>
          <input
            style={{ borderWidth: '1px', marginRight: '10px' }}
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Meno"
          />
          <input
            style={{ borderWidth: '1px' }}
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Nazov piesne"
          />
        </div>
        <Piano
          noteRange={{ first: MidiNumbers.fromNote('c3'), last: MidiNumbers.fromNote('f5') }}
          playNote={playNote}
          stopNote={() => {}}
          width={380}
        />
        <button
          style={{ borderWidth: '1px', marginTop: '10px' }}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? "zastav nahravanie" : "nahravat"}
        </button>

        <h3 style={{ marginTop: '20px' }}>Piesne</h3>
        <ul>
          {recordings.map((recording) => (
            <div key={recording._id}>
              <span>Autor: <strong>{recording.author}</strong> piesen: <strong>{recording.subject}</strong></span>
              <button
                style={{ marginLeft: '10px', borderWidth: '1px' }}
                onClick={() => playRecording(recording.mp3)} // Ensure mp3 is sent and played
              >
                Prehrat
              </button>
            </div>
          ))}
        </ul>
      </div>
    </>
  );
};

export default PianoRecorder;
