import Fuse from 'fuse.js';

export class SearchBar {
	constructor(container, { data, onSearch, keys = ['title', 'artist', 'tags'], placeholder = 'Fuzzy Search...', threshold = 0.3 }) {
		this.container = container;
		this.data = data;
		this.onSearch = onSearch;
		this.placeholder = placeholder;
		this.fuse = new Fuse(data, {
			keys,
			threshold, // 0.0 = perfect match, 1.0 = match anything
			includeScore: true,
			shouldSort: true,
			useExtendedSearch: true,
		});

		this.render();
	}

	updateData(newData) {
		this.data = newData;
		this.fuse.setCollection(newData);
	}

	render() {
		this.container.innerHTML = '';

		const wrapper = document.createElement('div');
		wrapper.className = 'glass-panel';
		wrapper.style.padding = '1rem';
		wrapper.style.marginBottom = '1.5rem';
		wrapper.style.display = 'flex';
		wrapper.style.alignItems = 'center';

		const icon = document.createElement('span');
		icon.innerHTML = '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>';
		icon.style.marginRight = '0.75rem';
		icon.style.color = 'var(--text-secondary)';

		const input = document.createElement('input');
		input.type = 'text';
		input.placeholder = this.placeholder;
		input.style.background = 'transparent';
		input.style.border = 'none';
		input.style.color = 'var(--text-primary)';
		input.style.fontSize = '1.1rem';
		input.style.width = '100%';
		input.style.outline = 'none';
		input.style.fontFamily = 'inherit';

		input.addEventListener('input', (e) => {
			const query = e.target.value.trim();
			if (!query) {
				this.onSearch(this.data); // Return all data
			} else {
				const results = this.fuse.search(query);
				this.onSearch(results.map(r => r.item));
			}
		});

		wrapper.append(icon, input);
		this.container.appendChild(wrapper);

		// Auto-focus input
		setTimeout(() => input.focus(), 0);
	}
}
