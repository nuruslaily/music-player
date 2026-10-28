import { useEffect, useRef, useState, type CSSProperties } from "react";
import { songs } from "./data/songs";
import {
  Leaf,
  Moon,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Waves,
} from "lucide-react";

type Theme = "cute" | "earth" | "mature" | "blue";

const themes: {
  id: Theme;
  label: string;
  icon: typeof Sparkles;
  color: string;
}[] = [
  { id: "blue", label: "Biru", icon: Waves, color: "#0f172a" },
  { id: "cute", label: "Lucu", icon: Sparkles, color: "#ffe9f3" },
  { id: "earth", label: "Bumi", icon: Leaf, color: "#e8efdd" },
  { id: "mature", label: "Dewasa", icon: Moon, color: "#14161a" },
];

const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem("theme");

  return stored === "cute" ||
    stored === "earth" ||
    stored === "mature" ||
    stored === "blue"
    ? stored
    : "mature";
};

function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [currentSong, setCurrentSong] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  const song = songs[currentSong];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);

    const color = themes.find((item) => item.id === theme)?.color;

    if (color) {
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", color);
    }
  }, [theme]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  const toggleShuffle = () => {
    setShuffle((prev) => !prev);
  };

  const nextSong = () => {
    if (shuffle) {
      let randomIndex;

      do {
        randomIndex = Math.floor(Math.random() * songs.length);
      } while (songs.length > 1 && randomIndex === currentSong);

      setCurrentSong(randomIndex);
    } else {
      setCurrentSong((prev) => (prev + 1) % songs.length);
    }
  };

  const prevSong = () => {
    if (shuffle) {
      let randomIndex;

      do {
        randomIndex = Math.floor(Math.random() * songs.length);
      } while (songs.length > 1 && randomIndex === currentSong);

      setCurrentSong(randomIndex);
    } else {
      setCurrentSong((prev) => (prev === 0 ? songs.length - 1 : prev - 1));
    }
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  };

  const handleSongEnd = () => {
    if (!audioRef.current) return;

    if (repeatMode === "one") {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    if (repeatMode === "all") {
      nextSong();
      return;
    }

    if (currentSong < songs.length - 1) {
      nextSong();
    } else {
      setIsPlaying(false);
    }
  };

  const updateProgress = () => {
    if (!audioRef.current) return;

    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration);

    const current =
      (audioRef.current.currentTime / audioRef.current.duration) * 100;

    setProgress(current || 0);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;

    const value = Number(e.target.value);

    audioRef.current.currentTime = (value / 100) * audioRef.current.duration;

    setProgress(value);
  };

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play();
    }
  }, [currentSong]);

  return (
    <div className="app-shell min-h-screen flex items-center justify-center p-3 sm:p-6">
      <div className="player-card w-full max-w-sm sm:max-w-md p-4 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-(--muted)">
            Theme
          </span>

          <div
            className="flex gap-1 rounded-full p-1"
            style={{ background: "var(--switcher-bg)" }}
          >
            {themes.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setTheme(item.id)}
                  title={item.label}
                  aria-label={`Tema ${item.label}`}
                  aria-pressed={theme === item.id}
                  className={`btn p-1.5 sm:p-2 ${
                    theme === item.id ? "btn-accent" : ""
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </button>
              );
            })}
          </div>
        </div>

        <img
          src={song.cover}
          alt={song.title}
          className="w-full aspect-square object-cover rounded-xl sm:rounded-2xl"
        />

        <div className="mt-5 text-center">
          <h2 className="text-xl sm:text-2xl font-bold truncate">
            {song.title}
          </h2>

          <p className="text-sm sm:text-base text-(--muted)">{song.artist}</p>
        </div>

        <div className="mt-5">
          <input
            type="range"
            value={progress}
            min="0"
            max="100"
            onChange={handleSeek}
            className="range"
            style={{ "--value": `${progress}%` } as CSSProperties}
          />

          <div className="flex justify-between text-xs sm:text-sm text-(--muted) mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex justify-center items-center gap-2 sm:gap-3 mt-6">
          <button
            onClick={toggleShuffle}
            title="Shuffle"
            className={`btn px-4 py-2 ${shuffle ? "btn-accent" : ""}`}
          >
            <Shuffle />
          </button>

          <button
            onClick={prevSong}
            title="Sebelumnya"
            className="btn p-2 sm:px-4 sm:py-2"
          >
            <SkipBack />
          </button>

          <button
            onClick={togglePlay}
            title={isPlaying ? "Pause" : "Play"}
            className="btn-accent p-3 sm:px-6 sm:py-2"
          >
            {isPlaying ? <Pause /> : <Play />}
          </button>

          <button
            onClick={nextSong}
            title="Berikutnya"
            className="btn px-4 py-2"
          >
            <SkipForward />
          </button>

          <button
            onClick={toggleRepeat}
            title="Repeat"
            className={`btn px-4 py-2 ${
              repeatMode === "off" ? "" : "btn-accent"
            }`}
          >
            {repeatMode === "one" ? <Repeat1 /> : <Repeat />}
          </button>
        </div>

        <div className="mt-8">
          <h3 className="font-semibold mb-3">Playlist</h3>

          <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto hide-scrollbar">
            {songs.map((item, index) => (
              <button
                key={index}
                onClick={() => setCurrentSong(index)}
                className={`playlist-item w-full text-left p-3 ${
                  currentSong === index ? "playlist-item-active" : ""
                }`}
              >
                <div className="font-medium truncate">{item.title}</div>

                <div className="text-xs sm:text-sm opacity-70 truncate">
                  {item.artist}
                </div>
              </button>
            ))}
          </div>
        </div>

        <audio
          ref={audioRef}
          src={song.src}
          onTimeUpdate={updateProgress}
          onEnded={handleSongEnd}
        />
      </div>
    </div>
  );
}

export default App;
