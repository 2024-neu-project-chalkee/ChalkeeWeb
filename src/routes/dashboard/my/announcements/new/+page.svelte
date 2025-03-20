<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let corg = !$page.data.groups.length ? (!$page.data.classes.length ? '' : 'c') : 'g';

	let selectedClass: string;
	let selectedGroup: string;
</script>

<div class="island-col">
	<h1>Create a new announcement</h1>
	<form class="mt-4 flex flex-col gap-8">
		<div class="flex flex-col gap-2">
			<h2>Which class or a group would you like to create it for?</h2>
			<label class="flex cursor-pointer flex-row items-center gap-2">
				<input
					type="radio"
					name="corg"
					checked={corg == 'c'}
					disabled={!$page.data.classes.length}
					on:change={(e) => (corg = (e.target as HTMLInputElement).value)}
					value="c"
				/>
				Class
			</label>
			<label class="flex cursor-pointer flex-row items-center gap-2">
				<input
					type="radio"
					name="corg"
					checked={corg == 'g'}
					disabled={!$page.data.groups.length}
					on:change={(e) => (corg = (e.target as HTMLInputElement).value)}
					value="g"
				/>
				Group
			</label>
		</div>
		<div class="flex flex-col gap-2">
			{#if corg == 'c'}
				<h2>Which class is it?</h2>
				<select
					bind:value={selectedClass}
					on:change={() => goto(`/dashboard/my/announcements/new/for/class/${selectedClass}`)}
					name="classes"
					id="classes"
				>
					<option selected disabled hidden>Select a class</option>
					{#each $page.data.classes as opt}
						<option value={opt.id}>{`${opt.number}.${opt.letter}`}</option>
					{/each}
				</select>
			{:else}
				<h2>Which group is it?</h2>
				<select
					bind:value={selectedGroup}
					on:change={() => goto(`/dashboard/my/announcements/new/for/group/${selectedGroup}`)}
					name="groups"
					id="groups"
				>
					<option selected disabled hidden>Select a group</option>
					{#each $page.data.groups as opt}
						<option value={opt.id}>{opt.name}</option>
					{/each}
				</select>
			{/if}
		</div>
	</form>
</div>

<style>
	h2 {
		@apply text-xl;
	}
</style>
