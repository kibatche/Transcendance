export interface Room
{
	name: string;
	type: "public" | "private" | "direct" | "user";
	users?: string[];
	client_name?: string;
	protection: boolean;
	allowed?: boolean;
}

export interface Mute
{
	name: string;
	date: Date;
}

export interface Message
{
	name: string;
	message: string;
}

export interface User
{
	name: string;
	isadmin: boolean;
	isblocked: boolean;
	ismute: boolean;
	mute_date: Date;
}

export interface FetchResponse
{
	status: number;
	error?: boolean;
	code?: string;
	message?: string;
	messages?: Message[];
	user?: User;
	users?: User[];
	room?: Room;
	rooms?: Room[];
	condition?: boolean;
	mute?: Mute;
}

export interface FetchInit
{
	method: string;
	headers: any;
	body?: string;
}

export enum FetchMethod
{
	POST = 'POST',
	GET = 'GET',
	DELETE = 'DELETE',
}

