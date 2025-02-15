import { addId } from './fontawesome.js';

class IconSearch {
  constructor(appName) {
    this.searchInput = document.getElementById('name');
    this.iconSearchList = document.getElementById('iconSearchList');
    this.configName = appName;
    this.config = null;
  }

  async init() {
    const localConfig = JSON.parse(localStorage.getItem(this.configName) || 'null');

    if (localConfig && typeof localConfig === 'object' && Object.keys(localConfig).length > 0) {
      this.config = localConfig;
    } else {
      this.config = await this.loadConfig();
      this.saveConfig();
    }

    // events
    this.setupEvents();
  }

  sortByMostMatched(a, b, name) {
    // extract the text content from the html string
    const aText = a.replace(/<[^>]*>/g, '').toLowerCase(); // remove html tags
    const bText = b.replace(/<[^>]*>/g, '').toLowerCase(); // remove html tags

    // check if the strings start with the search text
    const aStartsWith = aText.startsWith(name);
    const bStartsWith = bText.startsWith(name);

    if (aStartsWith && !bStartsWith) return -1; // a comes first
    if (!aStartsWith && bStartsWith) return 1; // b comes first

    // if both or neither start with the search text, sort by index of the search text
    const aIndex = aText.toLowerCase().indexOf(name);
    const bIndex = bText.toLowerCase().indexOf(name);

    if (aIndex < bIndex) return -1; // a comes first
    if (aIndex > bIndex) return 1; // b comes first

    // if the search text appears at the same index, sort by string length
    return aText.length - bText.length;
  }

  setupEvents() {
    this.iconSearchList.addEventListener('click', (event) => {
      const element = event.target;

      if (element.dataset) {
        this.searchInput.value = element.dataset.name;
        this.iconSearchList.innerHTML = '';
      }
    });

    // keyboard events
    this.searchInput.addEventListener('keydown', (event) => {
      if (!this.iconSearchList.innerHTML) return;

      // close auto-completion
      let nextSelected;

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          this.iconSearchList.innerHTML = '';
          break;

        case 'Enter':
        case 'Tab':
          this.searchInput.value = this.selected.dataset.name;
          this.iconSearchList.innerHTML = '';
          break;

        case 'ArrowUp':
          event.preventDefault();
          nextSelected = this.iconSearchList.querySelector('li:has(+.selected)');
          if (!nextSelected) nextSelected = this.iconSearchList.querySelector('li:last-of-type');
          this.selected.classList.remove('selected');
          nextSelected.classList.add('selected');
          nextSelected.scrollIntoView();
          this.selected = nextSelected;
          this.searchInput.value = nextSelected.dataset.name;
          break;

        case 'ArrowDown':
          event.preventDefault();
          nextSelected = this.iconSearchList.querySelector('.selected+li');
          if (!nextSelected) nextSelected = this.iconSearchList.querySelector('li:first-of-type');
          this.selected.classList.remove('selected');
          nextSelected.classList.add('selected');
          nextSelected.scrollIntoView();
          this.selected = nextSelected;
          this.searchInput.value = nextSelected.dataset.name;
          break;
      }
    });

    // autocomplete
    this.searchInput.addEventListener('input', () => {
      const name = this.searchInput.value.trim().toLowerCase();

      this.iconSearchList.innerHTML = '';

      if (!name) return;

      const results = this.searchIcon(name);

      if (!results.iconNames || !results.iconAliases) return;

      const iconNames = results.iconNames.map((name) => `<li class="icon-name" data-name="${name}">${name}</li>`);
      const iconAliases = results.iconAliases.map((alias) => `<li class="icon-alias" data-name="${alias[1]}">${alias[0]}</li>`);
      const matched = [...iconNames, ...iconAliases]
        .sort((a, b) => this.sortByMostMatched(a, b, name))
        .slice(0, 100)
        .join('\n');

      this.iconSearchList.insertAdjacentHTML('beforeend', matched);

      this.selected = this.iconSearchList.querySelector('li:first-of-type');
      this.selected.classList.add('selected');
    });
  }

  async getJson(url) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Data from JSON file:', data);

      return data;
    } catch (error) {
      console.error('Error fetching or parsing JSON:', error);
      throw error;
    }
  }

  async loadConfig() {
    const config = {};
    const iconNamesAPI = 'assets/js/icons/icons-names.json';
    const iconAliasesAPI = 'assets/js/icons/icons-aliases.json';

    try {
      config.iconNames = await this.getJson(iconNamesAPI);
      config.iconAliases = await this.getJson(iconAliasesAPI);

      console.log('Configuration loaded successfully:', config);
      return config;
    } catch (error) {
      console.error('Failed to load configuration:', error);
      throw error;
    }
  }

  saveConfig() {
    localStorage.setItem(this.configName, JSON.stringify(this.config));
  }

  searchIcon(name) {
    const compare = (a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' });
    const names = name.toLowerCase().split(' ');
    const results = {
      iconNames: [],
      iconAliases: [],
    };

    // search in the iconNames
    if (this.config.iconNames) {
      results.iconNames = this.config.iconNames.filter((iconName) => {
        return names.every((name) => iconName.toLowerCase().includes(name));
      });
    }

    // search in the iconAliases
    if (this.config.iconAliases) {
      results.iconAliases = this.config.iconAliases.filter(([key]) => {
        return names.every((name) => key.toLowerCase().includes(name));
      });
    }

    return results;
  }
}

export default IconSearch;
