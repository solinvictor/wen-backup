-- Add 'rider' to the profiles role enum (if using enum type)
-- If role is a plain text column, this is just a comment for reference

-- 1. Ensure profiles table has role column (text)
alter table profiles add column if not exists role text default 'buyer';

-- 2. Create a rider profile (run manually per rider you onboard):
-- insert into auth.users ... then:
-- update profiles set role = 'rider', full_name = 'Rider Name' where id = '<user_id>';

-- 3. RLS: riders can read orders assigned to them
-- (wire up after rider_id column is added to orders in next step)
