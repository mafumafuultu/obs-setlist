import db from '../lib/db';
import { SearchBar } from '../components/searchBar';
import { Pagination } from '../components/pagination';
import { Modal } from '../components/modal';

export async function renderSongList(container) {
	container.innerHTML = '<div style="text-align: center; margin-top: 2rem;">Loading songs...</div>';

	let songs = [];
	try {
		console.log("Fetching songs...");
		songs = await db.select('song');
		console.log("Fetched songs:", songs);
		if (!songs) songs = [];
		songs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
	} catch (err) {
		console.error(err);
		container.innerHTML = `<div style="color: #ef4444;">Error loading songs: ${err.message}</div>`;
		return;
	}

	// State
	let filteredSongs = [...songs];
	const PAGE_SIZE = 10;

	// Layout
	container.innerHTML = '';
	container.style.display = 'flex';
	container.style.flexDirection = 'column';
	container.style.height = '100%';
	container.style.overflow = 'hidden';

	// 1. Header & Actions
	const header = document.createElement('div');
	header.style.display = 'flex';
	header.style.justifyContent = 'space-between';
	header.style.alignItems = 'center';
	header.style.marginBottom = '1rem';

	const titleGroup = document.createElement('div');
	const title = document.createElement('h2');
	title.textContent = 'Library';
	titleGroup.appendChild(title);

	// Import/Export Buttons
	const ioGroup = document.createElement('div');
	ioGroup.style.display = 'flex';
	ioGroup.style.gap = '0.5rem';
	ioGroup.style.marginTop = '0.5rem';

	const importBtn = document.createElement('button');
	importBtn.textContent = 'Import JSON';
	importBtn.style.fontSize = '0.8rem';
	importBtn.style.color = 'var(--text-secondary)';
	importBtn.onclick = () => importSongs(() => reload());

	const exportBtn = document.createElement('button');
	exportBtn.textContent = 'Export JSON';
	exportBtn.style.fontSize = '0.8rem';
	exportBtn.style.color = 'var(--text-secondary)';
	exportBtn.onclick = () => exportSongs(songs);

	ioGroup.append(importBtn, exportBtn);
	titleGroup.appendChild(ioGroup);

	const addBtn = document.createElement('button');
	addBtn.textContent = '+ Add Song';
	addBtn.className = 'btn-primary';
	addBtn.onclick = () => openAddSongModal(() => reload());

	header.append(titleGroup, addBtn);
	container.appendChild(header);

	// 2. Search Bar Placeholder
	const searchContainer = document.createElement('div');
	container.appendChild(searchContainer);

	// 3. Pagination Container (Moved here)
	const paginationContainer = document.createElement('div');
	container.appendChild(paginationContainer);

	// 4. Table Container
	const tableContainer = document.createElement('div');
	tableContainer.className = 'glass-panel';
	tableContainer.style.flex = '1';
	tableContainer.style.overflowY = 'auto';
	tableContainer.style.display = 'flex';
	tableContainer.style.flexDirection = 'column';
	container.appendChild(tableContainer);

	const tableEl = document.createElement('table');
	tableEl.style.width = '100%';
	tableEl.style.borderCollapse = 'collapse';
	tableEl.style.textAlign = 'left';

	const thead = document.createElement('thead');
	thead.style.background = 'var(--bg-secondary)'; // Solid background for sticky
	thead.style.position = 'sticky';
	thead.style.top = '0';
	thead.style.zIndex = '1';
	thead.style.borderBottom = '1px solid var(--glass-border)';
	thead.innerHTML = `
	<tr>
		<th style="padding: 1rem; color: var(--text-secondary); background: inherit;">Title</th>
		<th style="padding: 1rem; color: var(--text-secondary); background: inherit;">Artist</th>
		<th style="padding: 1rem; color: var(--text-secondary); background: inherit;">Links</th>
		<th style="padding: 1rem; color: var(--text-secondary); background: inherit;">Tags</th>
		<th style="padding: 1rem; color: var(--text-secondary); text-align: right; background: inherit;">Actions</th>
	</tr>
	`;
	tableEl.appendChild(thead);

	const tbody = document.createElement('tbody');
	tableEl.appendChild(tbody);
	tableContainer.appendChild(tableEl);

	tableContainer.appendChild(tableEl);

	// --- Components Logic ---

	const renderTableRows = (page) => {
		tbody.innerHTML = '';
		const start = (page - 1) * PAGE_SIZE;
		const paginatedItems = filteredSongs.slice(start, start + PAGE_SIZE);

		if (paginatedItems.length === 0) {
			tbody.innerHTML = '<tr><td colspan="5" style="padding: 2rem; text-align: center; color: var(--text-secondary);">No songs found</td></tr>';
			return;
		}

		paginatedItems.forEach(song => {
			const tr = document.createElement('tr');
			tr.style.borderBottom = '1px solid var(--glass-border)';
			tr.style.transition = 'background 0.2s';
			tr.onmouseover = () => tr.style.background = 'rgba(255,255,255,0.02)';
			tr.onmouseout = () => tr.style.background = 'transparent';

			const karaokeLink = song.karaoke_url ? `<a href="${song.karaoke_url}" target="_blank" title="Karaoke" style="text-decoration: none; margin-right: 8px;">🎤</a>` : '<span style="opacity: 0.2; margin-right: 8px;">🎤</span>';
			const lyricsLink = song.lyrics_url ? `<a href="${song.lyrics_url}" target="_blank" title="Lyrics" style="text-decoration: none;">📝</a>` : '<span style="opacity: 0.2;">📝</span>';

			tr.innerHTML = `
		<td style="padding: 1rem; font-weight: 500;">${song.title}</td>
		<td style="padding: 1rem; color: var(--text-secondary);">${song.artist}</td>
		<td style="padding: 1rem; font-size: 1.2rem;">${karaokeLink}${lyricsLink}</td>
		<td style="padding: 1rem;">${(song.tags || []).map(t => `<span style="background: rgba(129, 140, 248, 0.2); color: #818cf8; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; margin-right: 4px;">${t}</span>`).join('')}</td>
		<td style="padding: 1rem; text-align: right;">
			<button class="edit-btn" style="color: var(--accent-primary); opacity: 0.7; margin-right: 0.5rem;">Edit</button>
			<button class="delete-btn" style="color: #ef4444; opacity: 0.7;">Delete</button>
		</td>
		`;

			tr.querySelector('.edit-btn').onclick = (e) => {
				e.stopPropagation();
				openEditSongModal(song, () => reload());
			};

			tr.querySelector('.delete-btn').onclick = async (e) => {
				e.stopPropagation();
				new Modal({
					title: 'Delete Song',
					content: `Are you sure you want to delete "<strong>${song.title}</strong>"?`,
					confirmText: 'Delete',
					onConfirm: () => {
						db.delete(song.id).then(() => reload());
						return true;
					}
				});
			};

			tbody.appendChild(tr);
		});
	};

	const pagination = new Pagination(paginationContainer, {
		pageSize: PAGE_SIZE,
		totalItems: filteredSongs.length,
		onPageChange: (page) => renderTableRows(page),
	});

	new SearchBar(searchContainer, {
		data: songs,
		keys: ['title', 'artist', 'tags'],
		onSearch: (results) => {
			filteredSongs = results;
			pagination.updateTotal(filteredSongs.length);
			renderTableRows(1);
		}
	});

	renderTableRows(1);
	pagination.render();

	function reload() {
		renderSongList(container);
	}
}

function createSongForm(initialData = {}, artists = [], allTags = []) {
	const form = document.createElement('div');
	form.style.position = 'relative'; // for suggest dropdown
	const artistDatalistId = `artist-suggestions-${Math.random().toString(36).substring(2, 11)}`;

	form.innerHTML = `
	<div style="margin-bottom: 1rem;">
		<label style="display: block; color: var(--text-secondary); margin-bottom: 0.5rem; font-size: 0.9rem;">Title</label>
		<input id="song-title" type="text" value="${initialData.title || ''}" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); padding: 0.8rem; border-radius: 8px; color: white; outline: none; box-sizing: border-box;">
	</div>
	<div style="margin-bottom: 1rem;">
		<label style="display: block; color: var(--text-secondary); margin-bottom: 0.5rem; font-size: 0.9rem;">Artist</label>
		<input id="song-artist" type="text" list="${artistDatalistId}" value="${initialData.artist || ''}" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); padding: 0.8rem; border-radius: 8px; color: white; outline: none; box-sizing: border-box;">
		<datalist id="${artistDatalistId}">
			${artists.map(a => `<option value="${a}">`).join('')}
		</datalist>
	</div>
	<div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
		<div style="flex: 1;">
			<label style="display: block; color: var(--text-secondary); margin-bottom: 0.5rem; font-size: 0.9rem;">Karaoke URL</label>
			<input id="song-karaoke" type="text" value="${initialData.karaoke_url || ''}" placeholder="https://..." style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); padding: 0.8rem; border-radius: 8px; color: white; outline: none; box-sizing: border-box;">
		</div>
		<div style="flex: 1;">
			<label style="display: block; color: var(--text-secondary); margin-bottom: 0.5rem; font-size: 0.9rem;">Lyrics URL</label>
			<input id="song-lyrics" type="text" value="${initialData.lyrics_url || ''}" placeholder="https://..." style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); padding: 0.8rem; border-radius: 8px; color: white; outline: none; box-sizing: border-box;">
		</div>
	</div>
	<div style="margin-bottom: 1rem; position: relative;">
		<label style="display: block; color: var(--text-secondary); margin-bottom: 0.5rem; font-size: 0.9rem;">Tags</label>
		<input id="song-tags" type="text" autocomplete="off" value="${(initialData.tags || []).join(', ')}" placeholder="anime, rock, chill" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); padding: 0.8rem; border-radius: 8px; color: white; outline: none; box-sizing: border-box;">
		<div id="tag-suggestions" class="glass-panel" style="display: none; position: absolute; top: 100%; left: 0; right: 0; z-index: 1000; max-height: 200px; overflow-y: auto; margin-top: 4px; box-shadow+ 0 4px 20px rgba(0,0,0,0.4);"></div>
	</div>
	`;

	const taginput = form.querySelector('#song-tags');
	const suggestionsDiv = form.querySelector('#tag-suggestions');
	let selectedIndex = -1;

	const getActiveTag = () => {
		const val = taginput.value;
		const pos = taginput.selectionStart;
		const parts = val.split(',');
		let currentOffset = 0;
		for (let i = 0, l = parts.length; i < l; i++) {
			const part = parts[i];
			const start = currentOffset;
			const end = currentOffset + part.length;
			if (start <= pos && pos <= end + 1) {
				return {text: part.trim(), index: i, start: end};
			}
			currentOffset = end + 1;
		}
		return {text: '', index: 0, start: 0, end: 0};
	};

	const showSugegstions = (query) => {
		if (!query) {
			suggestionsDiv.style.display = 'none';
			return;
		}
		const matches = allTags.filter(t => t.toLowerCase().includes(query.toLowerCase()));
		if (matches.length === 0) {
			suggestionsDiv.style.display = 'none';
			return;
		}

		suggestionsDiv.innerHTML = matches.map((m, i) => `
			<div class="suggestion-item" data-value="${m}" style="padding: 0.6rem 1rem; cursor: pointer; border-bottom: 1px solid var(--glass-border); font-size: 0.9rem; ${i == selectedIndex ? 'background: var(--accent-primary); color: #000;' : ''}">
				${m}
			</div>
		`).join('');
		suggestionsDiv.style.display = 'block';

		suggestionsDiv.querySelectorAll('.tag-suggestion-item').forEach((item, i) => {
			item.onclick = () => selectSuggestion(item.dataset.value);
			item.onmouseenter = () => {
				selectedIndex = i;
				updateSelectionStyles();
			};
		});
	};

	const updateSelectionStyles = () => {
		suggestionsDiv.querySelectorAll('.suggestion-item').forEach((item, i) => {
			item.style.background = i === selectedIndex ? 'var(--accent-primary)' : 'transparent';
			item.style.color = i === selectedIndex ? '#000' : 'white';
		});
	};

	const selectSuggestion = (value) => {
		const active = getActiveTag();
		const val = taginput.value;
		const parts = val.split(',');
		parts[active.index] = active.index === 0 ? value : ' ' + value;

		taginput.value = parts.join(',');
		suggestionsDiv.style.display = 'none';
		selectedIndex = -1;
		taginput.focus();

		const newPos = parts.slice(0, active.index + 1).join(',').length;
		taginput.setSelectionRange(newPos, newPos);
	};

	taginput.oninput = () => {
		const active = getActiveTag();
		selectedIndex = -1;
		showSugegstions(active.text);
	};

	taginput.onkeydown = (e) => {
		if (suggestionsDiv.style.display === 'block') {
			const items = suggestionsDiv.querySelectorAll('.suggestion-item');
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				selectedIndex = (selectedIndex + 1) % items.length;
				updateSelectionStyles();
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				selectedIndex = (selectedIndex - 1 + items.length) % items.length;
				updateSelectionStyles();
			} else if (e.key === 'Enter' && 0 <= selectedIndex) {
				e.preventDefault();
				selectSuggestion(items[selectedIndex].dataset.value);
			} else if (e.key === 'Escape') {
				suggestionsDiv.style.display = 'none';
			}
		}
	};

	taginput.onblur = () => {
		setTimeout(() => {
			suggestionsDiv.style.display = 'none';
		}, 200);
	};

	return form;
}

export async function openAddSongModal(onSuccess) {
	const songs = await db.select('song').catch(() => []);
	const artists = [...new Set(songs.map(s => s.artist).filter(Boolean))].sort();
	const tags = [...new Set(songs.flatMap(s => s.tags || []).filter(Boolean))].sort();
	const form = createSongForm({}, artists, tags);
	new Modal({
		title: 'Add New Song',
		content: form,
		width: '700px',
		confirmText: 'Create Song',
		onConfirm: () => {
			const title = form.querySelector('#song-title').value;
			const artist = form.querySelector('#song-artist').value;
			const karaoke_url = form.querySelector('#song-karaoke').value;
			const lyrics_url = form.querySelector('#song-lyrics').value;
			const tagsStr = form.querySelector('#song-tags').value;

			if (!title || !artist) {
				alert("Title and Artist are required");
				return false;
			}

			const tags = tagsStr ? [...new Set(tagsStr.split(',').map(s => s.trim()).filter(Boolean))] : [];

			db.create('song', {
				title,
				artist,
				karaoke_url,
				lyrics_url,
				tags,
				created_at: new Date().toISOString(),
			}).then(() => {
				onSuccess();
			}).catch(err => {
				alert(err.message);
			});
			return true;
		}
	});
}

export async function openEditSongModal(song, onSuccess) {
	const songs = await db.select('song').catch(() => []);
	const artists = [...new Set(songs.map(s => s.artist).filter(Boolean))].sort();
	const tags = [...new Set(songs.flatMap(s => s.tags || []).filter(Boolean))].sort();
	const form = createSongForm(song, artists, tags);
	new Modal({
		title: 'Edit Song',
		content: form,
		width: '700px',
		confirmText: 'Save Changes',
		onConfirm: () => {
			const title = form.querySelector('#song-title').value;
			const artist = form.querySelector('#song-artist').value;
			const karaoke_url = form.querySelector('#song-karaoke').value;
			const lyrics_url = form.querySelector('#song-lyrics').value;
			const tagsStr = form.querySelector('#song-tags').value;

			if (!title || !artist) {
				alert("Title and Artist are required");
				return false;
			}
			const tags = tagsStr ? [...new Set(tagsStr.split(',').map(s => s.trim()).filter(Boolean))] : [];

			db.merge(song.id, {
				title,
				artist,
				karaoke_url,
				lyrics_url,
				tags
			}).then(() => onSuccess()).catch(err => alert(err.message));
			return true;
		}
	});
}

function exportSongs(songs) {
	const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(songs, null, 2));
	const downloadAnchorNode = document.createElement('a');
	downloadAnchorNode.setAttribute("href", dataStr);
	downloadAnchorNode.setAttribute("download", "songs_export_" + new Date().toISOString().slice(0, 10) + ".json");
	document.body.appendChild(downloadAnchorNode);
	downloadAnchorNode.click();
	downloadAnchorNode.remove();
}

function importSongs(onSuccess) {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = '.json';
	input.onchange = (e) => {
		const file = e.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = async (event) => {
			try {
				const json = JSON.parse(event.target.result);
				if (!Array.isArray(json)) throw new Error("Invalid JSON: Must be an array");

				let count = 0;
				for (const item of json) {
					if (item.title && item.artist) {
						await db.create('song', {
							title: item.title,
							artist: item.artist,
							karaoke_url: item.karaoke_url || '',
							lyrics_url: item.lyrics_url || '',
							tags: Array.isArray(item.tags) ? item.tags : [],
							created_at: new Date().toISOString()
						});
						count++;
					}
				}
				alert(`Imported ${count} songs successfully.`);
				onSuccess();
			} catch (err) {
				alert("Import failed: " + err.message);
			}
		};
		reader.readAsText(file);
	};
	input.click();
}
