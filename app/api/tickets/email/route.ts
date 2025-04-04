import { NextResponse } from 'next/server';
// import { createTransport } from 'nodemailer';
// import { supabase } from '@/lib/supabase/server';

// const transporter = createTransport({
//   // Configure your email service here
//   // Example for Gmail:
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD
//   }
// });

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const ticketFile = formData.get('ticket') as File;
    const email = formData.get('email') as string;
    const ticketId = formData.get('ticketId') as string;

    // // Get ticket details from database
    // const { data: ticket, error } = await supabase
    //   .from('tickets')
    //   .select('*')
    //   .eq('id', ticketId)
    //   .single();

    // if (error) throw error;

    // // Send email
    // await transporter.sendMail({
    //   from: process.env.EMAIL_FROM,
    //   to: email,
    //   subject: `Your Bus Ticket #${ticket.ticket_number}`,
    //   html: `
    //     <h1>Your Bus Ticket</h1>
    //     <p>Thank you for choosing our service!</p>
    //     <p>Please find your ticket attached.</p>
    //     <p>
    //       <strong>From:</strong> ${ticket.from_location}<br>
    //       <strong>To:</strong> ${ticket.to_location}<br>
    //       <strong>Date:</strong> ${new Date(
    //         ticket.created_at
    //       ).toLocaleDateString()}
    //     </p>
    //   `,
    //   attachments: [
    //     {
    //       filename: `ticket-${ticket.ticket_number}.pdf`,
    //       content: await ticketFile.arrayBuffer()
    //     }
    //   ]
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
