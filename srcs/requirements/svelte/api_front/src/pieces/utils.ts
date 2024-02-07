
export async function fetchAvatar(username?: string)
{
	let url = `http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/user/avatar`;
	if (username) {
		url += `?username=${username}`;
	}

	return fetch(url)
		.then((response) => {
			if (!response.ok) {
				throw new Error("HTTP " + response.status);
			}
			return response.blob();
		})
		.then((blob) => {
			return URL.createObjectURL(blob);
		})
		.catch((error) => { 
			console.log("catch fetchAvatar: ", error);
			return `http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/img/default.png`;
		});
}

export async function fetchUser(username?: string)
{
	let url = `http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/user`;
	if (username) {
		url += `?username=${username}`;
	}

	return fetch(url)
		.then((response) => {
			if (!response.ok) {
				throw new Error("HTTP " + response.status);
			}
			return response.json();
		})
		.catch((error) => { 
			console.log("catch fetchUser: ", error);
			return null;
		});
}

export async function fetchAllUsers()
{
	return fetch(`http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}/api/v2/user/all`)
		.then((response) => {
			if (!response.ok) {
				if (response.status === 404)
					return [];
				throw new Error("HTTP " + response.status);
			}
			return response.json();
		})
		.catch((error) => { 
			console.log("catch fetchAllUsers: ", error);
			return [];
		});
}
