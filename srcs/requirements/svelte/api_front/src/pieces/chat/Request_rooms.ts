import { msgs, user, history, add_history, socket, current_room, settings_user } from './Store_chat';
import type { Room, FetchResponse } from './Types_chat';
import { FetchMethod, Mute, User } from './Types_chat';
import { to_print } from './Utils_chat';
import { fetch_chat_request, set_client_name_on_room, fill_fetch_response } from './Request_utils';

export async function get_room_messages()
{
	to_print("in get_room_messages");

	let response: FetchResponse = await fetch_chat_request('messages', FetchMethod.GET);

	const messages = response.messages;
	if (messages === null)
		return;

	messages.forEach(function(item) {
		if (item.name === user.username) {
			item.name = "me";
		}
	});

	msgs.set(messages);
}

export async function create_room(room: Room)
{
	to_print("in create_room");

	to_print("room sent to create:", room);
	let response: FetchResponse = await fetch_chat_request('create', FetchMethod.POST, room);
	to_print("room returned from create:", response.room);

	return response;
}

export async function join_room(room: Room)
{
	to_print("in join_room");

	to_print("room sent to join:", room);
	let response: FetchResponse = await fetch_chat_request('join', FetchMethod.POST, room);
	to_print("room returned from join:", response.room);

	return response.room;
}

export async function change_room(room: Room): Promise<FetchResponse>
{
	to_print("in change_room");

	to_print("room sent to change:", room);
	let response: FetchResponse = await fetch_chat_request('change', FetchMethod.POST, room);
	to_print("room returned from change:", response);

	if (response.status >= 300 || response.error)
		return response;

	await get_room_messages();

	set_client_name_on_room(room);

	current_room.set(room);
	add_history("room");

	return response;
}

export async function set_current_room()
{
	to_print("in set_current_room");

	let response: FetchResponse = await fetch_chat_request('currentroom', FetchMethod.GET);
	to_print("response from get_current_room:", response);

	if (response && response.room)
	{
		set_client_name_on_room(response.room);
		current_room.set(response.room);
	}
}

export async function set_settings_user(username: string)
{
	to_print("in set_settings_user");

	to_print("username for set_settings_user:", username);
	let response: FetchResponse = await fetch_chat_request('userinfos', FetchMethod.POST, {username: username});
	to_print("response from set_settings_user:", response);

	if (response && response.user)
		settings_user.set(response.user);
}

export async function validate_password(room: Room)
{
	to_print("in validate_password");

	to_print("room sent to validate password:", room);
	let response: FetchResponse = await fetch_chat_request('passwordauth', FetchMethod.POST, room);
	to_print("room returned from validate password:", response.room);

	return response;
}

export async function add_password(room: Room)
{
	to_print("in add_password");

	to_print("room sent to add password:", room);
	let response: FetchResponse = await fetch_chat_request('addpassword', FetchMethod.POST, room);
	to_print("room returned from add password:", response.room);

	return response;
}

export async function change_password(room: Room, old_password: string)
{
	to_print("in send_password");

	let request_body =
	{
		room: room,
		old_password: old_password,
	}

	to_print("room sent to change password:", room);
	let response: FetchResponse = await fetch_chat_request('changepassword', FetchMethod.POST, request_body);
	to_print("room returned from change password:", response.room);

	return response;
}

export async function remove_password(room: Room)
{
	to_print("in send_password");

	to_print("room sent to remove password:", room);
	let response: FetchResponse = await fetch_chat_request('removepassword', FetchMethod.DELETE, room);
	to_print("room returned from remove password:", response.room);

	return response;
}

export async function invite_user(user_name: string)
{
	to_print("in invite_user");

	let response: FetchResponse = await fetch_chat_request('invite', FetchMethod.POST, {username: user_name});

	await get_room_messages();
}

export async function get_my_rooms()
{
	to_print("in get_my_rooms");

	let response: FetchResponse = await fetch_chat_request('myrooms', FetchMethod.GET);

	let rooms = response.rooms.map(room => set_client_name_on_room(room));

	return rooms;
}

export async function get_all_rooms()
{
	to_print("in get_all_rooms");

	let response: FetchResponse = await fetch_chat_request('allrooms', FetchMethod.GET);

	return response.rooms;
}

export async function get_room_users(): Promise<User[]>
{
	to_print("in get_room_users");

	let response: FetchResponse = await fetch_chat_request('roomusers', FetchMethod.GET);
	to_print("response from get_room_users:", response);

	return response.users;
}

export async function get_all_users()
{
	to_print("in get_all_users");

	let response: FetchResponse = await fetch_chat_request('users', FetchMethod.GET);

	return response.users;
}

export async function leave_room(): Promise<void>
{
	to_print("in leave_room");

	let response: FetchResponse = await fetch_chat_request('leave', FetchMethod.DELETE);
}

export async function make_admin(username): Promise<FetchResponse>
{
	to_print("in is_admin");

	to_print("username sent to setadmin:", username);
	let response: FetchResponse = await fetch_chat_request('setadmin', FetchMethod.POST, {username: username} );
	to_print("response from setadmin:", response);

	return response;
}

export async function get_is_admin(): Promise<boolean>
{
	to_print("in is_admin");

	let response: FetchResponse = await fetch_chat_request('isadmin', FetchMethod.GET);
	to_print("is_admin return:", response.condition);

	return response.condition;
}

export async function set_mute(date_limit: Date, username: string, time: string): Promise<FetchResponse>
{
	to_print("in set_mute");

	let body =
	{
		mute:
		{
			name: username,
			date: date_limit,
		},
		time: time,
	}

	to_print("setmute send body:", body);
	let response: FetchResponse = await fetch_chat_request('setmute', FetchMethod.POST, body );
	to_print("setmute return:", response);

	return response;
}

export async function get_is_mute(username: string): Promise<Mute>
{
	to_print("in get_is_mute");

	let response: FetchResponse = await fetch_chat_request('ismute', FetchMethod.POST, {username: username} );
	to_print("ismute return:", response);

	return response.mute;
}

export async function get_unmute(username: string): Promise<void>
{
	to_print("in get_unmute");

	await fetch_chat_request('unmute', FetchMethod.POST, {username: username} );
}

export async function set_block_user(username: string): Promise<void>
{
	to_print("in set_block_user");

	await fetch_chat_request('block', FetchMethod.POST, {username: username} );
}

export async function remove_block_user(username: string): Promise<void>
{
	to_print("in set_block_user");

	await fetch_chat_request('unblock', FetchMethod.POST, {username: username} );
}

export async function list_block_user(username: string): Promise<User[]>
{
	to_print("in list_block_user");

	let response: FetchResponse = await fetch_chat_request('listblock', FetchMethod.GET);
	to_print("response.users:", response.users);

	return response.users;
}

