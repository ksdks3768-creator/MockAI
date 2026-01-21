import { GoogleGenAI, Type } from "@google/genai";
import { JobDetails, InterviewQuestion, AnswerFeedback, InterviewType, InterviewDifficulty, SupportedLanguage } from '../types';

// Initializing the AI client with the provided environment variable.
// This allows you to simply swap the API_KEY in your environment and the app will function.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-3-flash-preview for high-speed performance competing with Groq
const SPEED_MODEL = 'gemini-3-flash-preview';

export const parseJobDescription = async (jd: string): Promise<JobDetails> => {
  const prompt = `Parse the following job description. Extract the specific job title, key skills, and responsibilities. Return the result as a JSON object with three keys: "jobTitle", "skills", and "responsibilities".

Job Description:
---
${jd}
---
`;

  const response = await ai.models.generateContent({
    model: SPEED_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          jobTitle: { type: Type.STRING },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["jobTitle", "skills", "responsibilities"],
      },
    },
  });

  // Using .text property instead of deprecated .text() method
  const text = response.text;
  if (!text) throw new Error("API returned an empty response.");
  return JSON.parse(text.trim());
};

export const generateQuestions = async (
  jobDetails: JobDetails, 
  interviewType: InterviewType, 
  difficulty: InterviewDifficulty,
  language: SupportedLanguage,
  customQuestionTexts: string[] = []
): Promise<InterviewQuestion[]> => {
  const prompt = `You are an expert interviewer. Generate 5 unique questions in ${language} for a ${difficulty} level ${interviewType}.
  
  Job Details:
  - Title: ${jobDetails.jobTitle}
  - Skills: ${jobDetails.skills.join(", ")}
  
  Instructions:
  - Output questions, personas, and keywords in ${language}.
  - Personas should be diverse (e.g., Senior Engineer, HR Manager, VP of Product).
  ${customQuestionTexts.length > 0 ? `- Incorporate these custom themes: ${customQuestionTexts.join(', ')}` : ''}
  `;

  const response = await ai.models.generateContent({
    model: SPEED_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                persona: { type: Type.STRING },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["question", "persona", "keywords"],
            },
          },
        },
        required: ["questions"],
      },
    },
  });
  
  const text = response.text;
  if (!text) throw new Error("API returned an empty response.");
  const parsed = JSON.parse(text.trim());
  return parsed.questions;
};

export const analyzeAnswer = async (question: string, answer: string, keywords: string[], language: SupportedLanguage): Promise<AnswerFeedback> => {
  const prompt = `Analyze the candidate's answer to the interview question.
  
  Question: "${question}"
  Candidate Answer: "${answer}"
  Language: ${language}
  
  Evaluate strengths, weaknesses, provide an ideal response, and a numeric score (0-10).
  Ensure all text feedback is in ${language}.`;

  const response = await ai.models.generateContent({
    model: SPEED_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          idealAnswer: { type: Type.STRING },
          spokenFeedback: { type: Type.STRING },
          matchedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          missedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          score: { type: Type.NUMBER },
          rating: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced'] },
        },
        required: ["strengths", "weaknesses", "idealAnswer", "spokenFeedback", "matchedKeywords", "missedKeywords", "score", "rating"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("API returned an empty response.");
  return JSON.parse(text.trim());
};