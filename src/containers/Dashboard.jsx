import React, { useState, useCallback, useEffect } from "react";
import { Pane } from "evergreen-ui";
import isEmpty from "lodash/isEmpty";

import { useUser } from "@/hooks/";
import Header from "@/components/Header";
import EmailConnectScreen from "@/screens/EmailConnect";
import Preloader from "@/components/Preloader";
import handleException from "@/utils/handle-exception";
import * as alerts from "@/utils/alerts";
import { ChildrenProps } from "@/utils/common-prop-types";

const loadingMessages = [
	"Hold tight...",
	"Dashboard engines ready...",
	"Off we go..."
];

let loadingMessageIndex = 0;

const DashboardContainer = ({ children }) => {
	const [user, isUserLoading, { signOut }] = useUser();
	const [isPreloading, setPreloading] = useState(true);
	const [isMounted, setMounted] = useState(false);
	const isLoading = isUserLoading;
	const [loadingMessage, setLoadingMessage] = useState(
		loadingMessages[loadingMessageIndex]
	);

	useEffect(() => {
		// Cancel preloader
		if (isLoading && !isMounted) {
			return () => {};
		}
		setMounted(true);
		const timeout = setTimeout(() => {
			setPreloading(false);
		}, 500);
		return () => {
			clearTimeout(timeout);
		};
	}, [isLoading]);

	const signOutHandler = useCallback(async () => {
		const { error } = await signOut();
		if (error) {
			handleException(error);
			alerts.error();
		}
	}, []);

	useEffect(() => {
		const loadingMessageInterval = setInterval(() => {
			if (loadingMessageIndex > loadingMessages.length) {
				clearInterval(loadingMessageInterval);
			} else {
				setLoadingMessage(loadingMessages[loadingMessageIndex]);
				loadingMessageIndex += 1;
			}
		}, 750);
	}, []);

	return (
		<Pane
			display="flex"
			flexDirection="column"
			marginY="0"
			marginX="auto"
			minHeight="100vh"
			position="relative"
		>
			{(isPreloading || (isLoading && !isMounted)) && (
				<Preloader message={loadingMessage} />
			)}
			<Header
				userProvider={user?.app_metadata?.provider}
				username={
					user?.app_metadata?.provider === "email"
						? user?.email
						: user?.user_metadata?.full_name
				}
				avatarUrl={user?.user_metadata?.avatar_url}
				signOut={signOutHandler}
			/>
			{isEmpty(user) && <EmailConnectScreen />}
			{!isEmpty(user) && children}
		</Pane>
	);
};

DashboardContainer.propTypes = {
	children: ChildrenProps.isRequired
};

export default DashboardContainer;
