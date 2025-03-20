<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let deleteRequested: boolean = false;
	let success: null | boolean = null;

	let announcementTypes =
		$page.data.session?.user?.role == 'Principal'
			? ['General', 'Homework', 'Test', 'Exam', 'Matura Exam']
			: ['General', 'Homework', 'Test', 'Exam'];
	let announcementTypeDescriptions =
		$page.data.session?.user?.role == 'Principal'
			? ['in general', 'about homework', 'about a test', 'about an exam', 'about a matura exam']
			: ['in general', 'about homework', 'about a test', 'about an exam'];
</script>

<div class="island-col">
	{#if !$page.data.announcement.graded}
		{#if success == null}
			{#if !deleteRequested}
				<h1>
					{$page.data.announcement.type == 'General'
						? `A general announcement from subject ${$page.data.announcement.subjectName}`
						: `${$page.data.announcement.type} from subject ${$page.data.announcement.subjectName}`}
				</h1>
				{#if $page.data.session?.user?.role && ['Teacher', 'Principal'].includes($page.data.session?.user?.role) && $page.data.announcement.announcedBy == $page.data.session?.user?.id}
					<form
						method="POST"
						enctype="multipart/form-data"
						action="?/modify"
						use:enhance={async ({ formData, cancel }) => {
							if (
								!formData.get('type') ||
								!formData.get('date') ||
								!formData.get('content') ||
								($page.data.session?.user?.role != 'Principal' &&
									formData.get('type') == 'Matura Exam')
							)
								cancel();

							return async ({ result }) => {
								success = result.status == 200;
							};
						}}
						class="flex flex-col gap-4"
					>
						<div class="mt-4 flex flex-col gap-2">
							<h2>This announcement contains information...</h2>
							<select name="type" id="type" required>
								{#each announcementTypeDescriptions as type, i}
									<option
										value={announcementTypes[i]}
										selected={$page.data.announcement.type == announcementTypes[i]}>{type}</option
									>
								{/each}
							</select>
						</div>
						<div class="mt-4 flex flex-col gap-2">
							<h2>Due by:</h2>
							<input
								class="w-full md:w-3/5"
								type="date"
								name="date"
								id="date"
								value={new Date($page.data.announcement.date)
									.toLocaleDateString('en-CA', { timeZone: 'Europe/Budapest' })
									.split('/')
									.reverse()
									.join('-')}
							/>
						</div>
						<div class="mt-4 flex flex-col gap-2">
							<h2>Content:</h2>
							<textarea class="w-full md:w-3/5" name="content" id="content" required
								>{$page.data.announcement.content}</textarea
							>
						</div>
						<button class="mt-4" type="submit">Make changes to this announcement</button>
						<button
							on:click|preventDefault={() => {
								if (new Date($page.data.announcement.date) < new Date())
									goto(`/dashboard/my/announcements/${$page.data.announcement.id}/grade`);
							}}
							disabled={new Date($page.data.announcement.date) > new Date() ||
								$page.data.announcement.type == 'General'}>Grade students</button
						>
						<button on:click|preventDefault={() => (deleteRequested = true)}
							>Delete this assignment</button
						>
					</form>
				{:else}
					<div class="mt-2 flex flex-col gap-4">
						<p>
							Due by: {new Date($page.data.announcement.date).toLocaleDateString()}
							{new Date($page.data.announcement.date).toLocaleDateString() ==
							new Date(Date()).toLocaleDateString()
								? ' (today)'
								: new Date($page.data.announcement.date).toLocaleDateString() ==
									  new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString()
									? ' (yesterday)'
									: new Date($page.data.announcement.date).toLocaleDateString() ==
										  new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString()
										? ' (tomorrow)'
										: ''}
						</p>
						<p>Content: <br />{$page.data.announcement.content}</p>
					</div>
				{/if}
			{:else}
				<h1>Are you sure about deleting this announcement?</h1>
				<form
					class="flex flex-col"
					method="POST"
					action="?/delete"
					use:enhance={async () => {
						return async ({ result }) => {
							console.log(result);
							success = result.status == 200;
						};
					}}
				>
					<div class="mt-4 flex flex-col gap-2 md:flex-row">
						<button on:click|preventDefault={() => (deleteRequested = false)}>Cancel</button>
						<button>Delete</button>
					</div>
				</form>
			{/if}
		{:else if success}
			<h1>Successful operation!</h1>
			<button on:click={() => goto('/dashboard/my/announcements')}
				>Go back to my announcements</button
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
						deleteRequested = false;
					}}>Go back and retry</button
				>
				<button on:click={() => goto('/dashboard/my/announcements')}
					>Go back to my announcements</button
				>
			</div>
		{/if}
	{:else}
		<h1>You have already graded students for this announced item</h1>
		<button on:click={() => goto('/dashboard/my/announcements')}>Go back to my announcements</button
		>
	{/if}
</div>
