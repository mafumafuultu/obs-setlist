export const config = {
	database: {
		host: '127.0.0.1',
		port: 8000,
		user: 'root',
		pass: 'root',
		namespace: 'song_manager',
		database: 'core'
	},
	liveDisplay: {
		theme: 'neon', // 'default', 'minimal', 'neon'
	},
	themes: {
		default: {
			fontFamily: "'Outfit', sans-serif",
			accentColor: "#ec4899",
			nowPlayingBg: "rgba(0, 0, 0, 0.6)",
			historyColor: "rgba(255, 255, 255, 0.7)",
			blur: "10px",
			borderRight: "4px solid #ec4899",
			// Independent Positions
			nowPlaying: {
				bottom: "4rem",
				left: "2rem",
				textAlign: "left"
			},
			history: {
				bottom: "12rem",
				left: "2rem",
				textAlign: "left"
			}
		},
		minimal: {
			fontFamily: "'Inter', sans-serif",
			accentColor: "#ffffff",
			nowPlayingBg: "rgba(0, 0, 0, 0.2)",
			historyColor: "rgba(255, 255, 255, 0.5)",
			blur: "0px",
			borderRight: "2px solid #ffffff",
			nowPlaying: {
				top: "2rem",
				left: "2rem",
				textAlign: "left"
			},
			history: {
				top: "12rem",
				left: "2rem",
				textAlign: "left"
			}
		},
		neon: {
			fontFamily: "'monospace'",
			accentColor: "#00f3ff",
			nowPlayingBg: "rgba(10, 10, 30, 0.8)",
			historyColor: "rgba(0, 243, 255, 0.6)",
			blur: "5px",
			borderRight: "4px solid #00f3ff",
			textShadow: "0 0 10px #00f3ff",
			nowPlaying: {
				top: "2rem",
				left: "2rem",
				textAlign: "left"
			},
			history: {
				top: "12rem",
				left: "2rem",
				textAlign: "left"
			}
		}
	}
};
