import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Check, X } from 'lucide-react';
import { Flashcard as FlashcardType } from '@/lib/schemas';
import { cn } from '@/lib/utils';

interface FlashcardProps {
  flashcard: FlashcardType;
  onNext?: () => void;
  onMarkDifficulty?: (difficulty: 'easy' | 'medium' | 'hard') => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ 
  flashcard, 
  onNext,
  onMarkDifficulty 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowAnswer(!showAnswer);
  };

  const handleMarkDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
    onMarkDifficulty?.(difficulty);
    onNext?.();
    setIsFlipped(false);
    setShowAnswer(false);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-success/10 text-success border-success/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'hard':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-card border-0 shadow-elegant">
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline"
              className={getDifficultyColor(flashcard.difficulty)}
            >
              {flashcard.difficulty?.toUpperCase() || 'UNRATED'}
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFlip}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Flip
          </Button>
        </div>

        {/* Card Content */}
        <div className="min-h-[300px] flex items-center justify-center">
          <div className={cn(
            "w-full text-center transition-all duration-500 transform",
            isFlipped && "scale-95"
          )}>
            {!showAnswer ? (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Question
                </h3>
                <p className="text-2xl font-semibold leading-relaxed">
                  {flashcard.front}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Answer
                </h3>
                <p className="text-xl leading-relaxed text-foreground">
                  {flashcard.back}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-4">
          {!showAnswer ? (
            <Button 
              onClick={handleFlip}
              className="w-full bg-gradient-primary hover:opacity-90 shadow-card"
              size="lg"
            >
              Show Answer
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-center text-sm text-muted-foreground mb-4">
                How difficult was this question?
              </p>
              
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleMarkDifficulty('easy')}
                  className="text-success border-success/30 hover:bg-success/10"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Easy
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleMarkDifficulty('medium')}
                  className="text-warning border-warning/30 hover:bg-warning/10"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Medium
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleMarkDifficulty('hard')}
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  <X className="h-4 w-4 mr-2" />
                  Hard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Flashcard;