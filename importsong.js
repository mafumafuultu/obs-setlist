const fs = require('fs');
const {Surreal} = require('surrealdb.node');
const readline = require('readline/promises');
const ynStr = `[n]: Finish (default) [y]: Execute > `
const yn = async (fn) => {
	const readInterface = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	const string = await readInterface.question(ynStr);
	if ('' !== string) {
		let l = string.toLocaleLowerCase();
		switch(l) {
			case 'y': return readInterface.close(), fn();
			case 'n': return console.log('finish'), readInterface.close();
			default : readInterface.close(), yn(fn);
		}
	} else if ('' === string) {
		return console.log('finish'), readInterface.close();
	}
};

const CONFIG = {
	"host": "127.0.0.1",
	"port": 3000,
	"username": "obs-setlist",
	"password": "obs-setlist",
	"dbport" : 8000
};


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

	console.log('\nThe setlist database will be cleared and the data mentioned in "songs.json" will be registered.');
	yn(checkJson);
}

function checkJson() {
	try {
		let data = fs.readFileSync('./songs.json', 'utf-8');
		let songsArr = JSON.parse(data);
		if (Array.isArray(songsArr)) {
			if (songsArr.length) {
				console.info(`./songs.json is empty`);
				return;
			}
			let songs = songsArr.map(({title, artist, url, tags} = v) => ({title, artist, url, tags}));
			exec_clearAndImport(songs);
		}
	} catch (e) {
		console.error(e);
	}
}

async function exec_clearAndImport(songs) {
	await db.query('DELETE setlist;DELETE items;DELETE songs');
	songs.forEach(async song => {
		let {title, artist, url, tags} = song;
		await db.create('songs', {
			title,
			artist,
			url,
			tags
		});
	});
	console.info('\ncomplete!\nfinish');
}

main();