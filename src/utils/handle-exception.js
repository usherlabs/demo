export const setUser = (user) => {
	console.log("setUser", user);
};

const handleException = (err, ctx) => {
	console.log(err, ctx); // eslint-disable-line
};

export default handleException;
