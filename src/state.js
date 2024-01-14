import { getAlphaValues } from "./get-alpha-values.js";
import { loadScripts } from "./load-scripts.js";
import { loadSchedule } from "./load-schedule.js";

class State {
  constructor(data, game, sources) {
    this.name = data.name;
    this.audios = loadScripts(this, data.scripts || {});
    this.data = data;
    this.nextFrameTime = 0;
    this.animIndex = 0;
    this.fps = data.fps || 15;
    this.game = game;
    this.sources = sources;
  }
  async load() {
    this.images = await loadSchedule(this.data, this.game, this.sources);
    console.log('images', this.images, this.data);
    this.images = await Promise.all(this.images.map(image => new Promise(res => {
      const offscreenCanvas = document.createElement('canvas');
      const offscreenCtx = offscreenCanvas.getContext('2d')
      offscreenCanvas.width = image.image.width;
      offscreenCanvas.height = image.image.height;
      offscreenCtx.drawImage(image.image, 0, 0);
      if(image.mask) {
        console.log('masking image', this.data);
        offscreenCtx.globalCompositeOperation = 'destination-in';
        offscreenCtx.drawImage(image.mask, 0, 0);
      }
      const finalImage = new Image();
      finalImage.src = offscreenCanvas.toDataURL();
      finalImage.onload = async () => {
        const alpha = getAlphaValues(finalImage, .25);
        res({image:finalImage, alpha:alpha, fps:image.fps || 15});
      }
    })));
  }
  tick(t) {
  }
  draw(ctx, x, y) {
    const image = this.images[this.animIndex].image;
    ctx.drawImage(image, x, y);
  }
  hitTest(x, y) {
    const hitPos = {
      x: Math.floor(x * .25),
      y: Math.floor(y * .25)
    }
    const imageWidth = Math.floor(this.images[this.animIndex].image.width * .25);
    const imageHeight = Math.floor(this.images[this.animIndex].image.height * .25);
    if(hitPos.x > imageWidth || hitPos.y > imageHeight) return false
    return this.images[this.animIndex].alpha && this.images[this.animIndex].alpha[(hitPos.y * imageWidth) + hitPos.x];
  }
}
export {State}