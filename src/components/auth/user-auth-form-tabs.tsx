'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserAuthForm } from '@/components/auth/user-auth-form';

export function UserAuthFormTabs() {
  return (
    <Tabs defaultValue="donor" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="donor">Donor</TabsTrigger>
        <TabsTrigger value="receiver">Receiver</TabsTrigger>
        <TabsTrigger value="volunteer">Volunteer</TabsTrigger>
      </TabsList>
      <TabsContent value="donor">
        <UserAuthForm role="donor" />
      </TabsContent>
      <TabsContent value="receiver">
        <UserAuthForm role="receiver" />
      </TabsContent>
      <TabsContent value="volunteer">
        <UserAuthForm role="volunteer" />
      </TabsContent>
    </Tabs>
  );
}
