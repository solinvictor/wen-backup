-- WEN — add price and image_url to products
-- price: admin sets per-product price in naira
-- image_url: admin can supply a custom image; store falls back to category image if null

alter table public.products
  add column price numeric(12, 2),
  add column image_url text;

comment on column public.products.price is
  'Price in naira set by admin. Nullable — product shows as unavailable for purchase until set.';

comment on column public.products.image_url is
  'Optional custom product image URL. Falls back to category image on the frontend if null.';
