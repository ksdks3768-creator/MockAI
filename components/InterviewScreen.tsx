import React, { useState, useEffect, useCallback, useRef } from 'react';
import { InterviewQuestion, InterviewResult, AnswerFeedback, AppState, SupportedLanguage } from '../types';
import { analyzeAnswer } from '../services/geminiService';
import FeedbackCard from './FeedbackCard';
import { MicrophoneIcon, StopIcon, LoadingSpinner, SendIcon } from './icons';

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = true;
  recognition.interimResults = true;
}

interface InterviewScreenProps {
  questions: InterviewQuestion[];
  language: SupportedLanguage;
  setResults: (results: InterviewResult[]) => void;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const MAX_CHARS = 2500;

const InterviewScreen: React.FC<InterviewScreenProps> = ({ questions, language, setResults, setAppState }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [textAnswer, setTextAnswer] = useState('');
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [localResults, setLocalResults] = useState<InterviewResult[]>([]);
  const [speechState, setSpeechState] = useState<'idle' | 'playing' | 'paused' | 'ended'>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (recognition) {
      const langMap: Record<SupportedLanguage, string> = {
        [SupportedLanguage.ENGLISH]: 'en-US',
        [SupportedLanguage.HINDI]: 'hi-IN',
        [SupportedLanguage.SPANISH]: 'es-ES',
        [SupportedLanguage.FRENCH]: 'fr-FR',
        [SupportedLanguage.GERMAN]: 'de-DE',
        [SupportedLanguage.CHINESE]: 'zh-CN',
        [SupportedLanguage.JAPANESE]: 'ja-JP',
      };
      recognition.lang = langMap[language];
    }
  }, [language]);
  
  const speak = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    const newUtterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => v.lang.startsWith(recognition?.lang.split('-')[0] || 'en'));
    if (targetVoice) newUtterance.voice = targetVoice;
    newUtterance.onstart = () => setSpeechState('playing');
    newUtterance.onend = () => setSpeechState('ended');
    window.speechSynthesis.speak(newUtterance);
  }, []);

  useEffect(() => {
    if (currentQuestion && !feedback) {
      speak(`${currentQuestion.persona}: ${currentQuestion.question}`);
    }
  }, [currentQuestion, feedback, speak]);
  
  const displayedAnswer = isListening ? (finalTranscript + ' ' + transcript) : textAnswer || finalTranscript || transcript;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 250)}px`;
    }
  }, [displayedAnswer]);

  const handleSubmitAnswer = async () => {
      if (isListening) recognition?.stop();
      setIsAnalyzing(true);
      setAppState(AppState.ANALYZING);
      
      try {
        const generatedFeedback = await analyzeAnswer(currentQuestion.question, displayedAnswer.trim(), currentQuestion.keywords, language);
        if (generatedFeedback.spokenFeedback) speak(generatedFeedback.spokenFeedback);

        const newResult = { question: currentQuestion, answer: displayedAnswer.trim(), feedback: generatedFeedback };
        setFeedback(generatedFeedback);
        setResults([...localResults, newResult]);
        setLocalResults(prev => [...prev, newResult]);
        setAppState(AppState.FEEDBACK);
      } catch(error) {
        console.error(error);
        setAppState(AppState.INTERVIEW);
      } finally {
        setIsAnalyzing(false);
      }
  };

  const handleSkipQuestion = () => {
    if (isListening) recognition?.stop();
    window.speechSynthesis.cancel();
    
    const skippedResult: InterviewResult = {
      question: currentQuestion,
      answer: "(Skipped)",
      isSkipped: true,
      feedback: {
        score: 0,
        rating: 'Beginner',
        strengths: [],
        weaknesses: ["Question skipped by user."],
        idealAnswer: "No feedback available for skipped questions.",
        spokenFeedback: "Question skipped.",
        matchedKeywords: [],
        missedKeywords: currentQuestion.keywords
      }
    };

    const updated = [...localResults, skippedResult];
    setResults(updated);
    setLocalResults(updated);
    advanceToNext();
  };

  useEffect(() => {
    if (!recognition) return;
    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      setTranscript(interim);
      if (final) setFinalTranscript(prev => (prev + ' ' + final).trim());
    };
    recognition.onend = () => setIsListening(false);
  }, []);

  const advanceToNext = () => {
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

  return (
    <div className="h-full w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col justify-between overflow-hidden">
      <div className="flex-1 flex flex-col justify-center space-y-6 py-6 overflow-y-auto scrollbar-hide">
        {feedback ? (
          <FeedbackCard 
            feedback={feedback} 
            userAnswer={localResults[localResults.length - 1]?.answer || ''}
            speechState={speechState}
            onToggleSpokenFeedback={() => {
                if (speechState === 'playing') window.speechSynthesis.pause();
                else if (speechState === 'paused') window.speechSynthesis.resume();
                else speak(feedback.spokenFeedback);
            }}
          />
        ) : (
          <div className="animate-fade-in-scale space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-brand-accent-green-light text-brand-accent-green font-bold rounded-full text-[10px] sm:text-xs uppercase tracking-widest">
                  {currentQuestion.persona}
                </div>
                <div className="text-brand-text-light font-bold text-[10px] sm:text-xs">
                  {currentQuestionIndex + 1} / {questions.length}
                </div>
              </div>
              <button 
                onClick={handleSkipQuestion}
                className="text-[10px] sm:text-xs font-bold text-red-400 hover:text-red-500 uppercase tracking-widest transition-colors px-3 py-1 rounded-lg border border-red-100 hover:border-red-200"
              >
                Skip
              </button>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-brand-text-dark leading-tight">
              {currentQuestion.question}
            </h1>
            <div className="relative group">
              <textarea
                ref={textareaRef}
                className="w-full p-5 sm:p-8 bg-white border-2 border-gray-100 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm focus:border-brand-accent-green focus:ring-4 focus:ring-brand-accent-green/5 outline-none transition-all duration-300 resize-none text-lg sm:text-xl placeholder:text-gray-300 min-h-[120px]"
                placeholder="Type your answer here..."
                value={displayedAnswer}
                onChange={(e) => {
                    setTextAnswer(e.target.value);
                    if(isListening) { recognition?.stop(); setIsListening(false); }
                }}
                disabled={isAnalyzing}
              />
              <div className="absolute bottom-4 right-6 text-[10px] font-bold text-gray-300">
                {displayedAnswer.length} / {MAX_CHARS}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <footer className="flex-shrink-0 min-h-[100px] flex flex-col items-center justify-center border-t border-gray-100 pb-[env(safe-area-inset-bottom)] mb-4">
        {isAnalyzing ? (
           <div className="flex items-center gap-3 py-4">
              <LoadingSpinner className="w-6 h-6 text-brand-accent-green" />
              <p className="font-bold text-brand-text-light">Analyzing Performance...</p>
           </div>
        ) : feedback ? (
          <button
            onClick={advanceToNext}
            className="w-full max-w-md bg-brand-text-dark text-white font-bold py-4 rounded-2xl sm:rounded-3xl hover:bg-black transition-all shadow-xl active:scale-95"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Interview'}
          </button>
        ) : (
          <div className="flex items-center gap-4 w-full max-w-xl py-4">
            <button
              onClick={() => {
                if (!recognition) return;
                if (isListening) { recognition.stop(); } 
                else { setTranscript(''); setFinalTranscript(''); setTextAnswer(''); recognition.start(); setIsListening(true); }
              }}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300 shadow-2xl active:scale-90 ${isListening ? 'bg-red-500 scale-105' : 'bg-brand-accent-green hover:bg-brand-accent-green/90'}`}
            >
              {isListening ? <StopIcon className="w-8 h-8 text-white" /> : <MicrophoneIcon className="w-8 h-8 text-white" />}
            </button>
            <button
                onClick={handleSubmitAnswer}
                disabled={!displayedAnswer.trim()}
                className="flex-1 flex justify-center items-center gap-3 bg-brand-text-dark text-white font-bold py-4 rounded-2xl sm:rounded-3xl hover:bg-black transition-all disabled:bg-gray-200 shadow-xl active:scale-95"
            >
                <SendIcon className="w-5 h-5" />
                Submit
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};

export default InterviewScreen;