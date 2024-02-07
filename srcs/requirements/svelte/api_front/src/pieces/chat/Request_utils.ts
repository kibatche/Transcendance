import { user } from './Store_chat';
import type { Room, FetchResponse, FetchInit, FetchMethod } from './Types_chat';
import { to_print } from './Utils_chat';

export async function fetch_chat_request(route: string, fetchMethod: FetchMethod, param?: any)
{
	to_print("in fetch_chat_request");

	let response: FetchResponse = { status: 0 };

	let fetch_params: FetchInit = {
		method: fetchMethod,
		headers: { 'Content-Type': 'application/json' },
	}
	if (param)
		fetch_params.body = JSON.stringify(param);

	try
	{
		const resp = await fetch(`/api/v2/chat/${route}`, fetch_params);
		response.status = resp.status;

		let data = await resp.json();
		fill_fetch_response(response, data);

		if (!resp.ok)
			throw new Error(data.message);
	}
	catch (error)
	{
		console.error(error.message);
	}

	return response;
}

export function set_client_name_on_room(room: Room)
{
	to_print("in set_client_name_on_room");

	if (room.type === 'direct')
	{
		room.client_name = room.users[0];
		if (room.client_name === user.username)
			room.client_name = room.users[1];
	}
	else
		room.client_name = room.name;
	return room;
}

export function fill_fetch_response(response: FetchResponse, data: any)
{
	to_print("in fill_fetch_response");

	Object.keys(data).forEach(key =>
	{
		response[key] = data[key];
	});
}
