import { getClassesOfInstituteFromDb, getGroupsOfInstituteFromDb } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	return {
		classes: await getClassesOfInstituteFromDb(session?.user?.instituteId as string),
		groups: await getGroupsOfInstituteFromDb(session?.user?.instituteId as string)
	};
};
