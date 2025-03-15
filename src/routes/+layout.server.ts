import type { LayoutServerLoad } from './$types';

function formatPageTitle(url: string) {
	let title = url;
	title = title.replaceAll('/', ' ').trim();

	if (title == 'signin') return 'Sign in';

	if (title.match(/ /g)) {
		if (title.startsWith('dashboard')) title = title.replace('dashboard ', '');
	}

	title = title.charAt(0).toUpperCase() + title.slice(1);

	if (title.includes('Manage timetables')) title = 'Manage timetables';

	return title;
}

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.auth();

	return {
		session,
		title: formatPageTitle(event.url.pathname)
	};
};
