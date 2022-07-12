/**
 * Reserved callback URL for use with Humanode OAuth2
 */

import { setCookie, parseCookies } from "nookies";
import { Base64 } from "js-base64";
import jwtDecode from "jwt-decode";
import { supabase } from "@/utils/supabase-client";

import getHandler from "@/server/middleware";
import {
	getHumanodeOpenIdClient,
	getRedirectUri
} from "@/utils/humanode-client";

const handler = getHandler();

handler.get(async (req, res) => {
	const client = await getHumanodeOpenIdClient();
	const cookies = parseCookies({ req });

	req.log.debug({ cookies }, "Cookies");

	const { hn_code_verifier: codeVerifier } = cookies;

	// Get callback params with auth code.
	const params = client.callbackParams(req);
	let redir = "/?verify=complete";
	let user = null;
	try {
		const state = JSON.parse(params.state ? Base64.decode(params.state) : "{}");
		if (state.redir) {
			redir += `?redir=${state.redir}`;
		}
		user = state.user;
	} catch (e) {
		// ...
	}

	const failureRedir = `/?verify=failure`;
	if (user === null) {
		req.log.error("No user for personhood authentication");
		return res.redirect(302, failureRedir);
	}

	// If callback params have an error instead of auth code
	// render error page with description.
	if ("error" in params) {
		req.log.error(params, "Failed to process the Humanode PoP Verification");
		return res.redirect(302, failureRedir);
	}

	req.log.info("Processed the Humanode PoP Verification");

	// Exchange auth code for JWT token.
	const tokenSet = await client.callback(getRedirectUri(), params, {
		state: params.state,
		code_verifier: codeVerifier
	});
	if (!tokenSet.id_token) {
		req.log.error({ tokenSet }, "Failed to extract ID Token from Token Set");
		return res.redirect(302, failureRedir);
	}

	// Save JWT.
	setCookie(
		{ res },
		"hn_access_token",
		Base64.encode(JSON.stringify(tokenSet)),
		{
			maxAge: 30 * 24 * 60 * 60 // 30 days
		}
	);

	// Use the `sub` property to uniquely identify the face.
	const dec = jwtDecode(tokenSet.id_token);
	const id = dec.sub;

	req.log.info({ id }, "Personhood verification completed!");

	// Save Personhood result to the DB
	const sIns = await supabase.from("personhood_entries").insert({
		user_id: user.id,
		hn_id: id,
		success: true,
		response: JSON.stringify(tokenSet)
	});
	console.log("invite_links: insert", sIns);
	if (sIns.error && sIns.status !== 406) {
		throw sIns.error;
	}
	const [results] = sIns.data;

	req.log.info({ results }, "Personhood entry saved");

	// Redirect end-user to root route.
	return res.redirect(302, redir);
});

export default handler;
