const g = {
	source:{
		setlist: [],
		itemlist: [],
		songs: [],
	},
	Status: {
		_setlist : {},
		setRecord(rec) {
			this._setlist = rec;
		},
		getTitle() {
			return this._setlist.title;
		},
		getID() {
			return this._setlist.id;
		}
	}
};
const page = 'change';
const gridTheme = {
	style: {font: '14px sans-serif'},
	headerStyle: {font: '14px sans-serif'},
};

const onload = () => document.readyState !== 'complete'
	? new Promise(r => document.addEventListener('readystatechange', () => {
		switch (document.readyState) {
			case 'complete': r();break;
			default:
		}
	}))
	: Promise.resolve();

const toNext = new cheetahGrid.columns.action.ButtonAction({
	action(rec) {
		let title = rec.title.trim();
		if (title) {
			g.io.emit('send_setNext', title);
		}
	}
});
const oepnCurrent = new cheetahGrid.columns.action.ButtonAction({
	action(rec) {
		g.io.emit('send_openCurrent', '');
	}
});
const openURL = new cheetahGrid.columns.action.ButtonAction({
	action(rec) {
		let url = rec.url.trim();
		if (url) {
			var anchor = document.createElement('a');
			anchor.href = `${url}`;
			anchor.target = '_Blank';
			anchor.click();
			anchor = null;
		}
	},
});

const openSetList = new cheetahGrid.columns.action.ButtonAction({
	action(rec) {
		ID('currentsetlist').textContent = `${rec.title}`;
		g.Status.setRecord(rec);
		g.io.emit('getSetlistItem', JSON.stringify(rec));
	},
});
const splArr = v => v?.split(',').map(e => e.trim()).filter(e => e != null && e !== '');
const colSearch = value => {
	const flVal = splArr(value);
	return flVal.length === 0
		? null
		: record => {
			let vs = Object.values(record);
			return flVal.every(val => vs.some(col => Array.isArray(col)
					? col.some(x => `${x}`.search(val) != -1)
					: `${col}`.search(val) != -1))
		};
};

onload().then(_ => {
	init();
});

function init() {
	g.io = io();
	g.io.on(`connect`, console.log);
	g.io.emit(`connect_${page}`, 'connect');

	g.io.on('updateSetlist', DBFN.updateSetlist);
	g.io.on('updateItems', DBFN.updateItems)
	g.io.on('updateSongs', DBFN.updateSongs);

	createGrids();
	init_events();
	window.onbeforeunload = function() {

	}
}

function createGrids() {
	createSetList();
	createSetListItem();
	createSongTable();
}

function init_events() {
	g.io.emit('getSongs', '');
	g.io.emit('getAllsetlist', '');
	setlistDialogEvents();
	songDialogevents();
}

function setlistDialogEvents() {
	const show = ID('showNewSetlist'),
		dialog = ID('newSetlist'),
		title = ID('setlistTitle'),
		cancel = ID('cancelSetlist'),
		ok = ID('addSetlist');;

	show.addEventListener('click', () => dialog.showModal());
	title.addEventListener('input', () => {
		title.setCustomValidity('');
		title.checkValidity();
	});
	title.addEventListener('invalid', () => {
		if (title.value.trim() === '') title.setCustomValidity('required');
	});
	dialog.addEventListener('close', () => {
		if (dialog.returnValue !== '_cancel') g.io.emit('addSetlist', dialog.returnValue);
		[...Q('#newSetlist input')].forEach(el => el.value = '');
		setTimeout(()=> g.io.emit('getAllsetlist', ''), 1000);
	});
	cancel.addEventListener('click', e => {
		e.preventDefault();
		dialog.close('_cancel');
	});
	ok.addEventListener('click', () => {
		let t = title.value.trim();
		if (t.length === 0) return;
		dialog.close(t);
	});
}

function songDialogevents() {
	const show = ID('showNewSongs'),
		dialog = ID('newSong'),
		title = ID('songtitle'),
		artist = ID('songArtist'),
		url = ID('songURL'),
		tags = ID('songTags'),
		cancel = ID('cancelSong'),
		ok = ID('addSong');

	show.addEventListener('click', () => dialog.showModal());
	title.addEventListener('input', () => {
		title.setCustomValidity('');
		title.checkValidity();
	});
	title.addEventListener('invalid', () => { if (title.value.trim() === '') title.setCustomValidity('required'); });
	dialog.addEventListener('close', () => {
		if (dialog.returnValue !== '_cancel') g.io.emit('addSong', dialog.returnValue);
		[...Q('#newSong input')].forEach(el => el.value = '');
		setTimeout(() => g.io.emit('getSongs', ''), 1000);
	});
	cancel.addEventListener('click', e => {
		e.preventDefault();
		dialog.close('_cancel');
	});
	ok.addEventListener('click', () => {
		let t = title.value.trim();
		if (t.length === 0) return;
		dialog.close(JSON.stringify({
			title: t,
			artist: artist.value.trim(),
			url: url.value.trim(),
			tags: splArr(tags.value)
		}));
	});
}

const DBFN = {
	updateSetlist(record) { g.source.setlist = record; UP_DATASOURCE.setlist(); },
	updateItems(record) { g.source.itemlist = record; UP_DATASOURCE.items(); },
	updateSongs(record) { g.source.songs = record; UP_DATASOURCE.songs(); },

	addSetlist(json) {io.emit('addSetlist', json)},
	addItems(json) {

	},
	addSong(json) {},


	getSetlistItem(title) {
		g.io.emit('getSetlistItem', title);
	}
};

const UP_DATASOURCE = {
	_toDataSource(data, length) {
		const getData = index => data[index] || (data[index] = {});
		let source = new cheetahGrid.data.CachedDataSource({
			get(index) {
				return getData(index);
			},
			length
		});
		return new cheetahGrid.data.FilterDataSource( source );
	},
	setlist() {
		let length = g.source.setlist.length;
		g.setlist.dataSource = this._toDataSource(g.source.setlist, length);
	},
	items() {
		let length = g.source.itemlist.length;
		g.itemlist.dataSource = this._toDataSource(g.source.itemlist, length);
	},
	songs() {
		let length = g.source.songs.length;
		g.songlist.dataSource = this._toDataSource(g.source.songs, length);
	},
};


function createSetList() {
	let {style, headerStyle} = gridTheme;
	g.setlist = new cheetahGrid.ListGrid({
		parentElement: document.querySelector('#setlists'),
		header : [
			{field: 'title', caption: 'Title', action: 'input', width: 220, style, headerStyle},
			{width: 70, columnType : new cheetahGrid.columns.type.ButtonColumn({caption: 'load'}), action: openSetList, style, headerStyle},
		],
	});
	UP_DATASOURCE.setlist();
	g.setlist.listen('changed_value', (...args) => {
		args.forEach(v => {
			if (v.oldValue === v.value) return;
			g.io.emit('change_setlist', JSON.stringify(v.record));
		});
	});

}

function createSetListItem() {

	ID('updateItems').addEventListener('click', () => {
		let id = g.Status.getID();
		if (id?.length) {
			let arr = g.source.itemlist;
			arr.sort((a, b) => a.no - b.no);
			let data = {
				id,
				data: arr.map((v, i)=> ({id: v.id, no: i}))
			};
			g.io.emit('change_items', JSON.stringify(data));
		}
	});
	ID('toFinish').addEventListener('click', () => {
		let id = g.Status.getID();
		if (id?.length) {
			let arr = g.source.itemlist.filter(v => v.check === true).map(v => v.title);
			g.io.emit('send_toFinish', arr);
		}
	})
	let {style, headerStyle} = gridTheme;

	g.itemlist = new cheetahGrid.ListGrid({
		parentElement: document.querySelector('#itemList'),
		header: [
			{ field: 'check', caption: '', width: 50, columnType: 'check', action: 'check', headerType: 'check', headerAction: 'check', style, headerStyle},
			{ field: 'no', caption: 'No', sort: true, width: 80, columnType: 'number', action: new cheetahGrid.columns.action.SmallDialogInputEditor({ type: 'number', classList: ['al-right'], }), style, headerStyle},
			{ caption: '', columnType: new cheetahGrid.columns.type.ButtonColumn({caption: 'Next'}), width: 50, action: toNext, style, headerStyle},
			{ caption: '', columnType: new cheetahGrid.columns.type.ButtonColumn({caption: 'oepn'}), width: 50, action: oepnCurrent, style, headerStyle},
			{ field: 'title', caption: 'Title', width: 200, style, headerStyle},
			{ field: 'artist', caption: 'Artist', width: 200, style, headerStyle},
			{ field: 'url', caption: 'URL', width: 250, style, headerStyle},
			{ caption: 'link', columnType: new cheetahGrid.columns.type.ButtonColumn({ caption: 'link', }), width: 50, action: openURL, style, headerStyle},
			{ field: 'tags', caption: 'Tags', width: 250, style, headerStyle},
		],
		frozenColCount: 2,
	});
	UP_DATASOURCE.items();
	g.itemlist.listen('changed_value', (...args) => {
		args.forEach(v => {
			if (v.field === 'check') return;
		})
	});

	const search = document.querySelector('#itemsearch');

	search.addEventListener('input', () => {
		g.itemlist.dataSource.filter = colSearch(search.value);
		g.itemlist.invalidate();
	});
}

function createSongTable() {
	ID('addItems').addEventListener('click', () => {
		let items = g.source.songs.filter(v => v.check === true);
		let id = g.Status.getID();
		if (id?.length) {
			var data = {
				id,
				data: items.map(v => v.id)
			};
			g.io.emit('setItems', JSON.stringify(data));
		}
	});

	let {style, headerStyle} = gridTheme;

	g.songlist = new cheetahGrid.ListGrid({
		// Parent element on which to place the grid
		parentElement: document.querySelector('#songs'),
		// Header definition
		header: [
			{ field: 'check', caption: '', width: 50, columnType: 'check', action: 'check', headerType: 'check', headerAction: 'check', style, headerStyle,},
			{ field: 'title', caption: 'Title', width: 200, action: 'input', style, headerStyle },
			{ field: 'artist', caption: 'Artist', width: 200, action: 'input', style, headerStyle },
			{ field: 'url', caption: 'URL', width: 250, action: 'input', style, headerStyle },
			{ caption: 'link' , columnType: new cheetahGrid.columns.type.ButtonColumn({ caption: 'link', }), width: 50, action: openURL, style, headerStyle },
			{ field: 'tags', caption: 'Tags', width: 250, action: 'input', style, headerStyle },
		],
		frozenColCount: 2,
	});
	UP_DATASOURCE.songs();
	g.songlist.listen('changed_value', (...args) => {
		args.forEach(v => {
			switch (v.field) {
				case 'check': return;
				case 'tags': v.record.tags = splArr(v.record.tags); break;
				default:
			}
			g.io.emit('change_songs', JSON.stringify(v.record));
		});
	});

	const search = document.querySelector('#songsearch');
	var xx = 'aa'


	search.addEventListener('input', () => {
		g.songlist.dataSource.filter = colSearch(search.value);
		g.songlist.invalidate();
	});
}