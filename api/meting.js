import Meting from "@meting/core";

const allowServers = new Set(["netease", "tencent", "kugou", "baidu", "kuwo"]);
const allowTypes = new Set(["song", "playlist", "album", "artist"]);

function parseJson(value, fallback) {
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
}

function toHttps(url) {
  return typeof url === "string" ? url.replace(/^http:\/\//, "https://") : "";
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const server = String(req.query.server || "netease").trim();
  const type = String(req.query.type || "song").trim();
  const id = String(req.query.id || "").trim();

  if (!id || !allowServers.has(server) || !allowTypes.has(type)) {
    return res.status(400).json({ error: "Invalid server/type/id" });
  }

  try {
    const meting = new Meting(server);
    meting.format(true);

    let raw;
    if (type === "song") raw = await meting.song(id);
    else if (type === "playlist") raw = await meting.playlist(id);
    else if (type === "album") raw = await meting.album(id);
    else raw = await meting.artist(id, 50);

    const songs = parseJson(raw, []);
    const list = Array.isArray(songs) ? songs : [songs];

    const result = await Promise.all(
      list.slice(0, type === "song" ? 1 : 50).map(async (song) => {
        const songId = song.id || song.url_id || song.lyric_id;
        const [urlRaw, lyricRaw, picRaw] = await Promise.all([
          songId ? meting.url(song.url_id || songId, 320).catch(() => "{}") : "{}",
          songId ? meting.lyric(song.lyric_id || songId).catch(() => "{}") : "{}",
          song.pic_id ? meting.pic(song.pic_id, 300).catch(() => "{}") : "{}",
        ]);

        const url = parseJson(urlRaw, {});
        const lyric = parseJson(lyricRaw, {});
        const pic = parseJson(picRaw, {});
        const artist = Array.isArray(song.artist)
          ? song.artist.join(" / ")
          : String(song.artist || song.author || "");

        return {
          id: song.id || id,
          title: song.name || song.title || "",
          author: artist,
          album: song.album || "",
          url: toHttps(url.url || song.url || ""),
          pic: toHttps(pic.url || song.pic || ""),
          lrc: lyric.lyric || lyric.lrc || lyric.tlyric || "",
          tlyric: lyric.tlyric || "",
          source: song.source || server,
        };
      }),
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Meting failed" });
  }
}
