'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { ArrowLeft, Bus, Eye, EyeOff, Phone, User } from 'lucide-react';
import { signUp } from '@/lib/supabase/auth';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Role } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { signUpSchema, type SignUpFormData } from './schema';
import { locationService } from '@/lib/location-service';

type Region = { id: string; name: string; code: string };
type Province = { id: string; name: string; region_code: string; code: string };
type City = { id: string; name: string; province_code: string; code: string };
type Barangay = { id: string; name: string; city_code: string; code: string };

export default function SignUp() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [regions, setRegions] = useState<Region[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);

  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedBarangay, setSelectedBarangay] = useState<string>('');

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      phone: '',
      role: 'passenger',
      address: '',
      birthdate: '',
      gender: 'male'
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = form;

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const regionList = await locationService.getRegions();
        setRegions(regionList);
      } catch (error) {
        console.error('Failed to load regions:', error);
      }
    };

    loadRegions();
  }, []);

  useEffect(() => {
    if (!selectedRegion) {
      setProvinces([]);
      return;
    }

    const loadProvinces = async () => {
      try {
        const provinceList = await locationService.getProvinces(selectedRegion);
        setProvinces(provinceList);
        setSelectedProvince('');
        setCities([]);
        setBarangays([]);
      } catch (error) {
        console.error('Failed to load provinces:', error);
      }
    };

    loadProvinces();
  }, [selectedRegion]);

  useEffect(() => {
    if (!selectedProvince) {
      setCities([]);
      return;
    }

    const loadCities = async () => {
      try {
        const cityList = await locationService.getCities(selectedProvince);
        setCities(cityList);
        setSelectedCity('');
        setBarangays([]);
      } catch (error) {
        console.error('Failed to load cities:', error);
      }
    };

    loadCities();
  }, [selectedProvince]);

  useEffect(() => {
    if (!selectedCity) {
      setBarangays([]);
      return;
    }

    const loadBarangays = async () => {
      try {
        const barangayList = await locationService.getBarangays(selectedCity);
        setBarangays(barangayList);
        setSelectedBarangay('');
      } catch (error) {
        console.error('Failed to load barangays:', error);
      }
    };

    loadBarangays();
  }, [selectedCity]);

  useEffect(() => {
    if (selectedRegion) {
      const region = regions.find(r => r.code === selectedRegion);
      if (region) {
        setValue('regionCode', region.code);
        setValue('regionName', region.name);
      }
    }
  }, [selectedRegion, regions, setValue]);

  useEffect(() => {
    if (selectedProvince) {
      const province = provinces.find(p => p.code === selectedProvince);
      if (province) {
        setValue('provinceCode', province.code);
        setValue('provinceName', province.name);
      }
    }
  }, [selectedProvince, provinces, setValue]);

  useEffect(() => {
    if (selectedCity) {
      const city = cities.find(c => c.code === selectedCity);
      if (city) {
        setValue('cityCode', city.code);
        setValue('cityName', city.name);
      }
    }
  }, [selectedCity, cities, setValue]);

  useEffect(() => {
    if (selectedBarangay) {
      const barangay = barangays.find(b => b.code === selectedBarangay);
      if (barangay) {
        setValue('barangayCode', barangay.code);
        setValue('barangayName', barangay.name);
      }
    }
  }, [selectedBarangay, barangays, setValue]);

  const onSubmit = async (data: SignUpFormData) => {
    try {
      // Format the address from all fields for display
      const formattedAddress = [
        data.houseNumber,
        data.street,
        selectedBarangay
          ? barangays.find(b => b.code === selectedBarangay)?.name
          : '',
        selectedCity ? cities.find(c => c.code === selectedCity)?.name : '',
        selectedProvince
          ? provinces.find(p => p.code === selectedProvince)?.name
          : '',
        selectedRegion
          ? regions.find(r => r.code === selectedRegion)?.name
          : '',
        data.postalCode
      ]
        .filter(Boolean)
        .join(', ');

      // Get the names for selected location codes
      const regionName =
        regions.find(r => r.code === selectedRegion)?.name || '';
      const provinceName =
        provinces.find(p => p.code === selectedProvince)?.name || '';
      const cityName = cities.find(c => c.code === selectedCity)?.name || '';
      const barangayName =
        barangays.find(b => b.code === selectedBarangay)?.name || '';

      // Sign up with Supabase including additional metadata
      await signUp(data.email, data.password, 'passenger', {
        name: data.name,
        phone: data.phone,
        address: formattedAddress, // Use the formatted address for display
        birthdate: data.birthdate,
        gender: data.gender,
        // Store address components for future reference
        addressDetails: {
          houseNumber: data.houseNumber || '',
          street: data.street || '',
          regionCode: selectedRegion,
          regionName,
          provinceCode: selectedProvince,
          provinceName,
          cityCode: selectedCity,
          cityName,
          barangayCode: selectedBarangay,
          barangayName,
          postalCode: data.postalCode || ''
        }
      });

      toast({
        title: 'Success',
        description: 'Account created successfully'
      });

      if (data.role === 'passenger') {
        router.push('/onboarding');
      } else {
        router.push('/sign-in');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create account',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-maroon-700 to-maroon-900">
      <header className="p-4">
        <Button variant="ghost" size="icon" asChild className="text-white">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-primary mb-6">
          <Bus className="w-8 h-8" />
        </div>

        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Create Account
            </CardTitle>
            <CardDescription className="text-center">
              Sign up to start booking bus tickets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <Input
                    {...register('name')}
                    placeholder="Enter your full name"
                    className="pl-10"
                  />
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Input
                    {...register('phone')}
                    type="tel"
                    placeholder="09XXXXXXXXX or +639XXXXXXXXX"
                    className="pl-10"
                  />
                  <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthdate">Date of Birth</Label>
                <Input
                  {...register('birthdate')}
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.birthdate && (
                  <p className="text-sm text-red-500">
                    {errors.birthdate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select {...register('gender')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-red-500">
                    {errors.gender.message}
                  </p>
                )}
              </div>
              <div className="space-y-4 border p-4 rounded-md">
                <h3 className="font-medium">Address Details</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="houseNumber">House/Unit Number</Label>
                    <Input
                      {...register('houseNumber')}
                      id="houseNumber"
                      placeholder="e.g. 123"
                    />
                    {errors.houseNumber && (
                      <p className="text-sm text-red-500">
                        {errors.houseNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="street">Street Name</Label>
                    <Input
                      {...register('street')}
                      id="street"
                      placeholder="e.g. Main Street"
                    />
                    {errors.street && (
                      <p className="text-sm text-red-500">
                        {errors.street.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select
                    value={selectedRegion}
                    onValueChange={value => setSelectedRegion(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map(region => (
                        <SelectItem key={region.code} value={region.code}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Select
                    value={selectedProvince}
                    onValueChange={value => setSelectedProvince(value)}
                    disabled={!selectedRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a province" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map(province => (
                        <SelectItem key={province.code} value={province.code}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City/Municipality</Label>
                  <Select
                    value={selectedCity}
                    onValueChange={value => setSelectedCity(value)}
                    disabled={!selectedProvince}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map(city => (
                        <SelectItem key={city.code} value={city.code}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barangay">Barangay</Label>
                  <Select
                    value={selectedBarangay}
                    onValueChange={value => setSelectedBarangay(value)}
                    disabled={!selectedCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a barangay" />
                    </SelectTrigger>
                    <SelectContent>
                      {barangays.map(barangay => (
                        <SelectItem key={barangay.code} value={barangay.code}>
                          {barangay.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      {...register('postalCode')}
                      id="postalCode"
                      placeholder="e.g. 1000"
                    />
                    {errors.postalCode && (
                      <p className="text-sm text-red-500">
                        {errors.postalCode.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }>
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              {/* <div className="space-y-2">
                <Label>Account Type</Label>
                <RadioGroup
                  {...register('role')}
                  className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="passenger" id="passenger" />
                    <Label htmlFor="passenger">Passenger</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="conductor" id="conductor" />
                    <Label htmlFor="conductor">Conductor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin">Admin</Label>
                  </div>
                </RadioGroup>
              </div> */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/sign-in"
                className="text-primary underline underline-offset-4">
                Sign In
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
