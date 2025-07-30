import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1 className="landing-title">Welcome to <span className="brand">FlashLearn</span></h1>
        <p className="landing-subtitle">Your all-in-one study assistant for notes, flashcards, and quizzes.</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Smart Notes</h3>
            <p>Organize your study material with easy-to-use note management. Edit, save, and revisit your notes anytime.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📇</div>
            <h3>Flashcards Generator</h3>
            <p>Automatically create flashcards from your notes to boost your memory and retention.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">❓</div>
            <h3>Quizzes & Practice</h3>
            <p>Test your knowledge with custom quizzes. Get instant feedback and track your progress.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Dashboard & Activity</h3>
            <p>See your recent activity, track learning streaks, and stay motivated with a personalized dashboard.</p>
          </div>
        </div>
        <div className="cta-section">
          <Link to="/home" className="landing-start-btn">Get Started</Link>
          <p className="cta-note">No account required. Your data stays private on your device.</p>
        </div>
      </div>
      <footer className="landing-footer">
        <p>Made with ❤️ for students and lifelong learners.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
