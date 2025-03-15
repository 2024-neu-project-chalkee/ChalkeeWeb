<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let firstName: string = '';
	let lastName: string = '';
	let role: string = '';
	let studentId: string = '';

	let success: boolean | null = null;
</script>

<div class="island-col">
	{#if success == null}
		<h1>Add a user to the users of the institution</h1>
		<form
			method="POST"
			enctype="multipart/form-data"
			use:enhance={async ({ formData, cancel }) => {
				if (
					!formData.get('role') ||
					(formData.get('role') == 'Student' && !formData.get('studentId'))
				)
					cancel();

				if (formData.get('studentClass'))
					formData.set('classId', formData.get('studentClass') as string);
				else if (formData.get('teacherClass'))
					formData.set('classId', formData.get('teacherClass') as string);

				formData.set('institutionId', $page.data.session?.user?.institutionId as string);

				return async ({ result }) => {
					success = result.status == 200;
				};
			}}
			class="flex flex-col gap-4"
		>
			<div class="mt-4 flex flex-col gap-2">
				<h2>First name</h2>
				<input
					bind:value={firstName}
					class="w-full md:w-3/5"
					type="text"
					name="firstName"
					id="firstName"
					required
				/>
			</div>
			<div class="flex flex-col gap-2">
				<h2>Last name</h2>
				<input
					bind:value={lastName}
					class="w-full md:w-3/5"
					type="text"
					name="lastName"
					id="lastName"
					required
				/>
			</div>
			<div class="flex flex-col gap-2">
				<h2>Email address</h2>
				<input class="w-full md:w-3/5" type="email" name="email" id="email" required />
			</div>
			<div class="flex flex-col gap-2">
				<h2>Role</h2>
				<select
					bind:value={role}
					on:change={() => {
						if (role != 'Student') studentId = '';
					}}
					class="w-full md:w-3/5"
					name="role"
					id="role"
					required
				>
					<option selected hidden disabled>Select an option</option>
					<option value="Student">Student</option>
					<option value="Teacher">Teacher</option>
					<option value="Principal">Principal</option>
					<option value="Admin">Admin</option>
				</select>
			</div>
			{#if role == 'Student'}
				<div class="flex flex-col gap-2">
					<h2>Student ID</h2>
					<input
						bind:value={studentId}
						class="w-full md:w-3/5"
						type="text"
						name="studentId"
						id="studentId"
						required
					/>
				</div>
				<div class="flex flex-col gap-2">
					<h2>Class</h2>
					<select class="w-full md:w-3/5" name="studentClass" id="studentClass" required>
						<option selected hidden disabled>Select an option</option>
						{#each $page.data.classes as c}
							<option value={c.id}>{c.number}.{c.letter}</option>
						{/each}
					</select>
				</div>
			{:else if ['Teacher', 'Principal'].includes(role)}
				<div class="flex flex-col gap-2">
					<h2>Head teacher of class (optional)</h2>
					<select class="w-full md:w-3/5" name="teacherClass" id="teacherClass">
						<option selected hidden disabled>Select an option</option>
						{#each $page.data.classes as c}
							<option value={c.id}>{c.number}.{c.letter}</option>
						{/each}
					</select>
				</div>
			{/if}
			{#if firstName.length != 0 && lastName.length != 0}
				<p class="mt-4 text-xs text-red-900 md:text-sm">
					*The default password of the user will be "<span
						class="text-xs text-neutral-200 md:text-sm"
						>{firstName.charAt(0).toUpperCase() +
							firstName.slice(1, 3) +
							lastName.charAt(0).toUpperCase() +
							lastName.slice(1, 3) +
							`${
								studentId.length == 11 && !Number.isNaN(parseInt(studentId))
									? studentId.slice(-4)
									: (new Date().getMonth() + 1 < 10
											? `0${new Date().getMonth() + 1}`
											: new Date().getMonth() + 1) +
										(new Date().getDate() < 10
											? `0${new Date().getDate()}`
											: new Date().getDate().toString())
							}`}</span
					>", this should be changed upon the first sign in.
				</p>
			{/if}
			<button>Add user to the users of the institution</button>
		</form>
	{:else if success}
		<h1>Successful operation!</h1>
		<div>
			<button
				on:click={() => {
					success = null;
					firstName = '';
					lastName = '';
					role = '';
					studentId = '';
				}}>Add another user to the users of the institution</button
			>
			<button on:click={() => goto('/dashboard')}>Go to the dashboard</button>
		</div>
	{:else}
		<h1>Unsuccessful operation!</h1>
		<h2>
			Oops, it seems like an unexpected error has happened while trying to add a user to the users
			of the institution!
		</h2>
		<div>
			<button
				on:click={() => {
					success = null;
					firstName = '';
					lastName = '';
					role = '';
					studentId = '';
				}}>Go back and retry</button
			>
			<button on:click={() => goto('/dashboard')}>Go to the dashboard</button>
		</div>
	{/if}
</div>
