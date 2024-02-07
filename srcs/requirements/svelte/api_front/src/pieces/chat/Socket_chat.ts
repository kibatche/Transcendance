import io from 'socket.io-client';
import { user, msgs, layout, set_socket, set_user } from './Store_chat';
import { to_print } from './Utils_chat';
import { fetchUser } from '../utils';

const address = `http://${process.env.WEBSITE_HOST}:${process.env.WEBSITE_PORT}`;

export async function init_socket()
{
	to_print("in init_socket");
	//console.error("in init_socket");
	const user = await fetchUser();
	if (!user)
		return;

	set_user(user);

	let socket = await io(address,
	{
		path: '/chat',
		query:
		{
			username: user.username,
		},
	});

	set_socket(socket);

	socket_states(socket);
	socket_events(socket);
}

function socket_events(socket)
{
	socket.on('message', function(from, message)
	{
		to_print("received msg:", message, from);
		if (from === user.username)
			from = "me";
		msgs.update(msgs => [...msgs, { name: from, message: message }]);
	});

	socket.on('new_password', function()
	{
		to_print("notification new password");
		layout.set("password");
	});
}

function socket_states(socket)
{
	socket.on('connect',           function(){ console.log("socket.io connected"); });
	socket.on('disconnect',        function(){ console.log("socket.io disconnected"); });
	socket.on('connect_error',     function(){ console.log("socket.io connect_error"); });
	socket.on('connect_timeout',   function(){ console.log("socket.io connect_timeout"); });
	socket.on('error',             function(){ console.log("socket.io error"); });
	socket.on('reconnect',         function(){ console.log("socket.io reconnect"); });
	socket.on('reconnect_attempt', function(){ console.log("socket.io reconnect_attempt"); });
	socket.on('reconnecting',      function(){ console.log("socket.io reconnecting"); });
	socket.on('reconnect_error',   function(){ console.log("socket.io reconnect_error"); });
	socket.on('reconnect_failed',  function(){ console.log("socket.io reconnect_failed"); });
	socket.on('ping',              function(){ console.log("socket.io ping"); });
	socket.on('pong',              function(){ console.log("socket.io pong"); });
}

