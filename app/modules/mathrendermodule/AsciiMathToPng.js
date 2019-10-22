var mjAPI = require("mathjax-node");
const { convert } = require('convert-svg-to-png');
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

async function asciiMathToPng(expr, scale=0.04) {
  const svgStr = await asciiMathToSvg(expr);

  let svg = new tools.SVG(svgStr);

  let palette = {};
  for (let c of await getSvgColorNames(svg)) palette[c] = '#fff';

  let newSvg = await setSvgColorPalette(svg, palette);
  
  return await convert(newSvg.toString(), {
    height: newSvg.height * scale, 
    background:'#36393F',
    puppeteer: {args: ['--no-sandbox', '--disable-setuid-sandbox']}
  });
}

module.exports = asciiMathToPng;