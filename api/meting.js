import Meting from "@meting/core";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const server = String(req.query.server || "netease");
  const type = String(req.query.type || "song");
  const id = String(req.query.id || "");

  if (!id) return res.status(400).json({ error: "Missing id" });

  const meting = new Meting(server);
  meting.format(true);

  let data;
  if (type === "song") data = await meting.song(id);
  else if (type === "playlist") data = await meting.playlist(id);
  else if (type === "album") data = await meting.album(id);
  else if (type === "artist") data = await meting.artist(id, 50);
  else return res.status(400).json({ error: "Invalid type" });

  return res.status(200).send(data);
}
