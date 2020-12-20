export default class Page {
	constructor(container) {
		this._page = container;

		const scrollbarWidth = window.innerWidth - this._page.clientWidth;
		this._page.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
		this._page.style.setProperty('--scrollbar-width-thin', `${scrollbarWidth / 2}px`);

		this._page.addEventListener('keydown', this._keydownHandler.bind(this));
	}

	_keydownHandler({ key }) {
		if (key === 'Tab') {
			this._page.classList.add('page_a11y');
			this._page.removeEventListener('keydown', setA11yHandler);
		}
	}
}
