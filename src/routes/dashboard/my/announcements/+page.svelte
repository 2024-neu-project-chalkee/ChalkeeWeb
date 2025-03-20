<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	let w = 1537;
</script>

<svelte:window bind:innerWidth={w} />

<div class="island-col">
	<table>
		{#if $page.data.announcements.length}
			<thead>
				<tr>
					<th>Class/Group</th>
					{#if w > 1536}
						<th>Type</th>
					{/if}
					<th>Subject</th>
					{#if w > 1536}
						<th>Announced by</th>
						<th>Content</th>
					{/if}
					<th>Due by</th>
				</tr>
			</thead>
		{/if}
		<tbody>
			{#each $page.data.announcements as announcement}
				<tr
					class={new Date(announcement.date) <
					new Date(
						new Date().getFullYear() +
							'-' +
							(new Date().getMonth() + 1) +
							'-' +
							new Date().getDate()
					)
						? 'opacity-50'
						: ''}
					on:click={() => goto(`/dashboard/my/announcements/${announcement.id}`)}
				>
					<td
						>{announcement.groupName ??
							`${announcement.classNumber}.${announcement.classLetter}`}</td
					>
					{#if w > 1536}
						<td>{announcement.type}</td>
					{/if}
					<td>{announcement.subjectName}</td>
					{#if w > 1536}
						<td>{announcement.announcerName}{announcement.userIsAnnouncer ? ' (you)' : ''}</td>
						<td title={announcement.content}>{announcement.content}</td>
					{/if}
					<td
						>{new Date(announcement.date).toLocaleDateString()}
						{new Date(announcement.date).toLocaleDateString() ==
						new Date(Date()).toLocaleDateString()
							? ' (today)'
							: new Date(announcement.date).toLocaleDateString() ==
								  new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString()
								? ' (yesterday)'
								: new Date(announcement.date).toLocaleDateString() ==
									  new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString()
									? ' (tomorrow)'
									: ''}</td
					>
				</tr>
			{/each}
			{#if $page.data.session?.user?.role && ['Teacher', 'Principal'].includes($page.data.session?.user?.role)}
				{#if !$page.data.announcements.length}
					<tr>
						<td class="no-announcements" colspan={w > 1536 ? 6 : 3}
							>There aren't any announcements yet.</td
						>
					</tr>
				{/if}
				<tr>
					<td class="add text-xl duration-150 ease-in-out" colspan={w > 1536 ? 6 : 3}>
						<button on:click={() => goto('/dashboard/my/announcements/new')}>+</button></td
					>
				</tr>
			{/if}
		</tbody>
	</table>
</div>

<style>
	tbody tr td:not(.add) {
		@apply w-max max-w-56 overflow-hidden text-ellipsis whitespace-nowrap p-3 duration-150 ease-in-out md:p-8;
	}

	tbody tr td.no-announcements {
		@apply w-max max-w-none !important;
	}

	tbody tr:hover td:not(.no-announcements) {
		@apply cursor-pointer bg-neutral-700 duration-150 ease-in-out;
	}
</style>
