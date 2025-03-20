import { getAnnouncementFromDB, removeAnnouncementFromDB, modifyAnnouncementInDB } from '$lib/db';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const annoucement = await getAnnouncementFromDB(session?.user?.id as string, event.params.id);

	if (!annoucement) throw redirect(302, '/dashboard');

	return {
		announcement: annoucement
	};
};

export const actions: Actions = {
	delete: async ({ params }) => {
		return await removeAnnouncementFromDB(params.id);
	},
	modify: async ({ params, request }) => {
		const form = await request.formData();
		const type = form.get('type') as string;
		const content = form.get('content') as string;
		const date = form.get('date') as string;
		return await modifyAnnouncementInDB(params.id, type, content, date);
	}
};
