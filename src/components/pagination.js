export class Pagination {
	constructor(container, { pageSize, totalItems, onPageChange }) {
		this.container = container;
		this.pageSize = pageSize;
		this.totalItems = totalItems;
		this.currentPage = 1;
		this.onPageChange = onPageChange;
	}

	updateTotal(newTotal) {
		this.totalItems = newTotal;
		this.currentPage = 1; // Reset to first page on total change (e.g. search filter)
		this.render();
	}

	render() {
		this.container.innerHTML = '';
		const totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;

		const wrapper = document.createElement('div');
		wrapper.style.display = 'flex';
		wrapper.style.alignItems = 'center';
		wrapper.style.gap = '1rem';
		wrapper.style.justifyContent = 'center';

		const prevBtn = document.createElement('button');
		prevBtn.textContent = '« Prev';
		prevBtn.className = 'btn-primary';
		prevBtn.disabled = this.currentPage === 1;
		prevBtn.style.opacity = this.currentPage === 1 ? '0.5' : '1';
		prevBtn.onclick = () => {
			if (this.currentPage > 1) {
				this.currentPage--;
				this.onPageChange(this.currentPage);
				this.render();
			}
		};

		const info = document.createElement('span');
		info.textContent = `Page ${this.currentPage} of ${totalPages}`;
		info.style.color = 'var(--text-secondary)';
		info.style.fontVariantNumeric = 'tabular-nums';

		const nextBtn = document.createElement('button');
		nextBtn.textContent = 'Next »';
		nextBtn.className = 'btn-primary';
		nextBtn.disabled = this.currentPage === totalPages;
		nextBtn.style.opacity = this.currentPage === totalPages ? '0.5' : '1';
		nextBtn.onclick = () => {
			if (this.currentPage < totalPages) {
				this.currentPage++;
				this.onPageChange(this.currentPage);
				this.render();
			}
		};

		wrapper.append(prevBtn, info, nextBtn);
		this.container.appendChild(wrapper);
	}
}
