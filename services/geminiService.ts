import { GoogleGenAI, Type } from "@google/genai";
import { JobDetails, InterviewQuestion, AnswerFeedback, InterviewType, InterviewDifficulty, SupportedLanguage } from '../types';

// The Google GenAI SDK client initialized with the process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseJobDescription = async (jd: string): Promise<JobDetails> => {
  const prompt = `Parse the following job description. Extract the specific job title, key skills, and responsibilities. Return the result as a JSON object with three keys: "jobTitle", "skills", and "responsibilities".

Job Description:
---
${jd}
---
`;

  // Basic Text Task: Use 'gemini-3-flash-preview' for extraction and parsing.
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          jobTitle: {
            type: Type.STRING,
            description: "The specific job title for the role, e.g., 'Senior Frontend Engineer'."
          },
          skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of key technical and soft skills required for the role.",
          },
          responsibilities: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of the main responsibilities and duties of the role.",
          },
        },
        required: ["jobTitle", "skills", "responsibilities"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("Failed to extract text from the model response.");
  return JSON.parse(text.trim());
};

export const generateQuestions = async (
  jobDetails: JobDetails, 
  interviewType: InterviewType, 
  difficulty: InterviewDifficulty,
  language: SupportedLanguage,
  customQuestionTexts: string[] = []
): Promise<InterviewQuestion[]> => {
  let personaPrompt = "";
  switch (interviewType) {
    case InterviewType.HR:
      personaPrompt = "Generate 5 questions typical of an HR manager, focusing on behavioral aspects, company fit, and career goals.";
      break;
    case InterviewType.TECHNICAL:
      personaPrompt = "Generate 5 deep technical questions to rigorously assess the candidate's skills.";
      break;
    case InterviewType.PANEL:
      personaPrompt = "Generate 5 questions for a panel interview, with a mix of personas: 1 from an HR Manager, 2 from a Technical Lead, 1 from a Senior Teammate, and 1 from a Hiring Manager.";
      break;
  }

  let difficultyPrompt = "";
  switch (difficulty) {
    case InterviewDifficulty.EASY:
      difficultyPrompt = "The questions should be easy, suitable for a junior or entry-level candidate.";
      break;
    case InterviewDifficulty.HARD:
      difficultyPrompt = "The questions should be hard and complex, designed to challenge a senior or principal-level candidate.";
      break;
    case InterviewDifficulty.EXPERT:
      difficultyPrompt = "The questions should be extremely challenging, targeting a domain expert or staff-level candidate.";
      break;
    case InterviewDifficulty.MEDIUM:
    default:
      difficultyPrompt = "The questions should be of medium difficulty, appropriate for a mid-level candidate.";
      break;
  }

  const customPrompt = customQuestionTexts.length > 0 
    ? `Additionally, the user provided these custom questions: [${customQuestionTexts.join(' | ')}]. Include them and determine appropriate personas.` 
    : "";

  const prompt = `You are an expert interview panel. Based on the following job details, generate a set of interview questions.
IMPORTANT: You MUST generate all text (questions, personas, keywords) in ${language}.

${personaPrompt}
${difficultyPrompt}
${customPrompt}

Job Details:
- Job Title: ${jobDetails.jobTitle}
- Skills: ${jobDetails.skills.join(", ")}
- Responsibilities: ${jobDetails.responsibilities.join(", ")}
`;

  // Complex Reasoning Task: Use 'gemini-3-pro-preview' for advanced interview scenario generation.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
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
                keywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
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
  if (!text) throw new Error("Failed to extract text from the model response.");
  const parsedResponse = JSON.parse(text.trim());
  return parsedResponse.questions;
};

export const analyzeAnswer = async (question: string, answer: string, keywords: string[], language: SupportedLanguage): Promise<AnswerFeedback> => {
  const prompt = `Analyze the interview answer.
IMPORTANT: You MUST provide all feedback (strengths, weaknesses, idealAnswer, spokenFeedback, rating) in ${language}.

Question: "${question}"
Keywords: ${keywords.join(", ")}
Answer: "${answer}"
`;

  // Complex reasoning and evaluation task: Use 'gemini-3-pro-preview' for grading and detailed feedback.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
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
          rating: { type: Type.STRING },
        },
        required: ["strengths", "weaknesses", "idealAnswer", "spokenFeedback", "matchedKeywords", "missedKeywords", "score", "rating"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("Failed to extract text from the model response.");
  return JSON.parse(text.trim());
};