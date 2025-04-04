import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  User,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  Calendar,
  Edit2
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function PassengerProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    phone: '',
    preferredPayment: 'cash',
    preferredLocation: ''
  });

  const stats = {
    totalTrips: 24,
    totalDistance: '1,234 km',
    favoriteRoute: 'Legazpi → Manila',
    memberSince: 'January 2024'
  };

  const initials = formData.name
    .split(' ')
    .map((n: string) => n[0])
    .join('');

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-maroon-800">
                {formData.name}
              </h2>
              <p className="text-sm text-muted-foreground">{formData.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              // Edit Form
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, phone: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment">Preferred Payment</Label>
                  <Select
                    value={formData.preferredPayment}
                    onValueChange={value =>
                      setFormData(prev => ({
                        ...prev,
                        preferredPayment: value
                      }))
                    }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="ewallet">E-Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              // View Mode
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-maroon-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{formData.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-maroon-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">
                      {formData.phone || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-maroon-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Preferred Payment
                    </p>
                    <p className="font-medium capitalize">
                      {formData.preferredPayment}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Travel Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Travel Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Trips</p>
                <p className="text-2xl font-bold text-maroon-800">
                  {stats.totalTrips}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Distance</p>
                <p className="text-2xl font-bold text-maroon-800">
                  {stats.totalDistance}
                </p>
              </div>
            </div>
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-maroon-500" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Favorite Route
                  </p>
                  <p className="font-medium">{stats.favoriteRoute}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-maroon-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">{stats.memberSince}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
