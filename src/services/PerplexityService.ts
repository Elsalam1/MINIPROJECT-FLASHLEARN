import axios from 'axios';
import { getPlainTextFromSlate } from '../components/NoteEditor';

// Use OpenRouter API key from Vite environment variable
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

interface FlashCard {
  front: string;
  back: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

// Helper function to extract plain text from note content (which might be JSON)
const getPlainTextContent = (content: string): string => {
  try {
    // Try to parse as JSON (for Slate format)
    const parsed = JSON.parse(content);
    return getPlainTextFromSlate(parsed);
  } catch (e) {
    // If it's not valid JSON, return as is (legacy plain text format)
    return content;
  }
};


class OpenRouterService {
  private readonly apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private readonly headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  };

  /**
   * Generate flashcards from note content using OpenRouter API
   */
  async generateFlashcards(noteContent: string): Promise<FlashCard[]> {
    try {
      const plainTextContent = getPlainTextContent(noteContent);
      const response = await axios.post(
        this.apiUrl,
        {
          model: "openai/gpt-3.5-turbo", // You can change to another OpenRouter-supported model
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that generates flashcards for studying. Format your response as a JSON array of objects with 'front' and 'back' properties."
            },
            {
              role: "user",
              content: `Generate 5 flashcards from the following note: ${plainTextContent}`
            }
          ]
        },
        { headers: this.headers }
      );
      const content = response.data.choices[0].message.content;
      let flashcards: FlashCard[] = [];
      // Try to extract JSON from code blocks first
      const jsonCodeBlockMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonCodeBlockMatch && jsonCodeBlockMatch[1]) {
        try {
          flashcards = JSON.parse(jsonCodeBlockMatch[1]);
          return flashcards;
        } catch (parseError) {
          console.log('Error parsing JSON from code block:', parseError);
        }
      }
      // Try to extract array directly
      const arrayMatch = content.match(/\[([\s\S]*?)\]/);
      if (arrayMatch && arrayMatch[0]) {
        try {
          flashcards = JSON.parse(arrayMatch[0]);
          return flashcards;
        } catch (parseError) {
          console.log('Error parsing JSON array:', parseError);
        }
      }
      // As a last resort, try to parse the entire content
      try {
        flashcards = JSON.parse(content);
        return flashcards;
      } catch (parseError) {
        console.log('Error parsing entire content as JSON:', parseError);
        throw new Error('Unable to parse flashcards from API response');
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      return [];
    }
  }

  /**
   * Generate quiz questions from note content using OpenRouter API
   */
  async generateQuiz(noteContent: string): Promise<QuizQuestion[]> {
    try {
      const plainTextContent = getPlainTextContent(noteContent);
      const response = await axios.post(
        this.apiUrl,
        {
          model: "openai/gpt-3.5-turbo", // You can change to another OpenRouter-supported model
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that creates quiz questions from study notes."
            },
            {
              role: "user",
              content: `Generate 5 multiple-choice quiz questions with 4 options each from these notes: ${plainTextContent}. Return them in a JSON array of objects with fields: question, options (array of strings), and correctAnswer (0-indexed number). Only return valid JSON, nothing else.`
            }
          ]
        },
        { headers: this.headers }
      );
      const content = response.data.choices[0].message.content.trim();
      let quizQuestions: QuizQuestion[] = [];
      // Try to parse the JSON directly
      try {
        quizQuestions = JSON.parse(content);
        return quizQuestions;
      } catch (parseError) {
        console.log('Direct JSON parse failed:', parseError);
        // Try to extract JSON if surrounded by markdown code blocks or backticks
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```|`([\s\S]*?)`/);
        if (jsonMatch) {
          try {
            const jsonStr = (jsonMatch[1] || jsonMatch[2]).trim();
            quizQuestions = JSON.parse(jsonStr);
            return quizQuestions;
          } catch (markdownParseError) {
            console.log('Markdown JSON extraction failed:', markdownParseError);
          }
        }
      }
      // As a last resort, try to manually extract the JSON
      console.error('Failed to parse quiz questions from API response');
      return [];
    } catch (error) {
      console.error('Error generating quiz:', error);
      return [];
    }
  }
}

export default new OpenRouterService();