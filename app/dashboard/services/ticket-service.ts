import { supabase } from '@/lib/supabase/client';
import { Ticket } from '@/types';
import { saveAs } from 'file-saver';
import QRCode from 'qrcode';

export const ticketService = {
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
          <meta charset="utf-8">
          <title>Bus Ticket - ${ticket.ticket_number}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 2rem; }
            .ticket { max-width: 600px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 2rem; }
            .qr-code { text-align: center; margin: 2rem 0; }
            .details { margin: 2rem 0; }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin: 0.5rem 0;
              padding: 0.5rem 0;
              border-bottom: 1px solid #eee;
            }
            .label { color: #666; }
            .value { font-weight: 500; }
            .footer {
              margin-top: 2rem;
              text-align: center;
              color: #666;
              font-size: 0.875rem;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <h1>Bus Ticket</h1>
              <h2>#${ticket.ticket_number}</h2>
              <p>Status: ${ticket.status.toUpperCase()}</p>
            </div>

            <div class="qr-code">
              <img src="${qrDataUrl}" alt="Ticket QR Code" />
            </div>

            <div class="details">
              <div class="detail-row">
                <span class="label">From:</span>
                <span class="value">${ticket.from_location}</span>
              </div>
              <div class="detail-row">
                <span class="label">To:</span>
                <span class="value">${ticket.to_location}</span>
              </div>
              <div class="detail-row">
                <span class="label">Passenger:</span>
                <span class="value">${ticket.passenger_name}</span>
              </div>
              <div class="detail-row">
                <span class="label">Seat:</span>
                <span class="value">${ticket.seat_number}</span>
              </div>
              <div class="detail-row">
                <span class="label">Amount:</span>
                <span class="value">₱${ticket.amount.toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span class="label">Payment Method:</span>
                <span class="value">${ticket.payment_method.toUpperCase()}</span>
              </div>
            </div>

            <div class="footer">
              <p>Please show this ticket to the conductor before boarding.</p>
              <p>Valid only for the date and route shown above.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  async downloadTicket(ticket: Ticket) {
    try {
      const html = await this.generateTicketHTML(ticket);
      const blob = new Blob([html], { type: 'text/html' });
      saveAs(blob, `ticket-${ticket.ticket_number}.html`);
      return true;
    } catch (error) {
      console.error('Error downloading ticket:', error);
      throw error;
    }
  },

  async shareTicket(ticket: Ticket) {
    try {
      const shareData = {
        title: 'Bus Ticket',
        text: `Bus ticket from ${ticket.from_location} to ${ticket.to_location}`,
        url: `${window.location.origin}/tickets/${ticket.id}`
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(
          `${window.location.origin}/tickets/${ticket.id}`
        );
        return 'copied';
      }

      return 'shared';
    } catch (error) {
      console.error('Error sharing ticket:', error);
      throw error;
    }
  }
};
