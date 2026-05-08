/** Ensures ConfigModule validation passes when running e2e without real Supabase. */
if (!process.env.SUPABASE_URL) {
  process.env.SUPABASE_URL = 'https://e2e-placeholder.supabase.co';
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'e2e-placeholder-service-role';
}
if (!process.env.SUPABASE_STORAGE_BUCKET) {
  process.env.SUPABASE_STORAGE_BUCKET = 'productsImages';
}
