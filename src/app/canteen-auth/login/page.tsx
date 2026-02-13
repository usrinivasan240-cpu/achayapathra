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
                Sign in to your canteen account
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

          {/* Test Credentials Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-900 mb-2">Test Credentials:</p>
            <p className="text-xs text-blue-800">
              <strong>User:</strong> user@test.com / password123
            </p>
            <p className="text-xs text-blue-800">
              <strong>Admin:</strong> admin@test.com / admin123
            </p>
          </div>
        </div>
      </div>
      <div className="hidden bg-gradient-to-br from-orange-400 to-orange-600 lg:flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-4xl font-bold mb-4">🍽️ Canteen Ordering</h2>
          <p className="text-xl mb-8">Fast • Fresh • Delicious</p>
          <div className="space-y-4 text-lg">
            <p>🚀 Quick ordering</p>
            <p>📍 Real-time tracking</p>
            <p>💰 Best prices</p>
            <p>🎉 Special discounts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
