import urlJoin from "url-join";

const getInviteLink = (id = "") => {
	const origin = `${window.location.origin}/invite`;
	return urlJoin(origin, id);
};

export default getInviteLink;
