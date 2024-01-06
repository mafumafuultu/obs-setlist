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
	"password": "obs-setlist"
};

try {
	let data = fs.readFileSync('./config.json', 'utf-8');
	let {host, port, username, password} = JSON.parse(data);
	
	if (host && port && username && password) {
		Object.assign(CONFIG, {host, port, username, password});
	} else {
		console.error( `"config.json" requires "host", "port", "username", and "password". Due to an invalid "config.json", the execution will proceed with the default settings.` );
	}
} catch (e) {console.error(e);}
const db = new Surreal();
const settings = {
	path: `ws://${CONFIG.host}:8000/rpc`,
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
	} catch (error) {
		console.error(error);
	}
}

async function addItem(param) {

	let cre = await db.create('setlist', {
		title: 'title',
		url: 'testuel',
		tag: ['names', 'tags'],
	});
	console.log('create');

	let bbb = await db.select('setlist');

	console.log('select');
	console.log(bbb);
	return bbb;
}

async function delItem(param) {

}

main();

const ROOTING = {
	// url: 'filepath'
	'/'           : './index.html',
	'/changelist' : './index.html',
	'/setlist'    : './setlist.html',
};


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

 

const EVENTS = {
};
const STATUS = {

}

server.listen(CONFIG.port, CONFIG.host, () => {
	const url = `http://${CONFIG.host}:${CONFIG.port}`;
	console.info(`Server running at ${url}/`);
});

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
	
	socket.on('connect', msg => {
		console.debug(`connect: ${msg}`);
	});
	socket.on('disconnect', msg => {
		console.debug(`disconnect: ${msg}`);
	});
});
