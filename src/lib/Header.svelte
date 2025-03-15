<script>
	import { goto } from '$app/navigation';
	import Sidebar from './Sidebar.svelte';
	import { sidebarOpen } from './sidebar';
</script>

<header>
	<button on:click={() => goto('/dashboard/')}><img id="logo" src="/logo.svg" alt="logo" /></button>
	<nav class={$sidebarOpen ? 'transition-all md:pr-80' : 'transition-all'}>
		<button on:click={() => sidebarOpen.set(!$sidebarOpen)}
			><img
				src={$sidebarOpen ? '/close.svg' : '/menu.svg'}
				alt={$sidebarOpen ? 'close' : 'open'}
			/></button
		>
	</nav>
	<Sidebar />
</header>

<style>
	header {
		@apply fixed z-50 flex h-16 w-screen flex-row items-center justify-between gap-2 bg-neutral-800 px-16 drop-shadow-lg;
	}

	#logo {
		@apply h-full cursor-pointer text-2xl;
	}

	button {
		@apply z-50 h-1/3 border-0 hover:bg-transparent !important;
	}

	nav {
		@apply z-50;
	}

	nav button img {
		@apply h-10;
	}
</style>
