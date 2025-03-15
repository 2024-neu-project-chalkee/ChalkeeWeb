<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Timetable } from '$lib/types';

	const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

	let maxPeriod = 8;

	let timetable: Timetable = $page.data.timetables || {};
	$: timetable = $page.data.timetables ? $page.data.timetables : {};

	let l = '';
	$: c = $page.data.lesson ? $page.data.lesson['status'] == 'Cancelled' : false;
	$: e = $page.data.lesson ? $page.data.lesson['status'] == 'Event' : false;

	if (timetable) {
		maxPeriod = Math.max(
			...Object.values(timetable)
				.flat()
				.map((entry) => entry.period),
			8
		);
	}

	let dp: number;
	let pp: number;
	let w = 0;
</script>

<svelte:window bind:innerWidth={w} />

<div class="island-col">
	{#key $page.url.searchParams.get('d') && $page.url.searchParams.get('p')}
		{#if $page.url.searchParams.get('d') && $page.url.searchParams.get('p')}
			<form
				use:enhance={({ formData }) => {
					formData.append('d', $page.url.searchParams.get('d') ?? '');
					formData.append('p', $page.url.searchParams.get('p') ?? '');
					formData.append('original', JSON.stringify($page.data.lesson));
					return async ({ result }) => {
						if (result.status == 200) {
							await invalidateAll();
							await goto($page.url.pathname, { replaceState: true });
						}
					};
				}}
				method="POST"
				class="flex flex-col gap-8"
				action={`?/${
					$page.data.lesson
						? $page.data.lesson['status']
							? l == 'R'
								? 'R'
								: l == 'C1'
									? 'C1'
									: null
							: l == 'C2'
								? 'C2'
								: l == 'D'
									? 'D'
									: null
						: l == 'A'
							? 'A'
							: l == 'C3'
								? 'C3'
								: null
				}`}
			>
				<div class="flex flex-col gap-4">
					<h1>What would you like to do with this lesson?</h1>
					<select required bind:value={l} class="w-3/5" name="l" id="l">
						<option selected disabled hidden>Select an option</option>
						{#if $page.data.lesson}
							{#if $page.data.lesson['status']}
								<option value="R">Revert temporary change</option>
								<option value="C1">Change data of the temporary change</option>
							{:else}
								<option value="C2">Make a temporary change to the timetable</option>
								<option value="D">Remove it from the default timetable</option>
							{/if}
						{:else}
							<option value="A">Add a lesson to the default timetable</option>
							<option value="C3">Make a temporary change to the timetable</option>
						{/if}
					</select>
					{#if $page.data.lesson}
						{#if $page.data.lesson['status']}
							{#if l == 'C1'}
								<label class="mt-4 flex cursor-pointer flex-row items-center gap-2">
									<input bind:checked={e} type="checkbox" name="event" id="event" />
									Event
								</label>
								<label
									class={`${e ? 'opacity-50' : ''} flex cursor-pointer flex-row items-center gap-2`}
								>
									<input
										bind:checked={c}
										disabled={e}
										type="checkbox"
										name="cancelled"
										id="cancelled"
									/>
									Cancelled
								</label>
								<div class={`${e || c ? 'opacity-50' : ''} flex flex-col gap-2`}>
									<h2>Who should be the teacher of the lesson?</h2>
									<select disabled={e || c} name="teacher" id="teacher">
										{#each $page.data.teachers as teacher}
											<option
												value={teacher.id}
												selected={$page.data.lesson.teacher_id == teacher.id}
												>{teacher.name}{teacher.id == $page.data.session?.user?.id
													? ' (you)'
													: ''}</option
											>
										{/each}
									</select>
								</div>
								<div class={`${e || c ? 'opacity-50' : ''} flex flex-col gap-2`}>
									<h2>Which subject should it be?</h2>
									<select disabled={e || c} name="subject" id="subject">
										{#each $page.data.subjects as subject}
											<option
												value={subject.id}
												selected={$page.data.lesson.subject_id == subject.id}>{subject.name}</option
											>
										{/each}
									</select>
								</div>
								<div class={`${e || c ? 'opacity-50' : ''} flex flex-col gap-2`}>
									<h2>Which room should the lesson be held in?</h2>
									<select disabled={e || c} name="room" id="room">
										{#each $page.data.rooms as room}
											<option value={room.id} selected={$page.data.lesson.room_id == room.id}
												>{room.name}</option
											>
										{/each}
									</select>
								</div>
							{/if}
						{:else if l == 'C2'}
							<label class="mt-4 flex cursor-pointer flex-row items-center gap-2">
								<input bind:checked={e} type="checkbox" name="event" id="event" />
								Event
							</label>
							<label
								class={`${e ? 'opacity-50' : ''} flex cursor-pointer flex-row items-center gap-2`}
							>
								<input
									bind:checked={c}
									disabled={e}
									type="checkbox"
									name="cancelled"
									id="cancelled"
								/>
								Cancelled
							</label>
							<div class={`${e || c ? 'opacity-50' : ''} flex flex-col gap-2`}>
								<h2>Who should be the teacher of the lesson?</h2>
								<select disabled={e || c} name="teacher" id="teacher">
									{#each $page.data.teachers as teacher}
										<option value={teacher.id} selected={$page.data.lesson.teacher_id == teacher.id}
											>{teacher.name}{teacher.id == $page.data.session?.user?.id
												? ' (you)'
												: ''}</option
										>
									{/each}
								</select>
							</div>
							<div class={`${e || c ? 'opacity-50' : ''} flex flex-col gap-2`}>
								<h2>Which subject should it be?</h2>
								<select disabled={e || c} name="subject" id="subject">
									{#each $page.data.subjects as subject}
										<option value={subject.id} selected={$page.data.lesson.subject_id == subject.id}
											>{subject.name}</option
										>
									{/each}
								</select>
							</div>
							<div class={`${e || c ? 'opacity-50' : ''} flex flex-col gap-2`}>
								<h2>Which room should the lesson be held in?</h2>
								<select disabled={e || c} name="room" id="room">
									{#each $page.data.rooms as room}
										<option value={room.id} selected={$page.data.lesson.room_id == room.id}
											>{room.name}</option
										>
									{/each}
								</select>
							</div>
						{/if}
					{:else if l == 'A'}
						<div class="flex flex-col gap-2">
							<h2>Who should be the teacher of the lesson?</h2>
							<select name="teacher" id="teacher">
								<option selected disabled hidden>Select an option</option>
								{#each $page.data.teachers as teacher}
									<option value={teacher.id}
										>{teacher.name}{teacher.id == $page.data.session?.user?.id
											? ' (you)'
											: ''}</option
									>
								{/each}
							</select>
						</div>
						<div class="flex flex-col gap-2">
							<h2>Which subject should it be?</h2>
							<select name="subject" id="subject">
								<option selected disabled hidden>Select an option</option>
								{#each $page.data.subjects as subject}
									<option value={subject.id}>{subject.name}</option>
								{/each}
							</select>
						</div>
						<div class="flex flex-col gap-2">
							<h2>Which room should the lesson be held in?</h2>
							<select name="room" id="room">
								<option selected disabled hidden>Select an option</option>
								{#each $page.data.rooms as room}
									<option value={room.id}>{room.name}</option>
								{/each}
							</select>
						</div>
					{:else if l == 'C3'}
						<div class="flex flex-col gap-2">
							<h2>Who should be the teacher of the lesson?</h2>
							<select required name="teacher" id="teacher">
								<option selected disabled hidden>Select an option</option>
								{#each $page.data.teachers as teacher}
									<option value={teacher.id}
										>{teacher.name}{teacher.id == $page.data.session?.user?.id
											? ' (you)'
											: ''}</option
									>
								{/each}
							</select>
						</div>
						<div class="flex flex-col gap-2">
							<h2>Which subject should it be?</h2>
							<select required name="subject" id="subject">
								<option selected disabled hidden>Select an option</option>
								{#each $page.data.subjects as subject}
									<option value={subject.id}>{subject.name}</option>
								{/each}
							</select>
						</div>
						<div class="flex flex-col gap-2">
							<h2>Which room should the lesson be held in?</h2>
							<select required name="room" id="room">
								<option selected disabled hidden>Select an option</option>
								{#each $page.data.rooms as room}
									<option value={room.id}>{room.name}</option>
								{/each}
							</select>
						</div>
					{/if}
					<button>Submit change</button>
				</div>
			</form>
		{:else if timetable}
			{#if w < 1536}
				<div class="flex flex-col gap-4">
					<h1>Which day and period would you like to select?</h1>
					<select
						required
						bind:value={dp}
						on:change={() => {
							if (pp != 0) goto(`?d=${dp}&p=${pp}`, { invalidateAll: true });
						}}
						name="dp"
						id="dp"
					>
						<option value="0" selected disabled hidden>Select an option</option>
						{#each daysOfWeek as day, index}
							<option value={index + 1}>{day}</option>
						{/each}
					</select>
					<select
						required
						bind:value={pp}
						on:change={() => {
							if (dp != 0) goto(`?d=${dp}&p=${pp}`, { invalidateAll: true });
						}}
						name="pp"
						id="pp"
					>
						<option value="0" selected disabled hidden>Select an option</option>
						{#each Array.from({ length: maxPeriod }, (_, i) => i + 1) as period}
							<option>{period}</option>
						{/each}
					</select>
				</div>
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
									{#if timetable[day] && timetable[day].some((entry) => entry.period === period)}
										{#each timetable[day].filter((entry) => entry.period === period) as entry}
											<td
												class={`${
													day == (!new Date().getDay() ? 7 : new Date().getDay()) &&
													entry.status == null
														? 'bg-neutral-900'
														: ''
												} ${
													entry.status != null
														? entry.status == 'Cancelled'
															? 'bg-red-600 line-through opacity-50 hover:opacity-75'
															: entry.status == 'Event'
																? 'bg-green-600 line-through opacity-50 hover:opacity-75'
																: 'bg-orange-600 hover:bg-orange-500'
														: 'hover:bg-neutral-600'
												} transition-colors`}
											>
												<button
													on:click={() => goto(`?d=${day}&p=${period}`, { invalidateAll: true })}
													class="cursor-pointer"
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
														class={['Reassigned', 'Roomswap'].includes(entry.status)
															? 'font-bold'
															: ''}
													>
														{entry.room}{['Reassigned', 'Roomswap'].includes(entry.status)
															? ' (Room change)'
															: ''}
													</p>
												</button>
											</td>
										{/each}
									{:else}
										<td
											class={day == (!new Date().getDay() ? 7 : new Date().getDay())
												? 'bg-neutral-900'
												: ''}
										>
											<button
												class="cursor-pointer transition-colors hover:bg-neutral-600"
												on:click={() => goto(`?d=${day}&p=${period}`, { invalidateAll: true })}
											>
												<strong>—</strong>
												<span>—</span>
												<span>—</span>
											</button>
										</td>
									{/if}
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		{/if}
	{/key}
</div>

<style>
	h2 {
		@apply text-lg;
	}
</style>
