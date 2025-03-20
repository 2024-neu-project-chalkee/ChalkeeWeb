import { getGradesOfUserFromDB } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	return {
		grades: await getGradesOfUserFromDB(session?.user?.id as string)
	};
};
