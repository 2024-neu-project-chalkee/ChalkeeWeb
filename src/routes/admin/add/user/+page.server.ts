import { putUserIntoInstitutionInDB } from '$lib/db';
import { hash } from 'argon2';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { getClassesOfInstitutionFromDB } from '$lib/db';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	return {
		classes: await getClassesOfInstitutionFromDB(session?.user?.institutionId as string)
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const firstName = form.get('firstName') as string;
		const lastName = form.get('lastName') as string;
		const email = form.get('email') as string;
		const role = form.get('role') as string;
		const studentId = form.get('studentId') as string;
		const institutionId = form.get('institutionId') as string;
		const classId = form.get('classId') as string;
		const password =
			firstName.charAt(0).toUpperCase() +
			firstName.slice(1, 3) +
			lastName.charAt(0).toUpperCase() +
			lastName.slice(1, 3) +
			`${
				studentId && studentId.length == 11 && !Number.isNaN(parseInt(studentId))
					? studentId.slice(-4)
					: (new Date().getMonth() + 1 < 10
							? `0${new Date().getMonth() + 1}`
							: new Date().getMonth() + 1) +
						(new Date().getDate() < 10
							? `0${new Date().getDate()}`
							: new Date().getDate().toString())
			}`;
		const passwordHashed = await hash(password as string);

		return await putUserIntoInstitutionInDB(
			email,
			passwordHashed,
			firstName,
			lastName,
			institutionId,
			classId,
			role,
			studentId
		);
	}
};
