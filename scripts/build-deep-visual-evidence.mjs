import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('../web/node_modules/@playwright/test');

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const OUT = join(ROOT, 'docs/reference/visual-evidence-deep');
const PAGES = join(OUT, 'fragment-pages');
const THUMBS = join(OUT, 'original-fragments');
const CAPTURES = join(OUT, 'capture-geometry');

const SOURCE_DIR = join(ROOT, 'files');
const CURRENT_SHOTS = join(ROOT, 'web/e2e/screenshots');
const GAP_JSON = join(ROOT, 'docs/reference/_gap-findings-raw.json');
const OLD_CODE_EVIDENCE = '/private/tmp/original-app-evidence/analyzed-2026-06-14T22-21-48-994Z/original-app-full-code-evidence.md';
const RESOURCE_DIR = '/private/tmp/original-app-evidence/analyzed-2026-06-14T22-21-48-994Z/resources';

const cssPath = findOriginalCss();
const originalCss = cssPath ? readFileSync(cssPath, 'utf8') : '';
const faCssPath = join(ROOT, 'web/node_modules/@fortawesome/fontawesome-free/css/all.min.css');
const faHref = existsSync(faCssPath) ? pathToFileURL(faCssPath).href : '';

const mappings = [
	{
		name: 'Room Shell / Full Layout',
		files: ['file-1.html', 'file2.html', 'file3.html', 'file4.html', 'file6.html', 'important-doc.html', 'as-splitter.html'],
		currentShots: ['01-room-loaded.png'],
		currentCode: ['web/src/routes/rooms/+page.svelte', 'web/src/lib/components/RoomTopNav.svelte', 'web/src/lib/components/RoomSidebar.svelte', 'web/src/lib/components/AlertsChatDock.svelte', 'web/src/lib/components/MainStage.svelte'],
		correct: 'Angular room shell uses top fixed Bootstrap nav, left room sidebar, angular-split/as-split areas, alerts/chat pane, and presentation area in one dense work UI.',
		ours: 'Svelte room shell exists and has the same broad regions, but current screenshots/code use custom CSS/grid/button markup instead of the reference Bootstrap/as-split DOM.',
		confidence: 'Strong for section existence and broad layout; exact parity must be validated live after code changes.'
	},
	{
		name: 'Top Navbar / Volume / Reload',
		files: ['file5.html', 'navbar.html', 'navbars-room.html', 'dropdownstart.html', 'dropdownvolume.html', 'navfile.html', 'reload.html'],
		currentShots: ['01-room-loaded.png'],
		currentCode: ['web/src/lib/components/RoomTopNav.svelte', 'web/src/lib/components/Nav.svelte'],
		correct: 'Bootstrap navbar with mainAppNav, hamburger/sidebar menu, user/mobile indicators, dropdownVolume, volume slider, sound toggles, and fa-sync reload nav item.',
		ours: 'RoomTopNav component exists, but evidence points to a custom topbar implementation and likely different dropdown/nav-link/button structure.',
		confidence: 'Strong for original structure from isolated nav fragments and capture JSON; current visual is from existing repo screenshot, not fresh live run.'
	},
	{
		name: 'Sidebar / Roster / Admin Controls',
		files: ['file4.html', 'important-doc.html', 'odds-and-ends.html'],
		currentShots: ['21-members-online.png'],
		currentCode: ['web/src/lib/components/RoomSidebar.svelte', 'web/src/lib/components/MembersPanel.svelte'],
		correct: 'Reference sidebar is Bootstrap nav list with Mobile App Info, Connectivity Check, General Settings, Archives, muted/followed users, active room users, sort/search/user option buttons, and role-gated controls.',
		ours: 'Sidebar/member panel exists, but evidence needs live admin/presenter/member captures for exact gated controls and roster geometry.',
		confidence: 'Medium: original evidence is strong, current-state parity needs fresh role-specific screenshots.'
	},
	{
		name: 'Presentation Tabs / Screens / Streams / Notes / Files',
		files: ['subnavbar.html', 'mixednavs.html', 'afterwebcamholder.html', 'file6.html'],
		currentShots: ['02-tab-streams.png', '03-tab-notes.png', '04-tab-files.png'],
		currentCode: ['web/src/lib/components/MainStage.svelte', 'web/src/lib/components/ScreenStage.svelte', 'web/src/lib/components/NotesPanel.svelte', 'web/src/lib/components/FilesPanel.svelte'],
		correct: 'Bootstrap nav-tabs list with Screens, hidden Streams in some captures, Notes with noteChangeIndicator/edit icon, Files with folder icon, and note sub-tabs including home/pen badges.',
		ours: 'Existing repo screenshots include Streams/Notes/Files states, but source inspection previously showed some tab assumptions were stale. This must be checked against current code before calling it fixed.',
		confidence: 'Strong for original tab markup; medium for repo because screenshots may be stale.'
	},
	{
		name: 'Alerts Panel / Alert Rows / Posting Flow',
		files: ['file2.html', 'file6.html', 'as-splitter.html'],
		currentShots: ['05-alert-modal.png', '06-alert-modal-filled.png', '07-alert-posted.png', '08-alert-row-menu.png'],
		currentCode: ['web/src/lib/components/AlertFeed.svelte', 'web/src/lib/components/PostAlertModal.svelte'],
		correct: 'Reference alerts feed is read-only for rows; posting is routed through Post Alert modal. Rows use dense Bootstrap message bubbles, QA/reaction/menu affordances, and row menu actions.',
		ours: 'Our screenshots show Post Alert flow and row menu, but code must be checked for any leftover inline composer or non-reference row/menu chrome.',
		confidence: 'Strong for correct flow; current parity depends on code read/live screenshot.'
	},
	{
		name: 'Post Alert Modal',
		files: ['file12.html'],
		currentShots: ['05-alert-modal.png', '06-alert-modal-filled.png'],
		currentCode: ['web/src/lib/components/PostAlertModal.svelte'],
		correct: 'Bootstrap modal #alert-modal with Text Alert, Text Url, combined Image / GIF / Video tab, textarea, URL input group, upload label/drop zone, footer checkboxes, green Post Alert.',
		ours: 'Current screenshot shows a Post Alert modal, but first-pass evidence was too narrow; the deeper card compares the original single saved modal directly against current screenshot and component path.',
		confidence: 'Strong.'
	},
	{
		name: 'Poll Window / Poll Panel',
		files: ['file13.html', 'odds-and-ends.html'],
		currentShots: ['13-poll-modal.png', '14-poll-created.png', '15-poll-voted.png', '16-poll-closed.png'],
		currentCode: ['web/src/lib/components/PollModal.svelte', 'web/src/lib/components/PollPanel.svelte'],
		correct: 'Reference is a floating draggable poll panel with titlebar controls, Create New Poll and Pre-Canned Polls tabs, step labels, Add Choice, Save To Canned, and Send Poll.',
		ours: 'Current screenshot shows a poll create surface; compare carefully for floating titlebar chrome, canned tab, and Save To Canned before calling it matched.',
		confidence: 'Strong for original, medium for current screenshot freshness.'
	},
	{
		name: 'User Settings Modal',
		files: ['appusersettingsmodal.html', 'file9.html'],
		currentShots: [],
		currentCode: ['web/src/lib/components/modals/SettingsModal.svelte', 'web/src/lib/components/RoomSidebar.svelte'],
		correct: 'Bootstrap modal #user-settings-modal with App Settings, Alert Settings, Chat Settings tabs, radio/checkbox groups for color theme, layout, chat color mode, sound toggles, and chat text size number input.',
		ours: 'No current repo screenshot artifact found for this modal. Must use code inspection or generate fresh screenshot before visual parity claim.',
		confidence: 'Strong original, weak current visual until captured.'
	},
	{
		name: 'Audio/Video Settings Modal',
		files: ['avsettingsmodal.html', 'avsettingsmodal1.html', 'file10.html'],
		currentShots: [],
		currentCode: ['web/src/lib/components/modals/AVSettingsModal.svelte'],
		correct: 'Bootstrap AV settings modal with User Settings and Presenter Settings tabs, speaker output selector/test, presenter mic/cam selectors, and Save/Close footer.',
		ours: 'No current repo screenshot artifact found. Current implementation needs visual capture for exact tab/nav/form/footer parity.',
		confidence: 'Strong original, weak current visual until captured.'
	},
	{
		name: 'Advanced Search / Alert Filter / Scheduled Alerts',
		files: ['file25.html', 'file28.html', 'file29.html'],
		currentShots: [],
		currentCode: ['web/src/lib/components/modals/AdvancedSearchModal.svelte', 'web/src/lib/components/modals/AlertFilterModal.svelte', 'web/src/lib/components/modals/ScheduledAlertsModal.svelte'],
		correct: 'Reference uses Bootstrap modal chrome. Advanced Search has title Rooms refresh button, dropdown-menu multi-selects, text search, checkbox filters, datetime fields. Scheduled Alerts is modal-xl table Date/Time, Sender, Alert, Repeat, Actions.',
		ours: 'No local screenshot artifact for these surfaces; existing docs say these are high-risk until visual capture confirms dropdown/table structure.',
		confidence: 'Strong original, weak current visual until captured.'
	},
	{
		name: 'Session / Logs / Reports Admin Modals',
		files: ['file11.html', 'file14.html', 'file15.html', 'file16.html', 'file26.html', 'file27.html'],
		currentShots: ['19-session-control.png', '20-confirm-clear-chat.png'],
		currentCode: ['web/src/lib/components/modals/SessionControlModal.svelte', 'web/src/lib/components/modals/DebugLogModal.svelte', 'web/src/lib/components/modals/ChatLogsModal.svelte', 'web/src/lib/components/modals/AlertLogsModal.svelte', 'web/src/lib/components/modals/AlertSendReportModal.svelte', 'web/src/lib/components/modals/AllUserPmModal.svelte'],
		correct: 'Reference admin modals use Bootstrap modal hierarchy, title-specific ids, modal headers/footers, list groups/tables/loading states, and role-gated visibility.',
		ours: 'Session screenshots exist; logs/reports/all-PM need fresh current visual capture before claiming exact match.',
		confidence: 'Medium: original modal shells are strong; some bodies are async/empty in captures.'
	},
	{
		name: 'Chat / Private Chat / Reply / QA',
		files: ['file18.html', 'file19.html', 'file20.html', 'file21.html', 'file24.html', 'file32.html'],
		currentShots: ['09-chat-main.png', '10-chat-offtopic.png', '11-reaction-picker.png', '12-reaction-added.png'],
		currentCode: ['web/src/lib/components/ChatPanel.svelte', 'web/src/lib/components/PrivateChat.svelte', 'web/src/lib/components/modals/ReplyModal.svelte', 'web/src/lib/components/modals/AlertQaModal.svelte', 'web/src/lib/components/modals/MutedUsersModal.svelte', 'web/src/lib/components/modals/FollowedUsersModal.svelte'],
		correct: 'Reference chat/PM/reply surfaces use dense Bootstrap message rows, textareas with image/GIF/emoji affordances, private chat docked panel, followed/muted user modals, and Q&A modal shell.',
		ours: 'Current chat screenshots cover basic chat/reactions only; private/reply/QA/followed/muted need dedicated current visuals.',
		confidence: 'Medium.'
	},
	{
		name: 'Media / YouTube / Mobile App / Screen Share / Recording',
		files: ['file8.html', 'file17.html', 'file22.html', 'file23.html', 'file30.html', 'file31.html', 'file33.html', 'file34.html', 'webcamholder.html', 'afterwebcamholder.html'],
		currentShots: ['17-media-modal.png', '18-media-playing.png'],
		currentCode: ['web/src/lib/components/MediaPlayer.svelte', 'web/src/lib/components/WebcamHolder.svelte', 'web/src/lib/components/modals/MediaForAllModal.svelte', 'web/src/lib/components/modals/MobileAppInfoModal.svelte', 'web/src/lib/components/modals/ConnectivityCheckModal.svelte', 'web/src/lib/components/modals/RichTextEditorModal.svelte', 'web/src/lib/components/RecPreview.svelte'],
		correct: 'Reference includes Play YouTube For All modal, mobile app modal with store badges, draggable/resizable screen-share and rec preview cards, WebRTC troubleshooter rows, rich text editor shell, toast container, and hidden webcam audio sink.',
		ours: 'Some media screenshots exist; screen-share/recording/toast/audio sink/mobile/settings require current visual or code evidence before exact parity claims.',
		confidence: 'Medium.'
	}
];

const fragmentFiles = readdirSync(SOURCE_DIR)
	.filter((file) => file.endsWith('.html'))
	.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
if (existsSync(join(ROOT, 'important-doc.html'))) fragmentFiles.push('important-doc.html');

mkdirSync(OUT, { recursive: true });
mkdirSync(PAGES, { recursive: true });
mkdirSync(THUMBS, { recursive: true });
mkdirSync(CAPTURES, { recursive: true });

const gapRows = readGapRows();
const originalCodeEvidence = existsSync(OLD_CODE_EVIDENCE) ? readFileSync(OLD_CODE_EVIDENCE, 'utf8') : '';

const fragments = fragmentFiles.map((file) => {
	const sourcePath = file === 'important-doc.html' ? join(ROOT, file) : join(SOURCE_DIR, file);
	const html = readFileSync(sourcePath, 'utf8');
	const name = basename(sourcePath);
	const meta = extractMeta(html);
	const gaps = gapRows.find((row) => basename(row.file || '') === name)?.gaps ?? [];
	const pagePath = join(PAGES, `${safeBase(name)}.html`);
	const shotPath = join(THUMBS, `${safeBase(name)}.png`);
	const wrapper = buildFragmentPage({ name, sourcePath, html, meta, gaps });
	writeFileSync(pagePath, wrapper);
	return {
		name,
		sourcePath,
		size: statSync(sourcePath).size,
		sha: sha256(html).slice(0, 16),
		meta,
		gapCount: gaps.length,
		highGapCount: gaps.filter((gap) => String(gap.priority || gap.severity || '').toLowerCase().includes('high')).length,
		pagePath,
		shotPath
	};
});

const captureCards = buildCaptureGeometry();

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 760 }, deviceScaleFactor: 1 });
for (const fragment of fragments) {
	await page.goto(pathToFileURL(fragment.pagePath).href, { waitUntil: 'load' });
	await page.waitForTimeout(80);
	await page.screenshot({ path: fragment.shotPath, fullPage: false });
}
await page.close();

const currentShots = existsSync(CURRENT_SHOTS)
	? readdirSync(CURRENT_SHOTS)
			.filter((file) => /\.(png|jpe?g)$/i.test(file))
			.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
			.map((name) => ({ name, path: join(CURRENT_SHOTS, name), size: statSync(join(CURRENT_SHOTS, name)).size }))
	: [];

const manifest = {
	generatedAt: new Date().toISOString(),
	sourceCounts: {
		originalHtmlFragments: fragments.length,
		currentRepoScreenshots: currentShots.length,
		captureGeometryFiles: captureCards.length
	},
	limitations: [
		'Original visuals are rendered from saved HTML fragments plus the harvested original CSS, not a new live original-app browser session.',
		'Current repo screenshots are existing artifacts because localhost:8081 and localhost:5174 were not running when this report was generated.',
		'Cards with no current screenshot are source/code-evidence only until fresh role-specific screenshots are captured.',
		'Hidden modals/fragments are force-shown for inspection; that is marked as inspection rendering, not native runtime state.'
	],
	originalCss: cssPath,
	originalCodeEvidence: existsSync(OLD_CODE_EVIDENCE) ? OLD_CODE_EVIDENCE : null,
	fragments: fragments.map((fragment) => ({
		name: fragment.name,
		size: fragment.size,
		sha: fragment.sha,
		appTags: fragment.meta.appTags,
		ids: fragment.meta.ids,
		modalIds: fragment.meta.modalIds,
		buttons: fragment.meta.buttons,
		inputs: fragment.meta.inputs,
		gapCount: fragment.gapCount,
		highGapCount: fragment.highGapCount,
		thumbnail: relative(OUT, fragment.shotPath)
	})),
	mappings
};
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));

const index = buildIndex({ fragments, currentShots, captureCards, manifest });
writeFileSync(join(OUT, 'index.html'), index);

const md = buildMarkdown({ fragments, currentShots, captureCards, manifest });
writeFileSync(join(OUT, 'hard-evidence-deep.md'), md);

const reportPage = await browser.newPage({ viewport: { width: 1500, height: 1800 }, deviceScaleFactor: 1 });
await reportPage.goto(pathToFileURL(join(OUT, 'index.html')).href, { waitUntil: 'load' });
await reportPage.waitForTimeout(120);
await reportPage.screenshot({ path: join(OUT, 'visual-evidence-deep.png'), fullPage: true });
await reportPage.close();
await browser.close();

console.log(`Wrote ${join(OUT, 'index.html')}`);
console.log(`Wrote ${join(OUT, 'visual-evidence-deep.png')}`);
console.log(`Wrote ${join(OUT, 'hard-evidence-deep.md')}`);
console.log(`Rendered ${fragments.length} original fragment thumbnails.`);

function buildFragmentPage({ name, sourcePath, html, meta, gaps }) {
	const title = escapeHtml(name);
	const source = escapeHtml(relative(ROOT, sourcePath));
	const style = `
		${originalCss}
		:root { color-scheme: dark; }
		html, body { margin: 0; min-height: 100%; background: #092335; color: #f3f7fb; font-family: "Open Sans", Arial, sans-serif; }
		body { padding: 12px; overflow: auto; }
		.evidence-banner {
			position: sticky; top: 0; z-index: 99999; display: flex; gap: 10px; align-items: center;
			padding: 8px 10px; margin: -12px -12px 10px; background: #061723; border-bottom: 1px solid #1b4b68;
			font: 12px/1.35 Arial, sans-serif; color: #d8edf8;
		}
		.evidence-pill { border: 1px solid #2b789f; border-radius: 3px; padding: 2px 6px; background: #0e3850; }
		.evidence-wrap { min-height: 660px; outline: 1px solid rgba(69,162,255,.45); background: #123a55; padding: 10px; overflow: auto; }
		.evidence-wrap > * { max-width: 100%; }
		.modal { display: block !important; opacity: 1 !important; position: relative !important; inset: auto !important; z-index: 10 !important; }
		.modal-dialog { margin: 10px auto !important; transform: none !important; }
		.modal-backdrop, .cdk-overlay-backdrop { display: none !important; }
		[hidden], .collapse:not(.show), .tab-pane:not(.active), .dropdown-menu { display: block !important; opacity: 1 !important; visibility: visible !important; }
		.dropdown-menu { position: relative !important; transform: none !important; float: none !important; margin: 8px 0 !important; }
		app-root, app-room, app-alerts, app-chat, app-presentationarea, app-post-alert-modal, app-poll-modal,
		app-user-settings-modal, app-av-settings-modal, app-session-control-modal, app-alerts-advanced-search {
			display: block;
		}
		iframe, img, video { max-width: 100%; }
	`;
	return `<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<title>${title}</title>
	${faHref ? `<link rel="stylesheet" href="${faHref}">` : ''}
	<style>${style}</style>
</head>
<body class="darkTheme lightTheme">
	<div class="evidence-banner">
		<strong>${title}</strong>
		<span class="evidence-pill">${source}</span>
		<span class="evidence-pill">${meta.appTags.length} app tags</span>
		<span class="evidence-pill">${meta.modalIds.length} modal ids</span>
		<span class="evidence-pill">${gaps.length} audited gaps</span>
	</div>
	<div class="evidence-wrap">${html}</div>
</body>
</html>`;
}

function buildIndex({ fragments, currentShots, captureCards, manifest }) {
	const sectionCards = mappings
		.map((mapping) => {
			const refFiles = mapping.files
				.map((name) => {
					const fragment = fragments.find((item) => item.name === name || item.name === basename(name));
					if (!fragment) return '';
					return `<figure class="mini"><img src="${rel(fragment.shotPath)}" alt="${escapeHtml(fragment.name)}"><figcaption>${escapeHtml(fragment.name)}</figcaption></figure>`;
				})
				.join('');
			const shots = mapping.currentShots
				.map((name) => currentShots.find((shot) => shot.name === name))
				.filter(Boolean)
				.map((shot) => `<figure class="mini"><img src="${rel(shot.path)}" alt="${escapeHtml(shot.name)}"><figcaption>${escapeHtml(shot.name)}</figcaption></figure>`)
				.join('');
			return `<section class="mapping">
				<header>
					<h2>${escapeHtml(mapping.name)}</h2>
					<span class="confidence">${escapeHtml(mapping.confidence)}</span>
				</header>
				<div class="versions">
					<div><h3>Correct Version</h3><p>${escapeHtml(mapping.correct)}</p></div>
					<div><h3>Our Version</h3><p>${escapeHtml(mapping.ours)}</p></div>
				</div>
				<div class="evidence-grid">
					<div><h3>Original Visual Evidence</h3><div class="mini-grid">${refFiles || '<p class="missing">No mapped original thumbnail.</p>'}</div></div>
					<div><h3>Repo Visual Evidence</h3><div class="mini-grid">${shots || '<p class="missing">No repo screenshot artifact found yet.</p>'}</div></div>
				</div>
				<p class="code-paths"><strong>Repo paths:</strong> ${mapping.currentCode.map((path) => `<code>${escapeHtml(path)}</code>`).join(' ')}</p>
			</section>`;
		})
		.join('');

	const fragmentCards = fragments
		.map((fragment) => `<article class="fragment">
			<img src="${rel(fragment.shotPath)}" alt="${escapeHtml(fragment.name)}">
			<div>
				<h3>${escapeHtml(fragment.name)}</h3>
				<p><strong>SHA:</strong> <code>${fragment.sha}</code> · <strong>Size:</strong> ${formatBytes(fragment.size)} · <strong>Audited gaps:</strong> ${fragment.gapCount} (${fragment.highGapCount} high)</p>
				<p><strong>App selectors:</strong> ${chips(fragment.meta.appTags, 'none')}</p>
				<p><strong>Modal ids:</strong> ${chips(fragment.meta.modalIds, 'none')}</p>
				<p><strong>Important ids:</strong> ${chips(fragment.meta.ids.slice(0, 18), 'none')}</p>
				<p><strong>Visible controls/text:</strong> ${chips([...fragment.meta.buttons.slice(0, 8), ...fragment.meta.inputs.slice(0, 8)], 'none')}</p>
			</div>
		</article>`)
		.join('');

	const currentCards = currentShots
		.map((shot) => `<figure class="shot"><img src="${rel(shot.path)}" alt="${escapeHtml(shot.name)}"><figcaption>${escapeHtml(shot.name)} · ${formatBytes(shot.size)}</figcaption></figure>`)
		.join('');

	const captureHtml = captureCards
		.map((card) => `<article class="capture"><img src="${rel(card.svgPath)}" alt="${escapeHtml(card.name)}"><div><h3>${escapeHtml(card.name)}</h3><p>${escapeHtml(card.summary)}</p></div></article>`)
		.join('');

	return `<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<title>Deep Visual Hard Evidence: Original App vs Repo</title>
	<style>
		:root { color-scheme: dark; }
		body { margin: 0; background: #071a27; color: #e8f2f8; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.45; }
		header.hero { padding: 24px 28px; background: #0b2638; border-bottom: 1px solid #1e5875; }
		h1, h2, h3, p { margin: 0; }
		h1 { font-size: 24px; }
		h2 { font-size: 18px; }
		h3 { font-size: 13px; color: #b7d9ea; text-transform: uppercase; }
		code { color: #bde8ff; background: #0a2231; border: 1px solid #1d536f; border-radius: 3px; padding: 1px 4px; }
		.wrap { padding: 18px 20px 36px; }
		.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 14px; }
		.stat { background: #0e3045; border: 1px solid #1f5a78; border-radius: 6px; padding: 10px; }
		.stat strong { display: block; font-size: 22px; color: #fff; }
		.notice { margin-top: 14px; padding: 10px 12px; border: 1px solid #7e6420; background: #2b250f; color: #ffe49a; border-radius: 6px; }
		.mapping, .fragment, .capture { border: 1px solid #1f5a78; background: #0b283b; border-radius: 6px; padding: 12px; margin: 14px 0; }
		.mapping > header { display: flex; justify-content: space-between; gap: 14px; align-items: baseline; border-bottom: 1px solid #19485f; padding-bottom: 8px; margin-bottom: 10px; }
		.confidence { color: #ffe49a; font-size: 12px; text-align: right; max-width: 460px; }
		.versions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
		.versions > div { background: #071f2e; border: 1px solid #164158; border-radius: 5px; padding: 10px; min-height: 86px; }
		.versions p { margin-top: 6px; }
		.evidence-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
		.mini-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
		.mini { margin: 0; border: 1px solid #1b536f; background: #061b28; border-radius: 4px; overflow: hidden; }
		.mini img { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; object-position: top left; background: #082131; }
		.mini figcaption, .shot figcaption { padding: 5px 7px; color: #b7d9ea; font-size: 11px; }
		.missing { min-height: 120px; display: grid; place-items: center; color: #ffe49a; background: #0b2c42; border: 1px dashed #2b789f; border-radius: 4px; }
		.code-paths { margin-top: 10px; color: #cbe3ef; }
		.section-title { margin: 28px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #27617f; }
		.fragment { display: grid; grid-template-columns: 420px 1fr; gap: 12px; }
		.fragment > img { width: 420px; height: 290px; object-fit: cover; object-position: top left; border: 1px solid #1e5875; background: #082131; }
		.fragment h3 { font-size: 15px; text-transform: none; color: #fff; }
		.fragment p { margin-top: 7px; }
		.chip { display: inline-block; margin: 2px 3px 2px 0; padding: 1px 5px; border-radius: 3px; background: #123c55; border: 1px solid #245d7b; color: #dff5ff; font-size: 11px; }
		.current-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
		.shot { margin: 0; border: 1px solid #1f5a78; background: #0b283b; border-radius: 6px; overflow: hidden; }
		.shot img { width: 100%; display: block; aspect-ratio: 16 / 9; object-fit: cover; object-position: top left; }
		.capture { display: grid; grid-template-columns: 520px 1fr; gap: 12px; align-items: start; }
		.capture img { width: 520px; border: 1px solid #1e5875; background: #082131; }
		@media (max-width: 1000px) {
			.stats, .versions, .evidence-grid, .fragment, .capture, .current-grid { grid-template-columns: 1fr; }
			.fragment > img, .capture img { width: 100%; height: auto; }
		}
	</style>
</head>
<body>
	<header class="hero">
		<h1>Deep Visual Hard Evidence: Original App vs Repo</h1>
		<p>Generated ${escapeHtml(manifest.generatedAt)} from raw saved HTML fragments, harvested original CSS, capture JSON, existing repo screenshots, and repo source paths.</p>
		<div class="stats">
			<div class="stat"><strong>${manifest.sourceCounts.originalHtmlFragments}</strong>original HTML fragments rendered</div>
			<div class="stat"><strong>${manifest.sourceCounts.currentRepoScreenshots}</strong>repo screenshot artifacts indexed</div>
			<div class="stat"><strong>${captureCards.length}</strong>capture geometry files rendered</div>
			<div class="stat"><strong>${mappings.length}</strong>version comparison sections</div>
		</div>
		<div class="notice">${manifest.limitations.map(escapeHtml).join(' ')}</div>
	</header>
	<main class="wrap">
		<h2 class="section-title">Section List: Correct Version vs Our Version</h2>
		${sectionCards}
		<h2 class="section-title">Original Fragment Atlas: Every Saved HTML File</h2>
		${fragmentCards}
		<h2 class="section-title">Current Repo Screenshot Artifacts</h2>
		<div class="current-grid">${currentCards || '<p class="missing">No current repo screenshots found.</p>'}</div>
		<h2 class="section-title">Original Capture Geometry</h2>
		${captureHtml || '<p class="missing">No capture JSON geometry found.</p>'}
	</main>
</body>
</html>`;
}

function buildMarkdown({ fragments, currentShots, captureCards, manifest }) {
	const lines = [];
	lines.push('# Deep Visual Hard Evidence');
	lines.push('');
	lines.push(`Generated: ${manifest.generatedAt}`);
	lines.push('');
	lines.push('## Source Counts');
	lines.push('');
	lines.push(`- Original HTML fragments rendered: ${fragments.length}`);
	lines.push(`- Current repo screenshots indexed: ${currentShots.length}`);
	lines.push(`- Capture geometry files rendered: ${captureCards.length}`);
	lines.push(`- Original harvested CSS: ${cssPath || 'not found'}`);
	lines.push(`- Original code evidence: ${manifest.originalCodeEvidence || 'not found'}`);
	lines.push('');
	lines.push('## Limits');
	lines.push('');
	for (const limit of manifest.limitations) lines.push(`- ${limit}`);
	lines.push('');
	lines.push('## Section List: Correct Version vs Our Version');
	lines.push('');
	for (const mapping of mappings) {
		lines.push(`### ${mapping.name}`);
		lines.push(`- Correct version: ${mapping.correct}`);
		lines.push(`- Our version: ${mapping.ours}`);
		lines.push(`- Confidence: ${mapping.confidence}`);
		lines.push(`- Original files: ${mapping.files.join(', ')}`);
		lines.push(`- Repo screenshots: ${mapping.currentShots.length ? mapping.currentShots.join(', ') : 'none found yet'}`);
		lines.push(`- Repo paths: ${mapping.currentCode.join(', ')}`);
		lines.push('');
	}
	lines.push('## Original Fragment Atlas');
	lines.push('');
	for (const fragment of fragments) {
		lines.push(`### ${fragment.name}`);
		lines.push(`- Thumbnail: ${relative(OUT, fragment.shotPath)}`);
		lines.push(`- Source: ${relative(ROOT, fragment.sourcePath)}`);
		lines.push(`- SHA: ${fragment.sha}`);
		lines.push(`- Size: ${formatBytes(fragment.size)}`);
		lines.push(`- App selectors: ${fragment.meta.appTags.join(', ') || 'none'}`);
		lines.push(`- Modal ids: ${fragment.meta.modalIds.join(', ') || 'none'}`);
		lines.push(`- Important ids: ${fragment.meta.ids.slice(0, 30).join(', ') || 'none'}`);
		lines.push(`- Audited gaps: ${fragment.gapCount}; high: ${fragment.highGapCount}`);
		lines.push('');
	}
	return lines.join('\n');
}

function extractMeta(html) {
	const appTags = unique([...html.matchAll(/<\/?(app-[a-z0-9-]+)/gi)].map((match) => match[1].toLowerCase())).sort();
	const ids = unique([...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1])).sort();
	const modalIds = ids.filter((id) => /modal|Modal|settings|logs|search|alert|poll|youtube|rte|report|session/.test(id));
	const classes = unique(
		[...html.matchAll(/\bclass=["']([^"']+)["']/gi)]
			.flatMap((match) => match[1].split(/\s+/))
			.filter(Boolean)
	).sort();
	const buttons = unique(
		[...html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi)]
			.map((match) => cleanText(match[1]))
			.filter(Boolean)
	).slice(0, 30);
	const inputs = unique(
		[...html.matchAll(/<(input|textarea|select)\b([^>]*)>/gi)]
			.map((match) => {
				const attrs = match[2];
				const id = attr(attrs, 'id');
				const type = attr(attrs, 'type');
				const placeholder = attr(attrs, 'placeholder');
				const name = attr(attrs, 'name');
				return [match[1].toLowerCase(), id && `#${id}`, type && `type=${type}`, name && `name=${name}`, placeholder && `"${placeholder}"`]
					.filter(Boolean)
					.join(' ');
			})
			.filter(Boolean)
	).slice(0, 30);
	const headings = unique(
		[...html.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi)]
			.map((match) => cleanText(match[1]))
			.filter(Boolean)
	).slice(0, 20);
	return { appTags, ids, modalIds, classes, buttons, inputs, headings };
}

function buildCaptureGeometry() {
	const captureDir = join(ROOT, 'docs/reference/captures');
	if (!existsSync(captureDir)) return [];
	return readdirSync(captureDir)
		.filter((file) => file.endsWith('.json'))
		.sort()
		.map((file) => {
			const source = join(captureDir, file);
			const data = JSON.parse(readFileSync(source, 'utf8'));
			const nodes = collectGeometry(data).slice(0, 120);
			const svgPath = join(CAPTURES, `${safeBase(file)}.svg`);
			writeFileSync(svgPath, geometrySvg(file, nodes));
			return {
				name: file,
				source,
				svgPath,
				summary: `${nodes.length} visible rectangles extracted from capture JSON. Shows captured geometry only; not a DOM screenshot.`
			};
		});
}

function collectGeometry(value, acc = []) {
	if (!value || typeof value !== 'object') return acc;
	if (Array.isArray(value)) {
		for (const item of value) collectGeometry(item, acc);
		return acc;
	}
	const rect = value.rect || value.boundingBox || value.bounds;
	if (rect && typeof rect === 'object') {
		const x = num(rect.x ?? rect.left);
		const y = num(rect.y ?? rect.top);
		const w = num(rect.w ?? rect.width ?? (rect.right - rect.left));
		const h = num(rect.h ?? rect.height ?? (rect.bottom - rect.top));
		if (w > 2 && h > 2 && x > -2000 && y > -2000) {
			acc.push({
				x,
				y,
				w,
				h,
				label: String(value.label || value.text || value.id || value.class || value.tag || '').slice(0, 80),
				className: String(value.class || '')
			});
		}
	}
	for (const item of Object.values(value)) collectGeometry(item, acc);
	return acc;
}

function geometrySvg(name, nodes) {
	const minX = Math.min(0, ...nodes.map((node) => node.x));
	const minY = Math.min(0, ...nodes.map((node) => node.y));
	const maxX = Math.max(100, ...nodes.map((node) => node.x + node.w));
	const maxY = Math.max(100, ...nodes.map((node) => node.y + node.h));
	const scale = Math.min(1, 1280 / Math.max(1, maxX - minX), 720 / Math.max(1, maxY - minY));
	const width = Math.ceil((maxX - minX) * scale) + 20;
	const height = Math.ceil((maxY - minY) * scale) + 42;
	const rects = nodes
		.map((node, index) => {
			const x = 10 + (node.x - minX) * scale;
			const y = 32 + (node.y - minY) * scale;
			const w = Math.max(1, node.w * scale);
			const h = Math.max(1, node.h * scale);
			const color = colorFor(node.className || node.label || String(index));
			const label = node.label && w > 60 && h > 12 ? `<text x="${x + 3}" y="${y + 12}" fill="#dff6ff" font-size="10">${escapeXml(node.label)}</text>` : '';
			return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${color}" fill-opacity=".22" stroke="${color}" stroke-width="1"/>${label}`;
		})
		.join('\n');
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
		<rect width="100%" height="100%" fill="#071b29"/>
		<text x="10" y="20" fill="#e8f7ff" font-size="13" font-family="Arial">${escapeXml(name)}</text>
		${rects}
	</svg>`;
}

function readGapRows() {
	if (!existsSync(GAP_JSON)) return [];
	try {
		const rows = JSON.parse(readFileSync(GAP_JSON, 'utf8'));
		return Array.isArray(rows) ? rows : rows.findings || [];
	} catch {
		return [];
	}
}

function findOriginalCss() {
	if (!existsSync(RESOURCE_DIR)) return null;
	const css = readdirSync(RESOURCE_DIR).find((file) => /styles\..+\.css/i.test(file));
	return css ? join(RESOURCE_DIR, css) : null;
}

function cleanText(value) {
	return value
		.replace(/<script[\s\S]*?<\/script>/gi, '')
		.replace(/<style[\s\S]*?<\/style>/gi, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, 120);
}

function attr(attrs, name) {
	const match = attrs.match(new RegExp(`\\b${name}=["']([^"']+)["']`, 'i'));
	return match?.[1] || '';
}

function rel(path) {
	return relative(OUT, path).split('/').map(encodeURIComponent).join('/');
}

function chips(items, fallback) {
	if (!items.length) return `<span class="chip">${escapeHtml(fallback)}</span>`;
	return items.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join('');
}

function unique(items) {
	return [...new Set(items)];
}

function sha256(text) {
	return createHash('sha256').update(text).digest('hex');
}

function safeBase(name) {
	return name.replace(/[^a-z0-9._-]+/gi, '_').replace(/^\.+/, '');
}

function formatBytes(bytes) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function escapeHtml(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function escapeXml(value) {
	return escapeHtml(value).replace(/'/g, '&apos;');
}

function num(value) {
	const n = Number(value);
	return Number.isFinite(n) ? n : 0;
}

function colorFor(value) {
	const hash = createHash('md5').update(value).digest();
	const r = 80 + (hash[0] % 120);
	const g = 120 + (hash[1] % 100);
	const b = 160 + (hash[2] % 80);
	return `rgb(${r}, ${g}, ${b})`;
}
