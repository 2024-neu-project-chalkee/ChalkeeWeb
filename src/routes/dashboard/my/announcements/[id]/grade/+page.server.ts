import {
	getAnnouncementFromDB,
	getStudentsOfGroupFromDB,
	getStudentsOfClassFromDB,
	putAnnouncementGradesInDB
} from '$lib/db';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const annoucement = await getAnnouncementFromDB(session?.user?.id as string, event.params.id);
	let students: false | any[];

	if (!annoucement) throw redirect(302, '/dashboard');

	if (annoucement.groupId) {
		students = await getStudentsOfGroupFromDB(annoucement.groupId as string);
	} else {
		students = await getStudentsOfClassFromDB(annoucement.classId as string);
	}

	return {
		announcement: annoucement,
		students: students
	};
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const form = await request.formData();
		const grades = JSON.parse(form.get('grades') as string);
		const subjectId = form.get('subjectId') as string;
		const type = form.get('type') as string;
		const announcementId = params.id;
		const session = await locals.auth();
		let weight = 0;

		switch (type) {
			case 'Homework':
				weight = 50;
				break;
			case 'Test':
				weight = 100;
				break;
			case 'Exam':
				weight = 200;
				break;
			case 'Matura Exam':
				weight = 300;
				break;
		}

		return await putAnnouncementGradesInDB(
			grades,
			session?.user?.id as string,
			announcementId,
			subjectId,
			weight.toString()
		);
	}
};
