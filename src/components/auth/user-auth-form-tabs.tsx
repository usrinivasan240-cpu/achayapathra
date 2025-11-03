
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserAuthSigninForm } from './user-auth-signin-form';
import { UserAuthSocial } from './user-auth-social';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function UserAuthFormTabs() {
  return (
    <Tabs defaultValue="email" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="email">Email</TabsTrigger>
        <TabsTrigger value="google">Google</TabsTrigger>
      </TabsList>
      <TabsContent value="email">
         <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Sign In</CardTitle>
                <CardDescription>Enter your email below to sign in to your account</CardDescription>
            </CardHeader>
            <CardContent>
                <UserAuthSigninForm />
            </CardContent>
         </Card>
      </TabsContent>
      <TabsContent value="google">
      <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Sign In with Google</CardTitle>
                <CardDescription>Use your Google account to sign in instantly.</CardDescription>
            </CardHeader>
            <CardContent>
                <UserAuthSocial />
            </CardContent>
         </Card>
      </TabsContent>
    </Tabs>
  );
}
