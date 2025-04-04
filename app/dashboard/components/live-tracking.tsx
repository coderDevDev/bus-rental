'use client';

// Update LiveTracking component to include:

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RouteMap } from '@/components/conductor/route-map';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { Ticket, LocationUpdate } from '@/types';
import { useGeolocation } from '@/hooks/use-geolocation';
import { format } from 'date-fns';
import { useBusLocation } from '@/hooks/use-bus-location';
import {
  calculateDistance,
  calculateETA,
  isNearLocation
} from '@/lib/geo-utils';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/client';
import { TicketTimeline } from './ticket-timeline';
import { TicketQR } from './ticket-qr';
import { JourneyRating } from './journey-rating';
import { saveAs } from 'file-saver';
import QRCode from 'qrcode';
import { pdfService } from '../services/pdf-service';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { JourneySummary } from './journey-summary';

interface LiveTrackingProps {
  activeTickets: Ticket[];
}

export function LiveTracking({ activeTickets }: LiveTrackingProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { location: userLocation } = useGeolocation();
  const [eta, setEta] = useState<string>('');
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const [lastNotification, setLastNotification] = useState<string | null>(null);
  const [busLocation, setBusLocation] = useState<{
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
    lastUpdate: string;
  } | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [journeyStats, setJourneyStats] = useState<{
    duration: number;
    distance: number;
  } | null>(null);

  // Update passenger location in database
  useEffect(() => {
    if (!userLocation || !selectedTicket) return;

    const updateLocation = async () => {
      try {
        const { error } = await supabase.from('location_updates').upsert({
          passenger_id: selectedTicket.passenger_id,
          assignment_id: selectedTicket.assignment_id,
          ticket_id: selectedTicket.id,
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          heading: userLocation.heading,
          updated_at: new Date().toISOString()
        });

        if (error) throw error;
      } catch (error) {
        console.error('Error updating location:', error);
      }
    };

    const interval = setInterval(updateLocation, 10000); // Update every 10 seconds
    updateLocation(); // Initial update

    return () => clearInterval(interval);
  }, [userLocation, selectedTicket]);

  // Subscribe to bus location updates
  useEffect(() => {
    if (!selectedTicket?.assignment_id) return;

    const channel = supabase
      .channel(`bus-location-${selectedTicket.assignment_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'location_updates',
          filter: `assignment_id=eq.${selectedTicket.assignment_id}`
        },
        payload => {
          if (payload.new && 'conductor_id' in payload.new) {
            setBusLocation({
              latitude: payload.new.latitude,
              longitude: payload.new.longitude,
              heading: payload.new.heading,
              speed: payload.new.speed,
              lastUpdate: payload.new.updated_at
            });
          }
        }
      )
      .subscribe();

    // Initial fetch of bus location
    const fetchBusLocation = async () => {
      const { data, error } = await supabase
        .from('location_updates')
        .select('*')
        .eq('assignment_id', selectedTicket.assignment_id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setBusLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          heading: data.heading,
          speed: data.speed,
          lastUpdate: data.updated_at
        });
      }
    };

    fetchBusLocation();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTicket]);

  useEffect(() => {
    if (activeTickets.length > 0 && !selectedTicket) {
      // Get the most recent ticket
      const mostRecentTicket = activeTickets.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
      setSelectedTicket(mostRecentTicket);
    }
  }, [activeTickets, selectedTicket]);

  // Calculate distances and ETA
  useEffect(() => {
    if (!busLocation || !userLocation || !selectedTicket) return;

    const passengerCoords = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude
    };

    const busCoords = {
      latitude: busLocation.latitude,
      longitude: busLocation.longitude
    };

    const destinationCoords = {
      latitude: selectedTicket.to_location_latitude,
      longitude: selectedTicket.to_location_longitude
    };

    // Distance from bus to destination
    const busToDestination = calculateDistance(busCoords, destinationCoords);

    // Calculate progress
    const totalDistance = calculateDistance(
      {
        latitude: selectedTicket.from_location_latitude,
        longitude: selectedTicket.from_location_longitude
      },
      destinationCoords
    );

    console.log({ selectedTicket, totalDistance });
    const completed =
      ((totalDistance - busToDestination) / totalDistance) * 100;
    setProgress(Math.max(0, Math.min(100, completed)));

    // Calculate ETA
    const estimatedMinutes = calculateETA(
      busToDestination,
      busLocation.speed || 40
    );
    const arrival = new Date(Date.now() + estimatedMinutes * 60000);
    setEta(format(arrival, 'h:mm a'));

    // Notify if bus is approaching passenger
    if (
      isNearLocation(busCoords, passengerCoords, 1) &&
      lastNotification !== 'bus-approaching'
    ) {
      toast({
        title: 'Bus Approaching',
        description: 'Your bus is less than 1km away',
        duration: 5000
      });
      setLastNotification('bus-approaching');
    }

    // Journey milestones notifications
    if (completed >= 25 && lastNotification !== '25-percent') {
      toast({
        title: '25% Complete',
        description: 'Your journey is quarter way through'
      });
      setLastNotification('25-percent');
    } else if (completed >= 50 && lastNotification !== '50-percent') {
      toast({
        title: 'Halfway There',
        description: 'Your journey is halfway complete'
      });
      setLastNotification('50-percent');
    } else if (completed >= 75 && lastNotification !== '75-percent') {
      toast({
        title: 'Almost There',
        description: 'Your journey is 75% complete'
      });
      setLastNotification('75-percent');
    } else if (completed >= 90 && lastNotification !== 'arriving') {
      toast({
        title: 'Arriving Soon',
        description: 'You are approaching your destination'
      });
      setLastNotification('arriving');
    }
  }, [busLocation, userLocation, selectedTicket, lastNotification, toast]);

  const handleDownloadTicket = async () => {
    if (!selectedTicket) return;

    try {
      const html = await pdfService.generateTicketHTML(selectedTicket);
      const blob = new Blob([html], { type: 'text/html' });
      saveAs(blob, `ticket-${selectedTicket.ticket_number}.html`);
    } catch (error) {
      console.error('Error downloading ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to download ticket',
        variant: 'destructive'
      });
    }
  };

  const handleShareTicket = async () => {
    if (!selectedTicket) return;

    try {
      await navigator.share({
        title: 'Bus Ticket',
        text: `Bus ticket from ${selectedTicket.from_location} to ${selectedTicket.to_location}`,
        url: `${window.location.origin}/tickets/${selectedTicket.id}`
      });
    } catch (error) {
      console.error('Error sharing ticket:', error);
      // Fallback to copying to clipboard
      await navigator.clipboard.writeText(
        `${window.location.origin}/tickets/${selectedTicket.id}`
      );
      toast({
        title: 'Link Copied',
        description: 'Ticket link copied to clipboard'
      });
    }
  };

  const handleRateJourney = async (rating: number, feedback: string) => {
    if (!selectedTicket) return;

    try {
      await supabase.from('journey_ratings').insert({
        ticket_id: selectedTicket.id,
        passenger_id: selectedTicket.passenger_id,
        rating,
        feedback,
        created_at: new Date().toISOString()
      });

      toast({
        title: 'Thank You',
        description: 'Your feedback has been submitted'
      });
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit rating',
        variant: 'destructive'
      });
    }
  };

  const handleCompleteJourney = async () => {
    if (!selectedTicket) return;

    try {
      const completed_at = new Date().toISOString();
      const { error } = await supabase
        .from('tickets')
        .update({
          status: 'completed' as const,
          completed_at
        })
        .eq('id', selectedTicket.id);

      if (error) {
        console.error('Database error:', error);
        throw new Error('Failed to update ticket status');
      }

      // Calculate journey stats
      const startTime = new Date(selectedTicket.created_at);
      const endTime = new Date(completed_at);
      const duration = Math.round(
        (endTime.getTime() - startTime.getTime()) / 60000
      ); // minutes

      const distance = calculateDistance(
        {
          latitude: selectedTicket.from_location_latitude,
          longitude: selectedTicket.from_location_longitude
        },
        {
          latitude: selectedTicket.to_location_latitude,
          longitude: selectedTicket.to_location_longitude
        }
      );

      setJourneyStats({ duration, distance });

      // Update local state
      setSelectedTicket(prev =>
        prev ? { ...prev, status: 'completed', completed_at } : null
      );

      toast({
        title: 'Journey Completed',
        description: 'Thank you for traveling with us!'
      });

      setShowCompleteDialog(false);
    } catch (error) {
      console.error('Error completing journey:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete journey',
        variant: 'destructive'
      });
    }
  };

  if (!selectedTicket) return null;

  const mapData = selectedTicket && {
    startLocation: {
      name: selectedTicket.from_location,
      coordinates: [
        selectedTicket.from_location_longitude,
        selectedTicket.from_location_latitude
      ] as [number, number]
    },
    endLocation: {
      name: selectedTicket.to_location,
      coordinates: [
        selectedTicket.to_location_longitude,
        selectedTicket.to_location_latitude
      ] as [number, number]
    },
    currentLocation: busLocation
      ? {
          coordinates: [busLocation.longitude, busLocation.latitude] as [
            number,
            number
          ],
          heading: busLocation.heading
        }
      : undefined,
    passengerLocation: userLocation
      ? {
          coordinates: [userLocation.longitude, userLocation.latitude] as [
            number,
            number
          ],
          heading: userLocation.heading
        }
      : undefined,
    stops: [],
    showPath: true
  };

  return (
    <div className="space-y-6">
      {/* Ticket Selector */}
      <div className="flex items-center gap-4">
        <Select
          value={selectedTicket.id}
          onValueChange={value => {
            const ticket = activeTickets.find(t => t.id === value);
            if (ticket) setSelectedTicket(ticket);
          }}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a ticket to track" />
          </SelectTrigger>
          <SelectContent>
            {activeTickets.map(ticket => (
              <SelectItem key={ticket.id} value={ticket.id}>
                {ticket.from_location} → {ticket.to_location} (
                {format(new Date(ticket.created_at), 'MMM d, h:mm a')})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge
          variant="outline"
          className="ml-auto bg-green-100 text-green-800 border-green-200">
          {selectedTicket.status}
        </Badge>
      </div>

      {/* Add Timeline */}
      <TicketTimeline
        status={selectedTicket.status}
        fromLocation={selectedTicket.from_location}
        toLocation={selectedTicket.to_location}
        currentProgress={progress}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Map Card - Make it span 2 columns */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Live Tracking</span>
                {eta && (
                  <Badge variant="outline" className="ml-2">
                    ETA: {eta}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mapData && (
                <RouteMap
                  startLocation={mapData.startLocation}
                  endLocation={mapData.endLocation}
                  currentLocation={mapData.currentLocation}
                  passengerLocation={mapData.passengerLocation}
                  stops={mapData.stops}
                  className="h-[400px] w-full rounded-md border"
                  showPath={mapData.showPath}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* QR Code - Side column */}
        <div>
          <TicketQR
            ticketNumber={selectedTicket.ticket_number}
            qrData={
              selectedTicket.qr_code ||
              JSON.stringify({
                id: selectedTicket.id,
                number: selectedTicket.ticket_number
              })
            }
            onDownload={handleDownloadTicket}
            onShare={handleShareTicket}
          />
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{selectedTicket.from_location}</span>
              <span>{selectedTicket.to_location}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-maroon-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-center text-muted-foreground">
              {progress.toFixed(0)}% of journey completed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Journey Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-maroon-600" />
              <div>
                <p className="text-sm font-medium">Current Location</p>
                <p className="text-sm text-muted-foreground">
                  {mapData.passengerLocation
                    ? 'Tracking...'
                    : 'Waiting for location...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card> */}

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-maroon-600" />
              <div>
                <p className="text-sm font-medium">Estimated Time</p>
                <p className="text-sm text-muted-foreground">
                  {eta || 'Calculating...'}
                </p>
                {progress > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Journey Progress: {progress.toFixed(0)}%
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-maroon-600" />
              <div>
                <p className="text-sm font-medium">Status Updates</p>
                <p className="text-sm text-muted-foreground">On schedule</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedTicket.status === 'active' && (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-maroon-600" />
                  <div>
                    <p className="text-sm font-medium">Complete Journey</p>
                    <p className="text-sm text-muted-foreground">
                      Mark this journey as completed
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowCompleteDialog(true)}>
                  Complete Journey
                </Button>
              </div>
            </CardContent>
          </Card>

          <ConfirmDialog
            open={showCompleteDialog}
            onOpenChange={setShowCompleteDialog}
            title="Complete Journey"
            description="Are you sure you want to mark this journey as completed? This action cannot be undone."
            confirmText="Yes, Complete Journey"
            onConfirm={handleCompleteJourney}
          />
        </>
      )}

      {selectedTicket.status === 'completed' && journeyStats && (
        <>
          <JourneySummary
            ticket={selectedTicket}
            duration={journeyStats.duration}
            distance={journeyStats.distance}
          />
          <JourneyRating
            ticketId={selectedTicket.id}
            onSubmit={handleRateJourney}
          />
        </>
      )}
    </div>
  );
}
