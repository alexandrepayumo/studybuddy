import React, { useState, useEffect } from 'react';

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
    <div>
      <button onClick={isListening ? stopListening : startListening}>
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>
      <p>{text}</p>
    </div>
  );
};

export default VoiceToChat;
