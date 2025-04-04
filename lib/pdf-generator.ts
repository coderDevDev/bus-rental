import { jsPDF } from 'jspdf';
import type { Ticket } from '@/types';
import QRCode from 'qrcode';

export async function generateTicketPDF(ticket: Ticket): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5'
  });

  // Generate QR code
  const qrCodeData = await QRCode.toDataURL(
    JSON.stringify({
      ticket_number: ticket.ticket_number,
      passenger_name: ticket.passenger_name,
      from: ticket.from_location,
      to: ticket.to_location,
      date: ticket.created_at
    })
  );

  // Add logo and header
  doc.setFontSize(20);
  doc.setTextColor(128, 0, 0); // Maroon color
  doc.text('NorthPoint Bus', 74, 20);

  // Add QR code
  doc.addImage(qrCodeData, 'PNG', 65, 30, 40, 40);

  // Add ticket details
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);

  const details = [
    ['Ticket Number:', ticket.ticket_number],
    ['Passenger:', ticket.passenger_name],
    ['Type:', ticket.passenger_type],
    ['From:', ticket.from_location],
    ['To:', ticket.to_location],
    ['Seat:', ticket.seat_number],
    ['Amount:', `₱${ticket.amount.toFixed(2)}`],
    ['Date:', new Date(ticket.created_at).toLocaleDateString()],
    ['Time:', new Date(ticket.created_at).toLocaleTimeString()]
  ];

  let y = 80;
  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.text(label, 20, y);
    doc.setFont('helvetica', 'bold');
    doc.text(value.toString(), 60, y);
    y += 8;
  });

  // Add footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'This is a computer-generated document. No signature required.',
    20,
    140
  );

  return doc.output('blob');
}
