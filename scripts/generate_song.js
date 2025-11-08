import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  { artist: "Queen", title: "Bohemian Rhapsody" },
];

const index = new Date().getDate() % songs.length;
const song = songs[index];

async function getLyricsAndTranslate(artist, title) {
  const prompt = `
Gib mir den vollständigen englischen Songtext zu "${title}" von ${artist}.
Antworte NUR mit dem Songtext, ohne Erklärung oder Zusatztexte.
  `;

  const translationPrompt = `
Übersetze folgenden Songtext ins Deutsche (aber behalte den poetischen Stil bei):
`;

  try {
    console.log("🎵 Hole Lyrics von der KI...");
    const lyricsRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const lyrics = lyricsRes.choices[0].message.content.trim();

    console.log("🌍 Übersetze Text...");
    const transRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Du bist ein professioneller Übersetzer." },
        { role: "user", content: translationPrompt + "\n\n" + lyrics },
      ],
      temperature: 0.6,
    });

    const translated = transRes.choices[0].message.content.trim();
    return { lyrics, translated };
  } catch (err) {
    console.error("Fehler beim KI-Abruf:", err);
    return { lyrics: "Keine Lyrics gefunden.", translated: "Keine Übersetzung." };
  }
}

async function main() {
  const { lyrics, translated } = await getLyricsAndTranslate(song.artist, song.title);

  const result = {
    date: new Date().toISOString().slice(0, 10),
    artist: song.artist,
    title: song.title,
    translated,
  };

  const outputPath = path.join("data", "song_of_the_day.json");
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log("✅ Fertig: Song gespeichert in data/song_of_the_day.json");
}

main();
