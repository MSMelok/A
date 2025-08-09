import { supabase } from './supabase';
import type { User } from '@shared/schema';

export interface AuthUser extends User {
  session?: any;
}

export const authService = {
  async signIn(email: string, password: string): Promise<AuthUser | null> {
    try {
      console.log('Attempting to sign in with Supabase Auth:', email);
      
      // Use Supabase Auth to sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Supabase auth error:', authError);
        throw new Error(`Authentication failed: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('No user data returned from authentication');
      }

      console.log('Auth successful, fetching user role from users table...');
      
      // Now get the user role from our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      console.log('User role query result:', { userData, userError });

      if (userError) {
        console.error('User role fetch error:', userError);
        // If user doesn't exist in our users table, create a default agent record
        const { data: newUserData, error: insertError } = await supabase
          .from('users')
          .insert({
            email: email,
            name: authData.user.user_metadata?.full_name || email.split('@')[0],
            role: 'agent' // Default role
          })
          .select()
          .single();

        if (insertError) {
          console.error('Failed to create user record:', insertError);
          throw new Error('Failed to set up user profile');
        }

        console.log('Created new user record:', newUserData);
        
        // Use the newly created user data
        const authUser: AuthUser = {
          id: newUserData.id,
          email: newUserData.email,
          name: newUserData.name,
          role: newUserData.role,
          created_at: newUserData.created_at,
          session: authData.session
        };

        localStorage.setItem('auth_user', JSON.stringify(authUser));
        console.log('Successfully authenticated new user with role:', newUserData.role);
        return authUser;
      }

      // Create our auth user object
      const authUser: AuthUser = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        created_at: userData.created_at,
        session: authData.session
      };

      localStorage.setItem('auth_user', JSON.stringify(authUser));
      console.log('Successfully authenticated with role:', userData.role);
      return authUser;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  async signOut(): Promise<void> {
    // Sign out from Supabase Auth
    await supabase.auth.signOut();
    // Clear local storage
    localStorage.removeItem('auth_user');
  },

  getCurrentUser(): AuthUser | null {
    try {
      const stored = localStorage.getItem('auth_user');
      console.log('getCurrentUser - stored data:', stored);
      if (!stored) return null;
      
      const user = JSON.parse(stored) as AuthUser;
      console.log('getCurrentUser - parsed user:', user);
      
      // Check if Supabase session expired (expires_at is in seconds, convert to milliseconds)
      if (user.session?.expires_at && user.session.expires_at * 1000 < Date.now()) {
        console.log('Session expired, removing user');
        localStorage.removeItem('auth_user');
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('getCurrentUser error:', error);
      return null;
    }
  },

  isAdmin(user: AuthUser | null): boolean {
    return user?.role === 'admin';
  }
};
