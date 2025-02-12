document.addEventListener('DOMContentLoaded', () => {
  const versionInput = document.getElementById('version');
  const nameInput = document.getElementById('name');
  const searchBtn = document.getElementById('search');
  const iconList = document.getElementById('iconsList');

  const types = getTypes();
  let isDownloading = false;

  searchBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const version = versionInput.value;
    const name = nameInput.value;

    if (isDownloading) {
      return;
    }
    isDownloading = true;

    iconList.innerHTML = '';

    for (const type of types) {
      let svg = await getSvg(version, type, name);

      if (svg) {
        const listItem = createListItem(svg, type, name);
        iconList.insertAdjacentHTML('beforeend', listItem);
      }
    }

    isDownloading = false;
  });

  iconList.addEventListener('click', (e) => {
    const element = e.target;
    const listItem = e.target.closest('.list__item');
    const svg = listItem.querySelector('.item__preview').innerHTML;
    const name = listItem.querySelector('.item__name').innerHTML + '.svg';

    if (element.classList.contains('copy')) {
      copyText(svg);
      alert('image svg saved to clipboard');
    }

    if (element.classList.contains('download')) {
    }
  });
});
