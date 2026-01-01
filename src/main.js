import './style.css';
import { connectDB } from './lib/db';
import { renderSongList } from './views/songList';
import { renderSetlistList } from './views/setlistList';
import { config } from './config';

const app = document.querySelector('#app');

async function init() {
	const hash = window.location.hash;
	const isLiveMode = hash === '#live';

	if (isLiveMode) {
		app.innerHTML = '<div style="background: transparent; height: 100vh;"></div>';
	} else {
		app.innerHTML = `
			<header class="glass-panel" style="margin-top: 1rem; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
				<h1>Setlist Manager</h1>
				<nav style="display: flex; gap: 1rem;">
					<button id="nav-songs" class="btn-primary" style="background: transparent; color: var(--text-primary); box-shadow: none;">Songs</button>
					<button id="nav-setlists" class="btn-primary" style="background: transparent; color: var(--text-primary); box-shadow: none;">Setlists</button>
				</nav>
			</header>
			<main id="main-content" style="flex: 1; margin-top: 1.5rem; position: relative; overflow: hidden; display: flex; flex-direction: column;">
				<div class="glass-panel" style="height: 100%; display: flex; align-items: center; justify-content: center;">
					<p style="color: var(--text-secondary);">Connecting to database...</p>
				</div>
			</main>
		`;

		// Navigation Handlers
		document.getElementById('nav-songs').onclick = () => renderSongList(document.getElementById('main-content'));
		document.getElementById('nav-setlists').onclick = () => renderSetlistList(document.getElementById('main-content'));
	}

	const connected = await connectDB();

	if (connected) {
		const route = () => {
			const currentHash = window.location.hash;
			if (currentHash === '#live') {
				console.log("Routing to Live Display...");
				import('./views/liveDisplay').then(m => m.renderLiveDisplay(app));
			} else {
				// Re-render the main app structure if it was replaced by live display or not yet rendered
				if (!document.getElementById('main-content')) {
					app.innerHTML = `
										<header class="glass-panel" style="margin-top: 1rem; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
											<h1>Setlist Manager</h1>
											<nav style="display: flex; gap: 1rem;">
												<button id="nav-songs" class="btn-primary" style="background: transparent; color: var(--text-primary); box-shadow: none;">Songs</button>
												<button id="nav-setlists" class="btn-primary" style="background: transparent; color: var(--text-primary); box-shadow: none;">Setlists</button>
											</nav>
										</header>
										<main id="main-content" style="flex: 1; margin-top: 1.5rem; position: relative; overflow: hidden; display: flex; flex-direction: column;"></main>
								`;
					document.getElementById('nav-songs').onclick = () => renderSongList(document.getElementById('main-content'));
					document.getElementById('nav-setlists').onclick = () => renderSetlistList(document.getElementById('main-content'));
				}
				renderSongList(document.getElementById('main-content'));
			}
		};

		window.addEventListener('hashchange', route);
		route();
	} else {
		// If connection failed and we're NOT in live mode, show error (live mode handles its own errors or just stays transparent)
		if (!isLiveMode) {
			const mainContent = document.getElementById('main-content');
			if (mainContent) {
				mainContent.innerHTML = `
					<div class="glass-panel" style="height: 100%; display: flex; flexDirection: column; align-items: center; justify-content: center; border-color: #ef4444;">
						<p style="color: #ef4444; font-weight: bold;">Database Connection Failed</p>
						<p style="color: var(--text-secondary); margin-top: 0.5rem;">Please ensure SurrealDB is running.</p>
						<code style="background: #000; padding: 0.5rem; border-radius: 4px; margin-top: 1rem; color: #a1a1aa;">surreal start --user ${config.database.user} --pass ${config.database.pass} --bind 0.0.0.0:${config.database.port} rocksdb://./surrealdb</code>
					</div>
				`;
			}
		}
	}
}

init();
