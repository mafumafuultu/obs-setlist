# OBS setlist
![](https://img.shields.io/badge/status-release-blue?style=flat)
![](https://img.shields.io/badge/version-1.1.1-blue?style=flat)
![](https://img.shields.io/badge/SurralDB-2.4.0-purple?style=flat)

[日本語 README](./README_JP.md)

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

## Live Overlay Customization

The live overlay (`#live`) appearance and layout can be customized in `src/config.js`.

### Switching Themes and Positions
You chan independently change the visual style and the layout:

```javascript
liveDisplay: {
    theme: 'default', // 'Visual style
    positon: 'left_top' // Placement on screen
    maxVisibleHistory: 10, // Auto scroll starting from this number of items
}
```
### Available Presets

#### Themes (`theme`)
- `default`
- `minimal`
- `neon`
- `cyberpunk`
- `elegance`

#### Positions (`position`)
- `top_left`
- `top_center`
- `top_right`
- `bottom_left`
- `bottom_center`
- `bottom_right`

### Customizing Styles
The `themes`  object in `config.js` defines visual properties:
- `fontFamily` : Font stack.
- `accentColor` : Highlight color.
- `nowPlayingBg` : Background color/blur.
- `historyColor` : History text color.
- `textShadow` : Glow effects.
- `fontSizes` : Font size.
  - `historyItem` : history list size.
  - `nowPlayingLabel` : 'NOW PLAYING' size.
  - `nowPlayingTitle` : Title size.
  - `nowPlayingArtist` : Artist name size.

### Customizing Positions
The `positions` object defines exact coordinates: 
- `top`, `bottom`, `left`, `right` : CSS values.
- `textAlign` : Text alignment inside boxes.
- `margin`, `width`, `transform` : (Advanced) Used for centering and fine-tuning.
