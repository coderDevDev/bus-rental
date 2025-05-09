import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');

  if (!origin || !destination) {
    return NextResponse.json(
      { error: 'Origin and destination are required' },
      { status: 400 }
    );
  }

  try {
    // Search for routes that include both origin and destination
    // This is a simplified example - you'll need to adjust based on your database schema
    const routes = await db.route.findMany({
      where: {
        AND: [
          {
            stops: {
              some: {
                location: {
                  city: {
                    contains: origin,
                    mode: 'insensitive'
                  }
                }
              }
            }
          },
          {
            stops: {
              some: {
                location: {
                  city: {
                    contains: destination,
                    mode: 'insensitive'
                  }
                }
              }
            }
          }
        ],
        status: 'active'
      },
      include: {
        stops: {
          include: {
            location: true
          }
        }
      }
    });

    return NextResponse.json(routes);
  } catch (error) {
    console.error('Error searching routes:', error);
    return NextResponse.json(
      { error: 'Failed to search routes' },
      { status: 500 }
    );
  }
}
