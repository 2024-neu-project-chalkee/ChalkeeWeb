export type TimetableEntry = {
	class: string;
	group: string;
	day: number;
	period: number;
	name: string;
	subject: string;
	room: string;
	status: string;
};

export type Timetable = Record<number, TimetableEntry[]>;
