import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: typeof Bell;
}

export function NotificationPreferences() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'departure',
      title: 'Departure Reminders',
      description: 'Get notified 1 hour before your scheduled trip',
      enabled: true,
      icon: Clock
    },
    {
      id: 'delays',
      title: 'Delay Alerts',
      description: 'Receive updates about any delays or changes',
      enabled: true,
      icon: AlertTriangle
    },
    {
      id: 'stops',
      title: 'Stop Notifications',
      description: 'Get notified when approaching your stop',
      enabled: false,
      icon: MapPin
    },
    {
      id: 'updates',
      title: 'Service Updates',
      description: 'Receive general service and route updates',
      enabled: false,
      icon: Bell
    }
  ]);

  const handleToggle = (id: string) => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const handleSave = () => {
    // Save to backend
    toast({
      title: 'Success',
      description: 'Notification preferences updated'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-maroon-800">
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {settings.map(setting => (
          <div
            key={setting.id}
            className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <setting.icon className="w-4 h-4 text-maroon-600" />
                <Label htmlFor={setting.id} className="font-medium">
                  {setting.title}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {setting.description}
              </p>
            </div>
            <Switch
              id={setting.id}
              checked={setting.enabled}
              onCheckedChange={() => handleToggle(setting.id)}
            />
          </div>
        ))}
        <Button
          onClick={handleSave}
          className="w-full bg-maroon-600 hover:bg-maroon-700">
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
}
