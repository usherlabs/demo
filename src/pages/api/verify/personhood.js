import getHandler from "@/server/middleware";
import withAuth from "@/server/middleware/auth";
import { supabase } from "@/utils/supabase-client";

const handler = getHandler();

handler.use(withAuth).get(async (req, res) => {
	try {
		const sSel = await supabase
			.from("personhood_entries")
			.select(`id, created_at`)
			.match({ user_id: req.user.id })
			.order("created_at", { ascending: false });
		if (sSel.error && sSel.status !== 406) {
			throw sSel.error;
		}
		console.log("personhood_entries: select", sSel);

		const results = sSel.data;

		req.log.debug({ results }, "personhood fetch results");

		if (results.length > 0) {
			return res.json({
				success: true,
				createdAt: results[0].created_at
			});
		}
		return res.json({
			success: false
		});
	} catch (e) {
		req.log.error(e);
		return res.status(400).json({
			success: false
		});
	}
});

export default handler;
