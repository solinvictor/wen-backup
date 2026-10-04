-- Allow location and buyer_type to be null so we can seed a buyer row at signup
-- before the user has completed their first order.
ALTER TABLE buyers
  ALTER COLUMN location   DROP NOT NULL,
  ALTER COLUMN buyer_type DROP NOT NULL;

-- Trigger: create a buyers row whenever a new auth user is created.
-- full_name and phone come from user_metadata set during signUp().
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- user_id is not unique on buyers (each order creates a row); guard with EXISTS
  IF NOT EXISTS (SELECT 1 FROM public.buyers WHERE user_id = NEW.id) THEN
    INSERT INTO public.buyers (full_name, phone_number, email, user_id)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      NEW.email,
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger already exists in prod; this is idempotent via CREATE OR REPLACE on the function.
-- On a fresh DB: uncomment the lines below.
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION handle_new_user();
