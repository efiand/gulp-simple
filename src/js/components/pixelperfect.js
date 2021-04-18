const PP_CLASS = 'pixelperfect';
const DEFAULT_OFFSETS = {
  mobile: [0, 0],
  tablet: [0, 0],
  desktop: [0, 0]
};
const { documentElement } = document;

export default class Pixelperfect {
	constructor({ page, bgValue, tabletBreakpoint, desktopBreakpoint }) {
		this._page = page;
		this._isPP = Boolean(Number(localStorage.getItem('pp') || 0));
		this._currentBreakpoint = '';
		this._tabletBreakpoint = tabletBreakpoint;
		this._desktopBreakpoint = desktopBreakpoint;
		this._bgValue = bgValue.replace('{page}', page);
		this._offsets = JSON.parse(localStorage.getItem('ppOffsets')) || {
			[this._page]: DEFAULT_OFFSETS
		};
		this._keydownHandler = this._keydownHandler.bind(this);
		this._changeScreenMode = this._changeScreenMode.bind(this);

		this._setBgProperty('mobile');
		this._setBgProperty('tablet');
		this._setBgProperty('desktop');

		this._changeScreenMode();

		if (!this._offsets[this._page]) {
			this._offsets[this._page] = DEFAULT_OFFSETS;
			this._saveOffsets();
		}
		this._setOffsets();
		this._managePP();

		window.addEventListener(`resize`, this._changeScreenMode);
		document.addEventListener('keydown', this._keydownHandler);
	}

	_changeScreenMode() {
		const {clientWidth} = document.body;
		const breakpoint = 'mobile';
		if (clientWidth >= this._desktopBreakpoint) {
			breakpoint = 'desktop';
		} else if (clientWidth >= this._tabletBreakpoint) {
			breakpoint = 'tablet';
		}
		if (this._currentBreakpoint !== breakpoint) {
			this._currentBreakpoint = breakpoint;
			this._setOffsets();
		}
	}

	_keydownHandler(evt) {
		if (document.activeElement !== document.body) {
			return;
		}

		if (evt.code === 'KeyP') {
			evt.preventDefault();
			this._isPP = !this._isPP;
			this._managePP();
		} else if (this._isPP && evt.code === 'ArrowUp') {
			evt.preventDefault();
			this._movePP(0, -1);
		} else if (this._isPP && evt.code === 'ArrowDown') {
			evt.preventDefault();
			this._movePP(0, 1);
		} else if (this._isPP && evt.code === `ArrowLeft`) {
			evt.preventDefault();
			this._movePP(-1, 0);
		} else if (this._isPP && evt.code === `ArrowRight`) {
			evt.preventDefault();
			this._movePP(1, 0);
		}
	}

	_managePP() {
		if (this._isPP) {
			documentElement.classList.add(PP_CLASS);
		} else {
			documentElement.classList.remove(PP_CLASS);
		}

		localStorage.setItem('pp', Number(this._isPP));
	}

	_movePP(x, y) {
		this._offsets[this._page][this._currentBreakpoint][0] += x;
		this._offsets[this._page][this._currentBreakpoint][1] += y;
		this._saveOffsets();
		this._setOffsets();
	}

	_saveOffsets() {
		localStorage.setItem('ppOffsets', JSON.stringify(this._offsets));
	}

	_setBgProperty(breakpoint) {
		documentElement.style.setProperty(`--pp-img-${breakpoint}`, this._bgValue.replace('{breakpoint}', breakpoint));
	}

	_setOffsets() {
		const [x, y] = this._offsets[this._page][this._currentBreakpoint];
		ppEl.style.setProperty(`--pp-offset-x`, `${x}px`);
		ppEl.style.setProperty(`--pp-offset-y`, `${y}px`);
	};
}
