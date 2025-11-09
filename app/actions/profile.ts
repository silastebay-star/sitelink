'use server';

import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const profileSchema = z.object({
  full_name: z.string().min(2, {
    message: 'Full name must be at least 2 characters.',
  }),
  // Add other profile fields here as needed
});

export async function updateProfile(formData: FormData) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const parsed = profileSchema.safeParse({
    full_name: formData.get('full_name'),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: parsed.data.full_name,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating profile:', error);
    return {
      error: 'Failed to update profile.',
    };
  }

  revalidatePath('/dashboard/settings/profile');
  return { success: true };
}
