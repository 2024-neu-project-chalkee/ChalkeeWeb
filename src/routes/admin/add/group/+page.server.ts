import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { getRoomsOfInstitutionFromDB, putGroupInInstitutionInDB } from '$lib/db';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	return {
		rooms: await getRoomsOfInstitutionFromDB(session?.user?.institutionId as string)
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const name = form.get('name') as string;
		const grouproom = form.get('grouproom') as string;
		const institutionId = form.get('institutionId') as string;

		return await putGroupInInstitutionInDB(name, grouproom, institutionId);
	}
};
