import db from '../lib/db';
import { SearchBar } from '../components/searchBar';
import { Pagination } from '../components/pagination';
import { Modal } from '../components/modal';
import { renderSetlistDetail } from './setlistDetail';

export async function renderSetlistList(container) {
	container.innerHTML = '<div style="text-align: center; margin-top: 2rem;">Loading setlists...</div>';

	let setlists = [];
	try {
		setlists = await db.select('setlist');
		if (!setlists) setlists = [];
		setlists.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
	} catch (err) {
		console.error(err);
		container.innerHTML = `<div style="color: #ef4444;">Error loading setlists: ${err.message}</div>`;
		return;
	}

	// State
	let filteredSetlists = [...setlists];
	const PAGE_SIZE = 10;

	// Layout
	container.innerHTML = '';

	// Header
	const header = document.createElement('div');
	header.style.display = 'flex';
	header.style.justifyContent = 'space-between';
	header.style.alignItems = 'center';
	header.style.marginBottom = '1rem';

	const titleGroup = document.createElement('div');
	const title = document.createElement('h2');
	title.textContent = 'Setlists';
	titleGroup.appendChild(title);

	// Import/Export
	const ioGroup = document.createElement('div');
	ioGroup.style.display = 'flex';
	ioGroup.style.gap = '0.5rem';
	ioGroup.style.marginTop = '0.5rem';

	const importBtn = document.createElement('button');
	importBtn.textContent = 'Import JSON';
	importBtn.style.fontSize = '0.8rem';
	importBtn.style.color = 'var(--text-secondary)';
	importBtn.onclick = () => importSetlists(() => reload());

	const exportBtn = document.createElement('button');
	exportBtn.textContent = 'Export JSON';
	exportBtn.style.fontSize = '0.8rem';
	exportBtn.style.color = 'var(--text-secondary)';
	exportBtn.onclick = () => exportSetlists(setlists);

	ioGroup.append(importBtn, exportBtn);
	titleGroup.appendChild(ioGroup);

	const addBtn = document.createElement('button');
	addBtn.textContent = '+ New Setlist';
	addBtn.className = 'btn-primary';
	addBtn.onclick = () => openCreateSetlistModal(() => reload());

	header.append(titleGroup, addBtn);
	container.appendChild(header);

	// Search
	const searchContainer = document.createElement('div');
	container.appendChild(searchContainer);

	// Grid/List Container
	const gridContainer = document.createElement('div');
	gridContainer.style.display = 'grid';
	gridContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
	gridContainer.style.gap = '1.5rem';
	container.appendChild(gridContainer);

	// Pagination
	const paginationContainer = document.createElement('div');
	container.appendChild(paginationContainer);

	// Handlers
	const renderItems = (page) => {
		gridContainer.innerHTML = '';
		const start = (page - 1) * PAGE_SIZE;
		const items = filteredSetlists.slice(start, start + PAGE_SIZE);

		if (items.length === 0) {
			gridContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 2rem;">No setlists found</div>';
			return;
		}

		items.forEach(setlist => {
			const card = document.createElement('div');
			card.className = 'glass-panel';
			card.style.padding = '1.5rem';
			card.style.position = 'relative';
			card.style.transition = 'transform 0.2s, box-shadow 0.2s';
			card.style.cursor = 'default'; // Card itself is container
			// Hover effect for card
			card.onmouseover = () => {
				card.style.transform = 'translateY(-2px)';
				card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
			};
			card.onmouseout = () => {
				card.style.transform = 'none';
				card.style.boxShadow = 'none';
			};

			const d = new Date(setlist.event_date);
			const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
			const songCount = setlist.songs ? setlist.songs.length : 0;

			// Card Content
			// We make the title/info clickable to go to detail
			const content = document.createElement('div');
			content.style.cursor = 'pointer';
			content.onclick = () => renderSetlistDetail(container, setlist.id);
			content.innerHTML = `
		<div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
		  <h3 style="font-size: 1.25rem; color: var(--text-primary); margin: 0;">${setlist.title}</h3>
		  <span style="font-size: 0.85rem; color: var(--text-secondary); background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px;">${date}</span>
		</div>
		<div style="color: var(--text-secondary); font-size: 0.9rem;">
		  ${songCount} songs
		</div>
	  `;

			// Actions Footer
			const actions = document.createElement('div');
			actions.style.marginTop = '1rem';
			actions.style.paddingTop = '1rem';
			actions.style.borderTop = '1px solid var(--glass-border)';
			actions.style.display = 'flex';
			actions.style.justifyContent = 'flex-end';
			actions.style.gap = '0.5rem';

			const editBtn = document.createElement('button');
			editBtn.textContent = 'Edit';
			editBtn.style.fontSize = '0.8rem';
			editBtn.style.color = 'var(--text-secondary)';
			editBtn.onclick = (e) => {
				e.stopPropagation(); // prevent card click
				openEditSetlistModal(setlist, () => reload());
			};

			const deleteBtn = document.createElement('button');
			deleteBtn.textContent = 'Delete';
			deleteBtn.style.fontSize = '0.8rem';
			deleteBtn.style.color = '#ef4444';
			deleteBtn.onclick = (e) => {
				e.stopPropagation();
				new Modal({
					title: 'Delete Setlist',
					content: `Are you sure you want to delete "<strong>${setlist.title}</strong>"?`,
					confirmText: 'Delete',
					onConfirm: () => {
						db.delete(setlist.id).then(() => reload());
						return true;
					}
				});
			};

			actions.append(editBtn, deleteBtn);

			card.appendChild(content);
			card.appendChild(actions);
			gridContainer.appendChild(card);
		});
	};

	const pagination = new Pagination(paginationContainer, {
		pageSize: PAGE_SIZE,
		totalItems: filteredSetlists.length,
		onPageChange: renderItems,
	});

	// Pre-calculate searchable date formats for better fuzzy matching
	const setlistsWithSearchDates = setlists.map(s => {
		const d = new Date(s.event_date);
		const y = d.getFullYear();
		const m = d.getMonth() + 1;
		const day = d.getDate();
		const mm = String(m).padStart(2, '0');
		const dd = String(day).padStart(2, '0');

		// Formats: 2026-01-01, 20260101
		const searchable_date = `${y}-${mm}-${dd} ${y}${mm}${dd}`;
		return { ...s, searchable_date };
	});

	new SearchBar(searchContainer, {
		data: setlistsWithSearchDates,
		keys: ['title', 'searchable_date'],
		threshold: 0.05, // Extremely strict for dates to avoid overlapping matches like 01-01 and 01-21
		onSearch: (results) => {
			filteredSetlists = results;
			pagination.updateTotal(filteredSetlists.length);
			renderItems(1);
		}
	});

	renderItems(1);
	pagination.render();

	function reload() {
		renderSetlistList(container);
	}
}

function createSetlistForm(initialData = {}) {
	const form = document.createElement('div');
	form.innerHTML = `
	<div style="margin-bottom: 1rem;">
	  <label style="display: block; color: var(--text-secondary); margin-bottom: 0.5rem;">Title</label>
	  <input id="setlist-title" type="text" value="${initialData.title || ''}" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); padding: 0.8rem; border-radius: 8px; color: white; outline: none;">
	</div>
	<div style="margin-bottom: 1rem;">
	  <label style="display: block; color: var(--text-secondary); margin-bottom: 0.5rem;">Date</label>
	  <input id="setlist-date" type="date" value="${initialData.event_date ? new Date(initialData.event_date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); padding: 0.8rem; border-radius: 8px; color: white; outline: none;">
	</div>
  `;
	return form;
}

function openCreateSetlistModal(onSuccess) {
	const form = createSetlistForm();
	new Modal({
		title: 'Create Setlist',
		content: form,
		confirmText: 'Create',
		onConfirm: () => {
			const title = form.querySelector('#setlist-title').value;
			const date = form.querySelector('#setlist-date').value;

			if (!title) {
				alert("Title is required");
				return false;
			}

			db.create('setlist', {
				title,
				event_date: date ? new Date(date).toISOString() : new Date().toISOString(),
				songs: [],
				created_at: new Date().toISOString(),
			}).then(() => {
				onSuccess();
			}).catch(err => alert(err.message));
			return true;
		}
	});
}

function openEditSetlistModal(setlist, onSuccess) {
	const form = createSetlistForm(setlist);
	new Modal({
		title: 'Edit Setlist',
		content: form,
		confirmText: 'Save Changes',
		onConfirm: () => {
			const title = form.querySelector('#setlist-title').value;
			const date = form.querySelector('#setlist-date').value;

			if (!title) {
				alert("Title is required");
				return false;
			}

			db.merge(setlist.id, {
				title,
				event_date: date ? new Date(date).toISOString() : new Date().toISOString()
			}).then(() => onSuccess()).catch(err => alert(err.message));
			return true;
		}
	});
}

function exportSetlists(setlists) {
	const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(setlists, null, 2));
	const downloadAnchorNode = document.createElement('a');
	downloadAnchorNode.setAttribute("href", dataStr);
	downloadAnchorNode.setAttribute("download", "setlists_export_" + new Date().toISOString().slice(0, 10) + ".json");
	document.body.appendChild(downloadAnchorNode);
	downloadAnchorNode.click();
	downloadAnchorNode.remove();
}

function importSetlists(onSuccess) {
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
					if (item.title) {
						// Note: If importing songs with references, IDs must match or be re-mapped.
						// For MVP, assuming importing into same system or just ignoring songs if IDs invalid.
						await db.create('setlist', {
							title: item.title,
							event_date: item.event_date || new Date().toISOString(),
							songs: Array.isArray(item.songs) ? item.songs : [],
							created_at: new Date().toISOString()
						});
						count++;
					}
				}
				alert(`Imported ${count} setlists successfully.`);
				onSuccess();
			} catch (err) {
				alert("Import failed: " + err.message);
			}
		};
		reader.readAsText(file);
	};
	input.click();
}
