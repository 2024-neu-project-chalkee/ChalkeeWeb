import { putRoomIntoInstitutionInDB } from '$lib/db';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const name = form.get('name') as string;
		const institutionId = form.get('institutionId') as string;

		return await putRoomIntoInstitutionInDB(name, institutionId);
	}
};
