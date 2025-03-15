import { getClassesOfInstitutionFromDB, getGroupsOfInstitutionFromDB } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	return {
		classes: await getClassesOfInstitutionFromDB(session?.user?.institutionId as string),
		groups: await getGroupsOfInstitutionFromDB(session?.user?.institutionId as string)
	};
};
