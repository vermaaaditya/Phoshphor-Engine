/**
 * Processes an HTMLImageElement to yield a 1D Float32Array of normalized luminance values.
 * 
 * @param {HTMLImageElement} image - The source image element
 * @param {number} cols - Target columns count (width of grid)
 * @param {number} rows - Target rows count (height of grid)
 * @returns {Float32Array} 1D array of luminance values (0.0 to 1.0)
 */
export default function processImage(image, cols, rows) {
  const canvas = document.createElement('canvas');
  canvas.width = cols;
  canvas.height = rows;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return new Float32Array(cols * rows);
  }

  // Draw the image at the exact low-resolution columns x rows grid dimensions
  ctx.drawImage(image, 0, 0, cols, rows);
  
  // Retrieve raw pixel values (R, G, B, A per pixel)
  const imgData = ctx.getImageData(0, 0, cols, rows);
  const data = imgData.data;
  const luminance = new Float32Array(cols * rows);
  
  // Loop through pixels and compute weighted luminance normalized to [0.0, 1.0]
  for (let i = 0; i < luminance.length; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    
    // Luminance formula: (R * 0.299 + G * 0.587 + B * 0.114) / 255
    luminance[i] = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
  }
  
  return luminance;
}
