
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
  recognition.lang = 'en-US';
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

  // Update recognition language based on choice
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
    // Try to match the voice to the language
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = recognition?.lang.split('-')[0] || 'en';
    const targetVoice = voices.find(v => v.lang.startsWith(langPrefix));
    if (targetVoice) newUtterance.voice = targetVoice;

    newUtterance.rate = 1.0; 
    newUtterance.pitch = 1.0;
    newUtterance.onstart = () => setSpeechState('playing');
    newUtterance.onend = () => setSpeechState('ended');
    window.speechSynthesis.speak(newUtterance);
  }, []);

  useEffect(() => {
    if (currentQuestion && !feedback) {
      speak(`${currentQuestion.persona} asks: ${currentQuestion.question}`);
    }
  }, [currentQuestion, feedback, speak]);
  
  const displayedAnswer = isListening ? (finalTranscript + ' ' + transcript) : textAnswer || finalTranscript || transcript;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 250)}px`;
    }
  }, [displayedAnswer]);

  const handleSubmitAnswer = useCallback(async () => {
      if (isListening) recognition?.stop();
      setIsAnalyzing(true);
      setAppState(AppState.ANALYZING);
      
      const answerToSubmit = displayedAnswer.trim();
      if (!answerToSubmit) {
          setIsAnalyzing(false);
          setAppState(AppState.INTERVIEW);
          return;
      }

      try {
        const generatedFeedback = await analyzeAnswer(currentQuestion.question, answerToSubmit, currentQuestion.keywords, language);
        if (generatedFeedback.spokenFeedback) speak(generatedFeedback.spokenFeedback);

        const newResult = { question: currentQuestion, answer: answerToSubmit, feedback: generatedFeedback };
        setFeedback(generatedFeedback);
        setLocalResults(prev => {
          const updated = [...prev, newResult];
          setResults(updated);
          return updated;
        });
        setAppState(AppState.FEEDBACK);
      } catch(error) {
        setAppState(AppState.INTERVIEW);
      } finally {
        setIsAnalyzing(false);
      }
  }, [isListening, displayedAnswer, currentQuestion, language, setAppState, setResults, speak]);

  const handleSkipQuestion = useCallback(() => {
    if (isListening) recognition?.stop();
    window.speechSynthesis.cancel();
    
    // Add a placeholder result or just move forward
    const skippedResult: InterviewResult = {
      question: currentQuestion,
      answer: "(Skipped)",
      isSkipped: true,
      feedback: {
        score: 0,
        rating: 'Beginner',
        strengths: [],
        weaknesses: ["Question was skipped."],
        idealAnswer: "No feedback available for skipped questions.",
        spokenFeedback: "Question skipped.",
        matchedKeywords: [],
        missedKeywords: currentQuestion.keywords
      }
    };

    setLocalResults(prev => {
      const updated = [...prev, skippedResult];
      setResults(updated);
      return updated;
    });

    advanceToNext(true);
  }, [currentQuestion, isListening, setResults]);

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
    return () => { recognition.stop(); window.speechSynthesis.cancel(); };
  }, []);

  const handleToggleListening = () => {
    if (!recognition) return;
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

  const advanceToNext = (skipFeedback = false) => {
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
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-brand-accent-green-light text-brand-accent-green font-bold rounded-full text-[10px] sm:text-xs uppercase tracking-widest">
                  {currentQuestion.persona}
                </div>
                <div className="text-brand-text-light font-bold text-[10px] sm:text-xs uppercase tracking-widest">
                  {currentQuestionIndex + 1} / {questions.length}
                </div>
              </div>
              <button 
                onClick={handleSkipQuestion}
                className="text-[10px] sm:text-xs font-bold text-red-500 hover:text-red-600 uppercase tracking-widest"
              >
                Skip Question
              </button>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-brand-text-dark leading-tight">
              {currentQuestion.question}
            </h1>
            <div className="relative group">
              <textarea
                ref={textareaRef}
                className="w-full p-5 sm:p-8 bg-white border-2 border-gray-100 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm focus:border-brand-accent-green focus:ring-4 focus:ring-brand-accent-green/5 outline-none transition-all duration-300 resize-none text-lg sm:text-xl placeholder:text-gray-300 min-h-[120px]"
                placeholder="Compose your response here..."
                value={displayedAnswer}
                onChange={(e) => {
                    setTextAnswer(e.target.value);
                    if(isListening) { recognition?.stop(); setIsListening(false); }
                }}
                disabled={isAnalyzing}
              />
              <div className="absolute bottom-4 right-6 text-[10px] sm:text-xs font-bold text-gray-300">
                {displayedAnswer.length} / {MAX_CHARS}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <footer className="flex-shrink-0 min-h-[100px] flex flex-col items-center justify-center border-t border-gray-100 pb-[env(safe-area-inset-bottom)] mb-4">
        {isAnalyzing ? (
           <div className="flex items-center gap-3 py-4">
              <LoadingSpinner className="w-5 h-5 sm:w-6 sm:h-6 text-brand-accent-green" />
              <p className="font-bold text-xs sm:text-base text-brand-text-light">Analyzing Performance...</p>
           </div>
        ) : feedback ? (
          <button
            onClick={() => advanceToNext(false)}
            className="w-full max-w-md bg-brand-text-dark text-white font-bold py-4 sm:py-5 rounded-2xl sm:rounded-3xl hover:bg-black transition-all shadow-xl text-sm sm:text-base active:scale-[0.98]"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'View Full Report'}
          </button>
        ) : (
          <div className="flex items-center gap-3 sm:gap-4 w-full max-w-xl py-4">
            <button
              onClick={handleToggleListening}
              className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300 shadow-2xl active:scale-90 ${isListening ? 'bg-red-500 hover:bg-red-600 scale-105' : 'bg-brand-accent-green hover:bg-brand-accent-green/90'}`}
            >
              {isListening ? <StopIcon className="w-7 h-7 sm:w-10 sm:h-10 text-white" /> : <MicrophoneIcon className="w-7 h-7 sm:w-10 sm:h-10 text-white" />}
            </button>
            <button
                onClick={handleSubmitAnswer}
                disabled={!displayedAnswer.trim()}
                className="flex-1 flex justify-center items-center gap-2 sm:gap-3 bg-brand-text-dark text-white font-bold py-4 sm:py-5 rounded-2xl sm:rounded-3xl hover:bg-black transition-all disabled:bg-gray-200 shadow-xl text-sm sm:text-base active:scale-[0.98]"
            >
                <SendIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                Submit Answer
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};

export default InterviewScreen;
