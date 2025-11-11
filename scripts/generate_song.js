import fs from "fs";
import path from "path";

const RAW_FILE = "data/songs_raw.json";
const OUTPUT_FILE = "data/song_of_the_day.json";

async function main() {
  console.log("🎵 Generiere Song des Tages...");

  // Songs laden
  const songs = JSON.parse(fs.readFileSync(RAW_FILE, "utf-8"));

  // Song des Tages bestimmen
  const song = songs[new Date().getDate() % songs.length];
  const key = `${song.artist} - ${song.title}`;

  console.log(`🎶 Ausgewählt: ${key}`);

  // Ergebnis zusammenstellen
  const result = {
    date: new Date().toISOString().slice(0, 10),
    artist: song.artist,
    title: song.title,
    lyrics: song.lyrics
  };

  // Ausgabeordner sicherstellen
  fs.mkdirSync("data", { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));

  console.log(`✅ Fertig: ${OUTPUT_FILE} aktualisiert.`);
}

main();
