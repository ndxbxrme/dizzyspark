import { parseRange } from "./parse-range.js";
const parseSchedule = (state, game, sources, shallow) => {
  const images = [];
  state.schedule.forEach(item => {
    const source = game.sources.find(source => source.name === item.sourceName);
    console.log('source', source);
    frames = sources.filter(s => source.ids.includes(s.id));
    const frameNumbers = parseRange(item.data);
    if(source.subtype==='SpriteSheet') {
      frameNumbers.forEach(frameNumber => {
        const frame = frames[0];
        const cropFrame = source.frames[frameNumber-1];
        images.push({
          imagePath: `${frame.path}/${frame.filename}.png`,
          maskPath: `${frame.path}/${frame.filename}-mask-${item.maskName}.png`,
          fps: item.fps || 15,
          crop: cropFrame
        })
      })
    }
    else {
      frameNumbers.forEach(frameNumber => {
        const frame = frames[frameNumber-1];
        images.push({
          imagePath: `${frame.path}/${frame.filename}.png`,
          maskPath: `${frame.path}/${frame.filename}-mask-${item.maskName}.png`,
          fps: item.fps || 15
        })
      })
    }
  })
  if(shallow) {
    images.length = 1;
  }
  return images;
}
const cropImage = (img, crop) => {
  return new Promise(res => {
    console.log('cropping');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = crop.width || crop.to.w;
    canvas.height = crop.height || crop.to.h;
    ctx.drawImage(img, crop.from.x, crop.from.y, crop.from.w, crop.from.h, crop.to.x, crop.to.y, crop.from.w, crop.from.h);
    const url = canvas.toDataURL();
    const image = new Image();
    image.src = url;
    image.onload = () => {
      res(image);
    }
  });
}
const loadSchedule = async (state, game, sources, shallow) => {
  const images = parseSchedule(state, game, sources, shallow);
  await Promise.all(images.map(image => {
    return Promise.all([image.imagePath, image.maskPath].map((path, p) => {
      return new Promise(res => {
        let img = new Image();
        img.src = path;
        img.onload =  async () => {
          if(image.crop) {
            img = await cropImage(img, image.crop);
          }
          image[p===0?'image':'mask'] = img;
          res();
        }
        img.onerror = () => {
          res();
        }
      })
    }))
  }))
  return images;
}

export {loadSchedule, parseSchedule};