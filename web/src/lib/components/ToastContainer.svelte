<script lang="ts">
	import { fade } from 'svelte/transition';
	import { toasts, dismissToast } from '$lib/stores/toast.svelte';
</script>

<!-- Top-right stack (reference toastr "toast-top-right"). Click a toast to dismiss
     it early; each also auto-dismisses on its timer. role=status + aria-live so a
     new alert is announced without stealing focus. The reference fires every alert
     via toastr.warning(...), so each toast renders as .ngx-toastr.toast-warning. -->
<div class="toast-container toast-top-right" role="status" aria-live="polite">
	{#each toasts as t (t.id)}
		<button
			class="ngx-toastr toast-warning"
			type="button"
			onclick={() => dismissToast(t.id)}
			in:fade={{ duration: 140 }}
			out:fade={{ duration: 200 }}
		>
			<div class="toast-title">{t.title}</div>
			<!-- Plain text, NOT {@html}: our alert body is user-entered, so no enableHtml. -->
			<div class="toast-message">{t.body}</div>
		</button>
	{/each}
</div>

<style>
	/* HARD EVIDENCE (toastr css: .toast-container { pointer-events: none; position:
	   fixed; z-index: 999999; }) plus the final overriding rule
	   (toastr css: .toast-container { top: 70px !important; }). We inline that final
	   top (no !important needed here — no competing rule) and keep right from
	   (toastr css: .toast-top-right { top: 12px; right: 12px; }) where right: 12px
	   survives the top override. */
	.toast-container {
		pointer-events: none;
		position: fixed;
		z-index: 999999;
	}
	/* HARD EVIDENCE (toastr css: .toast-top-right { top: 12px; right: 12px; }); the
	   later cascade rule (toastr css: .toast-container { top: 70px !important; })
	   replaces the 12px top, so we resolve it to 70px here. */
	.toast-top-right {
		top: 70px;
		right: 12px;
	}
	/* HARD EVIDENCE (toastr css: .toast-container * { box-sizing: border-box; }) */
	.toast-container :global(*) {
		box-sizing: border-box;
	}

	/* HARD EVIDENCE (toastr css: .toast-container .ngx-toastr { position: relative;
	   overflow: hidden; margin: 0px 0px 6px; padding: 15px 15px 15px 50px; width:
	   300px; border-radius: 3px; background-position: 15px center; background-repeat:
	   no-repeat; background-size: 24px; box-shadow: rgb(153,153,153) 0px 0px 12px;
	   color: rgb(255,255,255); }) and base (toastr css: .ngx-toastr {
	   background-color: rgb(3,3,3); pointer-events: auto; }). We add text-align:left
	   and font:inherit because our node is a <button>, whose UA styles would
	   otherwise center text and shrink the font — not part of the reference <div>. */
	.ngx-toastr {
		position: relative;
		overflow: hidden;
		margin: 0 0 6px;
		padding: 15px 15px 15px 50px;
		width: 300px;
		max-width: 100%;
		border-radius: 3px;
		background-position: 15px center;
		background-repeat: no-repeat;
		background-size: 24px;
		box-shadow: rgb(153, 153, 153) 0 0 12px;
		background-color: rgb(3, 3, 3);
		color: rgb(255, 255, 255);
		pointer-events: auto;
		text-align: left;
		font: inherit;
		border: 0;
		cursor: pointer;
	}
	/* HARD EVIDENCE (toastr css: .toast-container .ngx-toastr:hover { box-shadow:
	   rgb(0,0,0) 0px 0px 12px; opacity: 1; cursor: pointer; }) */
	.ngx-toastr:hover {
		box-shadow: rgb(0, 0, 0) 0 0 12px;
		opacity: 1;
		cursor: pointer;
	}

	/* HARD EVIDENCE (toastr css: .toast-warning { background-color: rgb(248,148,6); }
	   and .toast-warning { background-image: url(data:image/svg+xml;base64,...) } — the
	   amber warning icon at background-position 15px center, 24px). The base64 SVG is
	   copied verbatim from the extracted .toast-warning rule. */
	.toast-warning {
		background-color: rgb(248, 148, 6);
		background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCA1NzYgNTEyJyB3aWR0aD0nNTc2JyBoZWlnaHQ9JzUxMic+PHBhdGggZmlsbD0ncmdiKDI1NSwyNTUsMjU1KScgZD0nTTU2OS41MTcgNDQwLjAxM0M1ODcuOTc1IDQ3Mi4wMDcgNTY0LjgwNiA1MTIgNTI3Ljk0IDUxMkg0OC4wNTRjLTM2LjkzNyAwLTU5Ljk5OS00MC4wNTUtNDEuNTc3LTcxLjk4N0wyNDYuNDIzIDIzLjk4NWMxOC40NjctMzIuMDA5IDY0LjcyLTMxLjk1MSA4My4xNTQgMGwyMzkuOTQgNDE2LjAyOHpNMjg4IDM1NGMtMjUuNDA1IDAtNDYgMjAuNTk1LTQ2IDQ2czIwLjU5NSA0NiA0NiA0NiA0Ni0yMC41OTUgNDYtNDYtMjAuNTk1LTQ2LTQ2LTQ2em0tNDMuNjczLTE2NS4zNDZsNy40MTggMTM2Yy4zNDcgNi4zNjQgNS42MDkgMTEuMzQ2IDExLjk4MiAxMS4zNDZoNDguNTQ2YzYuMzczIDAgMTEuNjM1LTQuOTgyIDExLjk4Mi0xMS4zNDZsNy40MTgtMTM2Yy4zNzUtNi44NzQtNS4wOTgtMTIuNjU0LTExLjk4Mi0xMi42NTRoLTYzLjM4M2MtNi44ODQgMC0xMi4zNTYgNS43OC0xMS45ODEgMTIuNjU0eicvPjwvc3ZnPg==');
	}

	/* HARD EVIDENCE (toastr css: .toast-title { font-weight: 700; }) */
	.toast-title {
		font-weight: 700;
	}
	/* HARD EVIDENCE (toastr css: .toast-message { overflow-wrap: break-word; }) */
	.toast-message {
		overflow-wrap: break-word;
	}
</style>
