import { writable } from 'svelte/store';
import type { Room, Message, User } from './Types_chat';

export let msgs = writable<Message[]>([]);
export let my_rooms = writable<Room[]>([]);
export let all_rooms = writable<Room[]>([]);
export let current_room = writable<Room>();
export let settings_user = writable<User>();
export let layout = writable("close");
export let history = writable<string[]>(["close", "home"]);

export let user;
export let socket;

export function set_user(new_user)     { user = new_user; }
export function set_socket(new_socket) { socket = new_socket; }

export function add_msg(name: string, message: string)
{
	msgs.update(msgs => [...msgs, { name: "me", message: message }]);
}

export function add_history(str: string)
{
	history.update(history => [str, ...history]);
}
export function back_history()
{
	history.update(history =>
	{
		if (history.length > 2)
			return history.slice(1);
		else
			return ["home", "home"];
	});
}

