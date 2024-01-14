import {State} from './state.js';
import { loadScripts } from "./load-scripts.js";

class GameObject {
  constructor(data, game, sources) {
    this.name = data.name;
    this.x = data.x || 0;
    this.y = data.y || 0;
    this.transitions = data.transitions || [];
    this.states = data.states.map(state => new State(state, game, sources));
    this.currentState = this.states.find(state => state.name === (data.startState || 'default')) || this.states[0];
    console.log('current state', this.currentState, data)
    this.audios = loadScripts(this, data.scripts || {});
  }
  async load() {
    await Promise.all(this.states.map(state => state.load()));
  }
  tick(t) {
    if(this.hidden || !this.currentState) return;
    /*this.currentState.tick(t);
    if(this.currentTransition) {
      console.log(this.currentState.animIndex, this.currentTransition[this.transitionIndex]);
    }*/
    const state = this.currentState;
    if(!state.nextFrameTime) state.nextFrameTime = t;
    if(t > state.nextFrameTime) {
      state.nextFrameTime += 1000 / ((state.fps || 15) * 1);
      state.animIndex++;
      if(this.currentTransition) {
        if(state.animIndex > this.currentTransition[this.transitionIndex].endFrame - 1) {
          this.transitionIndex++;
          const currentTransitionState = this.currentTransition[this.transitionIndex];
          console.log('changing state')
          this.currentState = this.states.find(state => state.name === currentTransitionState.stateName);
          this.currentState.animIndex = currentTransitionState.startFrame - 1;
          this.currentState.nextFrameTime = state.nextFrameTime;
          console.log(this.currentState.name, this.toStateName);
          if(this.currentState.name===this.toStateName) {
            this.currentTransition = null;
          }
        }
      }
      else {
        if(state.animIndex > state.images.length - 1) {
          state.animIndex = 0; //
        }
      }
    }
  }
  draw(ctx) {
    if(this.hidden || !this.currentState) return;
    if(this.highlight) {
      ctx.filter = 'url(#highlight)';
      this.currentState.draw(ctx, this.x, this.y);
      ctx.filter = 'none';
    }
    else {
      this.currentState.draw(ctx, this.x, this.y);
    }
  }
  hitTest(x, y) {
    if(x < this.x || y < this.y || !this.currentState) return false;
    return this.currentState.hitTest(x - this.x, y - this.y);
  }
  transitionTo(toStateName, immediate) {
    const fromStateName = this.currentState.name;
    this.currentTransition = null;
    let fromStateIndex = 0;
    this.toStateName = toStateName;
    for(let f=0; f<this.transitions.length; f++) {
      fromStateIndex = this.transitions[f].findIndex(transition => transition.stateName===fromStateName);
      const toStateIndex = this.transitions[f].findIndex(transition => transition.stateName===toStateName);
      if(fromStateIndex > -1 && toStateIndex > -1 && fromStateIndex < toStateIndex) {
        this.currentTransition = this.transitions[f];
        break;
      }
    }
    if(this.currentTransition && !immediate) {
      this.transitionIndex = fromStateIndex;
    }
    else {
      this.currentTransition = [
        {stateName:this.currentState.name, startFrame:1, endFrame:this.currentState.animIndex},
        {stateName:this.toStateName, startFrame:1, endFrame:2}
      ];
      this.transitionIndex = 0;
    }
  }
}
export {GameObject}