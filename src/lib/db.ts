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
			`SELECT * FROM chalkee.users WHERE email_address = '${email}' OR student_id = '${email}'`
		);

		if (!rows.length || !(await verify(rows[0].password, password))) return null;

		return {
			...(({ id, role }) => ({
				id,
				role
			}))(rows[0]),
			email: rows[0].email_address,
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

export async function getInstituteInfoFromDb(instituteId: string) {
	try {
		const { rows } = await pool.query(
			`SELECT * FROM chalkee.Institutes WHERE id = '${instituteId}'`
		);

		return {
			...(({ name, location, website }) => ({ name, location, website }))(rows[0]),
			phoneNumber: rows[0].phone_number
		};
	} catch {
		return null;
	}
}

export async function getClassInfoFromDb(classId: string) {
	try {
		const { rows } = await pool.query(`SELECT * FROM chalkee.Classes WHERE id = '${classId}'`);

		return {
			...(({ number, letter }) => ({ number, letter }))(rows[0]),
			additionalGroup: rows[0].additional_group
		};
	} catch {
		return null;
	}
}

export async function getTimetableInfoFromDb(classId: string) {
	try {
		const { rows } = await pool.query(
			`
			SELECT

			Timetables.id,
			Subjects.name,
			Timetables.day_of_week,
			COALESCE(Timetable_changes.period, Timetables.period) AS period,
			COALESCE(Timetable_changes.room, Timetables.room) AS room,
			CONCAT(first_name, ' ', last_name) AS teacher_name,
			COALESCE(Timetable_changes.type, 'Okay') AS status

			FROM chalkee.Timetables

			LEFT JOIN chalkee.Timetable_changes ON Timetables.id = Timetable_changes.timetable_obj_id
			AND (Timetable_changes.date >= date_trunc('week', current_date) AND Timetable_changes.date < date_trunc('week', current_date) + interval '1 week') IS NOT FALSE
			LEFT JOIN chalkee.Users ON COALESCE(Timetable_changes.teacher_id, Timetables.teacher_id) = Users.id
			JOIN chalkee.Subjects ON subject_id = Subjects.id

			WHERE Timetables.class_id = '${classId}'

			ORDER BY day_of_week, period
			`
		);

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
			timetables[o.day_of_week].push(o);
		});

		return timetables;
	} catch {
		return null;
	}
}
