# OBS setlist
![](https://img.shields.io/static/v1?label=status&message=beta&color=red)
![](https://img.shields.io/static/v1?label=version&message=0.8.0&color=blue)

### require
* [NodeJS](https://nodejs.org/en/download/)
* [SurrealDB](https://docs.surrealdb.com/docs/installation/windows#installing-surrealdb-using-the-install-script)


### start

```sh
npm i #instal modules
npm run db #start Surreal
npm run start #server start
```

### OBS
Add soruce > Browser  
URL : `http://localhost:3000/setlist.html`

### Browser
URL : `http://localhost:3000/index.html`


### Config

#### Style
`config.css`

#### Server
`config.json`

```json
{
	"host": "127.0.0.1",
	"port": 3000,
	"username": "obs-setlist",
	"password": "obs-setlist",
	"dbport": 8000
}
```

`package.json`

```json
{
	"scripts" {
		"db": "surreal start --auth -u <username> -p <password> --bind <host>:<dbport> file:setlist.db",
	}
}
```

# import songs
The setlist database will be cleared and the data mentioned in songs.json will be registered.  

Execute command: `npm run import`

## create import data
`./songs.json`

```json
[
	{
		"artist": "artist name",
		"title": "song title",
		"url": "https://example.com",
		"tags": ["#search", "#index", "#tag"]
	}
]
```
