import React, {
	createContext,
	useEffect,
	useState,
	useMemo,
	useCallback
} from "react";
import isEmpty from "lodash/isEmpty";
import once from "lodash/once";

import { ChildrenProps } from "@/utils/common-prop-types";
import { supabase } from "@/utils/supabase-client";
import useAuthStateChange from "@/hooks/use-auth-state-change";
import { authorise } from "@/actions/user";
import delay from "@/utils/delay";
import { saveInviteLink } from "@/actions/invite";

const saveInviteLinkOnce = once(saveInviteLink);

export const UserContext = createContext();

const UserContextProvider = ({ children }) => {
	const [user, setUser] = useState({});
	const [loading, setLoading] = useState(true);

	const removeUser = useCallback(() => setUser({}), []);

	const getUser = useCallback(async () => {
		setLoading(true);
		// Fetch Currently authenticated Discord User from Supabase
		const u = supabase.auth.user();
		console.log("getUser: ", u);
		if (!isEmpty(u)) {
			if (u.role === "authenticated") {
				// Here we fetch user verifications
				const [{ id: linkId }, conversions] = await saveInviteLinkOnce(u.id);
				const newUser = {
					...u,
					link: { id: linkId, conversions }
				};
				setUser(newUser);
				return newUser;
			}
		}
		return {};
	}, []);

	const signIn = useCallback(
		async (options = {}) => {
			setLoading(true);
			const r = await authorise(options);
			setLoading(false);
			return r;
		},
		[user]
	);

	const signOut = useCallback(async () => {
		setLoading(true);
		const r = await supabase.auth.signOut();
		setLoading(false);
		return r;
	}, []);

	useAuthStateChange((event) => {
		switch (event) {
			case "SIGNED_IN": {
				// Fetch user on sign in
				getUser().finally(() => {
					setLoading(false);
				});
				break;
			}
			case "SIGNED_OUT": {
				(async () => {
					await delay(1000);
					window.location.reload();
				})();
				break;
			}
			default: {
				break;
			}
		}
	});

	// On render, fetch user from session
	let interval;
	useEffect(() => {
		if (user.id) {
			clearInterval(interval);
			setLoading(false);
			return () => {};
		}
		//* Because the system uses OTP -- this is the only point where the User State is set.
		(async () => {
			// Fetch user on an interval
			interval = setInterval(async () => {
				const respUser = await getUser();
				if (respUser.id) {
					clearInterval(interval);
					setLoading(false);
				}
			}, 500);
			// Clear the interval after two seconds -- will ensure that the authorised should always be fetched regardless of if supabase event fires.
			await delay(2000);
			clearInterval(interval);
			setLoading(false);
		})();
		return () => {};
	}, [user]);

	const value = useMemo(
		() => ({
			user,
			loading,
			setUser,
			removeUser,
			getUser,
			signIn,
			signOut
		}),
		[user, loading]
	);

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

UserContextProvider.propTypes = {
	children: ChildrenProps.isRequired
};

export default UserContextProvider;
