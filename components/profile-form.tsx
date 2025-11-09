'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { updateProfile } from '@/app/actions/profile';


const profileFormSchema = z.object({
  full_name: z
    .string()
    .min(2, {
      message: 'Full name must be at least 2 characters.',
    })
    .max(30, {
      message: 'Full name must not be longer than 30 characters.',
    })
    .optional(), // Make optional for partial updates
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileForm() {
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<ProfileFormValues>({ full_name: '' });
  const supabase = createClient();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: 'onChange',
    defaultValues: initialData,
  });

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          toast.error('Failed to load profile data.');
        } else if (profile) {
          setInitialData({ full_name: profile.full_name || '' });
          form.reset({ full_name: profile.full_name || '' });
        }
      }
      setLoading(false);
    }
    fetchProfile();
  }, [form, supabase]);

  async function onSubmit(data: ProfileFormValues) {
    const result = await updateProfile(createFormData(data));

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      toast.success('Profile updated successfully!');
    }
  }

  // Helper to convert object to FormData for server actions
  const createFormData = (data: ProfileFormValues) => {
    const formData = new FormData();
    if (data.full_name !== undefined) formData.append('full_name', data.full_name);
    return formData;
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name. It can be your real name or a pseudonym.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Update profile</Button>
      </form>
    </Form>
  );
}
