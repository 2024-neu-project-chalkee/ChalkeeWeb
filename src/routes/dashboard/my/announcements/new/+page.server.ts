import { getClassesThatTeacherTeachesFromDB, getGroupsThatTeacherTeachesFromDB } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	return {
		classes: await getClassesThatTeacherTeachesFromDB(session?.user?.id as string),
		groups: await getGroupsThatTeacherTeachesFromDB(session?.user?.id as string)
	};
};
