export const isProd = process.env.NODE_ENV === "production";
export const logLevel = process.env.LOG_LEVEL || "info";
export const publicUrl = process.env.PUBLIC_URL || "";

export const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || "";

export const humanodeClientId = process.env.HUMANODE_CLIENT_ID;
export const humanodeClientSecret = process.env.HUMANODE_CLIENT_SECRET;
