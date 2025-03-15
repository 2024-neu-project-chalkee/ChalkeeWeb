import {
	getTimetableOfClassOrGroupFromDB,
	getTeachersAndPrincipalOfInstitutionFromDB,
	getSubjectsFromDB,
	getRoomsOfInstitutionFromDB,
	modifyLessonModificationInDB,
	putLessonModificationInDB,
	putLessonInDefaultTimetableInDB,
	removeLessonInDefaultTimetableFromDB,
	removeLessonModificationFromDB
} from '$lib/db';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { Timetable } from '$lib/types.ts';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	if (
		!event.params.id.match(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
		)
	)
		throw redirect(302, '/manage/timetables');

	const d = event.url.searchParams.get('d');
	const p = event.url.searchParams.get('p');

	const timetables: Timetable | null = await getTimetableOfClassOrGroupFromDB(
		null,
		event.params.id
	);

	return {
		timetables: timetables,
		lesson:
			d && p && !isNaN(Number(d))
				? timetables?.[Number(d)]?.find((x) => x.period === Number(p)) || null
				: null,
		teachers: await getTeachersAndPrincipalOfInstitutionFromDB(
			session?.user?.institutionId as string
		),
		subjects: await getSubjectsFromDB(),
		rooms: await getRoomsOfInstitutionFromDB(session?.user?.institutionId as string)
	};
};

export const actions: Actions = {
	C1: async ({ request, params, url }) => {
		let form = await request.formData();
		let cancelled = form.get('cancelled') == 'on';
		let event = form.get('event') == 'on';

		let originalValue = form.get('original');
		let original;
		if (originalValue && typeof originalValue === 'string') {
			original = JSON.parse(originalValue);
		} else {
			original = {};
		}

		let teacher = form.get('teacher') ?? original.teacher_id;
		let room = form.get('room') ?? original.room_id;
		let subject = form.get('subject') ?? original.subject_id;

		return await modifyLessonModificationInDB(
			null,
			params.id,
			form.get('d') as string,
			form.get('p') as string,
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

		let originalValue = form.get('original');
		let original;
		if (originalValue && typeof originalValue === 'string') {
			original = JSON.parse(originalValue);
		} else {
			original = {};
		}

		let teacher = form.get('teacher') ?? original.teacher_id;
		let room = form.get('room') ?? original.room_id;
		let subject = form.get('subject') ?? original.subject_id;

		return await putLessonModificationInDB(
			null,
			params.id,
			form.get('d') as string,
			form.get('p') as string,
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

		let originalValue = form.get('original');
		let original;
		if (originalValue && typeof originalValue === 'string') {
			original = JSON.parse(originalValue);
		} else {
			original = {};
		}

		let teacher = form.get('teacher') ?? original.teacher_id;
		let room = form.get('room') ?? original.room_id;
		let subject = form.get('subject') ?? original.subject_id;

		return await putLessonModificationInDB(
			null,
			params.id,
			form.get('d') as string,
			form.get('p') as string,
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
		return await putLessonInDefaultTimetableInDB(
			null,
			params.id,
			form.get('d') as string,
			form.get('p') as string,
			form.get('teacher') as string,
			form.get('room') as string,
			form.get('subject') as string
		);
	},
	D: async ({ request, params }) => {
		let form = await request.formData();
		return await removeLessonInDefaultTimetableFromDB(
			null,
			params.id,
			form.get('d') as string,
			form.get('p') as string
		);
	},
	R: async ({ request, params }) => {
		let form = await request.formData();
		return await removeLessonModificationFromDB(
			null,
			params.id,
			form.get('d') as string,
			form.get('p') as string
		);
	}
};
