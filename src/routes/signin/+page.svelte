<script>
	import { page } from '$app/stores';
	import { signIn } from '@auth/sveltekit/client';

	let email = '';
	let password = '';
</script>

<div class="forms">
	<form
		on:submit|preventDefault={() => {
			signIn('credentials', { email, password });
		}}
	>
		<h1><span>Chalkee</span> login</h1>
		<label for="email">
			Email or Student ID
			<input name="email" bind:value={email} />
		</label>
		<label for="password">
			Password
			<input name="password" type="password" bind:value={password} />
		</label>

		<button>Sign in</button>
		{#if $page.data.error}
			{#if $page.data.error == 'CredentialsSignin' && $page.data.code == 'credentials'}
				<h2 class="error">Invalid username or password</h2>
			{:else}
				<h2 class="error">An unexpected error occured</h2>
			{/if}
		{/if}
	</form>
</div>
