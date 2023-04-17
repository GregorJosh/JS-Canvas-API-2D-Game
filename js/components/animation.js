import Component from "./component.js";

export default class Animation extends Component {
    name = "idle";
    duration = 2000;
    spritesheetRow = 1;
    numOfFrames = 0;
    frameDuration = 0;
    isPlaying = false;
  
    currentFrame = {
      id: 1,
      duration: 0,
    };
  
    iteration = 0;
    numOfIterations = 0;
  
    init() {
      this.isPlaying = true;
      this.frameDuration = this.duration / this.numOfFrames;
    }
  
    setCycle(animationName, spritesheetRow, numOfFrames) {
      this.name = animationName;
      this.spritesheetRow = spritesheetRow;
      this.numOfFrames = numOfFrames;
    }
  
    pause() {
      this.isPlaying = false;
    }
  
    rewind() {
      this.currentFrame.id = 1;
    }
  
    stop() {
      this.pause();
      this.rewind();
  
      this.currentFrame.duration = 0;
    }
  
    update() {
      if (this.isPlaying && this.numOfFrames > 1) {
        if (this.iteration > this.numOfIterations) {
          this.stop();
          this.iteration = 0;
          return;
        }
  
        const scene = this.game.scene;
        const sceneLastFrameDur = scene.lastFrameDurMs;
        this.currentFrame.duration -= sceneLastFrameDur;
  
        if (this.currentFrame.duration < 0) {
          this.currentFrame.id++;
          this.currentFrame.duration = this.frameDuration;
  
          if (this.currentFrame.id > this.numOfFrames) {
            this.rewind();
            this.iteration++;
          }
        }
      }
    }
  }
