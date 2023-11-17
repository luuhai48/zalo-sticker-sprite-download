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

  fs.mkdirSync(`./downloads/${find.name}`, { recursive: true });

  await axios.get(find.iconUrl, { responseType: "stream" }).then((response) => {
    response.data.pipe(
      fs.createWriteStream(`./downloads/${find.name}/thumbnail.png`)
    );
  });

  const ids = res.value.map((s) => new URL(s.url).searchParams.get("eid"));
  for (const id of ids) {
    await axios
      .get(`https://zalo-api.zadn.vn/api/emoticon/sprite?eid=${id}&size=130`, {
        responseType: "stream",
      })
      .then(async (response) => {
        await pipeline(
          response.data,
          fs.createWriteStream(`./downloads/${find.name}/${id}.png`)
        );

        await new Promise((resolve) => {
          sharp(`./downloads/${find.name}/${id}.png`)
            .png({ quality: compressImageQualiry })
            .toFile(`./downloads/${find.name}/${id}-min.png`, function (err) {
              if (err) {
                return console.error(err);
              }
              resolve(true);
            });
        });
        fs.unlinkSync(`./downloads/${find.name}/${id}.png`);
        fs.renameSync(
          `./downloads/${find.name}/${id}-min.png`,
          `./downloads/${find.name}/${id}.png`
        );
      });
  }
};

download();
