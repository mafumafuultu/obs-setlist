const g = {};
const page = 'live'
const onload = () => document.readyState !== 'complete'
	? new Promise(r => document.addEventListener('readystatechange', () => {
		switch (document.readyState) {
			case 'complete': r();break;
			default:
		}
	}))
	: Promise.resolve();

onload().then(_ => {
	init();
});

function init() {
	g.io = io();
	g.io.on(`connect`, console.log);
	g.io.emit(`connect_${page}`, 'connect');
	g.io.on('setNext', setNext);
	g.io.on('setTitle', setTitle);
	g.io.on('openCurrent', openCurrent);
	g.io.on('checkToFinish', toFinish);
	window.onbeforeunload = function() {
	}
}

const ani = {
	wait: 'leSnake',
	in: 'leFadeInRight',
	out: 'leFadeOutLeft',
};


function toFinish(items) {
	console.log(items);
	let finish = ID('list_finished');
	var el = items.map(txt => createtag('li', {cls: 'cssanimation sequence hide', txt}));
	[...Q('#list_finished > li')].map(v => (v.textContent)).map(v => (setAnimateSequence(v), v)).forEach(v => v.classList.add(ani.out));

	setTimeout(() => {
		finish.innerHTML = '';
		finish.append(...el);
		el.forEach(li => {
			setAnimateSequence(li)
			li.classList.add(ani.in);
			li.classList.remove('hide');
		});
		setTimeout(() => {
			el.forEach(li => {
				li.textContent = li.textContent;
			});
		}, 2500);
	}, 2500);
}

function setTitle(setlistTitle) {
	ID('setlist_name').textContent = setlistTitle;
}

function setNext(nextTitle) {
	let current = ID('currentsong');
	let txt = current.textContent.trim();
	current.classList.add(ani.out);
	current.classList.remove(ani.wait);
	if (txt === '') {
		setTimeout(() => {
			current.classList.add('hide');
			current.classList.remove(ani.in);
			current.classList.remove(ani.out);
			current.innerHTML = '';
			current.textContent = nextTitle;

			setAnimateSequence(current);
		}, 2500);
	} else {
		let li = createtag('li', {cls: 'cssanimation sequence hide', txt});
		ID('list_finished').append(li);

		setTimeout(function() {
			setAnimateSequence(li);
			li.classList.add(ani.in);
			li.classList.remove('hide');

			current.classList.add('hide');
			current.classList.remove(ani.in);
			current.classList.remove(ani.out);
			current.innerHTML = '';

			setTimeout(function() {
				li.innerHTML = li.textContent;
			}, 2500);

			current.textContent = nextTitle;
			setAnimateSequence(current);
		}, 2500);
	}
}

function openCurrent() {
	let current = ID('currentsong')
	current.classList.add(ani.in);
	current.classList.remove('hide');
	setTimeout(function() {
		current.classList.remove(ani.in);
		current.classList.add(ani.wait);
	}, 2500);
}

function setAnimateSequence(el) {for ( var n = [el], a = 0; a < n.length; a++ ) { var e = n[a], t = e.innerHTML; t = t.trim(); var i = '', m = 100; for (l = 0; l < t.length; l++) ' ' != t[l] ? ( i += '<span style="animation-delay:' + m + 'ms; -moz-animation-delay:' + m + 'ms; -webkit-animation-delay:' + m + 'ms; ">' + t[l] + '</span>', m += 150 ) : i += t[l]; e.innerHTML = i }}
