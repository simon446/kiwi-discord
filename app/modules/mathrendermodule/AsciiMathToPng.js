var mjAPI = require("mathjax-node");
const svg2img = require('svg2img');
const tools = require('simple-svg-tools');

mjAPI.start();

function asciiMathToSvg(expr) {
  return new Promise((res, rej) => {
    mjAPI.typeset({
      math: expr,
      format: "AsciiMath",
      svg: true,
    }, function (data) {
      if (!data.errors) {res(data.svg)}
      else rej(data.errors);
    });
  });
}

function getSvgColorNames(svg) {
  return new Promise((res, rej) => {
    tools.GetPalette(svg).then(result => {
      res(result.colors);
    }).catch(err => {
        rej(err);
    });
  });
}

function setSvgColorPalette(svg, palette) {
  return new Promise((res, rej) => {
    tools.ChangePalette(svg, palette).then(svg => {
      res(svg);
    }).catch(err => {
      rej(err);
    });
  });
}

function svg2png(svgString, settings) {
  return new Promise((resolve, reject) => {
    svg2img(svgString, settings, function(error, buffer) {
        if (error) return reject(error);
        resolve(buffer);
    });
  })
}

async function asciiMathToPng(expr, scale=0.04) {
  const svgStr = await asciiMathToSvg(expr);

  let svg = new tools.SVG(svgStr);

  let palette = {};
  for (let c of await getSvgColorNames(svg)) palette[c] = '#fff';

  let newSvg = await setSvgColorPalette(svg, palette);
  
  return svg2png(newSvg.toString(), {'width': newSvg.width * scale, 'height': newSvg.height * scale});
}

module.exports = asciiMathToPng;