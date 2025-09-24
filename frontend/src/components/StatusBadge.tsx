import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Loader } from 'lucide-react';
import { JobStatusType } from '@/lib/schemas';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: JobStatusType;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getStatusConfig = (status: JobStatusType) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          label: 'Pending',
          className: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20'
        };
      case 'processing':
        return {
          icon: Loader,
          label: 'Processing',
          className: 'bg-processing/10 text-processing border-processing/20 hover:bg-processing/20'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          label: 'Completed',
          className: 'bg-success/10 text-success border-success/20 hover:bg-success/20'
        };
      case 'failed':
        return {
          icon: AlertCircle,
          label: 'Failed',
          className: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
        };
      default:
        return {
          icon: Clock,
          label: 'Unknown',
          className: 'bg-muted text-muted-foreground'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium transition-colors',
        config.className,
        className
      )}
    >
      <Icon 
        className={cn(
          'h-3.5 w-3.5',
          status === 'processing' && 'animate-spin'
        )} 
      />
      <span>{config.label}</span>
    </Badge>
  );
};

export default StatusBadge;