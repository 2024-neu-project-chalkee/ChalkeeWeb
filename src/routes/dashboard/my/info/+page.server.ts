import { getClassInfoFromDb, getInstituteInfoFromDb } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	return {
		institute: await getInstituteInfoFromDb(session?.user?.instituteId as string),
		class: await getClassInfoFromDb(session?.user?.classId as string)
	};
};
