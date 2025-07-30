import React, { useState, useEffect, useRef } from 'react';
import QuizQuestion from '../components/QuizQuestion';
import PerplexityService from '../services/PerplexityService';
import useElectron from '../hooks/useElectron';
import '../styles/pages/QuizPage.css';

interface QuizQuestionItem {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Note {
  id: string;
  title: string;
  content: string;
}

const QuizPage: React.FC = () => {
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [totalAnswered, setTotalAnswered] = useState<number>(0);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [quizAttempt, setQuizAttempt] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { saveData, loadData } = useElectron();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load notes from storage
        const savedNotes = await loadData('flashlearn-notes');
        if (savedNotes) {
          setNotes(savedNotes);
        }

        // Load quiz questions from storage
        const savedQuizQuestions = await loadData('flashlearn-quiz-questions');
        if (savedQuizQuestions) {
          setQuizQuestions(savedQuizQuestions);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    fetchData();
  }, [loadData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleGenerateQuiz = async () => {
    if (!selectedNoteId) return;
    const selectedNote = notes.find(note => note.id === selectedNoteId);
    if (!selectedNote) return;
    setIsGenerating(true);
    try {
      const generatedQuizQuestions = await PerplexityService.generateQuiz(selectedNote.content);
      const newQuizQuestions = generatedQuizQuestions.map(question => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer
      }));
      setQuizQuestions(newQuizQuestions);
      setScore(0);
      setTotalAnswered(0);
      await saveData('flashlearn-quiz-questions', newQuizQuestions);
      // Add to recent activity
      const activity = JSON.parse(localStorage.getItem('flashlearn-recent-activity') || '[]');
      activity.unshift({ type: 'quiz', title: `Generated quiz from "${selectedNote.title}"`, date: new Date().toISOString() });
      localStorage.setItem('flashlearn-recent-activity', JSON.stringify(activity.slice(0, 10)));
    } catch (error) {
      console.error('Error generating quiz questions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSubmit = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }
    setTotalAnswered(prevTotal => prevTotal + 1);
  };

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setDropdownOpen(false);
  };

  const getSelectedNoteName = () => {
    if (!selectedNoteId) return "Select a note to generate a quiz";
    const selectedNote = notes.find(note => note.id === selectedNoteId);
    return selectedNote ? selectedNote.title : "Select a note to generate a quiz";
  };

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <h1>Quiz</h1>
        <div className="quiz-controls">
          <div className="custom-dropdown" ref={dropdownRef}>
            <div 
              className="dropdown-selected" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span>{getSelectedNoteName()}</span>
              <svg className={`dropdown-icon ${dropdownOpen ? 'open' : ''}`} viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            {dropdownOpen && (
              <div className="dropdown-options">
                {notes.length > 0 ? (
                  notes.map(note => (
                    <div 
                      key={note.id} 
                      className={`dropdown-option ${note.id === selectedNoteId ? 'selected' : ''}`}
                      onClick={() => handleSelectNote(note.id)}
                    >
                      {note.title}
                    </div>
                  ))
                ) : (
                  <div className="dropdown-option disabled">No notes available</div>
                )}
              </div>
            )}
          </div>
          <button 
            className="generate-btn"
            onClick={handleGenerateQuiz}
            disabled={!selectedNoteId || isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Quiz'}
          </button>
        </div>
      </div>

      {quizQuestions.length > 0 && (
        <div className="quiz-score">
          <p>
            Score: <span className="score-value">{score}</span> / {totalAnswered} 
            {totalAnswered > 0 && (
              <span className="score-percentage">
                ({Math.round((score / totalAnswered) * 100)}%)
              </span>
            )}
          </p>
          {/* Final feedback and retake button */}
          {totalAnswered === quizQuestions.length && quizQuestions.length > 0 && (
            <div className="final-feedback">
              <p>
                {score === quizQuestions.length
                  ? 'Excellent! You got all questions correct.'
                  : score > 0
                    ? `You got ${score} out of ${quizQuestions.length} correct. Try again to improve your score!`
                    : 'No correct answers. Try again!'}
              </p>
              {/* Add to recent activity on completion */}
              <button
                className="generate-btn"
                onClick={() => {
                  setScore(0);
                  setTotalAnswered(0);
                  setQuizAttempt(prev => prev + 1);
                  // Add to recent activity
                  const activity = JSON.parse(localStorage.getItem('flashlearn-recent-activity') || '[]');
                  activity.unshift({ type: 'quiz', title: `Completed quiz (${score}/${quizQuestions.length})`, date: new Date().toISOString() });
                  localStorage.setItem('flashlearn-recent-activity', JSON.stringify(activity.slice(0, 10)));
                }}
              >
                Retake Quiz
              </button>
            </div>
          )}
        </div>
      )}

      {quizQuestions.length === 0 ? (
        <div className="empty-quiz">
          <p>You don't have any quiz questions yet. Select a note and generate a quiz to get started!</p>
        </div>
      ) : (
        <div className="quiz-questions-container">
          {quizQuestions.map(question => (
            <QuizQuestion 
              key={question.id + '-' + quizAttempt}
              question={question.question}
              options={question.options}
              correctAnswer={question.correctAnswer}
              onAnswerSubmit={handleAnswerSubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizPage; 