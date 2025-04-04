import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2 } from 'lucide-react';

interface TicketQRProps {
  ticketNumber: string;
  qrData: string;
  onDownload: () => void;
  onShare: () => void;
}

export function TicketQR({
  ticketNumber,
  qrData,
  onDownload,
  onShare
}: TicketQRProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Ticket #{ticketNumber}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="bg-white p-4 rounded-lg">
          <QRCodeSVG value={qrData} size={200} />
        </div>
        <div className="flex gap-2 w-full">
          <Button variant="outline" className="flex-1" onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" className="flex-1" onClick={onShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
