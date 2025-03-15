import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { getRoomsOfInstitutionFromDB, putClassInInstitutionInDB } from '$lib/db';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	return {
		rooms: await getRoomsOfInstitutionFromDB(session?.user?.institutionId as string)
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const number = form.get('number') as string;
		const letter = form.get('letter') as string;
		const classroom = form.get('classroom') as string;
		const institutionId = form.get('institutionId') as string;

		return await putClassInInstitutionInDB(number, letter, classroom, institutionId);
	}
};
