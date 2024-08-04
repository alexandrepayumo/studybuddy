import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';

const VoiceToChat = () => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  let recognition;

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setText(prevText => prevText + transcript);
          } else {
            interimTranscript += transcript;
          }
        }
        setText(prevText => prevText + interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error(event.error);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      console.error('Speech recognition not supported in this browser.');
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  return (
    <div className="voice-to-chat">
      <button 
        onClick={isListening ? stopListening : startListening} 
        className="microphone-button"
      >
        <FontAwesomeIcon icon={isListening ? faMicrophoneSlash : faMicrophone} size="1x" />
      </button>
      <p>{text}</p>

      <style jsx>{`
        .voice-to-chat {
          display: flex;
          flex-direction: column
        ;
          align-items: flex-end;
          justify-content: flex-start;
          padding: 20px;
          height: 20vh;
          margin-right: 20px;
        }
        .microphone-button {
          background-color: ${isListening ? 'red' : 'green'};
          border: none;
          border-radius: 50%;
          padding: 10px;
          color: white;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .microphone-button:focus {
          outline: none;
        }
        p {
          margin-top: 10px;
          font-size: 1rem;
          text-align: right;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default VoiceToChat;
