import { getAnnouncementsOfUserFromDB } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	return {
		announcements: await getAnnouncementsOfUserFromDB(session?.user?.id as string)
	};
};
