import db from '../lib/db';
import { config } from '../config';

export async function renderLiveDisplay(container) {
	const theme = config.themes[config.liveDisplay.theme] || config.themes.default;
	const pos = config.positions[config.liveDisplay.position] || config.positions.top_left;

	container.innerHTML = '<div style="color: white; padding: 2rem;">Connecting to live session...</div>';

	// UI Structure
	const overlay = document.createElement('div');
	overlay.className = 'live-overlay';
	overlay.style.cssText = `
		font-family: ${theme.fontFamily};
		color: white;
		padding: 2rem;
		height: 100vh;
		width: 100vw;
		position: fixed;
		top: 0;
		left: 0;
		background: transparent;
		overflow: hidden;
		pointer-events: none; /* Let OBS click through if needed */
		z-index: 9999;
	`;

	const nowPlaying = document.createElement('div');
	const npPos = pos.nowPlaying;
	// Determine entrance animation side
	const slideDist = npPos.right ? '20px' : '-20px';

	nowPlaying.style.cssText = `
		position: absolute;
		${npPos.top ? `top: ${npPos.top};` : ''}
		${npPos.bottom ? `bottom: ${npPos.bottom};` : ''}
		${npPos.left ? `left: ${npPos.left};` : ''}
		${npPos.right ? `right: ${npPos.right};` : ''}
		${npPos.margin ? `margin: ${npPos.margin};` : ''}
		${npPos.width ? `width: ${npPos.width};` : ''}
		text-align: ${npPos.textAlign || 'left'};
		padding: 1.5rem;
		background: ${theme.nowPlayingBg};
		border-right: ${theme.borderRight};
		backdrop-filter: blur(${theme.blur});
		min-width: 250px;
		transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
		opacity: 0;
		transform: translateX(${slideDist}) ${npPos.transform || ''};
		${theme.textShadow ? `text-shadow: ${theme.textShadow};` : ''}
		pointer-events: auto;
	`;

	const historyList = document.createElement('ol');
	const histPos = pos.history;
	historyList.style.cssText = `
		position: absolute;
		${histPos.top ? `top: ${histPos.top};` : ''}
		${histPos.bottom ? `bottom: ${histPos.bottom};` : ''}
		${histPos.left ? `left: ${histPos.left};` : ''}
		${histPos.right ? `right: ${histPos.right};` : ''}
		${histPos.margin ? `margin: ${histPos.margin};` : ''}
		${histPos.width ? `width: ${histPos.width};` : ''}
		${histPos.transform ? `transform: ${histPos.transform};` : ''}
		text-align: ${histPos.textAlign || 'left'};
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: ${theme?.fontSizes?.historyItem ? theme.fontSizes.historyItem : '1.4rem'};
		color: ${theme.historyColor};
		${theme.textShadow ? `text-shadow: ${theme.textShadow};` : ''}
	`;

	overlay.append(historyList, nowPlaying);
	container.innerHTML = '';
	container.appendChild(overlay);

	async function updateDisplay() {
		console.log("Updating live display...");
		try {
			const sessionResult = await db.select('live_session:current').catch(err => {
				console.error("Select session error:", err);
				return null;
			});
			const session = Array.isArray(sessionResult) ? sessionResult[0] : sessionResult;

			console.log("Current session data:", session);
			if (!session) {
				console.warn("No active live session data found.");
				return;
			}

			// Handle History
			historyList.innerHTML = '';
			if (session.history && Array.isArray(session.history) && session.history.length > 0) {
				session.history.forEach((item, idx) => {
					const row = document.createElement('li');
					row.innerHTML = `${item.title} / ${item.artist}`;
					historyList.appendChild(row);
				});
			}

			// Handle Now Playing
			if (session.status === 'singing' && session.current_song_id) {
				console.log("Fetching song details for:", session.current_song_id);
				const songResult = await db.select(session.current_song_id).catch(() => null);
				const song = Array.isArray(songResult) ? songResult[0] : songResult;

				if (song) {
					nowPlaying.style.opacity = '1';
					nowPlaying.style.transform = `translateX(0) ${npPos.transform || ''}`;
					nowPlaying.innerHTML = `
						<div style="font-size: ${theme?.fontSizes?.nowPlayingLabel ? theme.fontSizes.nowPlayingLabel : '1.8rem'}; text-transform: uppercase; letter-spacing: 0.1em; color: ${theme.accentColor}; margin-bottom: 0.5rem;">Now Playing</div>
						<div style="font-size: ${theme?.fontSizes?.nowPlayingTitle ? theme.fontSizes.nowPlayingTitle : '2.8rem'}; font-weight: 700;">${song.title}</div>
						<div style="font-size: ${theme?.fontSizes?.nowPlayingArtist ? theme.fontSizes.nowPlayingArtist : '2.1rem'}; opacity: 0.8;">${song.artist}</div>
					`;
				} else {
					console.warn("Song details not found for ID:", session.current_song_id);
				}
			} else {
				console.log("No song currently singing (status:", session.status, ")");
				nowPlaying.style.opacity = '0';
				nowPlaying.style.transform = `translateX(${slideDist}) ${npPos.transform || ''}`;
			}
		} catch (err) {
			console.error("Live sync update error:", err);
		}
	}

	// Live Query for real-time updates
	try {
		const { RecordId } = await import('surrealdb');
		const sessionId = new RecordId('live_session', 'current');

		console.log("Starting live query for:", sessionId);

		// Use the specific RecordId for the most direct notification
		await db.live(sessionId, (data) => {
			console.log("Live session record update received:", data);
			updateDisplay();
		});

		console.log("Live query successfully subscribed to 'live_session:current'");
	} catch (err) {
		console.error("Failed to start live query:", err);
		// Fallback: poll every 3 seconds if live query fails
		console.log("Starting polling fallback...");
		setInterval(updateDisplay, 3000);
	}

	// Initial load
	updateDisplay();
}
