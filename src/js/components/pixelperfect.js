const PP_CLASS = 'pixelperfect';

export default class Pixelperfect {
	constructor({page, bgValue = 'none'}) {
		this._page = page;
		this._el = document.createElement('div');
		this._isPP = Boolean(Number(localStorage.getItem('pp') || 0));
		this._bgValue = bgValue.replace('{page}', page);
		this._offsets = JSON.parse(localStorage.getItem('ppOffsets')) || {};

		this._keydownHandler = this._keydownHandler.bind(this);
	}

	init() {
		if (!this._offsets[this._page]) {
			this._offsets[this._page] = 0;
			localStorage.setItem('ppOffsets', JSON.stringify(this._offsets));
		}
		document.body.insertAdjacentElement('beforeend', this._el);
		this._managePP();

		document.addEventListener('keydown', this._keydownHandler);
	}

	_managePP() {
		if (this._isPP) {
			this._el.classList.add(PP_CLASS);
		} else {
			this._el.classList.remove(PP_CLASS);
		}

		localStorage.setItem('pp', Number(this._isPP));
	}

	_movePP(offset) {
		this._ppOffsets[this._page] += offset;
		localStorage.setItem('ppOffsets', JSON.stringify(this._ppOffsets));
		this._el.style.setProperty('--pp-offset', `${this._ppOffsets[this._page]}px`);
	}

	_keydownHandler(evt) {
		if (document.activeElement !== document.body) {
			return;
		}
		evt.preventDefault();

		if (evt.code === 'KeyP') {
			this._isPP = !this._isPP;
			managePP();
		} else if (this._isPP && evt.code === 'ArrowUp') {
			movePP(-1);
		} else if (this._isPP && evt.code === 'ArrowDown') {
			movePP(1);
		}
	}
}
