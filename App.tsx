import React, { useState, useCallback, useEffect } from 'react';
import { AppState, InterviewType, InterviewQuestion, InterviewResult, InterviewDifficulty, JobDetails, SavedInterviewSession, SupportedLanguage } from './types';
import * as geminiService from './services/geminiService';
import SetupScreen from './components/SetupScreen';
import InterviewScreen from './components/InterviewScreen';
import ProgressReportModal from './components/ProgressReportModal';
import CompletionScreen from './components/CompletionScreen';
import Sidebar from './components/Sidebar';
import DashboardScreen from './components/DashboardScreen';
import HistoryScreen from './components/HistoryScreen';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.DASHBOARD);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [results, setResults] = useState<InterviewResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SavedInterviewSession[]>([]);
  const [sessionForReport, setSessionForReport] = useState<InterviewResult[] | null>(null);
  
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [interviewType, setInterviewType] = useState<InterviewType | null>(null);
  const [interviewDifficulty, setInterviewDifficulty] = useState<InterviewDifficulty | null>(null);
  const [interviewLanguage, setInterviewLanguage] = useState<SupportedLanguage>(SupportedLanguage.ENGLISH);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai-interview-coach-sessions');
      if (saved) {
        setSessions(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load past sessions:", error);
    }
  }, []);

  const handleStartInterview = useCallback(async (jd: string, type: InterviewType, difficulty: InterviewDifficulty, language: SupportedLanguage, customQuestions: string[]) => {
    setAppState(AppState.GENERATING);
    setError(null);
    setInterviewType(type);
    setInterviewDifficulty(difficulty);
    setInterviewLanguage(language);
    try {
      const details = await geminiService.parseJobDescription(jd);
      setJobDetails(details);
      const generatedQuestions = await geminiService.generateQuestions(details, type, difficulty, language, customQuestions);
      if (generatedQuestions && generatedQuestions.length > 0) {
        setQuestions(generatedQuestions);
        setResults([]);
        setAppState(AppState.INTERVIEW);
      } else {
        throw new Error("The AI failed to generate questions.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Setting up failed.");
      setAppState(AppState.SETUP);
    }
  }, []);

  const saveSession = useCallback((results: InterviewResult[]) => {
    if (jobDetails && interviewType && interviewDifficulty) {
      const newSession: SavedInterviewSession = {
        id: new Date().toISOString(),
        date: new Date().toISOString(),
        jobTitle: jobDetails.jobTitle,
        interviewType,
        difficulty: interviewDifficulty,
        language: interviewLanguage,
        results,
      };
      
      const updated = [newSession, ...sessions];
      setSessions(updated);
      localStorage.setItem('ai-interview-coach-sessions', JSON.stringify(updated));
    }
  }, [jobDetails, interviewType, interviewDifficulty, interviewLanguage, sessions]);

  const deleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem('ai-interview-coach-sessions', JSON.stringify(updated));
  };

  const isInterviewActive = appState === AppState.INTERVIEW || 
                           appState === AppState.ANALYZING || 
                           appState === AppState.FEEDBACK || 
                           appState === AppState.GENERATING;

  const handleNavigate = (state: AppState) => {
    if (isInterviewActive && !window.confirm("Abandon current interview?")) return;
    setAppState(state);
    setError(null);
  };

  const renderCurrentPage = () => {
    switch (appState) {
      case AppState.DASHBOARD:
        return <DashboardScreen 
          sessions={sessions} 
          onStartNew={() => setAppState(AppState.SETUP)} 
          onViewHistory={() => setAppState(AppState.HISTORY)}
        />;
      case AppState.HISTORY:
        return <HistoryScreen 
          sessions={sessions} 
          onViewSession={setSessionForReport} 
          onDeleteSession={deleteSession} 
        />;
      case AppState.SETUP:
      case AppState.GENERATING:
        return <SetupScreen 
          onStart={handleStartInterview} 
          isLoading={appState === AppState.GENERATING}
          onViewPastSession={setSessionForReport}
          error={error}
        />;
      case AppState.INTERVIEW:
      case AppState.ANALYZING:
      case AppState.FEEDBACK:
        return <InterviewScreen 
          questions={questions} 
          language={interviewLanguage}
          // Fix: Simplified setResults to directly use the InterviewResult[] passed from InterviewScreen.
          // The previous version incorrectly attempted to call the array as a function in an unreachable branch.
          setResults={(res) => {
            setResults(res);
          }} 
          setAppState={setAppState} 
        />;
      case AppState.COMPLETE:
        return <CompletionScreen 
          onReset={() => {
            saveSession(results);
            setAppState(AppState.DASHBOARD);
          }}
          onViewReport={() => setSessionForReport(results)}
          results={results}
          jobTitle={jobDetails?.jobTitle}
        />;
      default:
        return <DashboardScreen sessions={sessions} onStartNew={() => setAppState(AppState.SETUP)} onViewHistory={() => setAppState(AppState.HISTORY)} />;
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-brand-bg font-sans flex flex-col md:flex-row text-brand-text-dark overflow-hidden overscroll-none">
      <Sidebar 
        currentState={appState} 
        onNavigate={handleNavigate} 
        isHidden={isInterviewActive || appState === AppState.COMPLETE} 
      />
      
      <main className="flex-1 overflow-y-auto relative h-full scroll-smooth">
        {renderCurrentPage()}
      </main>

      {sessionForReport && (
        <ProgressReportModal
            onClose={() => setSessionForReport(null)}
            results={sessionForReport}
        />
      )}
    </div>
  );
};

export default App;