const fs = require("fs");
const path = require("path");
const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));


const songs = [
  { artist: "Coldplay", title: "Yellow" },
  { artist: "Adele", title: "Hello" },
  { artist: "Ed Sheeran", title: "Perfect" },
  { artist: "Taylor Swift", title: "Lover" },
  { artist: "The Beatles", title: "Hey Jude" },
  { artist: "Billie Eilish", title: "Ocean Eyes" },
  { artist: "Imagine Dragons", title: "Believer" },
  { artist: "Elton John", title: "Rocket Man" },
  { artist: "ABBA", title: "Dancing Queen" },
  { artist: "Queen", title: "Bohemian Rhapsody" }
];

const fallbackMap = {
  "Coldplay Yellow": "Look at the stars...",
  "Adele Hello": "Hello, it's me...",
  "Ed Sheeran Perfect": "I found a love for me...",
  "Taylor Swift Lover": "We could leave the Christmas lights up...",
  "The Beatles Hey Jude": "Hey Jude, don't make it bad...",
  "Billie Eilish Ocean Eyes": "I've been watching you for some time...",
  "Imagine Dragons Believer": "First things first...",
  "Elton John Rocket Man": "She packed my bags last night pre-flight...",
  "ABBA Dancing Queen": "You can dance, you can jive...",
  "Queen Bohemian Rhapsody": "Is this the real life? Is this just fantasy?"
};

const index = new Date().getDate() % songs.length;
const song = songs[index];
const key = `${song.artist} ${song.title}`;

async function fetchLyrics(artist, title) {
  try {
    const res = await fetch(`https://api.lyrics.ovh/v1/${artist}/${title}`);
    const data = await res.json();
    return data.lyrics;
  } catch {
    return null;
  }
}

async function translateChunk(chunk) {
  const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|de`);
  const data = await res.json();
  return data.responseData.translatedText || "";
}

async function translateFull(text) {
  const parts = [];
  for (let i = 0; i < text.length; i += 400) {
    const chunk = text.slice(i, i + 400);
    const translated = await translateChunk(chunk);
    parts.push(translated);
    await new Promise(r => setTimeout(r, 300));
  }
  return parts.join(" ");
}

async function main() {
  let lyrics = await fetchLyrics(song.artist, song.title);
  if (!lyrics) lyrics = fallbackMap[key];

  console.log("Übersetze:", key);
  const translated = await translateFull(lyrics);

  const result = {
    date: new Date().toISOString().slice(0, 10),
    artist: song.artist,
    title: song.title,
    translated: translated || lyrics,
  };

  const outputPath = path.join("data", "song_of_the_day.json");
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log("✅ Fertig: data/song_of_the_day.json aktualisiert!");
}

main();
