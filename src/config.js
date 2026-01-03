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
		theme: 'default', // 'default', 'minimal', 'neon'
		position: 'top_left', // 'top_left', 'top_right', 'bottom_left', 'bottom_right'
	},
	positions: {
		top_left: {
			nowPlaying: {top: "2rem", left: "2rem", textAlign: "left"},
			history: {top: "15rem", left: "2rem", textAlign: "left"}
		},
		top_center: {
			nowPlaying: {top: "2rem", left: "0", right: "0", margin: "auto", width: "fit-content", textAlign: "center"},
			history: {top: "15rem", left: "0", right: "0", margin: "auto", width: "fit-content", textAlign: "center"}
		},
		top_right: {
			nowPlaying: {top: "2rem", right: "2rem", textAlign: "right"},
			history: {top: "15rem", right: "2rem", textAlign: "right"}
		},
		bottom_left: {
			nowPlaying: {bottom: "2rem", left: "2rem", textAlign: "left"},
			history: {bottom: "15rem", left: "2rem", textAlign: "left"}
		},
		bottom_center: {
			nowPlaying: {bottom: "2rem", left: "0", right: "0", margin: "auto", width: "fit-content", textAlign: "center"},
			history: {bottom: "15rem", left: "0", right: "0", margin: "auto", width: "fit-content", textAlign: "center"}
		},
		bottom_right: {
			nowPlaying: {bottom: "2rem", right: "2rem", textAlign: "right"},
			history: {bottom: "15rem", right: "2rem", textAlign: "right"}
		}
	},
	themes: {
		default: {
			fontFamily: "'Outfit', sans-serif",
			accentColor: "#ec4899",
			nowPlayingBg: "rgba(0, 0, 0, 0.6)",
			historyColor: "rgba(255, 255, 255, 0.7)",
			blur: "10px",
			borderRight: "4px solid #ec4899",
			fontSizes: {
				historyItem: "1.4rem",
				nowPlayingLabel: "1.8rem",
				nowPlayingTitle: "2.8rem",
				nowPlayingArtist: "2.1rem"
			}
		},
		default_left_bottom: {
			fontFamily: "'Outfit', sans-serif",
			accentColor: "#ec4899",
			nowPlayingBg: "rgba(0, 0, 0, 0.6)",
			historyColor: "rgba(255, 255, 255, 0.7)",
			blur: "10px",
			borderRight: "4px solid #ec4899",
			fontSizes: {
				historyItem: "1.4rem",
				nowPlayingLabel: "1.8rem",
				nowPlayingTitle: "2.8rem",
				nowPlayingArtist: "2.1rem"
			}
		},
		minimal: {
			fontFamily: "'Inter', sans-serif",
			accentColor: "#ffffff",
			nowPlayingBg: "rgba(0, 0, 0, 0.2)",
			historyColor: "rgba(255, 255, 255, 0.5)",
			blur: "0px",
			borderRight: "2px solid #ffffff",
			fontSizes: {
				historyItem: "1.4rem",
				nowPlayingLabel: "1.8rem",
				nowPlayingTitle: "2.8rem",
				nowPlayingArtist: "2.1rem"
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
			fontSizes: {
				historyItem: "1.4rem",
				nowPlayingLabel: "1.8rem",
				nowPlayingTitle: "2.8rem",
				nowPlayingArtist: "2.1rem"
			}
		},
		cyberpunk: {
			fontFamily: "'DotGothic16', sans-serif",
			accentColor: "#ff00ff",
			nowPlayingBg: "rgba(0, 0, 0, 0.8)",
			historyColor: "rgba(0, 255, 255, 0.8)",
			blur: "12px",
			borderRight: "4px solid #ff00ff",
			textShadow: "0 0 8px rgba(255,0,255,0.8), 0 0 15px rgba(0,255,255,0.4)",
			fontSizes: {
				historyItem: "1.4rem",
				nowPlayingLabel: "1.8rem",
				nowPlayingTitle: "2.8rem",
				nowPlayingArtist: "2.1rem"
			}
		},
		elegance: {
			fontFamily: "'Playfair Display', serif",
			accentColor: "#d3af37",
			nowPlayingBg: "rgba(255, 255, 255, 0.05)",
			historyColor: "rgba(255, 255, 255, 0.6)",
			blur: "20px",
			borderRight: "1px solid rgba(121, 175, 55, 0.5)",
			textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
			fontSizes: {
				historyItem: "1.4rem",
				nowPlayingLabel: "1.8rem",
				nowPlayingTitle: "2.8rem",
				nowPlayingArtist: "2.1rem"
			}
		}
	}
};
