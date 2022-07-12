export const isProd = process.env.NODE_ENV === "production";
export const isTest = process.env.NODE_ENV === "test";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const advertiser = {
	usherContractAddress:
		process.env.NEXT_PUBLIC_ADVERTISER_USHER_CONTRACT_ADDRESS,
	destinationUrl: process.env.NEXT_PUBLIC_ADVERTISER_DESTINATION_URL
};

export const ngrokUrl = process.env.NEXT_PUBLIC_NGROK_URL;
