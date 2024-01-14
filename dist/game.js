import {Room} from './room.js';
import {Subtitles} from './subtitles.js';
import { getUniqueAudiosByType } from './get-unique-audios-by-type.js';

class Game {
  constructor(options, game, sources, script, audio) {
    this.canvas = document.querySelector('.game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.cursorCanvas = document.querySelector('.game-cursor');
    this.cursorCtx = this.cursorCanvas.getContext('2d');
    this.canvas.width = this.cursorCanvas.width = 1920;
    this.canvas.height = this.cursorCanvas.height = 1080;
    this.options = options;
    this.game = game;
    this.sources = sources;
    this.script = script;
    this.audio = audio;
    this.variables = {
      inventory: [],
      musicVolume: 0.02
    };
    this.audios = {
      Script: {},
      Sfx: {},
      Music: {}
    }
    this.subtitles = new Subtitles(this.canvas, this.ctx);
    this.hoveredObject = null;
    this.init();
    this.boundMouseDown = this.mouseDown.bind(this);
    this.boundMouseUp = this.mouseUp.bind(this);
    this.boundMouseOver = this.mouseOver.bind(this);
    this.boundMouseOut = this.mouseOut.bind(this);
    this.boundMouseMove = this.mouseMove.bind(this);
    this.boundKeyDown = this.keyDown.bind(this);
    this.cursorCanvas.addEventListener('mousedown', this.boundMouseDown);
    this.cursorCanvas.addEventListener('mouseup', this.boundMouseUp);
    this.cursorCanvas.addEventListener('mouseover', this.boundMouseOver);
    this.cursorCanvas.addEventListener('mouseout', this.boundMouseOut);
    this.cursorCanvas.addEventListener('mousemove', this.boundMouseMove);
    this.cursorCanvas.addEventListener('keydown', this.boundKeyDown);
    this.gameObj = {
      sleep: async (ms) => {
        return new Promise(res => {
          setTimeout(res, ms);
        })
      },
      playScript: async (index) => {
        console.log('play script', index);
        return new Promise(res => {
          const occs = this.audios.Script[index.toString()];
          const occ = occs[Math.floor(Math.random() * occs.length)];
          const audioSourceNode = this.audio.createBufferSource();
          this.subtitles.setSubtitle(occ.text, occ.translation);
          audioSourceNode.buffer = occ.buffer;
          audioSourceNode.connect(this.audio.destination);
          audioSourceNode.addEventListener('ended', () => {
            this.subtitles.clearSubtitle();
            res();
          });
          audioSourceNode.start();
        });
      },
      playSfx: async (name) => {
        return new Promise(res => {
          const buffer = this.audios.Sfx[name];
          const audioSourceNode = this.audio.createBufferSource();
          audioSourceNode.buffer = buffer;
          audioSourceNode.connect(this.audio.destination);
          audioSourceNode.addEventListener('ended', () => {
            res();
          });
          audioSourceNode.start();
        });
      },
      playMusic: async (name) => {
        console.log('playmusic', name);
        const now = this.audio.currentTime;
        const crossfadeDuration = 1;
        if(this.currentMusicBuffer) {
          this.currentGain.gain.setValueAtTime(this.variables.musicVolume, now);
          this.currentGain.gain.linearRampToValueAtTime(0, now + crossfadeDuration);
        }
        console.log(this.audios.Music[name]);
        this.nextMusicBuffer = this.audio.createBufferSource();
        this.nextMusicBuffer.loop = true;
        this.nextMusicBuffer.buffer = this.audios.Music[name];
        this.nextGain = this.audio.createGain();
        this.nextMusicBuffer.connect(this.nextGain);
        this.nextGain.gain.setValueAtTime(0, now);
        this.nextGain.gain.linearRampToValueAtTime(this.variables.musicVolume, now + crossfadeDuration);
        this.nextGain.connect(audio.destination);
        this.nextMusicBuffer.start();
        setTimeout(() => {
          if(this.currentMusicBuffer) {
            this.currentMusicBuffer.stop();
            this.currentMusicBuffer.disconnect();
            this.currentGain.disconnect();
          }
          this.currentMusicBuffer = this.nextMusicBuffer;
          this.currentGain = this.nextGain;
          this.nextMusicBuffer = null;
          this.nextGain = null;
        }, crossfadeDuration * 1000);
      },
      openVerbPicker: async (actions, position) => {
        await this.gameObj.openGUI('VERB_PICKER');
        this.verbActions = actions;
        this.gui.objects.forEach(object => {
          object.x = position.x - 139;
          object.y = position.y - 72;
        });
      },
      openGUI: async (name) => {
        const guiRoom = new Room(this.game.rooms.find(room => room.name===name), this.game, this.sources);
        await guiRoom.load();
        if(this.gui) {
          this.gui.exit(this.gameObj);
          if(this.gui.exitTime) {
            await new Promise(res => setTimeout(res, this.gui.exitTime));
          }
        }
        this.gui = guiRoom;
        this.gui.enter(this.gameObj);
      },
      closeGUI: async () => {
        this.gui.exit(this.gameObj);
        if(this.gui.exitTime) {
          await new Promise(res => setTimeout(res, this.gui.exitTime));
        }
        this.gui = null;
      },
      goToRoom: async (name) => {
        const room = new Room(this.game.rooms.find(room => room.name===name), this.game, this.sources);
        await room.load();
        if(this.room) {
          this.room.exit(this.gameObj);
          if(this.room.exitTime) {
            await new Promise(res => setTimeout(res, this.room.exitTime));
          }
        }
        this.room = room;
        this.room.enter(this.gameObj);
      },
      setState: async (objectName, stateName, immediate) => {
        const object = this.room.objects.find(object => object.name===objectName);
        object.transitionTo(stateName, immediate);
      },
      setProperty: async (objectName, propertyName, value) => {
        const object = this.room.objects.find(object => object.name===objectName);
        object[propertyName] = value;
      },
      setVariable: (name, value) => {
        this.variables[name] = value;
      },
      getVariable: (name) => {
        return this.variables[name];
      },
      addToInventory: (name) => {
        this.variables.inventory.push(name);
      },
      removeFromInventory: (name) => {

      },
      setMusicVolume: (value) => {

      },
      setSfxVolume: (value) => {

      },
      setLanguage: (language, secondaryLanguage) => {

      },
      setSecondaryLanguage: (secondaryLanguage) => {

      },
      runAction: (actionName) => {
        this.verbActions && this.verbActions[actionName] && this.verbActions[actionName](this.gameObj);
      }
    }
  }
  async init() {
    const tick = (t) => {
      const delta = t - this.lastTime;
      if(delta > 1000) {
        this.timeOffset += delta;
      }
      this.currentTime = this.lastTime + delta - this.timeOffset;
      this.lastTime = t;
      t *= 1;
      this.running && window.requestAnimationFrame(tick);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.room && this.room.tick(t);
      this.gui && this.gui.tick(t);
      this.room && this.room.draw(this.ctx);
      this.gui && this.gui.draw(this.ctx);
      this.subtitles.draw();
    }
    const loadingRoom = new Room(this.game.rooms.find(room => room.name==='LOADING'), this.game, this.sources);
    await loadingRoom.load();
    this.gui = loadingRoom;
    this.gui.enter(this.gameObj);
    this.running = true;
    tick(0);
    console.log('start room', this.options.startRoom);
    const firstRoom = new Room(this.game.rooms.find(room => room.name===(this.options.startRoom || 'DEFAULT')), this.game, this.sources);
    await firstRoom.load();
    await this.loadAudios(firstRoom);
    this.room = firstRoom;
    this.room.enter(this.gameObj);
    this.gui = null;
  }
  async loadAudios(room) {
    const getBuffer = (path) => new Promise(async resolve => {
      const res = await fetch(path);
      const decoded = await this.audio.decodeAudioData(await res.arrayBuffer());
      resolve(decoded);
    });
    const audiosToLoad = getUniqueAudiosByType(room);
    console.log('audios to load', audiosToLoad);
    for(let i=0; i<audiosToLoad.Script.length; i++) {
      const index = audiosToLoad.Script[i];
      const phrase = this.script[+index];
      const occs = phrase.occurrences.filter(occ => occ.language===this.options.language && occ.status!=='Bad');
      this.audios.Script[index] = await Promise.all(occs.map(async occ => ({
        buffer:await getBuffer(occ.full_path.replace('.wav', '.ogg')),
        text: occ.text,
        translation: phrase.autotrans[this.options.secondaryLanguage].text
      })));
    }
    for(let i=0; i<audiosToLoad.Sfx.length; i++) {
      const name = audiosToLoad.Sfx[i];
      const sfx = this.game.audio.Sfx.find(sfx => sfx.name === name);
      const source = this.sources.find(source => source.id === sfx.id);
      this.audios.Sfx[name] = await getBuffer(source.path + '/' + source.filename + '.ogg');
    }
    for(let i=0; i<audiosToLoad.Music.length; i++) {
      const name = audiosToLoad.Music[i];
      const music = this.game.audio.Music.find(music => music.name === name);
      const source = this.sources.find(source => source.id === music.id);
      this.audios.Music[name] = await getBuffer(source.path + '/' + source.filename + '.ogg');
    }
  }
  destroy() {
    console.log('destroy');
    this.cursorCanvas.removeEventListener('mousedown', this.boundMouseDown);
    this.cursorCanvas.removeEventListener('mouseup', this.boundMouseUp);
    this.cursorCanvas.removeEventListener('mouseover', this.boundMouseOver);
    this.cursorCanvas.removeEventListener('mouseout', this.boundMouseOut);
    this.cursorCanvas.removeEventListener('mousemove', this.boundMouseMove);
    this.cursorCanvas.removeEventListener('keydown', this.boundKeyDown);
    this.running = false;
    this.currentMusicBuffer && this.currentMusicBuffer.stop();
  }
  mouseDown(event) {
    console.log('mouse down');
    event.preventDefault();
    const ratio = this.canvas.width / this.canvas.clientWidth;
    const [x, y] = [event.offsetX * ratio, event.offsetY * ratio];
    const objectHit = (this.gui && this.gui.hitTest(x, y)) || (this.room && this.room.hitTest(x, y));
    objectHit && objectHit.mousedown && objectHit.mousedown(this.gameObj, {x,y});
  }
  mouseUp(event) {
    event.preventDefault();
    const ratio = this.canvas.width / this.canvas.clientWidth;
    const [x, y] = [event.offsetX * ratio, event.offsetY * ratio];
    const objectHit = (this.gui && this.gui.hitTest(x, y)) || (this.room && this.room.hitTest(x, y));
    objectHit && objectHit.mouseup && objectHit.mouseup(this.gameObj, {x,y});
  }
  mouseOver(event) {
    event.preventDefault();
  }
  mouseOut(event) {
    event.preventDefault();
    this.hoveredObject && this.hoveredObject.mouseout && this.hoveredObject.mouseout(this.gameObj);
  }
  mouseMove(event) {
    event.preventDefault();
    const ratio = this.canvas.width / this.canvas.clientWidth;
    const [x, y] = [event.offsetX * ratio, event.offsetY * ratio];
    const objectHit = (this.gui && this.gui.hitTest(x, y)) || (this.room && this.room.hitTest(x, y));
    objectHit && objectHit.mousemove && objectHit.mousemove(this.gameObj, {x,y});
    if(objectHit !== this.hoveredObject) {
      objectHit && objectHit.mouseover && objectHit.mouseover(this.gameObj, {x,y});
      this.hoveredObject && this.hoveredObject.mouseout && this.hoveredObject.mouseout(this.gameObj, {x,y});
      this.hoveredObject = objectHit;
    }
  }
  keyDown(event) {
    event.preventDefault();
    event.cancelBubble = true;
  }
}
export {Game};