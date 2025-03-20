<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
</script>

<div class="island-col">
	<table>
		{#if $page.data.grades.length}
			<thead>
				<tr>
					<th>Subject</th>
					<th>Type</th>
					<th>Weight</th>
					<th>Grade</th>
				</tr>
			</thead>
		{/if}
		<tbody>
			{#each $page.data.grades as grade}
				<tr>
					<td>{grade.subjectName}</td>
					<td>{grade.type}</td>
					<td>{grade.weight}%</td>
					<td
						class={`${
							grade.grade == '5'
								? 'bg-green-900'
								: grade.grade == '4'
									? 'bg-green-600'
									: grade.grade == '3'
										? 'bg-yellow-600'
										: grade.grade == '2'
											? 'bg-red-700'
											: grade.grade == '1'
												? 'bg-red-900'
												: ''
						} text-base font-bold`}>{grade.grade}</td
					>
				</tr>
			{/each}
			{#if !$page.data.grades.length}
				<tr>
					<td class="no-grades" colspan="4">You haven't got any grades yet.</td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>

<style>
	tbody tr td {
		@apply w-max max-w-56 overflow-hidden text-ellipsis whitespace-nowrap p-3 duration-150 ease-in-out md:p-8;
	}

	tbody tr td.no-grades {
		@apply w-max max-w-none !important;
	}

	tbody tr:hover td:not(.no-grades) {
		@apply cursor-pointer duration-150 ease-in-out;
	}

	tbody tr:hover td:not(.no-grades, :last-child) {
		@apply bg-neutral-700;
	}
</style>
