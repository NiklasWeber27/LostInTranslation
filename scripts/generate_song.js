import fs from "fs";
import path from "path";

const RAW_FILE = "data/songs_raw.json";
const CACHE_FILE = "data/cache_translations.json";
const OUTPUT_FILE = "data/song_of_the_day.json";

async function translateText(text, lang = "de") {
  const prompt = `Translate this song lyric from English to German in a poetic and natural way: ${text}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(prompt)}&langpair=en|de`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return data?.responseData?.translatedText || text;
  } catch (err) {
    console.error("⚠️ Fehler bei Übersetzung:", err);
    return text;
  }
}

async function main() {
  console.log("🎵 Generiere Song des Tages...");

  const songs = JSON.parse(fs.readFileSync(RAW_FILE, "utf-8"));
  const cache = fs.existsSync(CACHE_FILE)
    ? JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"))
    : {};

  const song = songs[new Date().getDate() % songs.length];
  const key = `${song.artist} - ${song.title}`;

  let translated = cache[key];

  if (!translated) {
    console.log(`🌐 Übersetze "${key}"...`);
    translated = await translateText(song.lyrics, "de");
    cache[key] = translated;
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  } else {
    console.log(`🗂 Übersetzung aus Cache geladen: ${key}`);
  }

  const result = {
    date: new Date().toISOString().slice(0, 10),
    artist: song.artist,
    title: song.title,
    lyrics: song.lyrics,
    translation: translated
  };

  fs.mkdirSync("data", { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));

  console.log(`✅ Fertig: ${OUTPUT_FILE} aktualisiert.`);
}

main();
