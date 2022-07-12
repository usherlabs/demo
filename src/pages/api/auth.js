/**
 * Endpoint responsible for sign-in and sign-up
 * ie. if the user exists, send a sign in email
 */

import * as yup from "yup";

import { supabase } from "@/utils/supabase-client";
import getHandler from "@/server/middleware";

const handler = getHandler();

const schema = yup.object({
	email: yup.string().required()
});

// Initializing the cors middleware
handler.post(async (req, res) => {
	let { body } = req;
	try {
		body = await schema.validate(body);
	} catch (e) {
		return res.status(400).json({
			success: false
		});
	}
	const { email } = body;

	// create user first if user does not exist -- will throw if user exists
	// Alternative approach -- https://github.com/supabase/supabase/discussions/1282
	let isNewUser = true;
	try {
		const sNewUser = await supabase.auth.api.createUser({
			email,
			email_confirm: false,
			phone_confirm: false
		});
		if (sNewUser.error) {
			if (sNewUser.error.status === 422) {
				isNewUser = false;
			}
		}
		req.log.info({ newUser: { sNewUser } }, "New User Response");
	} catch (e) {
		req.log.error(e);
	}

	const sResp = await supabase.auth.api.generateLink(
		isNewUser ? "signup" : "magiclink",
		email
	);
	if (sResp.error && sResp.status !== 406) {
		throw sResp.error;
	}
	const { action_link: link } = sResp.data;
	req.log.info(
		{ email: { sResp } },
		`${isNewUser ? "Sign Up" : "Existing"} Magic link`
	);

	return res.json({
		success: true,
		data: {
			link
		}
	});
});

export default handler;
