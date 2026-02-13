import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CanteenSignupForm } from '@/components/auth/canteen-signup-form';

export default function SignupPage() {
  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <div className="mx-auto w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
              <CardDescription>
                Join the Achayapathra community to share and receive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CanteenSignupForm />
              <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href="/canteen-auth/login" className="text-orange-600 hover:text-orange-700 underline font-semibold">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="hidden bg-gradient-to-br from-orange-400 to-orange-600 lg:flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-4xl font-bold mb-4">🍽️ Welcome to Achayapathra</h2>
          <p className="text-xl mb-8">Building Humanity Through Sharing</p>
          <div className="space-y-4 text-lg">
            <p>✅ Reduce food waste</p>
            <p>✅ Help your neighbours</p>
            <p>✅ Earn reward points</p>
            <p>✅ Make a difference</p>
          </div>
        </div>
      </div>
    </div>
  );
}
