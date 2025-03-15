import { SvelteKitAuth } from '@auth/sveltekit';
import Credentials from '@auth/sveltekit/providers/credentials';
import { getUserFromDB } from '$lib/db';

declare module '@auth/sveltekit' {
	interface User {
		lastName: string | undefined;
		firstName: string | undefined;
		role: string | undefined;
		institutionId: string | undefined;
		classId: string | undefined;
		studentId: string | undefined;
	}
}

export const { signIn, signOut, handle } = SvelteKitAuth({
	trustHost: true,
	providers: [
		Credentials({
			name: 'Chalkee',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' }
			},
			authorize: async (credentials) => {
				let user = null;

				if (
					typeof credentials.email !== 'string' ||
					typeof credentials.password !== 'string' ||
					!credentials.email ||
					!credentials.password
				)
					return user;

				user = await getUserFromDB(credentials.email, credentials.password);

				return user;
			}
		})
	],
	session: {
		strategy: 'jwt'
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				Object.assign(token, user);
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				Object.assign(session.user, {
					id: token.id as string,
					firstName: token.firstName as string,
					lastName: token.lastName as string,
					role: token.role as string,
					institutionId: token.institutionId as string,
					classId: token.classId as string,
					studentId: token.studentId as string
				});
			}
			return session;
		}
	},
	pages: {
		error: '/signin',
		signIn: '/signin',
		signOut: '/signout'
	}
});
