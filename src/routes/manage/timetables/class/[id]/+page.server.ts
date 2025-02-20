import {
	getTimetableOfClassOrGroupFromDb,
	getTeachersAndPrincipalOfInstituteFromDb,
	getSubjectsFromDb,
	getRoomsOfInstituteFromDb,
	modifyLessonModificationInDB,
	putLessonModificationInDB,
	putLessonInDefaultTimetableFromDB,
	removeLessonInDefaultTimetableFromDB,
	removeLessonModificationFromDB
} from '$lib/db';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	if (
		!event.params.id.match(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
		)
	)
		throw redirect(302, '/manage/timetables');

	const timetables = await getTimetableOfClassOrGroupFromDb(event.params.id, null);

	return {
		timetables: timetables,
		lesson:
			event.url.searchParams.get('d') && event.url.searchParams.get('p')
				? timetables![event.url.searchParams.get('d')].find(
						(x) => x.period == event.url.searchParams.get('p')
					)
				: null,
		teachers: await getTeachersAndPrincipalOfInstituteFromDb(session?.user?.instituteId as string),
		subjects: await getSubjectsFromDb(),
		rooms: await getRoomsOfInstituteFromDb(session?.user?.instituteId as string)
	};
};

export const actions: Actions = {
	C1: async ({ request, params, url }) => {
		let form = await request.formData();
		let cancelled = form.get('cancelled') == 'on';
		let event = form.get('event') == 'on';
		let original = JSON.parse(form.get('original'));
		let teacher = form.get('teacher') ?? original.teacher_id;
		let room = form.get('room') ?? original.room_id;
		let subject = form.get('subject') ?? original.subject_id;

		return await modifyLessonModificationInDB(
			params.id,
			null,
			form.get('d'),
			form.get('p'),
			teacher,
			room,
			subject,
			cancelled,
			event,
			original
		);
	},
	C2: async ({ request, params, url }) => {
		let form = await request.formData();
		let cancelled = form.get('cancelled') == 'on';
		let event = form.get('event') == 'on';
		let original = JSON.parse(form.get('original'));
		let teacher = form.get('teacher') ?? original.teacher_id;
		let room = form.get('room') ?? original.room_id;
		let subject = form.get('subject') ?? original.subject_id;

		return await putLessonModificationInDB(
			params.id,
			null,
			form.get('d'),
			form.get('p'),
			teacher,
			room,
			subject,
			cancelled,
			event,
			original
		);
	},
	C3: async ({ request, params, url }) => {
		let form = await request.formData();
		let cancelled = form.get('cancelled') == 'on';
		let event = form.get('event') == 'on';
		let teacher = form.get('teacher') ?? original.teacher_id;
		let room = form.get('room') ?? original.room_id;
		let subject = form.get('subject') ?? original.subject_id;

		return await putLessonModificationInDB(
			params.id,
			null,
			form.get('d'),
			form.get('p'),
			teacher,
			room,
			subject,
			cancelled,
			event,
			null
		);
	},
	A: async ({ request, params }) => {
		let form = await request.formData();
		return await putLessonInDefaultTimetableFromDB(
			params.id,
			null,
			form.get('d'),
			form.get('p'),
			form.get('teacher'),
			form.get('room'),
			form.get('subject')
		);
	},
	D: async ({ request, params }) => {
		let form = await request.formData();
		return await removeLessonInDefaultTimetableFromDB(
			params.id,
			null,
			form.get('d'),
			form.get('p')
		);
	},
	R: async ({ request, params }) => {
		let form = await request.formData();
		return await removeLessonModificationFromDB(params.id, null, form.get('d'), form.get('p'));
	}
};
