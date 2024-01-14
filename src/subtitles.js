class Subtitles {
  constructor(canvas, ctx) {
    this.text = '';
    this.secondary = '';
    this.canvas = canvas;
    this.ctx = ctx;
  }
  setSubtitle(text, translation) {
    if(this.timeout) clearTimeout(this.timeout);
    this.text = text;
    this.translation = translation;
    this.padding = 10;
    this.lineHeight = 38; // Adjust the line height as needed
    
    // Set up text properties for measuring
    this.ctx.font = '38px Arial';
    
    // Calculate the dimensions of the text and translation
    this.textMetrics = this.ctx.measureText(this.text);
    this.translationMetrics = this.ctx.measureText(this.translation);
    this.textWidth = this.textMetrics.width;
    this.translationWidth = this.translationMetrics.width;
    this.textHeight = this.lineHeight; // Allow for two lines of text
    
    // Calculate the black background dimensions with padding
    this.textBackgroundWidth = this.textWidth + this.padding * 2;
    this.textBackgroundHeight = this.textHeight + this.padding * 2; // Extra padding for translation
    this.translationBackgroundWidth = this.translationWidth + this.padding * 2;
    
    // Calculate text positions for centering within the backgrounds
    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;
    this.textX = (this.canvasWidth - this.textBackgroundWidth) / 2 + this.padding;
    this.textY = (this.canvasHeight - this.textBackgroundHeight * 2) - this.lineHeight;
    this.translationX = (this.canvasWidth - this.translationBackgroundWidth) / 2 + this.padding;
    this.translationY = this.textY + this.textHeight + this.padding;
  }
  clearSubtitle() {
    this.timeout = setTimeout(() => {
      this.text = '';
    }, 1000);
  }
  tick(t) {

  }
  draw() {
    // Draw the black backgrounds for text and translation
    if(this.text) {
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(this.textX - this.padding, this.textY - this.padding, this.textBackgroundWidth, this.textBackgroundHeight);
      this.ctx.fillRect(this.translationX - this.padding, this.translationY - this.padding, this.translationBackgroundWidth, this.textBackgroundHeight);
  
      // Set up text properties
      this.ctx.fillStyle = 'white';
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'top';
  
      // Draw the text and translation within their respective black backgrounds
      this.ctx.fillText(this.text, this.textX, this.textY);
      this.ctx.fillStyle = '#daa4d4'; // Adjust the color for translation
      this.ctx.fillText(this.translation, this.translationX, this.translationY);
    }
  }
}
export {Subtitles};