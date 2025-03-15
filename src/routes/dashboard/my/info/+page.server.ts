import { getClassInfoFromDB, getGroupInfoFromDB, getInstitutionInfoFromDB } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	return {
		institution: await getInstitutionInfoFromDB(session?.user?.id as string),
		class: await getClassInfoFromDB(session?.user?.id as string),
		groups: await getGroupInfoFromDB(session?.user?.id as string)
	};
};
