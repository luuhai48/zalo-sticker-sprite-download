// Get from https://stickers.zaloapp.com
// Example: https://stickers.zaloapp.com/oa/detail?cid=00c28006bc43551d0c52
const stickerPackId = "00c28006bc43551d0c52";

const compressImageQualiry = 70;

// ======================
const fs = require("fs");
const { default: axios } = require("axios");
const sharp = require("sharp");
const stream = require("stream");
const util = require("util");
const pipeline = util.promisify(stream.pipeline);
const slug = require("slug");
const crypto = require("crypto");

const download = async () => {
  const list = await axios
    .get("https://stickers.zaloapp.com/sticker")
    .then(({ data }) => data);
  const all = list.value.all;

  const find = all.find((p) => p.id === stickerPackId);
  if (!find) {
    throw new Error("Sticker pack not found!!!");
  }

  console.log(
    `Downloading sticker pack: ${find.name}, total: ${find.totalImage}`
  );

  const res = await axios
    .get(`https://stickers.zaloapp.com/cate-stickers?cid=${stickerPackId}`)
    .then(({ data }) => data);

  if (!res?.value?.length) {
    console.log("Nothing to download!!!");
    return;
  }

  const dirName = slug(find.name);
  fs.mkdirSync(`./downloads/${dirName}`, { recursive: true });

  const pack = {
    name: find.name,
    slug: dirName,
    total: 0,
    stickers: [],
  };

  await axios.get(find.iconUrl, { responseType: "stream" }).then((response) => {
    response.data.pipe(
      fs.createWriteStream(`./downloads/${dirName}/thumbnail.png`)
    );
  });

  const ids = res.value.map((s) => new URL(s.url).searchParams.get("eid"));
  pack.total = ids.length;

  for (const id of ids) {
    console.log(`Downloading file ${id}.png`);
    await axios
      .get(`https://zalo-api.zadn.vn/api/emoticon/sprite?eid=${id}&size=130`, {
        responseType: "stream",
      })
      .then(async (response) => {
        await pipeline(
          response.data,
          fs.createWriteStream(`./downloads/${dirName}/${id}.png`)
        );

        await new Promise((resolve) => {
          sharp(`./downloads/${dirName}/${id}.png`)
            .png({ quality: compressImageQualiry })
            .toFile(`./downloads/${dirName}/${id}-min.png`, function (err) {
              if (err) {
                return console.error(err);
              }
              resolve(true);
            });
        });
        fs.unlinkSync(`./downloads/${dirName}/${id}.png`);
        fs.renameSync(
          `./downloads/${dirName}/${id}-min.png`,
          `./downloads/${dirName}/${id}.png`
        );
        pack.stickers.push({
          id: crypto.randomUUID(),
          filePath: `${id}.png`,
          number: parseInt(id),
        });
      });
  }

  fs.writeFileSync(`./downloads/${dirName}/pack.json`, JSON.stringify(pack));
};

download();
