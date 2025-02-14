import { getIconTypes, getSVG } from './modules/fontawesome.js';
import Notification from './modules/notification.js';

function copyToClipboard(text) {
  let input = document.createElement('input');
  input.value = text;

  document.body.appendChild(input);

  input.select();
  document.execCommand('copy');

  document.body.removeChild(input);
}

function downloadSVG(svg, name) {
  let element = document.createElement('a');
  element.setAttribute('href', 'data:svg/plain;charset=utf-8,' + encodeURIComponent(svg));
  element.setAttribute('download', name + '.svg');
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function createListIcon(svg, type, name) {
  const iconClass = [...type.split(/-(?=[^-]*$)/).map((type) => 'fa-' + type), 'fa-' + name].join(' ');

  return `
    <!-- icon -->
    <li class="icons__icon" data-class="${iconClass}">
        <div class="icon__preview">${svg}</div>
        <div class="icon__name">${name}</div>
    </li>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  let notification = new Notification();
  let controller;

  const types = getIconTypes();
  const versionInput = document.getElementById('version');
  const nameInput = document.getElementById('name');
  const searchBtn = document.getElementById('search');
  const iconsResults = document.getElementById('iconsResults');

  const iconsDownload = document.getElementById('iconsDownload');
  const downloadName = iconsDownload.querySelector('.download__name');
  const downloadPreview = iconsDownload.querySelector('.download__preview');
  const downloadClass = iconsDownload.querySelector('.download__class');

  function displayDownload(icon) {
    const version = versionInput.value;
    const iconClass = icon.dataset.class;
    const iconSVG = icon.querySelector('.icon__preview').innerHTML;
    const iconName = icon.querySelector('.icon__name').innerHTML;

    // icon type and link
    const iconType = iconClass.split(' ').slice(0, -1).join('-').replaceAll('fa-', '');
    const isFontPro = iconType.includes('duotone') || iconType.includes('sharp');

    let fontLink = `
      &lt;link
        rel="stylesheet"
        href="https://site-assets.fontawesome.com/releases/v${version}/css/all.css"&gt
      <br><br>
    `;

    if (isFontPro) {
      fontLink += `
        &lt;link
          rel="stylesheet"
          href="https://site-assets.fontawesome.com/releases/v${version}/css/${iconType}.css"&gt
        <br><br>
      `;
    }

    // update download section
    downloadName.innerText = `${iconName}-${iconType}`;
    downloadPreview.innerHTML = iconSVG;
    downloadClass.innerHTML = `
    ${fontLink}
    &lt;i class="<span>${iconClass}</span>"&gt;&lt/i&gt;
    `;

    // display download section
    iconsDownload.classList.add('download--active');
  }

  // search
  searchBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    // abort
    if (controller) {
      controller.abort();
      controller = null;
    }

    controller = new AbortController();
    const signal = controller.signal;

    const version = versionInput.value;
    const name = nameInput.value.replace(/ /g, '-');

    if (!version) {
      notification.error('please enter version of the icon');
      return;
    }

    if (!name) {
      notification.error('please enter name of the icon');
      return;
    }

    searchBtn.classList.add('loading');

    // clear old results
    iconsResults.innerHTML = '';

    for (const type of types) {
      if (signal.aborted) break;

      // fix issue on duotone-solid
      let svg = await getSVG(version, type == 'duotone-solid' ? 'duotone' : type, name, signal);

      if (svg) {
        const listIcon = createListIcon(svg, type, name);
        iconsResults.insertAdjacentHTML('beforeend', listIcon);

        //  break if the type is 'brands', since 'brands' only has one icon
        if (type == 'brands') break;
      }
    }

    if (!signal.aborted) {
      searchBtn.classList.remove('loading');

      if (iconsResults.innerHTML == '') {
        notification.error('an error occurred while loading icons');
      }
    }
  });

  iconsResults.addEventListener('click', (e) => {
    const icon = e.target.closest('.icons__icon');

    if (icon) {
      displayDownload(icon);
    }
  });

  iconsDownload.addEventListener('click', (e) => {
    const element = e.target;

    // buttons
    const copy = element.closest('.icon__copy');
    const download = element.closest('.icon__download');
    const close = element.closest('.icon__close');
    const previous = element.closest('.view__previous');
    const next = element.closest('.view__next');

    const iconName = downloadName.innerText;
    const iconSVG = downloadPreview.innerHTML;
    const iconClass = downloadClass.querySelector('span').innerHTML;

    if (copy) {
      copyToClipboard(iconSVG);
      notification.success(`the <span>${iconName}.svg</span> has been successfully copied to your clipboard.`);
    } else if (download) {
      downloadSVG(iconSVG, iconName);
      notification.success(`the <span>${iconName}.svg</span> has been successfully saved.`);
    } else if (close) {
      iconsDownload.classList.remove('download--active');
    } else if (previous) {
      const previousIcon = iconsResults.querySelector(`.icons__icon:has(+[data-class="${iconClass}"])`);
      displayDownload(previousIcon);
    } else if (next) {
      const nextIcon = iconsResults.querySelector(`[data-class="${iconClass}"] + .icons__icon`);
      displayDownload(nextIcon);
    }
  });
});
