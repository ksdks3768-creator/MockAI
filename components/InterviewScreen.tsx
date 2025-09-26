import React, { useState, useEffect, useCallback, useRef } from 'react';
import { InterviewQuestion, InterviewResult, AnswerFeedback, AppState } from '../types';
import { analyzeAnswer } from '../services/geminiService';
import FeedbackCard from './FeedbackCard';
import { MicrophoneIcon, StopIcon, LoadingSpinner, LogoIcon, SettingsIcon, SendIcon } from './icons';

// Check for SpeechRecognition API
// FIX: Cast window to `any` to access browser-specific `SpeechRecognition` and `webkitSpeechRecognition` properties, which are not in the standard Window type definition.
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
}


interface InterviewScreenProps {
  questions: InterviewQuestion[];
  setResults: React.Dispatch<React.SetStateAction<InterviewResult[]>>;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const InterviewScreen: React.FC<InterviewScreenProps> = ({ questions, setResults, setAppState }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [textAnswer, setTextAnswer] = useState('');
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setLocalResults] = useState<InterviewResult[]>([]);
  const [speechState, setSpeechState] = useState<'idle' | 'playing' | 'paused' | 'ended'>('idle');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);


  const currentQuestion = questions[currentQuestionIndex];
  
  const speak = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    const newUtterance = new SpeechSynthesisUtterance(text);
    newUtterance.rate = 0.9;
    newUtterance.pitch = 0.95;

    newUtterance.onstart = () => setSpeechState('playing');
    newUtterance.onpause = () => setSpeechState('paused');
    newUtterance.onresume = () => setSpeechState('playing');
    newUtterance.onend = () => {
        setSpeechState('ended');
        utteranceRef.current = null;
    };
    newUtterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        setSpeechState('ended');
        utteranceRef.current = null;
    };

    utteranceRef.current = newUtterance;
    window.speechSynthesis.speak(newUtterance);
  }, []);

  useEffect(() => {
    if (currentQuestion && !feedback) {
      speak(`Next question, from ${currentQuestion.persona}. ${currentQuestion.question}`);
    }
  }, [currentQuestion, feedback, speak]);
  
  const handleSubmitAnswer = useCallback(async (answerOverride?: string) => {
      if (isListening) {
          recognition?.stop();
      }
      setIsAnalyzing(true);
      setAppState(AppState.ANALYZING);
      
      const spokenAnswer = (answerOverride !== undefined ? answerOverride : (finalTranscript || transcript)).trim();
      const answerToSubmit = (spokenAnswer || textAnswer).trim();

      if (!answerToSubmit) {
          setIsAnalyzing(false);
          setAppState(AppState.INTERVIEW);
          return;
      }

      try {
        const generatedFeedback = await analyzeAnswer(currentQuestion.question, answerToSubmit, currentQuestion.keywords);
        
        if (generatedFeedback.spokenFeedback) {
          speak(generatedFeedback.spokenFeedback);
        }

        const newResult = {
            question: currentQuestion,
            answer: answerToSubmit,
            feedback: generatedFeedback
        };

        setFeedback(generatedFeedback);
        setResults(prev => [...prev, newResult]);
        setLocalResults(prev => [...prev, newResult]);
        setAppState(AppState.FEEDBACK);
      } catch(error) {
        console.error("Error analyzing answer:", error);
        alert("There was an error analyzing your answer. Please try again.");
        setAppState(AppState.INTERVIEW);
      } finally {
        setIsAnalyzing(false);
      }
  }, [isListening, finalTranscript, transcript, textAnswer, currentQuestion, setAppState, setResults, speak]);


  useEffect(() => {
    if (!recognition) {
        alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
        return;
    }
    
    recognition.onresult = (event) => {
      let interimTranscript = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
            final += chunk;
        } else {
          interimTranscript += chunk;
        }
      }
      setTranscript(finalTranscript + final + interimTranscript);
      if (final) {
        setFinalTranscript(prev => (prev + ' ' + final).trim());
      }
    };
    
    recognition.onend = () => {
        setIsListening(false);
    };

    return () => {
      recognition.onresult = null;
      recognition.onend = null;
      window.speechSynthesis.cancel();
      if(recognition) {
        recognition.stop();
      }
    }
  }, [finalTranscript, handleSubmitAnswer]);

  const handleToggleListening = () => {
    if (isListening) {
      recognition.stop();
    } else {
      setTranscript('');
      setFinalTranscript('');
      setTextAnswer(''); 
      recognition.start();
      setIsListening(true);
    }
  };
  
  const handleToggleSpokenFeedback = () => {
    const synth = window.speechSynthesis;
    if (speechState === 'playing') {
        synth.pause();
    } else if (speechState === 'paused') {
        synth.resume();
    } else if (speechState === 'ended' || speechState === 'idle') {
        if (feedback?.spokenFeedback) {
            speak(feedback.spokenFeedback);
        }
    }
  };

  const handleNextQuestion = () => {
    window.speechSynthesis.cancel();
    setSpeechState('idle');
    setFeedback(null);
    setTranscript('');
    setFinalTranscript('');
    setTextAnswer('');
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAppState(AppState.INTERVIEW);
    } else {
      setAppState(AppState.COMPLETE);
    }
  };

  const isInterviewOver = currentQuestionIndex >= questions.length;

  if (isInterviewOver) {
    return null; // App component will handle rendering the completion screen
  }

  const displayedAnswer = isListening || transcript ? transcript : textAnswer;

  return (
    <div className="w-full max-w-md mx-auto p-4 md:p-0 min-h-screen flex flex-col justify-between">
       <header className="flex justify-between items-center py-4">
        <LogoIcon className="w-8 h-8 text-brand-text-dark" />
        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-200">
          <SettingsIcon className="w-6 h-6 text-brand-text-light" />
        </button>
      </header>
     
      <main className="flex-grow flex flex-col justify-center space-y-6 relative overflow-hidden">
        
        {/* Decorative background elements */}
        <div className="absolute top-10 -left-16 w-32 h-32 bg-brand-accent-green-light rounded-full opacity-50 z-0"></div>
        <div className="absolute bottom-20 -right-20 w-48 h-48 bg-brand-accent-green-light rounded-2xl opacity-50 transform rotate-12 z-0"></div>

        {feedback ? (
           <div className="z-10">
              <FeedbackCard 
                feedback={feedback} 
                userAnswer={results[results.length - 1]?.answer || ''}
                speechState={speechState}
                onToggleSpokenFeedback={handleToggleSpokenFeedback}
              />
           </div>
        ) : (
          <div className="bg-brand-card p-6 rounded-3xl shadow-sm border border-gray-200/50 space-y-4 z-10">
            <div className="flex justify-between items-center text-sm font-medium text-brand-text-light">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span>From: {currentQuestion.persona}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-brand-text-dark">
              {currentQuestion.question}
            </h1>
            <div className="relative">
              <textarea
                rows={6}
                className="w-full p-4 bg-brand-input border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-accent-green focus:border-brand-accent-green transition duration-200 resize-none placeholder:text-brand-text-light"
                placeholder="Start speaking or type your answer..."
                value={displayedAnswer}
                onChange={(e) => {
                    setTextAnswer(e.target.value);
                    if(isListening) {
                      recognition.stop();
                      setIsListening(false);
                    }
                    setTranscript('');
                    setFinalTranscript('');
                }}
                disabled={isAnalyzing || isListening}
                readOnly={isListening}
              />
            </div>
          </div>
        )}
      </main>
      
      <footer className="py-4 z-10">
        {isAnalyzing ? (
           <div className="flex flex-col items-center gap-2 text-center">
              <LoadingSpinner className="w-8 h-8 text-brand-accent-green" />
              <p className="text-md text-brand-text-light animate-pulse-fast">AI is analyzing your answer...</p>
           </div>
        ) : feedback ? (
          <button
            onClick={handleNextQuestion}
            className="w-full bg-brand-text-dark text-white font-bold py-4 px-4 rounded-2xl hover:bg-black transition duration-300"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Interview'}
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleListening}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-brand-accent-green hover:bg-brand-accent-green/90'}`}
            >
              {isListening ? <StopIcon className="w-8 h-8 text-white" /> : <MicrophoneIcon className="w-8 h-8 text-white" />}
            </button>
            <button
                onClick={() => handleSubmitAnswer()}
                disabled={!displayedAnswer.trim()}
                className="flex-1 flex justify-center items-center gap-3 bg-brand-text-dark text-white font-bold py-4 px-4 rounded-2xl hover:bg-black transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                <SendIcon className="w-5 h-5" />
                Submit Answer
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};

export default InterviewScreen;