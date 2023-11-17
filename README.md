# How to use

## Requirements

- Have `nodejs` installed
- Have `npm` or `yarn` installed

## Install

```bash
yarn
# or
npm install
```

## Get sticker pack id

- Go to website `https://stickers.zaloapp.com` and find the pack that you want to download.
- Click on the pack, and click `Chi tiết` to view the detail.
- Copy id of the pack from URL:
  - Example: if the URL if `https://stickers.zaloapp.com/oa/detail?cid=00c28006bc43551d0c52`, id of the pack would be `00c28006bc43551d0c52`
- Put the id in the `download.js` file:

  ```javascript
  const stickerPackId = "00c28006bc43551d0c52";
  ```

- You can also edit the value of image compression after download. Default is 70.

  ```javascript
  const compressImageQualiry = 70;
  ```

- Start downloading by `node download.js`
- You should see new folder created `downloads/Name of the pack`
