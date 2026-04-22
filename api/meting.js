import Meting from "@meting/core";

const allowServers = new Set(["netease", "tencent", "kugou", "baidu", "kuwo"]);
const allowTypes = new Set(["song", "playlist", "album", "artist"]);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");

  const server = String(req.query.server || "netease").trim();
  const type = String(req.query.type || "song").trim();
  const id = String(req.query.id || "").trim();

  if (!id || !allowServers.has(server) || !allowTypes.has(type)) {
    return res.status(400).json({ error: "Invalid server/type/id" });
  }

  try {
    const meting = new Meting(server);
    meting.format(true);

    let data;
    if (type === "song") data = await meting.song(id);
    else if (type === "playlist") data = await meting.playlist(id);
    else if (type === "album") data = await meting.album(id);
    else data = await meting.artist(id, 50);

    return res.status(200).send(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Meting failed" });
  }
}
