import {
	DATABASE_HOST,
	DATABASE_USER,
	DATABASE_PASSWORD,
	DATABASE_NAME
} from '$env/static/private';
import { verify } from 'argon2';
import pg from 'pg';

const pool = new pg.Pool({
	host: DATABASE_HOST,
	user: DATABASE_USER,
	password: DATABASE_PASSWORD,
	database: DATABASE_NAME,
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000
});

export default pool;

export async function getUserFromDb(email: string, password: string) {
	try {
		const { rows } = await pool.query(
			`SELECT * FROM users WHERE email = '${email}' OR student_id = '${email}'`
		);

		if (!rows.length || !(await verify(rows[0].password, password))) return null;

		return {
			...(({ id, role, email }) => ({
				id,
				role,
				email
			}))(rows[0]),
			firstName: rows[0].first_name,
			lastName: rows[0].last_name,
			instituteId: rows[0].institute_id,
			classId: rows[0].class_id,
			studentId: rows[0].student_id
		};
	} catch {
		return null;
	}
}

export async function getInstituteInfoFromDb(userId: string) {
	try {
		const { rows } = await pool.query(
			`SELECT institutes.name, institutes.location, institutes.website, institutes.phone_number FROM users JOIN institutes ON users.institute_id = institutes.id WHERE users.id = '${userId}'`
		);

		return {
			...(({ name, location, website }) => ({ name, location, website }))(rows[0]),
			phoneNumber: rows[0].phone_number
		};
	} catch {
		return null;
	}
}

export async function getClassInfoFromDb(userId: string) {
	try {
		const { rows } = await pool.query(
			`SELECT classes.number, classes.letter FROM users JOIN classes ON users.class_id = classes.id WHERE users.id = '${userId}'`
		);

		return {
			...(({ number, letter }) => ({ number, letter }))(rows[0])
		};
	} catch {
		return null;
	}
}

export async function getGroupInfoFromDb(userId: string) {
	try {
		const { rows } = await pool.query(
			`SELECT groups.name, groups.grouproom FROM user_groups JOIN groups ON user_groups.group_id = groups.id WHERE user_id = '${userId}'`
		);

		return rows;
	} catch {
		return null;
	}
}

export async function getTimetableInfoFromDb(userId: string | null) {
	try {
		const { rows } = await pool.query(`
		WITH user_role AS (
			SELECT role FROM users WHERE id = '${userId}'
		) 

		SELECT
		subjects.name AS subject,
		timetables.day,
		timetables.period,
		CONCAT(users.first_name, ' ', users.last_name) AS name,
		rooms.name AS room,
		CASE 
			WHEN classes.id IS NULL THEN NULL 
			ELSE CONCAT(classes.number, '.', classes.letter) 
		END AS class,
		groups.name AS group,
		grouprooms.name AS grouproom,
		classrooms.name AS classroom

		FROM timetables

		LEFT JOIN classes ON timetables.class_id = classes.id
		LEFT JOIN groups ON timetables.group_id = groups.id
		LEFT JOIN users ON timetables.teacher_id = users.id
		LEFT JOIN rooms ON timetables.room_id = rooms.id
		LEFT JOIN subjects ON timetables.subject_id = subjects.id
		LEFT JOIN rooms AS classrooms ON classes.classroom = classrooms.id AND classes.id IS NOT NULL
		LEFT JOIN rooms AS grouprooms ON groups.grouproom = grouprooms.id AND groups.id IS NOT NULL

		WHERE 
			(
				(SELECT role FROM user_role) = 'Student' AND (
					groups.id IN (
						SELECT group_id
						FROM user_groups
						WHERE user_id = '${userId}'
					)
					OR classes.id IN (
						SELECT id
						FROM classes
						WHERE id = (
							SELECT class_id
							FROM users
							WHERE id = '${userId}'
						)
					)
				)
			)
			OR 
			(
				(SELECT role FROM user_role) = 'Teacher' AND (
					timetables.teacher_id = '${userId}'
				)
			);
		`);

		let timetables = {
			1: [],
			2: [],
			3: [],
			4: [],
			5: [],
			6: [],
			7: []
		};

		rows.forEach((o) => {
			//@ts-ignore
			timetables[o.day].push(o);
		});

		return timetables;
	} catch {
		return null;
	}
}
