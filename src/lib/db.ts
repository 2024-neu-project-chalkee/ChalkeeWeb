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
		const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1 OR student_id = $1`, [
			email
		]);

		if (!rows.length || !(await verify(rows[0].password, password))) return null;

		return {
			...(({ id, role, email }) => ({
				id,
				role,
				email
			}))(rows[0]),
			firstName: rows[0].first_name,
			lastName: rows[0].last_name,
			name: `${rows[0].first_name} ${rows[0].last_name}`,
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
			`SELECT institutes.name, institutes.location, institutes.website, institutes.phone_number FROM users JOIN institutes ON users.institute_id = institutes.id WHERE users.id = $1`,
			[userId]
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
			`SELECT classes.number, classes.letter FROM users JOIN classes ON users.class_id = classes.id WHERE users.id = $1`,
			[userId]
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
			`SELECT groups.name, groups.grouproom FROM user_groups JOIN groups ON user_groups.group_id = groups.id WHERE user_id = $1`,
			[userId]
		);

		return rows;
	} catch {
		return null;
	}
}

export async function getTimetableInfoFromDb(userId: string | null) {
	try {
		const { rows } = await pool.query(
			`
		WITH user_role AS (
			SELECT role 
			FROM users 
			WHERE id = $1
		), 
		timetable_combined AS (
			SELECT 
				tc.day, 
				tc.period, 
				s2.name AS subject,
				CONCAT(u2.first_name, ' ', u2.last_name) AS name,
				r2.name AS room,
				CASE 
					WHEN c2.id IS NULL THEN NULL 
					ELSE CONCAT(c2.number, '.', c2.letter) 
				END AS class,
				g2.name AS "group",
				gr2.name AS grouproom,
				cr2.name AS classroom,
				tc.status,
				c2.id AS class_id,
				g2.id AS group_id,
				u2.id AS teacher_id
			FROM timetable_changes tc
			LEFT JOIN classes c2 ON tc.class_id = c2.id
			LEFT JOIN groups g2 ON tc.group_id = g2.id
			LEFT JOIN users u2 ON tc.teacher_id = u2.id
			LEFT JOIN rooms r2 ON tc.room_id = r2.id
			LEFT JOIN subjects s2 ON tc.subject_id = s2.id
			LEFT JOIN rooms cr2 ON c2.classroom = cr2.id AND c2.id IS NOT NULL
			LEFT JOIN rooms gr2 ON g2.grouproom = gr2.id AND g2.id IS NOT NULL

			UNION ALL

			SELECT 
				t.day, 
				t.period, 
				s1.name AS subject,
				CONCAT(u1.first_name, ' ', u1.last_name) AS name,
				r1.name AS room,
				CASE 
					WHEN c1.id IS NULL THEN NULL 
					ELSE CONCAT(c1.number, '.', c1.letter) 
				END AS class,
				g1.name AS "group",
				gr1.name AS grouproom,
				cr1.name AS classroom,
				NULL AS status,
				c1.id AS class_id,
				g1.id AS group_id,
				u1.id AS teacher_id
			FROM timetables t
			LEFT JOIN classes c1 ON t.class_id = c1.id
			LEFT JOIN groups g1 ON t.group_id = g1.id
			LEFT JOIN users u1 ON t.teacher_id = u1.id
			LEFT JOIN rooms r1 ON t.room_id = r1.id
			LEFT JOIN subjects s1 ON t.subject_id = s1.id
			LEFT JOIN rooms cr1 ON c1.classroom = cr1.id AND c1.id IS NOT NULL
			LEFT JOIN rooms gr1 ON g1.grouproom = gr1.id AND g1.id IS NOT NULL
			WHERE NOT EXISTS (
				SELECT 1 FROM timetable_changes tc 
				WHERE tc.day = t.day AND tc.period = t.period
			)
		)

		SELECT day, period, subject, name, room, class, "group", classroom, grouproom, status
		FROM timetable_combined
		WHERE 
		(
			(SELECT role FROM user_role) = 'Student' 
			AND (
				group_id IN (
					SELECT group_id 
					FROM user_groups 
					WHERE user_id = $1
				)
				OR class_id IN (
					SELECT id 
					FROM classes 
					WHERE id = (
						SELECT class_id 
						FROM users 
						WHERE id = $1
					)
				)
			)
		) 
		OR 
		(
			(SELECT role FROM user_role) IN ('Teacher', 'Principal') 
			AND (
				teacher_id = $1
			)
		);
		`,
			[userId]
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
			timetables[o.day].push(o);
		});

		return timetables;
	} catch {
		return null;
	}
}

export async function getTeachersAndPrincipalOfInstituteFromDb(instituteId: string) {
	try {
		const { rows } = await pool.query(
			`SELECT * FROM users WHERE institute_id = $1 AND role IN ('Teacher', 'Principal')`,
			[instituteId]
		);

		return rows.map(
			({ id, role, email, first_name, last_name, institute_id, class_id, student_id }) => ({
				id,
				role,
				email,
				firstName: first_name,
				lastName: last_name,
				name: `${first_name} ${last_name}`,
				instituteId: institute_id,
				classId: class_id,
				studentId: student_id
			})
		);
	} catch {
		return null;
	}
}

export async function getSubjectsFromDb() {
	try {
		const { rows } = await pool.query(`SELECT * FROM subjects`);

		return rows;
	} catch {
		return null;
	}
}

export async function getRoomsOfInstituteFromDb(instituteId: string) {
	try {
		const { rows } = await pool.query(`SELECT * FROM rooms WHERE institute_id = $1`, [instituteId]);

		return rows;
	} catch {
		return null;
	}
}

export async function getClassesOfInstituteFromDb(instituteId: string) {
	try {
		const { rows } = await pool.query(
			`SELECT id, number, letter FROM classes WHERE institute_id = $1`,
			[instituteId]
		);

		return rows;
	} catch {
		return null;
	}
}

export async function getGroupsOfInstituteFromDb(instituteId: string) {
	try {
		const { rows } = await pool.query(`SELECT id, name FROM groups WHERE institute_id = $1`, [
			instituteId
		]);

		return rows;
	} catch {
		return null;
	}
}

export async function getTimetableOfClassOrGroupFromDb(
	classId: string | null,
	groupId: string | null
) {
	try {
		const { rows } = await pool.query(`
		WITH timetable_combined AS (
		SELECT 
			tc.day, 
			tc.period, 
			s2.name AS subject,
			s2.id AS subject_id,
			CONCAT(u2.first_name, ' ', u2.last_name) AS name,
			r2.name AS room,
			r2.id AS room_id,
			CASE 
				WHEN c2.id IS NULL THEN NULL 
				ELSE CONCAT(c2.number, '.', c2.letter) 
			END AS class,
			g2.name AS "group",
			gr2.name AS grouproom,
			cr2.name AS classroom,
			tc.status,
			c2.id AS class_id,
			g2.id AS group_id,
			u2.id AS teacher_id
		FROM timetable_changes tc
		LEFT JOIN classes c2 ON tc.class_id = c2.id
		LEFT JOIN groups g2 ON tc.group_id = g2.id
		LEFT JOIN users u2 ON tc.teacher_id = u2.id
		LEFT JOIN rooms r2 ON tc.room_id = r2.id
		LEFT JOIN subjects s2 ON tc.subject_id = s2.id
		LEFT JOIN rooms cr2 ON c2.classroom = cr2.id AND c2.id IS NOT NULL
		LEFT JOIN rooms gr2 ON g2.grouproom = gr2.id AND g2.id IS NOT NULL

		UNION ALL

		SELECT 
			t.day, 
			t.period, 
			s1.name AS subject,
			s1.id AS subject_id,
			CONCAT(u1.first_name, ' ', u1.last_name) AS name,
			r1.name AS room,
			r1.id AS room_id,
			CASE 
				WHEN c1.id IS NULL THEN NULL 
				ELSE CONCAT(c1.number, '.', c1.letter) 
			END AS class,
			g1.name AS "group",
			gr1.name AS grouproom,
			cr1.name AS classroom,
			NULL AS status,
			c1.id AS class_id,
			g1.id AS group_id,
			u1.id AS teacher_id
		FROM timetables t
		LEFT JOIN classes c1 ON t.class_id = c1.id
		LEFT JOIN groups g1 ON t.group_id = g1.id
		LEFT JOIN users u1 ON t.teacher_id = u1.id
		LEFT JOIN rooms r1 ON t.room_id = r1.id
		LEFT JOIN subjects s1 ON t.subject_id = s1.id
		LEFT JOIN rooms cr1 ON c1.classroom = cr1.id AND c1.id IS NOT NULL
		LEFT JOIN rooms gr1 ON g1.grouproom = gr1.id AND g1.id IS NOT NULL
		WHERE NOT EXISTS (
			SELECT 1 FROM timetable_changes tc 
			WHERE tc.day = t.day AND tc.period = t.period
		)
	)

	SELECT *
	FROM timetable_combined
	WHERE ${classId == null ? `group_id = '${groupId}'` : `class_id = '${classId}'`};
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

export async function getLessonStatusFromDB(
	classId: string | null,
	groupId: string | null,
	day: string,
	period: string
) {
	try {
		const { rows } = await pool.query(
			`
			SELECT 
			CASE
				WHEN EXISTS (
					SELECT 1 
					FROM timetables t
					WHERE t.${classId != null ? 'class_id = $1' : 'group_id = $1'}
					AND t.day = $2
					AND t.period = $3
				)
				AND NOT EXISTS (
					SELECT 1 
					FROM timetable_changes tc
					WHERE tc.${classId != null ? 'class_id = $1' : 'group_id = $1'}
					AND tc.day = $2
					AND tc.period = $3
				) 
				THEN 1

				WHEN NOT EXISTS (
					SELECT 1 
					FROM timetables t
					WHERE t.${classId != null ? 'class_id = $1' : 'group_id = $1'}
					AND t.day = $2
					AND t.period = $3
				)
				AND EXISTS (
					SELECT 1 
					FROM timetable_changes tc
					WHERE tc.${classId != null ? 'class_id = $1' : 'group_id = $1'}
					AND tc.day = $2
					AND tc.period = $3
				) 
				THEN 2
				
				WHEN EXISTS (
					SELECT 1 
					FROM timetables t
					WHERE t.${classId != null ? 'class_id = $1' : 'group_id = $1'}
					AND t.day = $2
					AND t.period = $3
				) 
				OR EXISTS (
					SELECT 1 
					FROM timetable_changes tc
					WHERE tc.${classId != null ? 'class_id = $1' : 'group_id = $1'}
					AND tc.day = $2
					AND tc.period = $3
				) 
				THEN 3

				ELSE 4
			END AS lesson_status;
			`,
			[classId ?? groupId, day, period]
		);

		return rows[0].lesson_status;
	} catch {
		return null;
	}
}

export async function removeLessonModificationFromDB(
	classId: string | null,
	groupId: string | null,
	day: string,
	period: string
) {
	try {
		const { rows } = await pool.query(
			`DELETE FROM timetable_changes WHERE ${classId == null ? 'group_id = $1' : 'class_id = $1'} AND day = $2 AND period = $3`,
			[classId ?? groupId, day, period]
		);

		return true;
	} catch {
		return false;
	}
}
export async function modifyLessonModificationInDB(
	classId: string | null,
	groupId: string | null,
	day: string,
	period: string,
	teacher_id: string,
	room_id: string,
	subject_id: string,
	cancelled: boolean,
	event: boolean,
	original: { status: string; teacher_id: string; room_id: string; subject_id: string }
) {
	try {
		let status = '';

		if (!event) {
			if (!cancelled) {
				if (original.teacher_id != teacher_id) {
					status = 'Substitute';
					if (original.room_id != room_id) {
						status = 'Reassigned';
					}
				} else if (original.room_id != room_id) {
					status = 'Roomswap';
				}
				if (original.subject_id != subject_id || ['Event', 'Cancelled'].includes(original.status)) {
					status = 'Shift';
				}
				if (status == '') status = 'Nochange';
			} else {
				status = 'Cancelled';
			}
		} else {
			status = 'Event';
		}

		if (status != 'Nochange') {
			pool.query(
				`UPDATE timetable_changes SET status = $4, teacher_id = $5, room_id = $6, subject_id = $7 WHERE ${classId == null ? 'group_id = $1' : 'class_id = $1'} AND day = $2 AND period = $3`,
				[classId ?? groupId, day, period, status, teacher_id, room_id, subject_id]
			);
		}

		return true;
	} catch {
		return false;
	}
}

export async function putLessonModificationInDB(
	classId: string | null,
	groupId: string | null,
	day: string,
	period: string,
	teacher_id: string,
	room_id: string,
	subject_id: string,
	cancelled: boolean,
	event: boolean,
	original: { status: string; teacher_id: string; room_id: string; subject_id: string } | null
) {
	try {
		let status = '';

		if (original != null) {
			if (!event) {
				if (!cancelled) {
					if (original.teacher_id != teacher_id) {
						status = 'Substitute';
						if (original.room_id != room_id) {
							status = 'Reassigned';
						}
					} else if (original.room_id != room_id) {
						status = 'Roomswap';
					}
					if (
						original.subject_id != subject_id ||
						['Event', 'Cancelled'].includes(original.status)
					) {
						status = 'Shift';
					}
					if (status == '') status = 'Nochange';
				} else {
					status = 'Cancelled';
				}
			} else {
				status = 'Event';
			}
		} else {
			status = 'Shift';
		}

		if (status != 'Nochange') {
			pool.query(
				`INSERT INTO timetable_changes (${classId == null ? 'group_id' : 'class_id'}, teacher_id, subject_id, room_id, status, day, period) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
				[classId ?? groupId, teacher_id, subject_id, room_id, status, day, period]
			);
		}

		return true;
	} catch {
		return false;
	}
}

export async function removeLessonInDefaultTimetableFromDB(
	classId: string | null,
	groupId: string | null,
	day: string,
	period: string
) {
	try {
		const { rows } = await pool.query(
			`DELETE FROM timetables WHERE ${classId == null ? 'group_id = $1' : 'class_id = $1'} AND day = $2 AND period = $3`,
			[classId ?? groupId, day, period]
		);

		return true;
	} catch {
		return false;
	}
}

export async function putLessonInDefaultTimetableFromDB(
	classId: string | null,
	groupId: string | null,
	day: string,
	period: string,
	teacher_id: string,
	room_id: string,
	subject_id: string
) {
	try {
		pool.query(
			`INSERT INTO timetables (${classId == null ? 'group_id' : 'class_id'}, teacher_id, subject_id, room_id, day, period) VALUES ($1, $2, $3, $4, $5, $6)`,
			[classId ?? groupId, teacher_id, subject_id, room_id, day, period]
		);

		return true;
	} catch {
		return false;
	}
}
