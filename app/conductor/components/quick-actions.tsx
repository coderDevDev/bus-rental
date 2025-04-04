import { Button } from '@/components/ui/button';
import { TicketIcon, QrCode, Clock, FileText } from 'lucide-react';
import type { QuickActionsProps } from './types';

export function QuickActions({
  onIssueTicket,
  onScanTicket,
  onClockIn,
  onShowReport,
  isOnDuty
}: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Button
        variant="outline"
        className="h-auto py-4 px-3 flex flex-col items-center gap-2"
        onClick={onIssueTicket}>
        <TicketIcon className="h-5 w-5" />
        <span className="text-xs">Issue Ticket</span>
      </Button>
      <Button
        variant="outline"
        className="h-auto py-4 px-3 flex flex-col items-center gap-2"
        onClick={onScanTicket}>
        <QrCode className="h-5 w-5" />
        <span className="text-xs">Scan Ticket</span>
      </Button>
      <Button
        variant={isOnDuty ? 'destructive' : 'outline'}
        className="h-auto py-4 px-3 flex flex-col items-center gap-2"
        onClick={onClockIn}>
        <Clock className="h-5 w-5" />
        <span className="text-xs">{isOnDuty ? 'Clock Out' : 'Clock In'}</span>
      </Button>
      <Button
        variant="outline"
        className="h-auto py-4 px-3 flex flex-col items-center gap-2"
        onClick={onShowReport}>
        <FileText className="h-5 w-5" />
        <span className="text-xs">Daily Report</span>
      </Button>
    </div>
  );
}
