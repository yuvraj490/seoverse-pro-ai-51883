
-- Migration: 20251101031440

-- Migration: 20251031143907

-- Migration: 20251031142240

-- Migration: 20251031142013

-- Migration: 20251031135954
-- Create profiles table with credits
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admin can update any profile
CREATE POLICY "Admin can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admin can delete any profile
CREATE POLICY "Admin can delete any profile"
  ON public.profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Create generations table
CREATE TABLE public.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  title TEXT,
  description TEXT NOT NULL,
  tags TEXT[] NOT NULL,
  keywords TEXT[] NOT NULL,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- Users can view their own generations
CREATE POLICY "Users can view own generations"
  ON public.generations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own generations
CREATE POLICY "Users can insert own generations"
  ON public.generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can view all generations
CREATE POLICY "Admin can view all generations"
  ON public.generations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Create payment requests table
CREATE TABLE public.payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  gmail TEXT NOT NULL,
  upi_password TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 99,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment requests
CREATE POLICY "Users can view own payment requests"
  ON public.payment_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own payment requests
CREATE POLICY "Users can insert own payment requests"
  ON public.payment_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can view all payment requests
CREATE POLICY "Admin can view all payment requests"
  ON public.payment_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admin can update payment requests
CREATE POLICY "Admin can update payment requests"
  ON public.payment_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.email = 'ys8800221@gmail.com'
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Migration: 20251031141237
-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Grant admin role to ys8800221@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'ys8800221@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Update RLS policies to use has_role function

-- Drop old policies that used is_admin
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all generations" ON public.generations;
DROP POLICY IF EXISTS "Admin can view all payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Admin can update payment requests" ON public.payment_requests;

-- Create new policies using has_role
CREATE POLICY "Admin can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update any profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete any profile"
ON public.profiles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can view all generations"
ON public.generations FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete generations"
ON public.generations FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can view all payment requests"
ON public.payment_requests FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update payment requests"
ON public.payment_requests FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policy for admins to view user_roles
CREATE POLICY "Admin can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));



-- Migration: 20251031142439
-- Trigger types regeneration
COMMENT ON TABLE public.profiles IS 'User profile information including credits and admin status';


-- Migration: 20251031144509
-- Trigger types refresh by adding a harmless comment
COMMENT ON TABLE public.profiles IS 'User profile information with credits and admin status';
COMMENT ON TABLE public.generations IS 'SEO content generations created by users';
COMMENT ON TABLE public.payment_requests IS 'User payment requests for credit purchases';
COMMENT ON TABLE public.user_roles IS 'User role assignments for access control';

-- Migration: 20251031144913
-- Add admin role for ys8800221@gmail.com
-- First, we need to find the user_id from profiles table and add admin role
-- This will allow the has_role function to return true for admin checks

-- Insert admin role for the user with email ys8800221@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles
WHERE email = 'ys8800221@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Also ensure they have admin flag in profiles
UPDATE public.profiles
SET is_admin = true
WHERE email = 'ys8800221@gmail.com';

-- Migration: 20251031145538
-- Update the handle_new_user function to give 5 free credits on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin, credits)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.email = 'ys8800221@gmail.com',
    5  -- Give 5 free credits to every new user
  );
  RETURN NEW;
END;
$function$;


-- Migration: 20251101035544
-- Grant admin role to ys8800221@gmail.com
-- This will work once the user signs up

-- First, let's check the current structure
-- The user_roles table already exists with the app_role enum

-- Insert admin role for the user (will work after signup)
-- Note: This is a one-time setup. The user must sign up first.
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'ys8800221@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
