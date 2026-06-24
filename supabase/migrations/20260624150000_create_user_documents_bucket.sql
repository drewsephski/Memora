insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'user-documents',
  'user-documents',
  false,
  20971520,
  array['application/pdf', 'text/plain', 'text/markdown']
)
on conflict (id) do nothing;
