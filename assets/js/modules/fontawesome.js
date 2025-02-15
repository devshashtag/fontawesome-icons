function toCamelCase(text) {
  return text.replace(/-([A-Za-z])/g, (letter) => letter.toUpperCase()).replace(/-/g, '');
}

export function addId(svg, id) {
  const index = svg.indexOf('>');
  return svg.slice(0, index) + ` id="${toCamelCase(id)}"` + svg.slice(index);
}

export function getIconTypes() {
  const iconFamily = ['', 'duotone', 'sharp', 'sharp-duotone'];
  const iconStyles = ['solid', 'regular', 'light', 'thin'];

  let types = [];

  types.push('brands');

  for (const family of iconFamily) {
    for (const style of iconStyles) {
      let type = family ? `${family}-${style}` : style;

      types.push(type);
    }
  }

  return types;
}

export async function getSVG(version = '6.7.2', type = 'solid', name = 'rocket', signal) {
  try {
    const url = `https://site-assets.fontawesome.com/releases/v${version}/svgs/${type}/${name}.svg`;
    console.log(url);
    let svg = await fetch(url, { signal }).then((response) => response.text());

    if (svg.includes('<path')) {
      // remove all comments
      svg = svg.replaceAll(/<!--.*-->/g, '');

      // append id before closing tag
      svg = addId(svg, name);

      return svg;
    }
  } catch {}
}
