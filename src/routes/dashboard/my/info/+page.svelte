<script>
	import { page } from '$app/stores';
	import { signOut } from '@auth/sveltekit/client';
	let user = $page.data.session?.user;
</script>

<div class="island-col">
	<h1>Information about you</h1>
	<p>Name: {user?.firstName} {user?.lastName}</p>
	<p>Email address: {user?.email}</p>
	{#if user?.role == 'Student'}
		<p>Your student ID: {user?.studentId}</p>
	{/if}
	{#if $page.data.class}
		{#if $page.data.session?.user?.role == 'Student'}
			<p>Class: {$page.data.class.number}.{$page.data.class.letter}</p>
		{:else}
			<p>
				Head teacher of class: {$page.data.class.number}.{$page.data.class.letter}
			</p>
		{/if}
	{/if}
	{#if $page.data.groups && $page.data.groups.length > 0}
		<p>
			Groups you're in: {$page.data.groups
				.map((/** @type {{ name: any; }} */ x) => x.name)
				.join(', ')}
		</p>
	{/if}
	<p>You are a {user?.role}.</p>
	<button on:click={() => signOut({ callbackUrl: '/' })}>Sign out</button>
</div>
<div class="island-col">
	<h1>Information about your institution</h1>
	<iframe
		style="filter: grayscale(100%) invert(92%) contrast(83%);"
		src="https://www.google.com/maps?q={$page.data.institution.name};{$page.data.institution
			.location}&output=embed"
		title="Maps"
	></iframe>
	<p>Name: {$page.data.institution.name}</p>
	<p>Location: {$page.data.institution.location}</p>
	<p>
		Phone number: <a href="tel:{$page.data.institution.phoneNumber}"
			>{$page.data.institution.phoneNumber.replace(
				/(\()?(\+36|0036|06)?(\))?(-| )?(1|20|2[2-9]|3[0-7]|40|42|4[4-9]|5[2-7]|59|60|62|63|66|68|69|70|7[2-9]|80|8[2-5]|8[7-9]]|90|9[2-9])([\\\/ ])?(\d{6,7}|\d{3}(-| )\d{3,4}|\d{3,4}(-| )\d{3})/g,
				'$2 $5 $6$7'
			)}
		</a>
	</p>
	<p>
		Website: <a target="_blank" href="https://{$page.data.institution.website}/"
			>{$page.data.institution.website}</a
		>
	</p>
</div>
