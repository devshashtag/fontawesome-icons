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

  const version = '6.7.2';
  const types = getIconTypes();
  const nameInput = document.getElementById('name');
  const searchBtn = document.getElementById('search');
  const iconsResults = document.getElementById('iconsResults');

  const iconsDownload = document.getElementById('iconsDownload');
  const downloadIcons = iconsDownload.querySelector('.download__icons');
  const downloadName = iconsDownload.querySelector('.download__name');
  const downloadPreview = iconsDownload.querySelector('.download__preview');
  const downloadClass = iconsDownload.querySelector('.download__class');

  // search
  searchBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    // const version = versionInput.value;
    const name = nameInput.value;

    // clear old results
    iconsResults.innerHTML = '';

    for (const type of types) {
      let svg = await getSVG(version, type, name);

      if (svg) {
        const listIcon = createListIcon(svg, type, name);
        iconsResults.insertAdjacentHTML('beforeend', listIcon);
      }
    }
  });

  iconsResults.addEventListener('click', (e) => {
    const icon = e.target.closest('.icons__icon');

    if (icon) {
      const iconClass = icon.dataset.class;
      const iconSVG = icon.querySelector('.icon__preview').innerHTML;
      const iconName = icon.querySelector('.icon__name').innerHTML;

      // skip if iconsDownload is open
      // if (iconsDownload.classList.contains('download--active')) return;

      downloadName.innerText = iconName;
      downloadPreview.innerHTML = iconSVG;
      downloadClass.innerHTML = `&lt;i class="<span>${iconClass}</span>" aria-hidden="true"&gt;&lt/i&gt;`;

      // active download area
      iconsDownload.classList.add('download--active');
    }
  });

  downloadIcons.addEventListener('click', (e) => {
    const element = e.target;
    const copy = element.closest('.copy');
    const download = element.closest('.download');
    const close = element.closest('.close');
    const name = downloadName.innerText;
    const svg = downloadPreview.innerHTML;

    if (copy) {
      copyToClipboard(svg);
      notification.displaySuccess(`the <span>${name}.svg</span> has been successfully copied to your clipboard.`);
    }

    if (download) {
      downloadSVG(svg, name);
      notification.displaySuccess(`the <span>${name}.svg</span> has been successfully saved.`);
    }

    if (close) {
      iconsDownload.classList.remove('download--active');
    }
  });
});
