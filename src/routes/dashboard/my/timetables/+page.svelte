<script>
	//@ts-nocheck
	import { page } from '$app/stores';

	const timetable = $page.data.timetables;

	const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

	let maxPeriod = Math.max(
		...Object.values(timetable)
			.flat()
			.map((entry) => entry.period),
		8
	);
</script>

<table>
	<thead>
		<tr>
			<th>Period</th>
			{#each daysOfWeek as day}
				<th>{day}</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each Array.from({ length: maxPeriod }, (_, i) => i + 1) as period}
			<tr>
				<td>
					<div>
						<strong>{period}</strong>
					</div>
				</td>

				{#each Array.from({ length: 7 }, (_, dayIndex) => dayIndex + 1) as day}
					<td>
						{#if timetable[day] && timetable[day].some((entry) => entry.period === period)}
							{#each timetable[day].filter((entry) => entry.period === period) as entry}
								<div
									class={entry.status == 'Okay'
										? ''
										: entry.status == 'Cancelled'
											? 'bg-red-500 opacity-35'
											: 'bg-yellow-300 text-neutral-800'}
								>
									<strong>{entry.name}</strong>
									<span>{entry.room}</span>
									<span>{entry.teacher_name}</span>
								</div>
							{/each}
						{:else}
							<div>
								<strong>—</strong>
								<span>—</span>
								<span>—</span>
							</div>
						{/if}
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
