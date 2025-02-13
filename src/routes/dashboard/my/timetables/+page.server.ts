import { getTimetableInfoFromDb } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	return {
		timetables: await getTimetableInfoFromDb(session?.user?.id as string)
	};
};
