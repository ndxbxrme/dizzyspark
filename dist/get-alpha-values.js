function getAlphaValues(image, resolution) {
  var canvas = document.createElement('canvas');
  canvas.width = Math.floor(image.width * resolution);
  canvas.height = Math.floor(image.height * resolution);
  var context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
  var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  var alphaValues = new Uint8Array(canvas.width * canvas.height);
  var data = imageData.data;
  for (var i = 0, j = 0; i < data.length; i += 4, j++) {
    alphaValues[j] = data[i + 3] > 100 ? 1 : 0;
  }
  return alphaValues;
}
export {getAlphaValues};