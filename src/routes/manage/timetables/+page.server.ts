import { getClassesOfInstitutionFromDb, getGroupsOfInstitutionFromDb } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	return {
		classes: await getClassesOfInstitutionFromDb(session?.user?.institutionId as string),
		groups: await getGroupsOfInstitutionFromDb(session?.user?.institutionId as string)
	};
};
