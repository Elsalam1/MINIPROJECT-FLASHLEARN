import React, { useState } from 'react';
import '../styles/components/FlashCard.css';

interface FlashCardProps {
  front: string;
  back: string;
  cards?: { front: string; back: string }[];
  index?: number;
  onComplete?: () => void;
}

const FlashCard: React.FC<FlashCardProps> = ({ front, back, cards, index = 0, onComplete }) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(index);
  const [repeatList, setRepeatList] = useState<number[]>([]);
  const [rememberedList, setRememberedList] = useState<number[]>([]);
  const [mode, setMode] = useState<'normal' | 'repetitive'>('normal');
  const [showComplete, setShowComplete] = useState<boolean>(false);

  // If cards prop is provided, enable repetitive mode
  const isRepetitive = Array.isArray(cards) && cards.length > 0;

  const handleFlip = () => {
    setIsFlipped(f => !f);
  };

  const handleRemembered = () => {
    if (!isRepetitive) return;
    setRememberedList(prev => [...prev, currentIndex]);
    nextCard();
  };

  const handleRepeat = () => {
    if (!isRepetitive) return;
    setRepeatList(prev => [...prev, currentIndex]);
    nextCard();
  };

  const nextCard = () => {
    if (!isRepetitive) return;
    let nextIdx = currentIndex + 1;
    // If at end, check for repeats
    if (nextIdx >= cards!.length) {
      // Filter out remembered cards
      const toRepeat = repeatList.filter(idx => !rememberedList.includes(idx));
      if (toRepeat.length === 0) {
        // All cards remembered
        setShowComplete(true);
        if (onComplete) onComplete();
        setMode('normal');
        setCurrentIndex(0);
        setRepeatList([]);
        setRememberedList([]);
        setIsFlipped(false);
        return;
      }
      setCurrentIndex(toRepeat[0]);
      setRepeatList(toRepeat.slice(1));
      setIsFlipped(false);
      return;
    }
    setCurrentIndex(nextIdx);
    setIsFlipped(false);
  };

  const startRepetitiveMode = () => {
    if (!isRepetitive) return;
    setMode('repetitive');
    setCurrentIndex(0);
    setRepeatList([]);
    setRememberedList([]);
    setIsFlipped(false);
    setShowComplete(false);
  };

  // Card data for current index
  let cardFront = front;
  let cardBack = back;
  if (isRepetitive && cards && cards.length > 0 && cards[currentIndex]) {
    cardFront = typeof cards[currentIndex].front === 'string' && cards[currentIndex].front.trim() !== ''
      ? cards[currentIndex].front
      : front;
    cardBack = typeof cards[currentIndex].back === 'string' && cards[currentIndex].back.trim() !== ''
      ? cards[currentIndex].back
      : 'No back content';
  }

  // Progress bar calculation
  const progressPercent = isRepetitive && cards!.length > 0 ? Math.round((rememberedList.length / cards!.length) * 100) : 0;

  return (
    <div className={`flash-card simple-flash-card ${isFlipped ? 'flipped' : ''}`}> 
      <div className="flash-card-inner simple-flash-card-inner" onClick={handleFlip}>
        {!isFlipped ? (
          <div className="flash-card-front simple-flash-card-face">
            <p>{cardFront}</p>
          </div>
        ) : (
          <div className="flash-card-back simple-flash-card-face">
            <p>{cardBack}</p>
          </div>
        )}
      </div>
      {isRepetitive && mode === 'repetitive' && (
        <div className="flash-card-actions">
          <button className="remembered-btn" onClick={handleRemembered}>Remembered</button>
          <button className="repeat-btn" onClick={handleRepeat}>Repeat</button>
        </div>
      )}
      {isRepetitive && mode === 'normal' && (
        <div className="flash-card-actions">
          <button className="start-repetitive-btn" onClick={startRepetitiveMode}>Start Repetitive Learning</button>
        </div>
      )}
      {showComplete && (
        <div className="flashcard-complete-modal">
          <div className="flashcard-complete-content">
            <h2>All cards remembered!</h2>
            <p>You completed the repetitive learning session.</p>
            <button onClick={() => setShowComplete(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashCard; 