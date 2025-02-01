import { sequence } from '@sveltejs/kit/hooks';
import { handle as authenticationHandle } from './auth';
import { redirect, type Handle } from '@sveltejs/kit';

export const authorizationHandle: Handle = async ({ event, resolve }) => {
	const session = await event.locals.auth();

	if (session) {
		if (event.url.pathname == '/' || event.url.pathname.startsWith('/signin'))
			throw redirect(302, '/dashboard');

		if (session.user!.role != 'Admin') {
			if (event.url.pathname.startsWith('/admin')) {
				throw redirect(302, '/dashboard');
			}
		}
	} else if (event.url.pathname != '/' && !event.url.pathname.startsWith('/signin')) {
		throw redirect(302, '/signin');
	}

	return resolve(event);
};

export const handle = sequence(authenticationHandle, authorizationHandle);
