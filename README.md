# OBS setlist
![](https://img.shields.io/badge/status-release-blue?style=flat)
![](https://img.shields.io/badge/version-1.0.0-blue?style=flat)
![](https://img.shields.io/badge/SurralDB-2.4.0-purple?style=flat)

## Prerequisites
- [NodeJS](https://nodejs.org/en/download/)
- [SurrealDB](https://docs.surrealdb.com/docs/installation/windows#installing-surrealdb-using-the-install-script)


## Startup Instructions

You need to run two terminal processes simultaneously.

### 1. Start the Database
Open a terminal and run:

```bash
npm run db
```

### 2. Start the Application
Open a **new** terminal window in the project directory and run:

```bash
npm run dev
```

Then open the URL shown (usually `http://localhost:5173`) in your browser.

## Shutdown Instructions

To stop the application completely:

1.  **Stop Frontend**: In the terminal running `npm run dev`, press `Ctrl + C` to stop the server.
2.  **Stop Database**: In the terminal running the `surreal start` command, press `Ctrl + C` key to stop the database.

## Features
- **Songs**: Manage your library with fuzzy search, karaoke/lyrics links.
- **Setlists**: Create setlists, drag-and-drop songs from library.
- **Import/Export**: Backup your data to JSON.
- **Live Overlay**: Customizable OBS overlay for VTubers.

## Database Configuration

Database connection settings are managed in `src/config.js`:

```javascript
export const config = {
    database: {
        host: '127.0.0.1',
        port: 8000,
        user: 'root',
        pass: 'root',
        namespace: 'song_manager',
        database: 'core'
    },
    // ...
};
```

> [!NOTE]
> If you change the `port` or `pass` here and you use `npm run db` to start SurrealDB, make sure to also update the `db` script in `package.json`.

## Live Overlay Themes

The live overlay (`#live`) appearance can be customized in `src/config.js`.

### Switching Themes
Change the `theme` property in `src/config.js`:
```javascript
export const config = {
    liveDisplay: {
        theme: 'neon', // 'default', 'minimal', or 'neon'
    },
    // ...
};
```

### Creating/Customizing Themes
Each theme in the `themes` object contains the following properties:

- **Style**:
  - `fontFamily`: The font used for all text.
  - `accentColor`: Primary color for labels.
  - `nowPlayingBg`: Background color/transparency for the "Now Playing" box.
  - `historyColor`: Text color for the history list.
  - `blur`: Backdrop blur intensity (e.g., `10px`).
  - `textShadow`: (Optional) Glow effect.

- **Positioning**:
  Each element (`nowPlaying` and `history`) has its own coordinates:
  - `top`, `bottom`, `left`, `right`: CSS coordinates (e.g., `"2rem"`).
  - `textAlign`: `"left"`, `"center"`, or `"right"`.

Example theme structure:
```javascript
custom: {
    fontFamily: "'Inter', sans-serif",
    accentColor: "#ffffff",
    // ... other styles
    nowPlaying: { top: "2rem", left: "2rem", textAlign: "left" },
    history: { top: "10rem", left: "2rem", textAlign: "left" }
}
```
