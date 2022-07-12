import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { css } from "@linaria/core";
import { toaster, TextInput, ClipboardIcon, useTheme } from "evergreen-ui";
import CopyToClipboard from "react-copy-to-clipboard";

import InputField from "@/components/InputField";

const AffiliateLink = ({ link, ...props }) => {
	const { colors } = useTheme();

	const onCopy = useCallback(() => {
		toaster.notify("Affiliate link has been copied!", {
			id: "link-copy"
		});
	}, []);

	return (
		<CopyToClipboard text={link} onCopy={onCopy}>
			<InputField
				id="affiliate-link"
				label="Affiliate Link"
				iconRight={ClipboardIcon}
				iconSize={18}
				iconProps={{
					color: colors.gray600
				}}
				background="tint2"
				cursor="pointer"
				inputContainerProps={{
					className: css`
						:active {
							background: rgb(240, 240, 240) !important;
							transition: background 0.25s;
						}
					`
				}}
				isLoading={!link}
				{...props}
			>
				<TextInput
					placeholder="Loading your shareable link..."
					readOnly
					value={link}
					height={42}
					width="100%"
					border="none"
					cursor="pointer"
				/>
			</InputField>
		</CopyToClipboard>
	);
};

AffiliateLink.propTypes = {
	link: PropTypes.string
};

AffiliateLink.defaultProps = {
	link: ""
};

export default AffiliateLink;
