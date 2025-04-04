export function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Button onClick={() => setIssuingTicket(true)}>
        <TicketIcon className="mr-2 h-4 w-4" />
        Issue Ticket
      </Button>
      <Button onClick={() => setScanning(true)}>
        <QrCode className="mr-2 h-4 w-4" />
        Scan Ticket
      </Button>
      <Button onClick={handleClockIn}>
        <Clock className="mr-2 h-4 w-4" />
        Clock In/Out
      </Button>
      <Button onClick={() => setShowingReport(true)}>
        <FileText className="mr-2 h-4 w-4" />
        Daily Report
      </Button>
    </div>
  );
}
