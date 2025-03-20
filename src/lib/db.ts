import {
	DATABASE_HOST,
	DATABASE_USER,
	DATABASE_PASSWORD,
	DATABASE_NAME
} from '$env/static/private';
import { verify } from 'argon2';
import pg from 'pg';
import type { Timetable } from './types';

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

export async function getUserFromDB(email: string, password: string) {
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
			institutionId: rows[0].institution_id,
			classId: rows[0].class_id,
			studentId: rows[0].student_id
		};
	} catch {
		return null;
	}
}

export async function getInstitutionInfoFromDB(userId: string) {
	try {
		const { rows } = await pool.query(
			`SELECT institutions.name, institutions.location, institutions.website, institutions.phone_number FROM users JOIN institutions ON users.institution_id = institutions.id WHERE users.id = $1`,
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

export async function getClassInfoFromDB(userId: string) {
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

export async function getGroupInfoFromDB(userId: string) {
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

export async function getTimetableInfoFromDB(userId: string | null) {
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

		let timetables: Timetable = {
			1: [],
			2: [],
			3: [],
			4: [],
			5: [],
			6: [],
			7: []
		};

		rows.forEach((o) => {
			timetables[o.day].push(o);
		});

		return timetables;
	} catch {
		return null;
	}
}

export async function getAnnouncementsOfUserFromDB(id: string) {
	try {
		const { rows } = await pool.query(
			`
			SELECT DISTINCT
			ON (announcements.id, announcements.group_id, announcements.class_id, announcements.date)
				announcements.id,
				announcements.type,
				announcements.content,
				announcements.date,
				announcements.graded,
				subjects.name AS subject_name,
				announcement_groups.name AS group_name,
				CASE 
					WHEN announcements.class_id IS NOT NULL THEN classes.number 
					ELSE NULL 
				END AS class_number,
				CASE 
					WHEN announcements.class_id IS NOT NULL THEN classes.letter 
					ELSE NULL 
				END AS class_letter,
				CONCAT(announcers.first_name, ' ', announcers.last_name) AS announcer_name,
				CASE 
					WHEN users.id = announcers.id THEN TRUE
					ELSE FALSE 
				END AS user_is_announcer

			FROM announcements

			LEFT JOIN users ON users.id = $1
			LEFT JOIN user_groups ON users.id = user_groups.user_id
			LEFT JOIN groups ON user_groups.group_id = groups.id
			LEFT JOIN classes ON announcements.class_id = classes.id 
			LEFT JOIN subjects ON announcements.subject_id = subjects.id
			LEFT JOIN groups AS announcement_groups ON announcements.group_id = announcement_groups.id
			LEFT JOIN users AS announcers ON announcements.announced_by = announcers.id

			LEFT JOIN timetables
			ON 
			(
				timetables.teacher_id = users.id
				AND
				(
					timetables.class_id = announcements.class_id
					OR
					timetables.group_id = announcements.group_id
				)
			)

			LEFT JOIN timetable_changes
			ON 
			(
				timetable_changes.teacher_id = users.id
				AND
				(
					timetable_changes.class_id = announcements.class_id
					OR
					timetable_changes.group_id = announcements.group_id
				)
			)

			WHERE announcements.graded IS FALSE
			AND (
				announcements.class_id = users.class_id
				OR announcements.group_id = groups.id
				OR timetables.teacher_id IS NOT NULL
				OR timetable_changes.teacher_id IS NOT NULL
			)
			ORDER BY announcements.date;
		`,
			[id]
		);

		return rows.map(
			({
				id,
				type,
				content,
				date,
				subject_name,
				group_name,
				class_number,
				class_letter,
				announcer_name,
				user_is_announcer
			}) => ({
				id,
				type,
				content,
				date,
				subjectName: subject_name,
				groupName: group_name,
				classNumber: class_number,
				classLetter: class_letter,
				announcerName: announcer_name,
				userIsAnnouncer: user_is_announcer
			})
		);
	} catch {
		return false;
	}
}

export async function getAnnouncementFromDB(id: string, announcementId: string) {
	try {
		const { rows } = await pool.query(
			`
			SELECT DISTINCT
			ON (announcements.id, announcements.group_id, announcements.class_id, announcements.date)
				announcements.id,
				announcements.type,
				announcements.content,
				announcements.date,
				announcements.graded,
				announcements.announced_by,
				announcements.group_id,
				announcements.class_id,
				subjects.name AS subject_name,
				subjects.id AS subject_id,
				announcement_groups.name AS group_name,
				CASE 
					WHEN announcements.class_id IS NOT NULL THEN classes.number 
					ELSE NULL 
				END AS class_number,
				CASE 
					WHEN announcements.class_id IS NOT NULL THEN classes.letter 
					ELSE NULL 
				END AS class_letter,
				CONCAT(announcers.first_name, ' ', announcers.last_name) AS announcer_name,
				CASE 
					WHEN users.id = announcers.id THEN TRUE
					ELSE FALSE 
				END AS user_is_announcer
			FROM announcements

			LEFT JOIN users ON users.id = $1
			LEFT JOIN user_groups ON users.id = user_groups.user_id
			LEFT JOIN groups ON user_groups.group_id = groups.id
			LEFT JOIN classes ON announcements.class_id = classes.id 
			LEFT JOIN subjects ON announcements.subject_id = subjects.id
			LEFT JOIN groups AS announcement_groups ON announcements.group_id = announcement_groups.id
			LEFT JOIN users AS announcers ON announcements.announced_by = announcers.id

			LEFT JOIN timetables
			ON 
			(
				timetables.teacher_id = users.id
				AND
				(
					timetables.class_id = announcements.class_id
					OR
					timetables.group_id = announcements.group_id
				)
			)

			LEFT JOIN timetable_changes
			ON 
			(
				timetable_changes.teacher_id = users.id
				AND
				(
					timetable_changes.class_id = announcements.class_id
					OR
					timetable_changes.group_id = announcements.group_id
				)
			)

			WHERE announcements.id = $2
			AND (
				announcements.graded IS FALSE
				OR users.id = announcers.id
			)
			AND (
				announcements.class_id = users.class_id
				OR announcements.group_id = groups.id
				OR timetables.teacher_id IS NOT NULL
				OR timetable_changes.teacher_id IS NOT NULL
			)
			ORDER BY announcements.date;
			`,
			[id, announcementId]
		);

		return rows.map(
			({
				id,
				type,
				content,
				date,
				announced_by,
				class_id,
				group_id,
				subject_name,
				subject_id,
				group_name,
				class_number,
				class_letter,
				announcer_name,
				user_is_announcer,
				graded
			}) => ({
				id,
				type,
				content,
				date,
				graded,
				announcedBy: announced_by,
				classId: class_id,
				groupId: group_id,
				subjectName: subject_name,
				subjectId: subject_id,
				groupName: group_name,
				classNumber: class_number,
				classLetter: class_letter,
				announcerName: announcer_name,
				userIsAnnouncer: user_is_announcer
			})
		)[0];
	} catch {
		return false;
	}
}

export async function getTeachersAndPrincipalOfInstitutionFromDB(institutionId: string) {
	try {
		const { rows } = await pool.query(
			`SELECT * FROM users WHERE institution_id = $1 AND role IN ('Teacher', 'Principal')`,
			[institutionId]
		);

		return rows.map(
			({ id, role, email, first_name, last_name, institution_id, class_id, student_id }) => ({
				id,
				role,
				email,
				firstName: first_name,
				lastName: last_name,
				name: `${first_name} ${last_name}`,
				institutionId: institution_id,
				classId: class_id,
				studentId: student_id
			})
		);
	} catch {
		return null;
	}
}

export async function getSubjectsFromDB() {
	try {
		const { rows } = await pool.query(`SELECT * FROM subjects`);

		return rows;
	} catch {
		return null;
	}
}

export async function getRoomsOfInstitutionFromDB(institutionId: string) {
	try {
		const { rows } = await pool.query(`SELECT * FROM rooms WHERE institution_id = $1`, [
			institutionId
		]);

		return rows;
	} catch {
		return null;
	}
}

export async function getClassesOfInstitutionFromDB(institutionId: string) {
	try {
		const { rows } = await pool.query(
			`SELECT id, number, letter FROM classes WHERE institution_id = $1`,
			[institutionId]
		);

		return rows;
	} catch {
		return null;
	}
}

export async function getGroupsOfInstitutionFromDB(institutionId: string) {
	try {
		const { rows } = await pool.query(`SELECT id, name FROM groups WHERE institution_id = $1`, [
			institutionId
		]);

		return rows;
	} catch {
		return null;
	}
}

export async function getTimetableOfClassOrGroupFromDB(
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

		let timetables: Timetable = {
			1: [],
			2: [],
			3: [],
			4: [],
			5: [],
			6: [],
			7: []
		};

		rows.forEach((o) => {
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

export async function getSubjectsAllowedForTeacherToTeachFromDB(id: string) {
	try {
		const { rows } = await pool.query(
			`
			SELECT DISTINCT subjects.id, subjects.name

			FROM (
				SELECT subject_id
				FROM timetables
				WHERE teacher_id = $1

				UNION

				SELECT subject_id
				FROM timetable_changes
				WHERE teacher_id = $1
			) AS teacher_subjects

			LEFT JOIN subjects ON teacher_subjects.subject_id = subjects.id;
		`,
			[id]
		);

		return rows;
	} catch {
		return false;
	}
}

export async function getMutualSubjectsForTeacherAndGroupFromDB(id: string, groupId: string) {
	try {
		const { rows } = await pool.query(
			`
			SELECT DISTINCT subjects.id, subjects.name
			
			FROM (
				SELECT timetables.subject_id
				FROM timetables
				WHERE timetables.group_id = $2
				
				UNION

				SELECT timetable_changes.subject_id
				FROM timetable_changes
				WHERE timetable_changes.group_id = $2
			) AS group_subjects

			INNER JOIN (
				SELECT timetables.subject_id
				FROM timetables
				WHERE timetables.teacher_id = $1
				AND timetables.group_id = $2
				
				UNION

				SELECT timetable_changes.subject_id
				FROM timetable_changes
				WHERE timetable_changes.teacher_id = $1
				AND timetable_changes.group_id = $2
			) AS teacher_subjects ON group_subjects.subject_id = teacher_subjects.subject_id

			LEFT JOIN subjects ON group_subjects.subject_id = subjects.id;
		`,
			[id, groupId]
		);

		return rows;
	} catch {
		return false;
	}
}

export async function getMutualSubjectsForTeacherAndClassFromDB(id: string, classId: string) {
	try {
		const { rows } = await pool.query(
			`
			SELECT DISTINCT subjects.id, subjects.name
			
			FROM (
				SELECT timetables.subject_id
				FROM timetables
				WHERE timetables.class_id = $2
				
				UNION

				SELECT timetable_changes.subject_id
				FROM timetable_changes
				WHERE timetable_changes.class_id = $2
			) AS class_subjects

			INNER JOIN (
				SELECT timetables.subject_id
				FROM timetables
				WHERE timetables.teacher_id = $1
				AND timetables.class_id = $2
				
				UNION

				SELECT timetable_changes.subject_id
				FROM timetable_changes
				WHERE timetable_changes.teacher_id = $1
				AND timetable_changes.class_id = $2
			) AS teacher_subjects ON class_subjects.subject_id = teacher_subjects.subject_id

			LEFT JOIN subjects ON class_subjects.subject_id = subjects.id;
		`,
			[id, classId]
		);

		return rows;
	} catch {
		return false;
	}
}

export async function getClassesThatTeacherTeachesFromDB(id: string) {
	try {
		const { rows } = await pool.query(
			`
			SELECT DISTINCT classes.id, classes.number, classes.letter, rooms.name AS classroom
			
			FROM (
				SELECT timetables.class_id
				FROM timetables
				WHERE timetables.teacher_id = $1
				
				UNION

				SELECT timetable_changes.class_id
				FROM timetable_changes
				WHERE timetable_changes.teacher_id = $1
			) AS teacher_classes
			
			LEFT JOIN classes ON teacher_classes.class_id = classes.id
			LEFT JOIN rooms ON classes.classroom = rooms.id

			WHERE classes.id IS NOT NULL;
			`,
			[id]
		);

		return rows;
	} catch {
		return false;
	}
}

export async function getGroupsThatTeacherTeachesFromDB(id: string) {
	try {
		const { rows } = await pool.query(
			`
			SELECT DISTINCT groups.id, groups.name, rooms.name AS grouproom

			FROM (
				SELECT timetables.group_id
				FROM timetables
				WHERE timetables.teacher_id = $1
				
				UNION

				SELECT timetable_changes.group_id
				FROM timetable_changes
				WHERE timetable_changes.teacher_id = $1
			) AS teacher_groups

			LEFT JOIN groups ON teacher_groups.group_id = groups.id
			LEFT JOIN rooms ON groups.grouproom = rooms.id

			WHERE groups.id IS NOT NULL;
			`,
			[id]
		);

		return rows;
	} catch {
		return false;
	}
}

export async function getStudentsOfClassFromDB(id: string) {
	try {
		const { rows } = await pool.query(
			`
			SELECT users.id, users.first_name, users.last_name FROM users

			WHERE class_id = $1 AND users.role = 'Student'

			ORDER BY users.first_name, users.last_name;
			`,
			[id]
		);

		return rows.map(({ id, first_name, last_name }) => ({
			id,
			firstName: first_name,
			lastName: last_name,
			name: `${first_name} ${last_name}`
		}));
	} catch {
		return false;
	}
}

export async function getStudentsOfGroupFromDB(id: string) {
	try {
		const { rows } = await pool.query(
			`
			SELECT users.id, users.first_name, users.last_name FROM user_groups

			JOIN users ON users.id = user_groups.user_id

			WHERE user_groups.group_id = $1 AND users.role = 'Student'

			ORDER BY users.first_name, users.last_name;
			`,
			[id]
		);

		return rows.map(({ id, first_name, last_name }) => ({
			id,
			firstName: first_name,
			lastName: last_name,
			name: `${first_name} ${last_name}`
		}));
	} catch {
		return false;
	}
}

export async function removeLessonModificationFromDB(
	classId: string | null,
	groupId: string | null,
	day: string,
	period: string
) {
	try {
		await pool.query(
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
			await pool.query(
				`UPDATE timetable_changes SET status = $4, teacher_id = $5, room_id = $6, subject_id = $7 WHERE ${classId == null ? 'group_id = $1' : 'class_id = $1'} AND day = $2 AND period = $3`,
				[classId ?? groupId, day, period, status, teacher_id, room_id, subject_id]
			);
		}

		return true;
	} catch {
		return false;
	}
}

export async function modifyAnnouncementInDB(
	id: string,
	type: string,
	content: string,
	date: string
) {
	try {
		await pool.query(`UPDATE announcements SET type = $2, content = $3, date = $4 WHERE id = $1`, [
			id,
			type,
			content,
			date
		]);

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
			await pool.query(
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
		await pool.query(
			`DELETE FROM timetables WHERE ${classId == null ? 'group_id = $1' : 'class_id = $1'} AND day = $2 AND period = $3`,
			[classId ?? groupId, day, period]
		);

		return true;
	} catch {
		return false;
	}
}

export async function removeAnnouncementFromDB(id: string) {
	try {
		await pool.query(`DELETE FROM announcements WHERE id = $1`, [id]);

		return true;
	} catch {
		return false;
	}
}

export async function putLessonInDefaultTimetableInDB(
	classId: string | null,
	groupId: string | null,
	day: string,
	period: string,
	teacher_id: string,
	room_id: string,
	subject_id: string
) {
	try {
		await pool.query(
			`INSERT INTO timetables (${classId == null ? 'group_id' : 'class_id'}, teacher_id, subject_id, room_id, day, period) VALUES ($1, $2, $3, $4, $5, $6)`,
			[classId ?? groupId, teacher_id, subject_id, room_id, day, period]
		);

		return true;
	} catch {
		return false;
	}
}

export async function putUserIntoInstitutionInDB(
	email: string,
	password: string,
	firstName: string,
	lastName: string,
	institutionId: string,
	classId: string | null,
	role: string,
	studentId: string | null
) {
	try {
		await pool.query(
			`INSERT INTO users (email, password, first_name, last_name, institution_id, class_id, role, student_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
			[email, password, firstName, lastName, institutionId, classId, role, studentId]
		);

		return true;
	} catch {
		return false;
	}
}

export async function putRoomIntoInstitutionInDB(name: string, institutionId: string) {
	try {
		await pool.query(`INSERT INTO rooms (name, institution_id) VALUES ($1, $2)`, [
			name,
			institutionId
		]);

		return true;
	} catch {
		return false;
	}
}

export async function putClassInInstitutionInDB(
	number: string,
	letter: string,
	classroom: string | null,
	institutionId: string
) {
	try {
		await pool.query(
			`INSERT INTO classes (number, letter, classroom, institution_id) VALUES ($1, $2, $3, $4)`,
			[number, letter, classroom, institutionId]
		);

		return true;
	} catch {
		return false;
	}
}

export async function putGroupInInstitutionInDB(
	name: string,
	grouproom: string | null,
	institutionId: string
) {
	try {
		await pool.query(`INSERT INTO groups (name, grouproom, institution_id) VALUES ($1, $2, $3)`, [
			name,
			grouproom,
			institutionId
		]);

		return true;
	} catch {
		return false;
	}
}

export async function putAnnouncementForClassInDB(
	userId: string,
	classId: string,
	subjectId: string,
	type: string,
	content: string,
	date: string
) {
	try {
		await pool.query(
			`INSERT INTO announcements (class_id, type, content, date, subject_id, announced_by, graded) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			[classId, type, content, date, subjectId, userId, false]
		);

		return true;
	} catch {
		return false;
	}
}

export async function putAnnouncementForGroupInDB(
	userId: string,
	groupId: string,
	subjectId: string,
	type: string,
	content: string,
	date: string
) {
	try {
		await pool.query(
			`INSERT INTO announcements (group_id, type, content, date, subject_id, announced_by, graded) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			[groupId, type, content, date, subjectId, userId, false]
		);

		return true;
	} catch {
		return false;
	}
}

export async function putAnnouncementGradesInDB(
	grades: { [studentId: string]: string },
	userId: string,
	announcementId: string,
	subjectId: string,
	weight: string
) {
	try {
		let query = `INSERT INTO grades (student_id, teacher_id, announcement_id, subject_id, grade, weight) VALUES `;

		for (let i = 0; i < Object.keys(grades).length; i++) {
			query += `('${Object.keys(grades)[i]}', '${userId}', '${announcementId}', '${subjectId}', ${Object.values(grades)[i]}, ${weight})${i != Object.keys(grades).length - 1 ? ',' : ''}`;
		}

		query += `; UPDATE announcements SET graded = TRUE WHERE id = '${announcementId}'`;

		await pool.query(query);

		return true;
	} catch {
		return false;
	}
}

export async function getGradesOfUserFromDB(id: string) {
	try {
		const { rows } = await pool.query(
			`
			SELECT

			grades.id,
			grades.announcement_id,
			grades.grade,
			grades.weight,
			announcements.type,
			announcements.content,
			announcements.date,
			CONCAT(users.first_name, ' ', users.last_name) AS name,
			subjects.name AS subject_name,
			groups.name AS group_name,
			CASE 
				WHEN classes.number IS NULL AND classes.letter IS NULL THEN NULL
				ELSE CONCAT(classes.number, '.', classes.letter) 
			END AS class_name

			FROM grades

			JOIN announcements ON announcements.id = grades.announcement_id
			JOIN users ON users.id = grades.teacher_id
			JOIN subjects ON subjects.id = grades.subject_id
			LEFT JOIN groups ON groups.id = announcements.group_id
			LEFT JOIN classes ON classes.id = announcements.class_id

			WHERE grades.student_id = $1 ORDER BY announcements.date
			`,
			[id]
		);

		return rows.map(
			({
				id,
				announcement_id,
				grade,
				weight,
				type,
				content,
				date,
				name,
				subject_name,
				group_name,
				class_name
			}) => ({
				id,
				announcementId: announcement_id,
				grade,
				weight,
				type,
				content,
				date,
				name,
				subjectName: subject_name,
				groupName: group_name,
				className: class_name
			})
		);
	} catch {
		return false;
	}
}
