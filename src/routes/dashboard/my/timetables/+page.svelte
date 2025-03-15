<script lang="ts">
	import { page } from '$app/stores';
	import type { Timetable } from '$lib/types';
	const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

	let maxPeriod = 8;

	let timetable: Timetable = $page.data.timetables || {};
	$: timetable = $page.data.timetables ? $page.data.timetables : {};

	if (timetable) {
		maxPeriod = Math.max(
			...Object.values(timetable)
				.flat()
				.map((entry) => entry.period),
			8
		);
	}

	let today =
		(new Date().getHours() >= maxPeriod + 8
			? (new Date().getDay() % 7) + 1
			: new Date().getDay()) || 7;

	let h = 0;
</script>

<svelte:window bind:innerWidth={h} />

<div class="island-col">
	{#if h < 1536}
		<table>
			<thead>
				<tr>
					<th>Period</th>
					<th>{daysOfWeek[today - 1]}</th>
				</tr>
			</thead>
			<tbody>
				{#each Array.from({ length: maxPeriod }, (_, i) => i + 1) as period}
					<tr>
						<td class={period + 6 == new Date().getHours() ? 'bg-neutral-900' : ''}>
							<div>
								<strong>{period}</strong>
							</div>
						</td>

						{#if timetable[today] && timetable[today].some((entry) => entry.period === period)}
							{#each timetable[today].filter((entry) => entry.period === period) as entry}
								<td
									class={entry.status != null
										? entry.status == 'Cancelled'
											? 'bg-red-600 line-through opacity-50'
											: entry.status == 'Event'
												? 'bg-green-600 line-through opacity-50'
												: 'bg-orange-600'
										: ''}
								>
									<strong>{entry.subject}</strong>
									{#if $page.data.session?.user?.role != 'Teacher'}
										<p
											class={['Reassigned', 'Substitute'].includes(entry.status) ? 'font-bold' : ''}
										>
											{entry.name}{@html ['Reassigned', 'Substitute'].includes(entry.status)
												? '<br>(Substitute teacher)'
												: ''}
										</p>
									{:else}
										<p
											class={['Reassigned', 'Substitute'].includes(entry.status) ? 'font-bold' : ''}
										>
											{entry.group == null ? entry.class : entry.group}{@html [
												'Reassigned',
												'Substitute'
											].includes(entry.status)
												? ' (Substitute teacher)'
												: ''}
										</p>
									{/if}
									<p class={['Reassigned', 'Roomswap'].includes(entry.status) ? 'font-bold' : ''}>
										{entry.room}{['Reassigned', 'Roomswap'].includes(entry.status)
											? ' (Room change)'
											: ''}
									</p>
								</td>
							{/each}
						{:else}
							<td>
								<div>
									<strong>—</strong>
									<span>—</span>
									<span>—</span>
								</div>
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<table>
			<thead>
				<tr>
					<th></th>
					{#each daysOfWeek as day}
						<th>{day}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each Array.from({ length: maxPeriod }, (_, i) => i + 1) as period}
					<tr>
						<td class={period + 6 == new Date().getHours() ? 'bg-neutral-900' : ''}>
							<div>
								<strong>{period}</strong>
							</div>
						</td>

						{#each Array.from({ length: 7 }, (_, dayIndex) => dayIndex + 1) as day}
							<td
								class={day == (!new Date().getDay() ? 7 : new Date().getDay())
									? 'bg-neutral-900'
									: ''}
							>
								{#if timetable[day] && timetable[day].some((entry) => entry.period === period)}
									{#each timetable[day].filter((entry) => entry.period === period) as entry}
										<div
											class={entry.status != null
												? entry.status == 'Cancelled'
													? 'bg-red-600 line-through opacity-50'
													: entry.status == 'Event'
														? 'bg-green-600 line-through opacity-50'
														: 'bg-orange-600'
												: ''}
										>
											<strong>{entry.subject}</strong>
											{#if $page.data.session?.user?.role != 'Teacher'}
												<p
													class={['Reassigned', 'Substitute'].includes(entry.status)
														? 'font-bold'
														: ''}
												>
													{entry.name}{@html ['Reassigned', 'Substitute'].includes(entry.status)
														? '<br>(Substitute teacher)'
														: ''}
												</p>
											{:else}
												<p
													class={['Reassigned', 'Substitute'].includes(entry.status)
														? 'font-bold'
														: ''}
												>
													{entry.group == null ? entry.class : entry.group}{@html [
														'Reassigned',
														'Substitute'
													].includes(entry.status)
														? ' (Substitute teacher)'
														: ''}
												</p>
											{/if}
											<p
												class={['Reassigned', 'Roomswap'].includes(entry.status) ? 'font-bold' : ''}
											>
												{entry.room}{['Reassigned', 'Roomswap'].includes(entry.status)
													? ' (Room change)'
													: ''}
											</p>
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
	{/if}
</div>
