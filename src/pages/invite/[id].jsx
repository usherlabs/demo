import { useCallback, useEffect } from "react";
import { setCookie, parseCookies } from "nookies";
import { Pane } from "evergreen-ui";
import Image from "next/image";
import { useRouter } from "next/router";

import {
	CONVERSION_COOKIE_NAME,
	CONTRACT_INVITE_CONFLICT_STRATEGY
} from "@/constants";
import Preloader from "@/components/Preloader";
import { getDestinationUrl, createConversion } from "@/actions/invite";
import { useContract } from "@/hooks/";

import LogoImage from "@/assets/logo/Logo.png";

const Invite = () => {
	const router = useRouter();
	const { id } = router.query;
	const [{ inviteConflictStrategy }] = useContract();

	const processInvite = useCallback(async () => {
		const cookies = parseCookies();
		const cid = cookies[CONVERSION_COOKIE_NAME];

		const {
			success,
			url,
			isInviteActive,
			convId: existingConvId,
			isRelated // Determines whether the existing ConvID is related to the Invite Link Id
		} = await getDestinationUrl(id, cid);
		if (!success || !url) {
			window.location.replace(`/link-error`);
			return;
		}

		// Only apply conversion creation/maintenance logic if Invite IS Active
		if (isInviteActive) {
			// If the Smart Contract has NOT defined that new Affiliate Links will overwrite the conversion
			// The default behaviour is to simply skip replacing the conversion cookie if a valid one exists
			if (
				inviteConflictStrategy ===
					CONTRACT_INVITE_CONFLICT_STRATEGY.OVERWRITE ||
				!existingConvId
			) {
				// If a valid converison tracking id is NOT already in cookie
				const { convId } = await createConversion(id);
				if (convId) {
					setCookie(null, CONVERSION_COOKIE_NAME, convId, {
						maxAge: 30 * 60 * 60, // lasts 30 days -- //* This can be configured ...eventually.
						path: "/"
					});
				}
			} else if (existingConvId && isRelated) {
				// Extend the duration of the Cookie if the Invite Link ID is related to the Conversion ID in the Cookie
				setCookie(null, CONVERSION_COOKIE_NAME, existingConvId, {
					maxAge: 30 * 60 * 60, // lasts 30 days -- //* This can be configured ...eventually.
					path: "/"
				});
			}
		}

		// Redirect to Advertiser Affiliate Referral URL
		window.location.replace(url);
	}, [id]);

	useEffect(() => {
		if (!id) {
			return () => {};
		}
		(async () => {
			// Do some security checks...

			processInvite();
		})();
		return () => {};
	}, [id]);

	return (
		<Pane
			display="flex"
			flexDirection="column"
			marginY="0"
			marginX="auto"
			minHeight="100vh"
			position="relative"
		>
			<Preloader message={`You've been invited...`} />
			<Pane
				zIndex={100}
				position="fixed"
				bottom={20}
				left={0}
				right={0}
				display="flex"
				alignItems="center"
				justifyContent="center"
			>
				<Image src={LogoImage} width={150} objectFit="contain" />
			</Pane>
		</Pane>
	);
};

export default Invite;
