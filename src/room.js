import { GameObject } from "./object.js";
import { loadScripts } from "./load-scripts.js";

class Room {
  constructor(data, game, sources) {
    this.objects = data.objects.map(object => new GameObject(object, game, sources));
    this.audios = loadScripts(this, data.scripts || {});
  }
  async load() {
    await Promise.all(this.objects.map(object => object.load()));
    this.onload && this.onload();
  }
  enter(game) {
    this.scripts && this.scripts.enter && this.scripts.enter(game);
    this.objects.forEach(object => (object.scripts && object.scripts.enter && object.scripts.enter(game)));
  }
  exit(game) {
    this.scripts && this.scripts.exit && this.scripts.exit(game);
    this.objects.forEach(object => (object.scripts && object.scripts.exit && object.scripts.exit(game)));
  }
  tick(t) {
    this.objects.forEach(object => object.tick(t));
  }
  draw(ctx) {
    this.objects.forEach(object => object.draw(ctx));
  }
  hitTest(x, y) {
    for(let f=this.objects.length-1; f>-1; f--) {
      const hit = this.objects[f].hitTest(x, y);
      if(hit) return this.objects[f];
    }
  }
}
export {Room};