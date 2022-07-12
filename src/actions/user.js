import { request } from "@/utils/browser-request";

export const authorise = async ({ email }) => {
	const response = await request
		.post("auth", {
			json: {
				email
			}
		})
		.json();
	console.log(response);

	return response.success;
};
