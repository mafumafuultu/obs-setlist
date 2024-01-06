
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
	var socket = io();
	socket.on(`connect`, console.log);
	socket.emit(`connect_${page}`, 'connect');
	window.onbeforeunload = function() {
			
	}
}

const ani = {
	wait: 'leSnake',
	in: 'leFadeInRight',
	out: 'leFadeOutLeft',
};

function setNext(nextTitle) {
	let current = ID('currentsong');
	current.classList.add(ani.out);
	current.classList.remove(ani.wait);
	let txt = current.textContent;
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
