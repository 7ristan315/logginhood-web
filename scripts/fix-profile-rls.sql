-- Drop and recreate the profiles UPDATE policy with a WITH CHECK clause
-- that prevents users from modifying privileged/immutable columns.
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  -- Prevent self-promotion: platform_admin must stay unchanged
  AND platform_admin IS NOT DISTINCT FROM (
    SELECT platform_admin FROM public.profiles WHERE id = auth.uid()
  )
  -- Prevent email spoofing: email must stay unchanged
  AND email IS NOT DISTINCT FROM (
    SELECT email FROM public.profiles WHERE id = auth.uid()
  )
  -- Prevent timestamp tampering
  AND created_at IS NOT DISTINCT FROM (
    SELECT created_at FROM public.profiles WHERE id = auth.uid()
  )
);
