<script lang="ts">
	import { fade } from 'svelte/transition';
	import { toasts, dismissToast } from '$lib/stores/toast.svelte';
</script>

<!-- Top-right stack (reference toastr "toast-top-right"). Click the × to dismiss a
     toast early; each also auto-dismisses on its timer. aria-live on the outer
     wrapper so a new toast is announced without stealing focus.

     HARD EVIDENCE (overlays-toasts.md §Behavior): the app's AlertService wrapper
     routes success(e)/info(e)/error(e) ALL through
     `alertService.info(e,"",{closeButton:true,tapToDismiss:true})` — so app toasts
     are the INFO variant (#2f96b4) with an explicit × close button and a blank
     title. Only the underlying alert-popup uses `toastr.warning`. Every current
     `showToast(...)` call site in this repo is an app notification (upload failed,
     profile updated, …), so they render as INFO per the evidence. The Toast store
     has NO `type` field (I may not edit the store), so the default rendered variant
     is `toast-info`; all four type backgrounds are defined below so a future typed
     toast (warning alert popups, error, success) styles correctly the moment a
     `type` field is threaded through the store. -->
<!-- HARD EVIDENCE (overlays-toasts.md §DOM 1): <div class="overlay-container"
     aria-live="polite"><div id="toast-container" class="toast-top-right
     toast-container"> — the aria-live sits on the OUTER overlay-container. -->
<div class="overlay-container" aria-live="polite">
	<div id="toast-container" class="toast-top-right toast-container">
		{#each toasts as t (t.id)}
			<!-- HARD EVIDENCE (overlays-toasts.md §DOM 1c literal rendered toast):
			     <toast-component class="ngx-toastr toast-info"> with a
			     <button class="toast-close-button" aria-label="Close">
			       <span aria-hidden="true">&times;</span></button>
			     ahead of the <div role="alert" class="toast-message">. The whole
			     toast body is tap-to-dismiss (tapToDismiss:true). The host is a
			     <div role="alert"> (announces the toast) so the inner close <button>
			     nests validly. Dismissal is the accessible × button below — the
			     reference whole-body tapToDismiss is a redundant convenience, so we do
			     NOT put click/keyboard handlers on the non-interactive alert host
			     (an a11y anti-pattern); the × button is the dismiss control. -->
			<div
				class="ngx-toastr toast-{t.type}"
				role="alert"
				in:fade={{ duration: 140 }}
				out:fade={{ duration: 200 }}
			>
				<!-- HARD EVIDENCE (overlays-toasts.md §DOM 1c + §Behavior closeButton:true):
				     explicit × close button when the call passes closeButton (the presenter
				     reconnect toast passes closeButton:false — bundle offset 1075251). -->
				{#if t.closeButton}
					<button
						type="button"
						class="toast-close-button"
						aria-label="Close"
						onclick={() => dismissToast(t.id)}
					>
						<span aria-hidden="true">&times;</span>
					</button>
				{/if}
				{#if t.title}
					<div class="toast-title">{t.title}</div>
				{/if}
				<!-- Plain text, NOT {@html}: our toast body is app/user-entered, so no
				     enableHtml. The ONE piece of HTML the reference ever injects is the
				     media-reconnect spinner (bundle offset 1074987: body ends with
				     `<i class="fas fa-cog fa-spin ms-2"></i>`) — reproduced via the typed
				     `spinner` flag below, exact classes, no HTML injection. -->
				<div class="toast-message">
					{t.body}{#if t.spinner}<i class="fas fa-cog fa-spin toast-cog" aria-hidden="true"></i>{/if}
				</div>
			</div>
		{/each}
	</div>
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
	   background-color: rgb(3,3,3); pointer-events: auto; }). text-align:left and
	   font:inherit are kept as defensive resets so the toast body renders
	   left-aligned at the app font regardless of the host element. */
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

	/* HARD EVIDENCE (overlays-toasts.md §Global CSS + §Resolved) — the four toastr
	   type backgrounds and their 24px left SVG icons, verbatim from
	   styles.d622cb9ed2bbc221.css:
	     .toast-info    { background-color:#2f96b4 }  circled-"i" icon
	     .toast-error   { background-color:#bd362f }  circled-"×" icon
	     .toast-success { background-color:#51a351 }  checkmark icon
	     .toast-warning { background-color:#f89406 }  triangle-"!" icon
	   Each base64 SVG is a white-fill icon rendered at background-size:24px,
	   background-position:15px center (from .ngx-toastr above). App toasts default to
	   .toast-info per §Behavior (alertService.info,{closeButton:true}); .toast-warning
	   is the alert-popup variant (toastr.warning); error/success are the other
	   toastr primitives, styled here so a future typed toast renders correctly. */
	.toast-info {
		background-color: rgb(47, 150, 180);
		background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCA1MTIgNTEyJyB3aWR0aD0nNTEyJyBoZWlnaHQ9JzUxMic+PHBhdGggZmlsbD0ncmdiKDI1NSwyNTUsMjU1KScgZD0nTTI1NiA4QzExOS4wNDMgOCA4IDExOS4wODMgOCAyNTZjMCAxMzYuOTk3IDExMS4wNDMgMjQ4IDI0OCAyNDhzMjQ4LTExMS4wMDMgMjQ4LTI0OEM1MDQgMTE5LjA4MyAzOTIuOTU3IDggMjU2IDh6bTAgMTEwYzIzLjE5NiAwIDQyIDE4LjgwNCA0MiA0MnMtMTguODA0IDQyLTQyIDQyLTQyLTE4LjgwNC00Mi00MiAxOC44MDQtNDIgNDItNDJ6bTU2IDI1NGMwIDYuNjI3LTUuMzczIDEyLTEyIDEyaC04OGMtNi42MjcgMC0xMi01LjM3My0xMi0xMnYtMjRjMC02LjYyNyA1LjM3My0xMiAxMi0xMmgxMnYtNjRoLTEyYy02LjYyNyAwLTEyLTUuMzczLTEyLTEydi0yNGMwLTYuNjI3IDUuMzczLTEyIDEyLTEyaDY0YzYuNjI3IDAgMTIgNS4zNzMgMTIgMTJ2MTAwaDEyYzYuNjI3IDAgMTIgNS4zNzMgMTIgMTJ2MjR6Jy8+PC9zdmc+');
	}
	.toast-error {
		background-color: rgb(189, 54, 47);
		background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCA1MTIgNTEyJyB3aWR0aD0nNTEyJyBoZWlnaHQ9JzUxMic+PHBhdGggZmlsbD0ncmdiKDI1NSwyNTUsMjU1KScgZD0nTTI1NiA4QzExOSA4IDggMTE5IDggMjU2czExMSAyNDggMjQ4IDI0OCAyNDgtMTExIDI0OC0yNDhTMzkzIDggMjU2IDh6bTEyMS42IDMxMy4xYzQuNyA0LjcgNC43IDEyLjMgMCAxN0wzMzggMzc3LjZjLTQuNyA0LjctMTIuMyA0LjctMTcgMEwyNTYgMzEybC02NS4xIDY1LjZjLTQuNyA0LjctMTIuMyA0LjctMTcgMEwxMzQuNCAzMzhjLTQuNy00LjctNC43LTEyLjMgMC0xN2w2NS42LTY1LTY1LjYtNjUuMWMtNC43LTQuNy00LjctMTIuMyAwLTE3bDM5LjYtMzkuNmM0LjctNC43IDEyLjMtNC43IDE3IDBsNjUgNjUuNyA2NS4xLTY1LjZjNC43LTQuNyAxMi4zLTQuNyAxNyAwbDM5LjYgMzkuNmM0LjcgNC43IDQuNyAxMi4zIDAgMTdMMzEyIDI1Nmw2NS42IDY1LjF6Jy8+PC9zdmc+');
	}
	.toast-success {
		background-color: rgb(81, 163, 81);
		background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCA1MTIgNTEyJyB3aWR0aD0nNTEyJyBoZWlnaHQ9JzUxMic+PHBhdGggZmlsbD0ncmdiKDI1NSwyNTUsMjU1KScgZD0nTTE3My44OTggNDM5LjQwNGwtMTY2LjQtMTY2LjRjLTkuOTk3LTkuOTk3LTkuOTk3LTI2LjIwNiAwLTM2LjIwNGwzNi4yMDMtMzYuMjA0YzkuOTk3LTkuOTk4IDI2LjIwNy05Ljk5OCAzNi4yMDQgMEwxOTIgMzEyLjY5IDQzMi4wOTUgNzIuNTk2YzkuOTk3LTkuOTk3IDI2LjIwNy05Ljk5NyAzNi4yMDQgMGwzNi4yMDMgMzYuMjA0YzkuOTk3IDkuOTk3IDkuOTk3IDI2LjIwNiAwIDM2LjIwNGwtMjk0LjQgMjk0LjQwMWMtOS45OTggOS45OTctMjYuMjA3IDkuOTk3LTM2LjIwNC0uMDAxeicvPjwvc3ZnPg==');
	}
	/* HARD EVIDENCE (toastr css: .toast-warning { background-color: rgb(248,148,6); }
	   and .toast-warning { background-image: url(data:image/svg+xml;base64,...) } — the
	   amber warning icon at background-position 15px center, 24px). The base64 SVG is
	   copied verbatim from the extracted .toast-warning rule (the alert-popup variant,
	   toastr.warning per §Behavior). */
	.toast-warning {
		background-color: rgb(248, 148, 6);
		background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCA1NzYgNTEyJyB3aWR0aD0nNTc2JyBoZWlnaHQ9JzUxMic+PHBhdGggZmlsbD0ncmdiKDI1NSwyNTUsMjU1KScgZD0nTTU2OS41MTcgNDQwLjAxM0M1ODcuOTc1IDQ3Mi4wMDcgNTY0LjgwNiA1MTIgNTI3Ljk0IDUxMkg0OC4wNTRjLTM2LjkzNyAwLTU5Ljk5OS00MC4wNTUtNDEuNTc3LTcxLjk4N0wyNDYuNDIzIDIzLjk4NWMxOC40NjctMzIuMDA5IDY0LjcyLTMxLjk1MSA4My4xNTQgMGwyMzkuOTQgNDE2LjAyOHpNMjg4IDM1NGMtMjUuNDA1IDAtNDYgMjAuNTk1LTQ2IDQ2czIwLjU5NSA0NiA0NiA0NiA0Ni0yMC41OTUgNDYtNDYtMjAuNTk1LTQ2LTQ2LTQ2em0tNDMuNjczLTE2NS4zNDZsNy40MTggMTM2Yy4zNDcgNi4zNjQgNS42MDkgMTEuMzQ2IDExLjk4MiAxMS4zNDZoNDguNTQ2YzYuMzczIDAgMTEuNjM1LTQuOTgyIDExLjk4Mi0xMS4zNDZsNy40MTgtMTM2Yy4zNzUtNi44NzQtNS4wOTgtMTIuNjU0LTExLjk4Mi0xMi42NTRoLTYzLjM4M2MtNi44ODQgMC0xMi4zNTYgNS43OC0xMS45ODEgMTIuNjU0eicvPjwvc3ZnPg==');
	}

	/* HARD EVIDENCE (overlays-toasts.md §Global CSS + §Resolved: .toast-close-button
	   { position:relative; right:-.3em; top:-.3em; float:right; font-size:20px;
	   font-weight:700; color:#fff; text-shadow:0 1px 0 #ffffff } and
	   button.toast-close-button { padding:0; cursor:pointer; background:transparent;
	   border:0 }). The × close button the app passes via closeButton:true. */
	.toast-close-button {
		position: relative;
		right: -0.3em;
		top: -0.3em;
		float: right;
		font-size: 20px;
		font-weight: 700;
		color: rgb(255, 255, 255);
		text-shadow: 0 1px 0 #ffffff;
		padding: 0;
		cursor: pointer;
		background: transparent;
		border: 0;
		line-height: 1;
	}
	/* HARD EVIDENCE (toastr css: .toast-close-button:hover, .toast-close-button:focus
	   { color:#000; text-decoration:none; cursor:pointer; opacity:.4 }) */
	.toast-close-button:hover,
	.toast-close-button:focus {
		color: rgb(0, 0, 0);
		text-decoration: none;
		cursor: pointer;
		opacity: 0.4;
	}

	/* HARD EVIDENCE (toastr css: .toast-title { font-weight: 700; }) */
	.toast-title {
		font-weight: 700;
	}
	/* HARD EVIDENCE (toastr css: .toast-message { overflow-wrap: break-word; }) */
	.toast-message {
		overflow-wrap: break-word;
	}
	/* Reference spinner icon carries BS5 `ms-2` = margin-left .5rem (the classes
	   `fas fa-cog fa-spin` come from the global FA stylesheet). */
	.toast-cog {
		margin-left: 0.5rem;
	}
</style>
