<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { writable } from 'svelte/store';

	let studentGrades = writable<{ [key: string]: string | null }>({});

	type Student = {
		id: string;
		name: string;
	};

	let students = $page.data.students as Student[];

	studentGrades.update((grades) => {
		students.forEach((student) => {
			grades[student.id as string] = '0';
		});
		return grades;
	});

	function updateScore(student: Student, value: string) {
		studentGrades.update((grades) => {
			grades[student.id] = value;
			return grades;
		});
	}

	let success: boolean | null = null;
</script>

<div class="island-col">
	{#if $page.data.announcement.type == 'General'}
		<h1>General announcements cannot be graded</h1>
		<button on:click={() => goto('/dashboard/my/announcements')}>Go back to my announcements</button
		>
	{:else if $page.data.announcement.graded}
		<h1>You have already graded students for this announced item</h1>
		<button on:click={() => goto('/dashboard/my/announcements')}>Go back to my announcements</button
		>
	{:else if success == null}
		<h1>Grade students</h1>
		<div class="mt-4 flex w-full flex-col">
			{#each $page.data.students as student}
				<div class="flex w-full flex-row items-center justify-between border-neutral-700 py-2">
					<p>{student.name}</p>
					<div class="flex flex-row gap-2">
						{#each ['⌀', '1', '2', '3', '4', '5'] as grade, i}
							<button
								class={$studentGrades[student.id] == i.toString() ? 'selectd-grade' : ''}
								on:click={() => updateScore(student, i.toString())}>{grade}</button
							>
						{/each}
					</div>
				</div>
			{/each}
		</div>
		<form
			use:enhance={async ({ formData, cancel }) => {
				if ($page.data.announcement.type == 'General') cancel();

				formData.set('grades', JSON.stringify($studentGrades));
				formData.set('subjectId', $page.data.announcement.subjectId);
				formData.set('type', $page.data.announcement.type);

				return async ({ result }) => {
					success = result.status == 200;
				};
			}}
			method="POST"
			enctype="multipart/form-data"
		>
			<button class="w-full">Finalize grades</button>
		</form>
	{:else if success}
		<h1>Successful operation!</h1>
		<button on:click={() => goto('/dashboard/my/announcements')}>Go back to my announcements</button
		>
	{:else}
		<h1>Unsuccessful operation!</h1>
		<h2>
			Oops, it seems like an unexpected error has happened while trying to peform this action!
		</h2>
		<div>
			<button
				on:click={() => {
					success = null;
				}}>Go back and retry</button
			>
			<button on:click={() => goto('/dashboard/my/announcements')}
				>Go back to my announcements</button
			>
		</div>
	{/if}
</div>

<style>
	.island-col > div {
		@apply gap-0;
	}

	.island-col > div > div:first-child {
		@apply border-y-2;
	}

	.island-col > div > div:not(:first-child) {
		@apply border-b-2;
	}

	.selectd-grade {
		@apply bg-neutral-900 !important;
	}
</style>
