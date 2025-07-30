// Daily/Weekly Summary Popup Component
const SummaryPopup: React.FC<{ onClose: () => void, daily: any, weekly: any }> = ({ onClose, daily, weekly }) => (
  <div className="summary-popup-overlay">
    <div className="summary-popup-box">
      <h2>📊 Your Study Summary</h2>
      <div className="summary-section">
        <h3>Today</h3>
        <ul>
          <li>Notes created: {daily.notes}</li>
          <li>Flashcards created: {daily.flashcards}</li>
          <li>Quizzes taken: {daily.quizzes}</li>
        </ul>
      </div>
      <div className="summary-section">
        <h3>This Week</h3>
        <ul>
          <li>Notes created: {weekly.notes}</li>
          <li>Flashcards created: {weekly.flashcards}</li>
          <li>Quizzes taken: {weekly.quizzes}</li>
        </ul>
      </div>
      <button className="summary-popup-close" onClick={onClose}>Close</button>
    </div>
  </div>
);
import React, { useEffect, useState } from 'react';
// Type definitions for calendar
type CalendarDay = { day: number | null; active: boolean };
type ActivityItem = { date: string };
import { Link } from 'react-router-dom';
import { IoDocumentTextOutline } from "react-icons/io5";
import { PiCards } from "react-icons/pi";
import { RiQuestionMark } from "react-icons/ri";
import '../styles/pages/HomePage.css';

const CalendarSection: React.FC = () => {
  // Get current month and year
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  // Get first day of month
  const firstDay = new Date(year, month, 1).getDay();
  // Get number of days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Get activity days from localStorage
  const activity = JSON.parse(localStorage.getItem('flashlearn-recent-activity') || '[]') as ActivityItem[];
  const activityDays = new Set(activity.map(a => a.date.slice(0, 10)));
  // Build calendar grid
  const weeks: CalendarDay[][] = [];
  let week: CalendarDay[] = [];
  for (let i = 0; i < firstDay; i++) {
    week.push({ day: null, active: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    week.push({ day, active: activityDays.has(dateStr) });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push({ day: null, active: false });
    weeks.push(week);
  }
  // Month name
  const monthName = now.toLocaleString('default', { month: 'long' });
  return (
    <div className="calendar-section">
      <h2 className="calendar-title">Activity Calendar - {monthName} {year}</h2>
      <div className="calendar-grid">
        <div className="calendar-row calendar-header">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="calendar-cell calendar-header-cell">{d}</div>
          ))}
        </div>
        {weeks.map((week, i) => (
          <div key={i} className="calendar-row">
            {week.map((cell, j) => (
              <div
                key={j}
                className={`calendar-cell${cell.day ? ' calendar-day' : ' calendar-empty'}${cell.active ? ' calendar-active' : ''}`}
              >
                {cell.day || ''}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const HomePage: React.FC = () => {
  // Daily/Weekly summary popup state
  const [showSummary, setShowSummary] = useState<boolean>(true);
  const [dailySummary, setDailySummary] = useState<{notes: number, flashcards: number, quizzes: number}>({notes: 0, flashcards: 0, quizzes: 0});
  const [weeklySummary, setWeeklySummary] = useState<{notes: number, flashcards: number, quizzes: number}>({notes: 0, flashcards: 0, quizzes: 0});
  // Daily goal tracker logic
  const DAILY_GOAL = 3;
  const [goalMet, setGoalMet] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  // Recent Activity Timeline logic
  type TimelineItem = { type: string; title: string; description: string; time: string; icon: React.ReactNode };
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);

  useEffect(() => {
    // Use the original arrays loaded from localStorage, which include 'created' and 'taken' fields
    const savedNotes = localStorage.getItem('flashlearn-notes');
    const notesArr: any[] = savedNotes ? JSON.parse(savedNotes) : [];
    const savedFlashcards = localStorage.getItem('flashlearn-flashcards');
    const cardsArr: any[] = savedFlashcards ? JSON.parse(savedFlashcards) : [];
    const savedQuizzes = localStorage.getItem('flashlearn-quizzes');
    const quizzesArr: any[] = savedQuizzes ? JSON.parse(savedQuizzes) : [];

    const timelineArr: TimelineItem[] = [];
    notesArr.forEach(note => {
      if (note.created) {
        timelineArr.push({
          type: 'Note',
          title: note.title,
          description: note.content.slice(0, 60) + (note.content.length > 60 ? '...' : ''),
          time: new Date(note.created).toLocaleString(),
          icon: <IoDocumentTextOutline style={{ color: '#2196f3' }} />
        });
      }
    });
    cardsArr.forEach(card => {
      if (card.created) {
        timelineArr.push({
          type: 'Flashcard',
          title: card.front,
          description: card.back.slice(0, 60) + (card.back.length > 60 ? '...' : ''),
          time: new Date(card.created).toLocaleString(),
          icon: <PiCards style={{ color: '#4caf50' }} />
        });
      }
    });
    quizzesArr.forEach(quiz => {
      if (quiz.taken) {
        timelineArr.push({
          type: 'Quiz',
          title: quiz.title,
          description: `${quiz.questions.length} questions`,
          time: new Date(quiz.taken).toLocaleString(),
          icon: <RiQuestionMark style={{ color: '#ff9800' }} />
        });
      }
    });
    // Sort by time descending
    timelineArr.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setTimeline(timelineArr.slice(0, 10)); // Show up to 10 recent activities
  }, []);
  // ...existing code...
  // Motivational quotes
  const quotes = [
    "Success is the sum of small efforts, repeated day in and day out.",
    "The secret of getting ahead is getting started.",
    "Don’t watch the clock; do what it does. Keep going.",
    "Learning never exhausts the mind.",
    "The future depends on what you do today.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Don’t stop when you’re tired. Stop when you’re done.",
    "Little by little, one travels far."
  ];
  const [quote, setQuote] = useState<string>("");
  useEffect(() => {
    // Pick a random quote on mount
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Array<{type: string, title: string, description: string}>>([]);
  const [notes, setNotes] = useState<Array<{id: string, title: string, content: string}>>([]);
  const [flashcards, setFlashcards] = useState<Array<{id: string, front: string, back: string}>>([]);
  const [quizzes, setQuizzes] = useState<Array<{id: string, title: string, questions: any[], score?: number, feedback?: string}>>([]);
  const [pinnedNotes, setPinnedNotes] = useState<Array<{id: string, title: string, content: string}>>([]);
  const [pinnedFlashcards, setPinnedFlashcards] = useState<Array<{id: string, front: string, back: string}>>([]);
  // ...existing code...

  useEffect(() => {
    // Load notes
    const savedNotes = localStorage.getItem('flashlearn-notes');
    let notesArr: any[] = [];
    if (savedNotes) {
      try {
        notesArr = JSON.parse(savedNotes);
        setNotes(notesArr);
        setPinnedNotes(notesArr.filter((n: any) => n.pinned));
      } catch {
        setNotes([]);
        setPinnedNotes([]);
      }
    }
    // Load flashcards
    const savedFlashcards = localStorage.getItem('flashlearn-flashcards');
    let cardsArr: any[] = [];
    if (savedFlashcards) {
      try {
        cardsArr = JSON.parse(savedFlashcards);
        setFlashcards(cardsArr);
        setPinnedFlashcards(cardsArr.filter((c: any) => c.pinned));
      } catch {
        setFlashcards([]);
        setPinnedFlashcards([]);
      }
    }
    // Load quizzes
    const savedQuizzes = localStorage.getItem('flashlearn-quizzes');
    let quizzesArr: any[] = [];
    if (savedQuizzes) {
      try {
        quizzesArr = JSON.parse(savedQuizzes);
        setQuizzes(quizzesArr);
      } catch {
        setQuizzes([]);
      }
    }
    // Streak logic: count consecutive days with activity
    const today = new Date().toISOString().slice(0, 10);
    let streakCount = 0;
    const activity: ActivityItem[] = JSON.parse(localStorage.getItem('flashlearn-recent-activity') || '[]');
    if (activity.length > 0) {
      const days = activity.map((a: ActivityItem) => a.date.slice(0, 10));
      const uniqueDays = Array.from(new Set(days)) as string[];
      uniqueDays.sort((a: string, b: string) => b.localeCompare(a));
      for (let i = 0; i < uniqueDays.length; i++) {
        const day = new Date(uniqueDays[i]);
        const expectedDay = new Date(today);
        expectedDay.setDate(expectedDay.getDate() - i);
        if (day.toISOString().slice(0, 10) === expectedDay.toISOString().slice(0, 10)) {
          streakCount++;
        } else {
          break;
        }
      }
    }
    setStreak(streakCount);
    // Progress logic: percent of daily goal (e.g., 3 activities per day)
    const todayCount = activity.filter((a: ActivityItem) => a.date.slice(0, 10) === today).length;
    setProgress(Math.min(100, Math.round((todayCount / DAILY_GOAL) * 100)));
    // Daily goal tracker logic
    setGoalMet(todayCount >= DAILY_GOAL);

    // Daily/Weekly summary logic
    // Get today's and this week's date strings
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Sunday
    const weekStartStr = weekStart.toISOString().slice(0, 10);

    // Helper to check if date is in week
    function isInWeek(dateStr: string) {
      const d = new Date(dateStr);
      return d >= weekStart && d <= now;
    }

    // Count notes created today/this week
    const dailyNotes = notesArr.filter(n => n.created && n.created.slice(0, 10) === todayStr).length;
    const weeklyNotes = notesArr.filter(n => n.created && isInWeek(n.created.slice(0, 10))).length;
    // Count flashcards created today/this week
    const dailyCards = cardsArr.filter(c => c.created && c.created.slice(0, 10) === todayStr).length;
    const weeklyCards = cardsArr.filter(c => c.created && isInWeek(c.created.slice(0, 10))).length;
    // Count quizzes taken today/this week
    const dailyQuizzes = quizzesArr.filter(q => q.taken && q.taken.slice(0, 10) === todayStr).length;
    const weeklyQuizzes = quizzesArr.filter(q => q.taken && isInWeek(q.taken.slice(0, 10))).length;

    setDailySummary({ notes: dailyNotes, flashcards: dailyCards, quizzes: dailyQuizzes });
    setWeeklySummary({ notes: weeklyNotes, flashcards: weeklyCards, quizzes: weeklyQuizzes });
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }
    const results: Array<{type: string, title: string, description: string}> = [];
    notes.forEach(note => {
      if (note.title.toLowerCase().includes(searchTerm.toLowerCase()) || note.content.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push({ type: 'Note', title: note.title, description: note.content.slice(0, 60) + (note.content.length > 60 ? '...' : '') });
      }
    });
    flashcards.forEach(card => {
      if (card.front.toLowerCase().includes(searchTerm.toLowerCase()) || card.back.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push({ type: 'Flashcard', title: card.front, description: card.back.slice(0, 60) + (card.back.length > 60 ? '...' : '') });
      }
    });
    quizzes.forEach(quiz => {
      if (quiz.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push({ type: 'Quiz', title: quiz.title, description: `${quiz.questions.length} questions` });
      }
    });
    setSearchResults(results);
  }, [searchTerm, notes, flashcards, quizzes]);

  // Handler to navigate to the relevant page
  // Handler to navigate to the relevant page and optionally pass an id
  const handleItemClick = (type: string, id?: string) => {
    switch (type.toLowerCase()) {
      case 'note':
        window.location.href = id ? `/notes?id=${id}` : '/notes';
        break;
      case 'flashcard':
        window.location.href = id ? `/flashcards?id=${id}` : '/flashcards';
        break;
      case 'quiz':
        window.location.href = id ? `/quiz?id=${id}` : '/quiz';
        break;
      default:
        break;
    }
  };

  return (
    <div className="desktop-home">
      {/* Top Summary Bar */}
      <div className="top-summary-bar">
        <div className="summary-left">
          <h1 className="app-title">FlashLearn</h1>
          <span className="subtitle">Learn in a flash</span>
        </div>
        <div className="summary-center">
          <span className="motivational-quote" role="img" aria-label="lightbulb">💡 {quote}</span>
        </div>
        <div className="summary-right">
          <div className="streak-summary">
            <span className="streak-label">🔥 Streak:</span>
            <span className="streak-count">{streak} day{streak === 1 ? '' : 's'}</span>
          </div>
          <div className="progress-summary">
            <span className="progress-label">Progress:</span>
            <span className="progress-value">{progress}%</span>
          </div>
          <div className="goal-summary">
            <span className="goal-label">Goal:</span>
            <span className="goal-value">{DAILY_GOAL} activities</span>
            <span className={`goal-status ${goalMet ? 'goal-met' : 'goal-not-met'}`}>{goalMet ? '✅' : '🚀'}</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="main-content-grid">
        <div className="main-center">
          {/* Search Bar */}
          <div className="search-bar-box">
            <input
              type="text"
              className="search-bar-input"
              placeholder="Search notes, flashcards, quizzes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <div className="search-results-list">
                {searchResults.length === 0 ? (
                  <div className="search-no-results">No results found.</div>
                ) : (
                  searchResults.map((item, idx) => {
                    let id = '';
                    if (item.type === 'Note') {
                      const found = notes.find(n => n.title === item.title);
                      id = found ? found.id : '';
                    } else if (item.type === 'Flashcard') {
                      const found = flashcards.find(f => f.front === item.title);
                      id = found ? found.id : '';
                    } else if (item.type === 'Quiz') {
                      const found = quizzes.find(q => q.title === item.title);
                      id = found ? found.id : '';
                    }
                    return (
                      <div
                        key={idx}
                        className="search-result-card interactive"
                        tabIndex={0}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleItemClick(item.type, id)}
                        onKeyDown={e => { if (e.key === 'Enter') handleItemClick(item.type, id); }}
                        aria-label={`Go to ${item.type.toLowerCase()} ${item.title}`}
                      >
                        <span className="search-result-type">{item.type}</span>
                        <span className="search-result-title">{item.title}</span>
                        <span className="search-result-description">{item.description}</span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
          {/* Quick Actions */}
          <div className="quick-actions">
            <Link to="/notes" className="action-card">
              <div className="action-icon">
                <IoDocumentTextOutline />
              </div>
              <div className="action-label">Notes</div>
              <p className="action-description">Create and manage your study notes</p>
            </Link>
            <Link to="/flashcards" className="action-card">
              <div className="action-icon">
                <PiCards />
              </div>
              <div className="action-label">Flashcards</div>
              <p className="action-description">Create flashcards from your notes</p>
            </Link>
            <Link to="/quiz" className="action-card">
              <div className="action-icon">
                <RiQuestionMark />
              </div>
              <div className="action-label">Quizzes</div>
              <p className="action-description">Test your knowledge with quizzes</p>
            </Link>
          </div>
        </div>
        <div className="main-right">
          {/* Calendar */}
          <CalendarSection />
          {/* Activity Section */}
          <div className="activity-section">
            {/* Timeline */}
            <div className="recent-activity-timeline-box">
              {timeline.length === 0 ? (
                <div className="timeline-empty">No recent activity yet.</div>
              ) : (
                <ul className="timeline-list">
                  {timeline.map((item, idx) => (
                    <li key={idx} className="timeline-item">
                      <span className="timeline-icon">{item.icon}</span>
                      <span className="timeline-type">{item.type}</span>
                      <span className="timeline-title">{item.title}</span>
                      <span className="timeline-description">{item.description}</span>
                      <span className="timeline-time">{item.time}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Pinned Items */}
            {(pinnedNotes.length > 0 || pinnedFlashcards.length > 0) && (
              <div className="pinned-items-box">
                <div className="pinned-grid">
                  {pinnedNotes.map(note => (
                    <div key={note.id} className="pinned-card pinned-note">
                      <span className="pinned-type">Note</span>
                      <span className="pinned-title">{note.title}</span>
                      <div className="pinned-description">{note.content.slice(0, 60)}{note.content.length > 60 ? '...' : ''}</div>
                    </div>
                  ))}
                  {pinnedFlashcards.map(card => (
                    <div key={card.id} className="pinned-card pinned-flashcard">
                      <span className="pinned-type">Flashcard</span>
                      <span className="pinned-title">{card.front}</span>
                      <div className="pinned-description">{card.back.slice(0, 60)}{card.back.length > 60 ? '...' : ''}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Recent Quiz Results */}
            {quizzes.length > 0 && (
              <div className="quiz-results-box">
                <div className="quiz-results-grid">
                  {quizzes.slice(0, 3).map((quiz, idx) => (
                    <div key={quiz.id} className="quiz-result-card">
                      <span className="quiz-title">{quiz.title}</span>
                      <span className="quiz-score">Score: {typeof quiz.score === 'number' ? `${quiz.score}%` : 'N/A'}</span>
                      {quiz.feedback && <div className="quiz-feedback">{quiz.feedback}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Saved Notes, Flashcards, Quizzes */}
            <div className="recent-activity-box">
              {notes.length === 0 && flashcards.length === 0 && quizzes.length === 0 ? (
                <div className="no-activity">No saved notes, flashcards, or quizzes. Start by creating some!</div>
              ) : (
                <div className="activity-grid">
                  {notes.slice(0, 3).map((note, idx) => (
                    <div
                      key={`note-${note.id}`}
                      className="activity-card activity-note"
                      tabIndex={0}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleItemClick('note')}
                      onKeyDown={e => { if (e.key === 'Enter') handleItemClick('note'); }}
                      aria-label={`Go to note`}
                    >
                      <div className="activity-main">
                        <span className="activity-type">Note</span>
                        <span className="activity-title">{note.title}</span>
                      </div>
                      <div className="activity-description">{note.content.slice(0, 60)}{note.content.length > 60 ? '...' : ''}</div>
                    </div>
                  ))}
                  {flashcards.slice(0, 3).map((card, idx) => (
                    <div
                      key={`flashcard-${card.id}`}
                      className="activity-card activity-flashcard"
                      tabIndex={0}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleItemClick('flashcard')}
                      onKeyDown={e => { if (e.key === 'Enter') handleItemClick('flashcard'); }}
                      aria-label={`Go to flashcard`}
                    >
                      <div className="activity-main">
                        <span className="activity-type">Flashcard</span>
                        <span className="activity-title">{card.front}</span>
                      </div>
                      <div className="activity-description">{card.back.slice(0, 60)}{card.back.length > 60 ? '...' : ''}</div>
                    </div>
                  ))}
                  {quizzes.slice(0, 3).map((quiz, idx) => (
                    <div
                      key={`quiz-${quiz.id}`}
                      className="activity-card activity-quiz"
                      tabIndex={0}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleItemClick('quiz')}
                      onKeyDown={e => { if (e.key === 'Enter') handleItemClick('quiz'); }}
                      aria-label={`Go to quiz`}
                    >
                      <div className="activity-main">
                        <span className="activity-type">Quiz</span>
                        <span className="activity-title">{quiz.title}</span>
                      </div>
                      <div className="activity-description">{quiz.questions && quiz.questions.length > 0 ? `${quiz.questions.length} questions` : 'No questions'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Daily/Weekly Summary Popup */}
      {showSummary && (
        <SummaryPopup
          onClose={() => setShowSummary(false)}
          daily={dailySummary}
          weekly={weeklySummary}
        />
      )}

      <div className="home-footer">
        <p>Select an option above to get started</p>
      </div>
    </div>
  );
};

export default HomePage; 