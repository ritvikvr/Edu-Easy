import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FileText, Calendar, CheckCircle } from 'lucide-react';
import { SummaryJobResult } from '@/lib/schemas';
import StatusBadge from './StatusBadge';

interface ResultHeaderProps {
  job: SummaryJobResult;
}

const ResultHeader: React.FC<ResultHeaderProps> = ({ job }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="p-6 bg-gradient-card border-0 shadow-elegant">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{job.fileName}</h1>
              <p className="text-muted-foreground">Job ID: {job.jobId}</p>
            </div>
          </div>
          
          <StatusBadge status={job.status} />
        </div>

        {/* Progress */}
        {job.status === 'processing' && job.progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Processing Progress</span>
              <span className="font-medium">{Math.round(job.progress)}%</span>
            </div>
            <Progress value={job.progress} className="h-2" />
          </div>
        )}

        {/* Timestamps */}
        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Created: {formatDate(job.createdAt)}</span>
          </div>
          
          {job.completedAt && (
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Completed: {formatDate(job.completedAt)}</span>
            </div>
          )}
        </div>

        {/* Error Display */}
        {job.error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive font-medium">Error:</p>
            <p className="text-destructive/80 text-sm mt-1">{job.error}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ResultHeader;