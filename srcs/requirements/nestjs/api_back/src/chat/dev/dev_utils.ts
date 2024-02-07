import { socketDto } from 'src/chat/dto/socket.dto';
import { Server } from 'socket.io';

export function printCaller(...prefix)
{
//	try
//	{
//		throw new Error();
//	}
//	catch (e)
//	{
//		Error.captureStackTrace(e);
//		let stack = e.stack.split('\n');
//		let caller = stack[2].trim();
//		console.log(...prefix, caller);
//	}
}

export function printCallerError(...prefix)
{
	try
	{
		throw new Error();
	}
	catch (e)
	{
		Error.captureStackTrace(e);
		let stack = e.stack.split('\n');
		let caller = stack[2].trim();
		console.log("\x1b[33m%s\x1b[0m", ...prefix, caller);
	}
}

export const socket_server: { server: Server } = { server: null };
export const sockets = new Map<string, socketDto>();


