'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HeartHandshake,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Loader2,
  Eye,
  EyeOff,
  Building2,
} from 'lucide-react';
import * as React from 'react';
import { doc, setDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
  address: z.string().min(5, 'Please enter a valid address.'),
  role: z.enum(['donor', 'receiver', 'volunteer', 'ngo'], {
    required_error: 'Please select a role.',
  }),
});

export default function SignUpPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      role: 'donor',
    },
  });

  const selectedRole = form.watch('role');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'Could not connect to authentication service.',
      });
      setIsLoading(false);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      
      const user = userCredential.user;
      await updateProfile(user, { displayName: values.name });

      const userDocRef = doc(firestore, 'users', user.uid);

      // Save additional user info to Firestore
      await setDoc(userDocRef, {
        id: user.uid,
        email: values.email,
        displayName: values.name,
        phone: values.phone,
        address: values.address,
        role: values.role,
        verified: false,
        points: 0,
        photoURL: '',
        createdAt: new Date().toISOString(),
      });

      // Send email notification to admin
      try {
        await fetch('/api/notify-registration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            role: values.role,
            phone: values.phone,
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          }),
        });
      } catch (notifErr) {
        console.error('Notification failed (non-critical):', notifErr);
      }

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description:
          error.code === 'auth/email-already-in-use'
            ? 'This email is already registered.'
            : error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md my-8">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <HeartHandshake className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl">
            {selectedRole === 'ngo' ? 'NGO Registration' : 'Create an Account'}
          </CardTitle>
          <CardDescription>
            {selectedRole === 'ngo' 
              ? 'Register your organization to access smart food requirements.' 
              : 'Join our community to start sharing and receiving.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Register As</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="donor">Individual Donor / Restaurant</SelectItem>
                        <SelectItem value="ngo">NGO / Social Organization</SelectItem>
                        <SelectItem value="volunteer">Volunteer / Delivery Partner</SelectItem>
                        <SelectItem value="receiver">Individual in Need</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedRole === 'ngo' ? 'Organization Name' : 'Full Name'}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        {selectedRole === 'ngo' ? (
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        ) : (
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        )}
                        <Input
                          placeholder={selectedRole === 'ngo' ? "e.g., Hope Foundation" : "e.g., John Doe"}
                          {...field}
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedRole === 'ngo' ? 'Organization Email' : 'Email Address'}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          {...field}
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...field}
                          className="pl-10 pr-10"
                          disabled={isLoading}
                        />
                         <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                            disabled={isLoading}
                        >
                            {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedRole === 'ngo' ? 'Organization Phone' : 'Phone Number'}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="+91 98765 43210"
                          {...field}
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedRole === 'ngo' ? 'Office Address' : 'Address'}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="123 Main St, Anytown"
                          {...field}
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-11 text-lg font-bold" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  selectedRole === 'ngo' ? 'Complete NGO Registration' : 'Sign Up'
                )}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link
              href="/"
              className="font-medium text-primary hover:underline"
            >
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}