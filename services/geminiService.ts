import { GoogleGenAI, Type } from "@google/genai";
import { JobDetails, InterviewQuestion, AnswerFeedback, InterviewType, InterviewDifficulty } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

export const parseJobDescription = async (jd: string): Promise<JobDetails> => {
  const prompt = `Parse the following job description and extract the key skills and responsibilities. Return the result as a JSON object with two keys: "skills" and "responsibilities", both containing arrays of strings.

Job Description:
---
${jd}
---
`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
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
        required: ["skills", "responsibilities"],
      },
    },
  });

  const parsedResponse = JSON.parse(response.text);
  return parsedResponse;
};

export const generateQuestions = async (jobDetails: JobDetails, interviewType: InterviewType, difficulty: InterviewDifficulty): Promise<InterviewQuestion[]> => {
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
    case InterviewDifficulty.MEDIUM:
    default:
      difficultyPrompt = "The questions should be of medium difficulty, appropriate for a mid-level candidate.";
      break;
  }


  const prompt = `You are an expert interview panel. Based on the following job details, generate a set of interview questions that feel natural and conversational, not robotic. The questions should be insightful and encourage detailed responses.
${personaPrompt}
${difficultyPrompt}

The response must be a JSON object containing a "questions" array. Each object in the array should have three keys: 
1. "question" (the insightful, human-like question text)
2. "persona" (e.g., "HR Manager", "Technical Lead")
3. "keywords" (an array of 5-10 essential keywords or concepts an ideal answer should contain).

Job Details:
- Skills: ${jobDetails.skills.join(", ")}
- Responsibilities: ${jobDetails.responsibilities.join(", ")}
`;

  const response = await ai.models.generateContent({
    model,
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
  
  const parsedResponse = JSON.parse(response.text);
  return parsedResponse.questions;
};


export const analyzeAnswer = async (question: string, answer: string, keywords: string[]): Promise<AnswerFeedback> => {
  const prompt = `You are a friendly and experienced interview coach. Analyze the following interview answer and provide feedback that is encouraging, constructive, and human. Avoid overly formal or robotic language.

Question:
"${question}"

Essential Keywords for a good answer:
${keywords.join(", ")}

Candidate's Answer:
"${answer}"

Your analysis must be a JSON object with the following keys:
1.  "strengths": An array of strings highlighting what was good about the answer. Be specific and positive.
2.  "weaknesses": An array of strings suggesting areas for improvement. Frame these as actionable tips, not just criticisms.
3.  "idealAnswer": A concise, well-structured example of an ideal answer. It should sound natural, like how a top candidate would actually speak. Avoid jargon where possible.
4.  "spokenFeedback": A comprehensive, conversational, and encouraging summary to be spoken aloud. Start by addressing the candidate warmly. Briefly cover the strengths and areas for improvement in a friendly tone, and then smoothly transition into suggesting the ideal answer as a helpful example. Keep it sounding like genuine, spoken advice from a coach.
5.  "matchedKeywords": An array of strings from the "Essential Keywords" list that were present or clearly alluded to in the candidate's answer.
6.  "missedKeywords": An array of strings from the "Essential Keywords" list that were NOT mentioned in the answer.
7.  "score": A numerical score from 0 to 10 evaluating the answer's quality, with 10 being a perfect answer.
8.  "rating": A rating of "Beginner", "Intermediate", or "Advanced" based on the score and overall quality. A score < 4 is Beginner, 4-7 is Intermediate, and > 7 is Advanced.
`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Positive aspects of the candidate's answer.",
          },
          weaknesses: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Areas where the candidate's answer could be improved.",
          },
          idealAnswer: {
            type: Type.STRING,
            description: "An example of a strong, well-structured answer to the question.",
          },
          spokenFeedback: {
            type: Type.STRING,
            description: "A comprehensive, conversational, and encouraging spoken feedback detailing strengths, weaknesses, and an ideal answer.",
          },
          matchedKeywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Keywords from the provided list that the user mentioned.",
          },
          missedKeywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Keywords from the provided list that the user missed.",
          },
          score: {
            type: Type.NUMBER,
            description: "A score from 0-10 for the answer.",
          },
          rating: {
            type: Type.STRING,
            description: "A rating of 'Beginner', 'Intermediate', or 'Advanced'.",
          },
        },
        required: ["strengths", "weaknesses", "idealAnswer", "spokenFeedback", "matchedKeywords", "missedKeywords", "score", "rating"],
      },
    },
  });

  const parsedResponse = JSON.parse(response.text);
  return parsedResponse;
};