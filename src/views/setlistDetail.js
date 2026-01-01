import db from '../lib/db';
import { SearchBar } from '../components/searchBar';
import { renderSetlistList } from './setlistList';
import { openEditSongModal } from './songList';

export async function renderSetlistDetail(container, setlistId) {
	container.innerHTML = '<div style="text-align: center; margin-top: 2rem;">Loading details...</div>';

	let setlist;
	let allSongs = [];
	try {
		// Fetch setlist
		const setlistResult = await db.select(setlistId);
		setlist = Array.isArray(setlistResult) ? setlistResult[0] : setlistResult;

		if (!setlist) throw new Error("Setlist not found");

		// Fetch ALL songs for the library panel
		allSongs = await db.select('song');
		if (!allSongs) allSongs = [];
		allSongs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

		// Fetch actual song objects for the setlist items from the allSongs library
		if (setlist.songs && setlist.songs.length > 0) {
			console.log("Hydrating setlist from library. Raw IDs:", setlist.songs);

			const songMap = new Map();
			allSongs.forEach(s => {
				const fullId = String(s.id);
				songMap.set(fullId, s);
				const idPart = fullId.includes(':') ? fullId.split(':')[1] : fullId;
				songMap.set(idPart, s);
			});

			setlist.songs = setlist.songs.map(id => {
				const sid = String(id);
				const s = songMap.get(sid);
				if (s) return s;

				const idPart = sid.includes(':') ? sid.split(':')[1] : sid;
				return songMap.get(idPart);
			}).filter(s => s);

			console.log("Hydrated songs count:", setlist.songs.length);
		} else {
			setlist.songs = [];
		}

	} catch (err) {
		console.error(err);
		container.innerHTML = `<div style="color: #ef4444;">Error: ${err.message}</div>`;
		return;
	}

	// --- Layout ---
	container.innerHTML = '';
	container.style.display = 'flex';
	container.style.flexDirection = 'column';
	container.style.height = '100%';
	container.style.overflow = 'hidden';

	// Header
	const header = document.createElement('div');
	header.style.display = 'flex';
	header.style.justifyContent = 'space-between';
	header.style.alignItems = 'center';
	header.style.marginBottom = '1rem';

	const leftHeader = document.createElement('div');
	leftHeader.style.display = 'flex';
	leftHeader.style.alignItems = 'center';
	leftHeader.style.gap = '1rem';

	const backBtn = document.createElement('button');
	backBtn.textContent = '←';
	backBtn.style.background = 'transparent';
	backBtn.style.border = '1px solid var(--glass-border)';
	backBtn.style.color = 'var(--text-primary)';
	backBtn.style.fontSize = '1.2rem';
	backBtn.style.padding = '0.4rem 0.8rem';
	backBtn.style.borderRadius = '8px';
	backBtn.style.cursor = 'pointer';
	backBtn.onclick = () => renderSetlistList(container);

	const titleGroup = document.createElement('div');
	const title = document.createElement('h2');
	title.textContent = setlist.title;
	title.style.margin = '0';
	const d = new Date(setlist.event_date);
	const dateFormatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	const date = document.createElement('div');
	date.textContent = dateFormatted;
	date.style.color = 'var(--text-secondary)';
	date.style.fontSize = '0.9rem';

	titleGroup.append(title, date);
	leftHeader.append(backBtn, titleGroup);

	const status = document.createElement('div');
	status.className = 'save-status';
	status.style.color = 'var(--text-secondary)';
	status.style.fontSize = '0.9rem';

	const liveControl = document.createElement('div');
	liveControl.style.display = 'flex';
	liveControl.style.alignItems = 'center';
	liveControl.style.gap = '0.5rem';
	liveControl.innerHTML = `
		<button id="live-btn" class="btn-primary" style="background: #ef4444; border: none; font-size: 0.8rem;">Start Live</button>
		<button id="clear-live-btn" class="btn-primary" style="background: #f59e0b; color: #000; border: none; font-size: 0.8rem; display: none; margin-left: 0.5rem; box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);">Clear Overlay</button>
		<button id="clear-history-btn" class="btn-primary" style="background: #3f3f46; color: #fff; border: 1px solid #52525b; font-size: 0.8rem; margin-left: 0.5rem; box-shadow: none;">Clear History</button>
		<div id="live-indicator" style="width: 10px; height: 10px; border-radius: 50%; background: #ccc; margin-left: 0.5rem;"></div>
	`;

	header.append(leftHeader, liveControl, status);

	// Live UI State
	let isLive = false;

	// Fetch current live session state to restore if reloaded
	const sessionResult = await db.select('live_session:current').catch(() => null);
	const initialSession = Array.isArray(sessionResult) ? sessionResult[0] : sessionResult;
	if (initialSession && initialSession.status !== 'finished' && initialSession.current_setlist_id === setlistId) {
		console.log("Resuming live session active for this setlist");
		isLive = true;
	}

	const liveBtn = liveControl.querySelector('#live-btn');
	const clearBtn = liveControl.querySelector('#clear-live-btn');
	const clearHistoryBtn = liveControl.querySelector('#clear-history-btn');
	const indicator = liveControl.querySelector('#live-indicator');

	const updateLiveUI = () => {
		if (isLive) {
			liveBtn.textContent = 'Stop Live';
			indicator.style.background = '#ef4444';
			indicator.style.boxShadow = '0 0 10px #ef4444';
			clearBtn.style.display = 'block';
		} else {
			liveBtn.textContent = 'Start Live';
			indicator.style.background = '#ccc';
			indicator.style.boxShadow = 'none';
			clearBtn.style.display = 'none';
		}
	};

	liveBtn.onclick = async () => {
		if (!isLive) {
			// Check if we should resume or start fresh
			const sessionRes = await db.select('live_session:current').catch(() => null);
			const session = Array.isArray(sessionRes) ? sessionRes[0] : sessionRes;

			if (session && session.current_setlist_id === setlistId && session.status !== 'finished') {
				console.log("Resuming existing session status to waiting");
				await db.merge('live_session:current', { status: 'waiting' });
			} else {
				console.log("Starting fresh session, resetting history");
				await db.update('live_session:current', {
					status: 'waiting',
					current_setlist_id: setlistId,
					current_song_id: null,
					history: []
				});
			}
			isLive = true;
		} else {
			console.log("Stopping live session");
			await db.update('live_session:current', {
				status: 'finished',
				current_setlist_id: null,
				current_song_id: null,
				history: []
			});
			isLive = false;
		}
		updateLiveUI();
		renderSetlist();
	};

	clearBtn.onclick = async () => {
		console.log("Clearing live overlay...");
		try {
			const result = await db.select('live_session:current');
			const session = Array.isArray(result) ? result[0] : result;
			if (session) {
				const history = session.history || [];
				if (session.status === 'singing' && session.current_song_id) {
					const songResult = await db.select(session.current_song_id);
					const song = Array.isArray(songResult) ? songResult[0] : songResult;
					if (song) history.push({ title: song.title, artist: song.artist });
				}
				await db.merge('live_session:current', {
					status: 'waiting',
					current_song_id: null,
					history: history
				});
				console.log("Overlay cleared and current song moved to history");
			}
		} catch (err) {
			console.error("Failed to clear overlay:", err);
		}
	};

	clearHistoryBtn.onclick = async () => {
		if (!confirm('Clear sang songs history?')) return;
		console.log("Clearing live history...");
		try {
			await db.merge('live_session:current', {
				history: []
			});
			console.log("History cleared");
		} catch (err) {
			console.error("Failed to clear history:", err);
		}
	};

	container.appendChild(header);

	// Split View Container
	const splitView = document.createElement('div');
	splitView.style.display = 'grid';
	splitView.style.gridTemplateColumns = '1fr 1fr';
	splitView.style.gap = '1.5rem';
	splitView.style.flex = '1';
	splitView.style.minHeight = '0'; // Important for nested flex scroll
	container.appendChild(splitView);

	// --- LEFT COLUMN: Library ---
	const leftCol = document.createElement('div');
	leftCol.className = 'glass-panel';
	leftCol.style.display = 'flex';
	leftCol.style.flexDirection = 'column';
	leftCol.style.overflow = 'hidden';

	updateLiveUI();
	const leftColHeader = document.createElement('div');
	leftColHeader.style.padding = '1rem';
	leftColHeader.style.borderBottom = '1px solid var(--glass-border)';
	leftColHeader.style.background = 'var(--bg-secondary)';
	leftColHeader.innerHTML = '<h3 style="margin: 0; font-size: 1.1rem;">Library</h3>';

	// Left Search
	const searchContainer = document.createElement('div');
	searchContainer.style.padding = '0.5rem 1rem';

	// Left List
	const libraryList = document.createElement('div');
	libraryList.style.flex = '1';
	libraryList.style.overflowY = 'auto';
	libraryList.style.padding = '0.5rem';

	leftCol.append(leftColHeader, searchContainer, libraryList);
	splitView.appendChild(leftCol);

	// --- RIGHT COLUMN: Setlist ---
	const rightCol = document.createElement('div');
	rightCol.className = 'glass-panel';
	rightCol.style.display = 'flex';
	rightCol.style.flexDirection = 'column';
	rightCol.style.overflow = 'hidden';

	// Right Header
	const rightColHeader = document.createElement('div');
	rightColHeader.style.padding = '1rem';
	rightColHeader.style.borderBottom = '1px solid var(--glass-border)';
	rightColHeader.style.background = 'var(--bg-secondary)';
	rightColHeader.style.display = 'flex';
	rightColHeader.style.justifyContent = 'space-between';
	rightColHeader.style.alignItems = 'center';

	const countBadge = document.createElement('span');
	countBadge.textContent = `${setlist.songs.length} songs`;
	countBadge.style.background = 'rgba(255,255,255,0.1)';
	countBadge.style.padding = '2px 8px';
	countBadge.style.borderRadius = '12px';
	countBadge.style.fontSize = '0.8rem';

	const h3Right = document.createElement('h3');
	h3Right.textContent = 'Setlist';
	h3Right.style.margin = '0';
	h3Right.style.fontSize = '1.1rem';
	h3Right.style.display = 'flex';
	h3Right.style.gap = '0.5rem';
	h3Right.style.alignItems = 'center';
	h3Right.appendChild(countBadge);

	rightColHeader.appendChild(h3Right);

	// Right List
	const setlistList = document.createElement('div');
	setlistList.style.flex = '1';
	setlistList.style.overflowY = 'auto';
	setlistList.style.padding = '0.5rem';

	const updateDropHint = () => {
		if (setlist.songs.length === 0) {
			setlistList.innerHTML = `
				<div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-secondary); opacity: 0.5;">
					<span style="font-size: 2rem; margin-bottom: 0.5rem;">📥</span>
					<p>Drag songs here</p>
				</div>
			`;
		}
	};

	rightCol.append(rightColHeader, setlistList);
	splitView.appendChild(rightCol);


	// --- LOGIC ---

	// 1. Render Library
	let filteredLibrary = allSongs;

	const renderLibrary = () => {
		libraryList.innerHTML = '';
		filteredLibrary.forEach(song => {
			const el = document.createElement('div');
			el.className = 'song-item';
			el.draggable = true;
			el.style.padding = '0.75rem';
			el.style.marginBottom = '0.5rem';
			el.style.background = 'rgba(255,255,255,0.03)';
			el.style.borderRadius = '6px';
			el.style.cursor = 'grab';
			el.style.border = '1px solid transparent';

			el.innerHTML = `
				<div style="font-weight: 500; font-size: 0.95rem;">${song.title}</div>
				<div style="color: var(--text-secondary); font-size: 0.8rem;">${song.artist}</div>
			`;

			el.addEventListener('dragstart', (e) => {
				e.dataTransfer.setData('application/json', JSON.stringify(song));
				e.dataTransfer.effectAllowed = 'copy';
				el.style.opacity = '0.5';
			});

			el.addEventListener('dragend', () => {
				el.style.opacity = '1';
			});

			el.ondblclick = () => {
				addSongToSetlist(song);
			};

			libraryList.appendChild(el);
		});
	};

	new SearchBar(searchContainer, {
		data: allSongs,
		keys: ['title', 'artist', 'tags'],
		onSearch: (results) => {
			filteredLibrary = results;
			renderLibrary();
		}
	});

	renderLibrary();


	// 2. Render Setlist
	const renderSetlist = () => {
		if (setlist.songs.length === 0) {
			updateDropHint();
			return;
		}
		setlistList.innerHTML = '';

		setlist.songs.forEach((song, index) => {
			const el = document.createElement('div');
			el.draggable = true;
			el.style.display = 'flex';
			el.style.alignItems = 'center';
			el.style.padding = '0.75rem';
			el.style.marginBottom = '0.5rem';
			el.style.background = 'rgba(255,255,255,0.05)';
			el.style.borderRadius = '6px';
			el.style.cursor = 'grab';
			el.style.border = '1px solid var(--glass-border)';

			const karaokeLink = song.karaoke_url ? `<a href="${song.karaoke_url}" target="_blank" title="Karaoke" style="text-decoration: none; margin-right: 8px; font-size: 1.1rem;">🎤</a>` : '';
			const lyricsLink = song.lyrics_url ? `<a href="${song.lyrics_url}" target="_blank" title="Lyrics" style="text-decoration: none; font-size: 1.1rem;">📝</a>` : '';

			el.innerHTML = `
				<span style="color: var(--text-secondary); margin-right: 0.8rem; font-family: monospace;">${index + 1}.</span>
				<div style="flex: 1;">
					<div style="font-weight: 500; font-size: 0.95rem;">${song.title}</div>
					<div style="color: var(--text-secondary); font-size: 0.8rem;">${song.artist}</div>
				</div>
				<div style="margin-right: 1rem; display: flex; align-items: center;">
					${karaokeLink}${lyricsLink}
				</div>
				<button class="edit-song-btn" style="background: none; border: none; color: var(--accent-primary); cursor: pointer; opacity: 0.5; padding: 0.2rem; margin-right: 0.5rem; font-size: 0.8rem;">Edit</button>
				${isLive ? `<button class="play-song-btn" style="background: none; border: none; color: #10b981; cursor: pointer; padding: 0.2rem; margin-right: 0.5rem; font-size: 1.1rem;">▶</button>` : ''}
				<button class="remove-btn" style="background: none; border: none; color: #ef4444; cursor: pointer; opacity: 0.5; padding: 0.2rem;">✕</button>
			`;

			if (isLive) {
				const playBtn = el.querySelector('.play-song-btn');
				playBtn.onclick = async (e) => {
					e.stopPropagation();
					console.log("Play button clicked for:", song.title);
					try {
						let sessionResult = await db.select('live_session:current').catch(() => null);
						let session = Array.isArray(sessionResult) ? sessionResult[0] : sessionResult;

						// Fallback: If session record is missing, create it immediately
						if (!session) {
							console.warn("Live session record missing, creating now...");
							try {
								session = await db.create('live_session:current', {
									status: 'singing',
									current_setlist_id: setlistId,
									current_song_id: song.id,
									history: []
								});
							} catch (createErr) {
								// If creation fails (e.g. race condition), try one last select
								sessionResult = await db.select('live_session:current');
								session = Array.isArray(sessionResult) ? sessionResult[0] : sessionResult;
							}
						}

						if (!session) {
							console.error("Could not find or create live session record");
							return;
						}

						const history = session.history || [];

						// If something was already singing, move it to history
						if (session.status === 'singing' && session.current_song_id) {
							const currentSid = String(session.current_song_id);
							const newSid = String(song.id);

							if (currentSid !== newSid) {
								try {
									const prevSongResult = await db.select(session.current_song_id);
									const prevSong = Array.isArray(prevSongResult) ? prevSongResult[0] : prevSongResult;
									if (prevSong) {
										history.push({ title: prevSong.title, artist: prevSong.artist });
									}
								} catch (err) {
									console.warn("Failed to fetch previous song for history:", err);
								}
							} else {
								console.log("Song already playing, skipping update");
								return;
							}
						}

						const updateData = {
							status: 'singing',
							current_song_id: song.id,
							history: history
						};
						console.log("Merging live session update:", updateData);
						await db.merge('live_session:current', updateData);
						console.log("Live session merge successful");
					} catch (err) {
						console.error("Critical live update error:", err);
					}
				};
			}

			el.querySelector('.edit-song-btn').onclick = (e) => {
				e.stopPropagation();
				openEditSongModal(song, async () => {
					// Update the local setlist object and re-render
					// We need to find all instances of this song in the setlist and update them
					const updatedSongs = await db.select('song');
					const updatedSong = updatedSongs.find(s => String(s.id) === String(song.id));
					if (updatedSong) {
						setlist.songs = setlist.songs.map(s => String(s.id) === String(song.id) ? updatedSong : s);
						renderSetlist();
					}
				});
			};

			el.querySelector('.remove-btn').onclick = (e) => {
				e.stopPropagation();
				removeSongFromSetlist(index);
			};

			el.onmouseover = () => el.querySelector('.remove-btn').style.opacity = '1';
			el.onmouseout = () => el.querySelector('.remove-btn').style.opacity = '0.5';

			el.addEventListener('dragstart', (e) => {
				e.dataTransfer.setData('text/plain', index);
				e.dataTransfer.effectAllowed = 'move';
				el.style.opacity = '0.5';
			});

			el.addEventListener('dragend', () => {
				el.style.opacity = '1';
			});

			el.addEventListener('dragover', (e) => {
				e.preventDefault();
				el.style.background = 'rgba(255,255,255,0.1)';
			});

			el.addEventListener('dragleave', () => {
				el.style.background = 'rgba(255,255,255,0.05)';
			});

			el.addEventListener('drop', (e) => {
				e.preventDefault();
				el.style.background = 'rgba(255,255,255,0.05)';

				const jsonSong = e.dataTransfer.getData('application/json');
				if (jsonSong) {
					const song = JSON.parse(jsonSong);
					addSongToSetlist(song, index);
				} else {
					const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
					if (!isNaN(fromIndex)) {
						reorderSetlist(fromIndex, index);
					}
				}
			});

			setlistList.appendChild(el);
		});

		countBadge.textContent = `${setlist.songs.length} songs`;
	};

	setlistList.addEventListener('dragover', (e) => {
		e.preventDefault();
		setlistList.style.background = 'rgba(255,255,255,0.02)';
	});

	setlistList.addEventListener('dragleave', () => {
		setlistList.style.background = 'transparent';
	});

	setlistList.addEventListener('drop', (e) => {
		e.preventDefault();
		setlistList.style.background = 'transparent';
		if (e.target === setlistList || e.target.parentNode === setlistList) {
			const jsonSong = e.dataTransfer.getData('application/json');
			if (jsonSong) {
				const song = JSON.parse(jsonSong);
				addSongToSetlist(song);
			}
		}
	});

	renderSetlist();

	// --- Actions ---

	async function addSongToSetlist(song, atIndex = null) {
		if (atIndex !== null) {
			setlist.songs.splice(atIndex, 0, song);
		} else {
			setlist.songs.push(song);
		}
		renderSetlist();
		await saveSetlist();
	}

	async function removeSongFromSetlist(index) {
		setlist.songs.splice(index, 1);
		renderSetlist();
		await saveSetlist();
	}

	async function reorderSetlist(fromIndex, toIndex) {
		if (fromIndex === toIndex) return;
		const [moved] = setlist.songs.splice(fromIndex, 1);
		setlist.songs.splice(toIndex, 0, moved);
		renderSetlist();
		await saveSetlist();
	}

	async function saveSetlist() {
		status.textContent = 'Saving...';
		try {
			await db.merge(setlistId, {
				songs: setlist.songs.map(s => s.id)
			});
			status.textContent = 'Saved';
			setTimeout(() => status.textContent = '', 2000);
		} catch (err) {
			console.error(err);
			status.textContent = 'Error saving';
			status.style.color = '#ef4444';
		}
	}
}
