export class Modal {
	constructor({ title, content, onConfirm, confirmText = 'Confirm' }) {
		this.title = title;
		this.content = content; // HTML string or Element
		this.onConfirm = onConfirm;
		this.confirmText = confirmText;
		this.overlay = null;
		this.render();
	}

	render() {
		this.overlay = document.createElement('div');
		this.overlay.style.position = 'fixed';
		this.overlay.style.top = '0';
		this.overlay.style.left = '0';
		this.overlay.style.width = '100vw';
		this.overlay.style.height = '100vh';
		this.overlay.style.background = 'rgba(0, 0, 0, 0.7)';
		this.overlay.style.backdropFilter = 'blur(4px)';
		this.overlay.style.display = 'flex';
		this.overlay.style.alignItems = 'center';
		this.overlay.style.justifyContent = 'center';
		this.overlay.style.zIndex = '1000';
		this.overlay.style.opacity = '0';
		this.overlay.style.transition = 'opacity 0.2s';

		const panel = document.createElement('div');
		panel.className = 'glass-panel';
		panel.style.width = '400px';
		panel.style.padding = '2rem';
		panel.style.transform = 'scale(0.95)';
		panel.style.transition = 'transform 0.2s';

		const h2 = document.createElement('h2');
		h2.textContent = this.title;
		h2.style.marginBottom = '1.5rem';

		const body = document.createElement('div');
		if (typeof this.content === 'string') {
			body.innerHTML = this.content;
		} else {
			body.appendChild(this.content);
		}
		body.style.marginBottom = '2rem';

		const actions = document.createElement('div');
		actions.style.display = 'flex';
		actions.style.justifyContent = 'flex-end';
		actions.style.gap = '1rem';

		const cancelBtn = document.createElement('button');
		cancelBtn.textContent = 'Cancel';
		cancelBtn.style.color = 'var(--text-secondary)';
		cancelBtn.style.padding = '0.5rem 1rem';
		cancelBtn.onclick = () => this.close();

		const confirmBtn = document.createElement('button');
		confirmBtn.className = 'btn-primary';
		confirmBtn.textContent = this.confirmText;
		confirmBtn.onclick = () => {
			if (this.onConfirm()) {
				this.close();
			}
		};

		actions.append(cancelBtn, confirmBtn);
		panel.append(h2, body, actions);
		this.overlay.appendChild(panel);

		document.body.appendChild(this.overlay);

		// Animate in
		requestAnimationFrame(() => {
			this.overlay.style.opacity = '1';
			panel.style.transform = 'scale(1)';
		});
	}

	close() {
		this.overlay.style.opacity = '0';
		this.overlay.querySelector('.glass-panel').style.transform = 'scale(0.95)';
		setTimeout(() => {
			this.overlay.remove();
		}, 200);
	}
}
