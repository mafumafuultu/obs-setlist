const g = {};
const page = 'change';
const onload = () => document.readyState !== 'complete'
	? new Promise(r => document.addEventListener('readystatechange', () => {
		switch (document.readyState) {
			case 'complete': r();break;
			default:
		}
	}))
	: Promise.resolve();

const openURL = new cheetahGrid.columns.action.ButtonAction({
	action(rec) {
		console.log(rec);
		alert(JSON.stringify(rec, null, "  "));
	},
});
const openSetList  = new cheetahGrid.columns.action.ButtonAction({
	action(rec) {
		console.log(rec);
		alert(JSON.stringify(rec, null, "  "));
	},
});

onload().then(_ => {
	init();
});


function init() {
	var socket = io();
	socket.on(`connect`, console.log);
	socket.emit(`connect_${page}`, 'connect');
	createGrids()
	
	window.onbeforeunload = function() {
			
	}
}

function createGrids() {
	createSetList();
	createSetListItem();
	createSongTable();
}

function createSetList() {
	var datas = ['aaaa', 'bbbb', 'cccc'].map(v => ({
		name: v
	}));

	const getDatass = (index) => datas[index] || (datas[index] = {name: `v ${index}`});


	g.setList = new cheetahGrid.ListGrid({
		parentElement: document.querySelector('#setlists'),
		header : [
			{field: 'name', caption: 'Title', action: 'input', width: 220},
			{width: 70, columnType : new cheetahGrid.columns.type.ButtonColumn({caption: 'load'})},
		],
	});
	g.setList.dataSource = new cheetahGrid.data.CachedDataSource({
		// Get record method
		get(index) {
		  return getDatass(index);
		},
		// Number of records
		length: 100,
	});
}

function createSetListItem() {
	var setlistTitle = 'Sample set list';
	var setlistSongs = new Array(20).fill({}).map((v, i) => {
		return {
			setlist: setlistTitle,
			no: i,
			title: `Title ${i}`,
			artist: `Artist ${i}`,
			url: `url ${i}`,
			tag: `tag ${i}`,
		}
	});

	g.itemList = new cheetahGrid.ListGrid({
		parentElement: document.querySelector('#itemList'),
		header: [
			{
				field: "check",
				caption: "",
				width: 50,
				columnType: "check",
				action: "check",
			},
			{ field: 'no', caption: 'No', sort: true, width: 80, columnType: 'number', action: new cheetahGrid.columns.action.SmallDialogInputEditor({ type: "number", classList: ["al-right"], })},
			{ field: "title", caption: "Title", width: 200 },
			{ field: "artist", caption: "Artist", width: 200,},
			{ field: "url", caption: "URL", width: 250,},
			{ caption: 'link' , columnType: new cheetahGrid.columns.type.ButtonColumn({ caption: "link", }), width: 50, action: openURL},
			{ field: "tag", caption: "Tags", width: 250,},
		],
		records: setlistSongs ,
		// Column fixed position
		frozenColCount: 2,
	});
}

function createSongTable() {
	var songs = [
		{title: 'sample2', artist: 'artist1', url: 'http://example.com', tag: 'test1,test2'},
		{title: 'sample1', artist: 'artist2', url: 'http://example.com', tag: 'test1,test3'},
		{title: 'sample2', artist: 'artist1', url: 'http://example.com', tag: 'test1,test2'},
		{title: 'sample1', artist: 'artist2', url: 'http://example.com', tag: 'test1,test3'},
		{title: 'sample2', artist: 'artist1', url: 'http://example.com', tag: 'test1,test2'},
		{title: 'sample1', artist: 'artist2', url: 'http://example.com', tag: 'test1,test3'},
		{title: 'sample2', artist: 'artist1', url: 'http://example.com', tag: 'test1,test2'},
		{title: 'sample1', artist: 'artist2', url: 'http://example.com', tag: 'test1,test3'},
		{title: 'sample2', artist: 'artist1', url: 'http://example.com', tag: 'test1,test2'},
		{title: 'sample1', artist: 'artist2', url: 'http://example.com', tag: 'test1,test3'},
		{title: 'sample2', artist: 'artist1', url: 'http://example.com', tag: 'test1,test2'},
		{title: 'sample1', artist: 'artist2', url: 'http://example.com', tag: 'test1,test3'},
		{title: 'sample2', artist: 'artist1', url: 'http://example.com', tag: 'test1,test2'},
		{title: 'sample1', artist: 'artist2', url: 'http://example.com', tag: 'test1,test3'},
		{title: 'sample2', artist: 'artist1', url: 'http://example.com', tag: 'test1,test2'},
		{title: 'sample1', artist: 'artist2', url: 'http://example.com', tag: 'test1,test3'},
		{title: 'sample2', artist: 'artist1', url: 'http://example.com', tag: 'test1,test2'},
		{title: 'sample1', artist: 'artist2', url: 'http://example.com', tag: 'test1,test3'},
		{title: 'sample2', artist: 'artist1', url: 'http://example.com', tag: 'test1,test2'},
		{title: 'sample1', artist: 'artist2', url: 'http://example.com', tag: 'test1,test3'},
		{title: 'sample2', artist: 'artist1', url: 'http://example.com', tag: 'test1,test2'},
		{title: 'sample1', artist: 'artist2', url: 'http://example.com', tag: 'test1,test3'},
		{title: 'sample2', artist: 'artist1', url: 'http://example.com', tag: 'test1,test2'},
		{title: 'sample1', artist: 'artist2', url: 'http://example.com', tag: 'test1,test3'},
		{title: 'sample2', artist: 'artist1', url: 'http://example.com', tag: 'test1,test2'},
		{title: 'sample1', artist: 'artist2', url: 'http://example.com', tag: 'test1,test3'},
		{title: 'sample2', artist: 'artist1', url: 'http://example.com', tag: 'test1,test2'},
		{title: 'sample1', artist: 'artist2', url: 'http://example.com', tag: 'test1,test3'},
		{title: 'sample2', artist: 'artist1', url: 'http://example.com', tag: 'test1,test2'},
		{title: 'sample1', artist: 'artist2', url: 'http://example.com', tag: 'test1,test3'},
		{title: 'sample2', artist: 'artist1', url: 'http://example.com', tag: 'test1,test2'},
		{title: 'sample1', artist: 'artist2', url: 'http://example.com', tag: 'test1,test3'},
	];

	g.songlist = new cheetahGrid.ListGrid({
		// Parent element on which to place the grid
		parentElement: document.querySelector("#songs"),
		// Header definition
		header: [
			{
				field: "check",
				caption: "",
				width: 50,
				columnType: "check",
				action: "check",
			},
			{ field: "songid", caption: "ID", width: 100 },
			{ field: "title", caption: "Title", width: 200, action: 'input' },
			{ field: "artist", caption: "Artist", width: 200, action: 'input'  },
			{ field: "url", caption: "URL", width: 250, action: 'input'  },
			{ caption: 'link' , columnType: new cheetahGrid.columns.type.ButtonColumn({ caption: "link", }), width: 50, action: openURL},
			{ field: "tag", caption: "Tags", width: 250, action: 'input'  },
		],
		// Array data to be displayed on the grid
		records: songs ,
		// Column fixed position
		frozenColCount: 2,
	  });
}
