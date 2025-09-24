import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, CheckCircle } from 'lucide-react';
import { QAResponse } from '@/lib/schemas';
import { cn } from '@/lib/utils';

interface QAFormProps {
  onAskQuestion: (question: string) => Promise<void>;
  isLoading?: boolean;
  lastResponse?: QAResponse | null;
}

const QAForm: React.FC<QAFormProps> = ({ 
  onAskQuestion, 
  isLoading = false,
  lastResponse = null 
}) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      await onAskQuestion(question.trim());
      setQuestion('');
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-success/10 text-success border-success/20';
    if (confidence >= 0.6) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-destructive/10 text-destructive border-destructive/20';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="space-y-6">
      {/* Question Form */}
      <Card className="p-6 bg-gradient-card border-0 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Ask a Question</h3>
          </div>
          
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about the document content..."
            className="min-h-[100px] resize-none border-border focus:border-primary"
            disabled={isLoading}
          />
          
          <Button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="w-full bg-gradient-primary hover:opacity-90 shadow-card"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                Thinking...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Ask Question
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Answer Display */}
      {lastResponse && (
        <Card className="p-6 bg-gradient-subtle border-0 shadow-card">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <h4 className="text-lg font-semibold">Answer</h4>
              </div>
              
              <Badge 
                variant="outline"
                className={getConfidenceColor(lastResponse.confidence)}
              >
                {getConfidenceLabel(lastResponse.confidence)} ({Math.round(lastResponse.confidence * 100)}%)
              </Badge>
            </div>
            
            <div className="prose prose-slate max-w-none">
              <p className="text-foreground leading-relaxed">
                {lastResponse.answer}
              </p>
            </div>
            
            {lastResponse.sources && lastResponse.sources.length > 0 && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Sources:
                </p>
                <div className="flex flex-wrap gap-2">
                  {lastResponse.sources.map((source, index) => (
                    <Badge 
                      key={index}
                      variant="secondary"
                      className="text-xs"
                    >
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default QAForm;