import { Ticket } from '@/types';
import { format } from 'date-fns';
import QRCode from 'qrcode';

export const pdfService = {
  async generateTicketHTML(ticket: Ticket): Promise<string> {
    const qrDataUrl = await QRCode.toDataURL(
      ticket.qr_code ||
        JSON.stringify({
          id: ticket.id,
          number: ticket.ticket_number
        })
    );

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .ticket { max-width: 600px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .details { margin: 20px 0; }
            .qr-code { text-align: center; margin: 20px 0; }
            .footer { text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <h1>Bus Ticket</h1>
              <h2>Ticket #${ticket.ticket_number}</h2>
            </div>
            
            <div class="details">
              <p><strong>From:</strong> ${ticket.from_location}</p>
              <p><strong>To:</strong> ${ticket.to_location}</p>
              <p><strong>Passenger:</strong> ${ticket.passenger_name}</p>
              <p><strong>Seat:</strong> ${ticket.seat_number}</p>
              <p><strong>Type:</strong> ${ticket.passenger_type}</p>
              <p><strong>Amount:</strong> ₱${ticket.amount.toFixed(2)}</p>
              <p><strong>Date:</strong> ${format(
                new Date(ticket.created_at),
                'PPP'
              )}</p>
            </div>

            <div class="qr-code">
              <img src="${qrDataUrl}" alt="Ticket QR Code" />
            </div>

            <div class="footer">
              <p>Please show this ticket to the conductor before boarding.</p>
              <p>Valid only for the date and route shown above.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
};
