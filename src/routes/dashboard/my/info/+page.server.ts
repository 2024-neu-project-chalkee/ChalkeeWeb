import { getClassInfoFromDb, getGroupInfoFromDb, getInstituteInfoFromDb } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	return {
		institute: await getInstituteInfoFromDb(session?.user?.id as string),
		class: await getClassInfoFromDb(session?.user?.id as string),
		groups: await getGroupInfoFromDb(session?.user?.id as string)
	};
};
