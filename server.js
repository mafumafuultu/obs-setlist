const http = require('http');
const fs = require('fs');
const mime = require('mime-types');
const path = require('path');
const {Server} = require('socket.io');
const {Surreal} = require('surrealdb.node');

const CONFIG = {
	"host": "127.0.0.1",
	"port": 3000,
	"username": "obs-setlist",
	"password": "obs-setlist",
	"dbport" : 8000
};

const ARG = process.argv.reduce((o, v) => {
	switch(v) {
		case '-log': o.log = true; break;
		default: 
	}
	return o;
}, {});

try {
	let data = fs.readFileSync('./config.json', 'utf-8');
	let {host, port, username, password, dbport} = JSON.parse(data);

	if (host && port && username && password && dbport) {
		Object.assign(CONFIG, {host, port, username, password, dbport});
	} else {
		console.error( `"config.json" requires "host", "port", "username", "password" and "dbport". Due to an invalid "config.json", the execution will proceed with the default settings.` );
	}
} catch (e) {
	console.error(e);
}

const db = new Surreal();
const settings = {
	path: `ws://${CONFIG.host}:${CONFIG.dbport}/rpc`,
	signin: {
		namespace: 'ns',
		database: 'db',
		username: CONFIG.username,
		password: CONFIG.password,
	},
};

async function main() {
	try {
		await db.connect(settings.path);
		console.info('DB connection…');
		var version = await db.version();
		console.info(`SurrealDB verison: ${version}`);

		await db.signin(settings.signin);
		await db.use({ ns: 'ns', db: 'db' });
		console.info("DB connected");
	} catch (e) {
		console.error(e);
	}
}

main();

const server = http.createServer((req, res) => {
	var filePath = '.' + req.url;
	if (filePath == './') {
		filePath = './index.html';
	}
	var extname = String(path.extname(filePath)).toLowerCase();
	var contentType = mime.lookup(filePath) || 'application/octet-stream';
	fs.readFile(filePath, function(err, content) {
		if (err) {
			if (err.code == 'ENOENT') {
				fs.readFile('./404.html', function(err, content) {
					res.writeHead(404, {'Content-Type': 'text/html'});
					res.end(content, 'utf-8');
				});
			} else {
				res.writeHead(500);
				res.end('Sorry, check with the site admin for err: ' + err.code + ' ..\n');
			}
		} else {
			res.writeHead(200, {'Content-Type': contentType});
			res.end(content, 'utf-8');
		}
	});
});

server.listen(CONFIG.port, CONFIG.host, () => {
	const url = `http://${CONFIG.host}:${CONFIG.port}`;
	console.info(`Server running at ${url}/`);
});


const STATUS = {
	setlist: '',
	record: {},
	setSetList(r) {
		this.record = r;
	},
	getSetLilst() {
		return this.record;
	},
	updateSetlist(title) {
		this.setlist = title;
	},
	getSetlist() {
		return this.setlist
	}
}

const io = new Server(server);
io.on('connection', socket => {
	console.debug('connected');
	['live', 'change'].forEach(v => {
		socket.on(`connect_${v}`, () => {
			console.debug(`connect_${v}`);
		});
		socket.on(`disconnect_${v}`, () => {
			console.debug(`disconnect_${v}`);
		});
	});

	socket.on('connect', msg => { console.debug(`connect: ${msg}`); });
	socket.on('disconnect', msg => { console.debug(`disconnect: ${msg}`); });

	socket.on('getAllsetlist', DBFN.getAllsetlist);
	socket.on('getSetlistItem',DBFN.getSetlist);

	socket.on('getSongs', async (msg) => {
		let songs = await db.select('songs');
		io.emit('updateSongs', songs);
	});

	socket.on('addSetlist', DBFN.addSetlist);
	socket.on('setItems', DBFN.setItems);
	socket.on('addSong', DBFN.addSong);
	socket.on('change_setlist', DBFN.changeSetList);
	socket.on('change_items', DBFN.changeItems);
	socket.on('change_songs', DBFN.changeSong);

	socket.on('send_setNext', msg => io.emit('setNext', msg));
	socket.on('send_openCurrent', () => io.emit('openCurrent', ''));
	socket.on('send_toFinish', msg => io.emit('checkToFinish', msg));
	socket.on('send_clear', () => io.emit(''))

	socket.on('del_setlist', DBFN.removeSetList);
	socket.on('del_fromsetlist', DBFN.removeItem);
	socket.on('del_song', DBFN.removeSong);
});

async function _getSetList(id) {
	let items = await db.query(`select id, no, songid.title as title, songid.artist as artist, songid.url as url, songid.tags ?? [] as tags from items where setlist = ${id} ORDER BY no;`);
	io.emit('updateItems', items);
}

const DBFN = {
	async getAllsetlist() {
		let setlist = await db.select('setlist');
		io.emit('updateSetlist', setlist);
	},
	async getSetlist(msg) {
		if (msg?.length === 0) return ;
		let record = JSON.parse(msg);
		console.log(record);
		STATUS.updateSetlist(record);
		io.emit('setTitle', record);
		let items = await db.query(`select id, no, songid.title as title, songid.artist as artist, songid.url as url, songid.tags ?? [] as tags from items where setlist = ${record.id} ORDER BY no;`);
		io.emit('updateItems', items);
	},
	async addSong(msg) {
		if (msg === '') return;
		let {title, artist, url, tags} = JSON.parse(msg);
		await db.create('songs', {
			title,
			artist,
			url,
			tags
		});
	},
	async addSetlist(title) {
		if (title === '') return;
		await db.create('setlist', {
			title
		});
	},
	async changeSetList(msg) {
		let {id, title} = JSON.parse(msg);
		await db.update(id, {
			title
		});
	},
	async changeItems(msg) {
		let title = STATUS.getSetlist();
		if (title === '') return ;
		var data = JSON.parse(msg);
		data.data.forEach(async v => {
			await db.query(`UPDATE ${v.id} SET no = ${v.no};`);
		});
		_getSetList(data.id);
	},
	async setItems(msg) {
		let title = STATUS.getSetlist();
		if (title === '') return ;
		let data = JSON.parse(msg);
		data.data.forEach(async v => {
			await db.query(`CREATE items SET setlist = "${data.id}", no = count(select * from items where setlist = ${data.id}), songid = "${v}";`);
		});
		_getSetList(data.id);
	},
	async changeSong(msg) {
		let data = JSON.parse(msg);
		let {title, artist, url, tags} = data;
		await db.query(`UPDATE ${data.id} SET title=$title, artist=$artist, url=$url, tags=$tags;`, {
			title, artist, url, tags
		});
	},
	async removeSetList(msg) {
		let {id} = JSON.parse(msg);
		let setlist = id;
		await db.query(`DELETE items WHERE setlist=$setlist;`, {
			setlist
		});
		await db.query(`delete $setlist;`, {
			setlist
		}); 
	},
	async removeItem(msg) {
		let datas = JSON.parse(msg);
		await db.query(`
		FOR $target IN $items {
			DELETE $target;
		}`, {items: datas.items});
	},
	async removeSong(msg) {
		let datas = JSON.parse(msg);
		await db.query(`
		FOR $target IN $items {
			DELETE items WHERE songid=$target;
			DELETE songs WHERE id = $target;
		}`, {items: datas.items});
	}
}
