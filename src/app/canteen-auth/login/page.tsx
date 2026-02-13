import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CanteenLoginForm } from '@/components/auth/canteen-login-form';

export default function LoginPage() {
  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <div className="mx-auto w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your Achayapathra account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CanteenLoginForm />
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/canteen-auth/signup" className="text-orange-600 hover:text-orange-700 underline font-semibold">
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="hidden bg-gradient-to-br from-orange-400 to-orange-600 lg:flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-4xl font-bold mb-4">🍽️ Achayapathra</h2>
          <p className="text-xl mb-8">Building Humanity Through Sharing</p>
          <div className="space-y-4 text-lg">
            <p>🚀 Donate surplus food</p>
            <p>📍 Find nearby donations</p>
            <p>💪 Volunteer to deliver</p>
            <p>🎉 Join the community</p>
          </div>
        </div>
      </div>
    </div>
  );
}
