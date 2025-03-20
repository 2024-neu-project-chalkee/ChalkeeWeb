import { getMutualSubjectsForTeacherAndClassFromDB, putAnnouncementForClassInDB } from '$lib/db';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Actions } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	const mutualSubjects = await getMutualSubjectsForTeacherAndClassFromDB(
		session?.user?.id as string,
		event.params.id
	);

	if (!mutualSubjects) throw redirect(302, '/dashboard/my/announcements/new');

	return {
		mutualSubjects: mutualSubjects
	};
};

export const actions: Actions = {
	default: async ({ params, request, locals }) => {
		const form = await request.formData();
		const subject = form.get('subject') as string;
		const type = form.get('type') as string;
		const date = form.get('date') as string;
		const content = form.get('content') as string;
		const session = await locals.auth();

		return await putAnnouncementForClassInDB(
			session?.user?.id as string,
			params.id,
			subject,
			type,
			content,
			date
		);
	}
};
