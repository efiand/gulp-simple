export default class Field {
	constructor(container) {
		this._field = container;

		this._savedValue = localStorage.getItem(input.name);
		if (this._savedValue) {
			this._field.value = this._savedValue;
		}

		this._field.addEventListener(`input`, this._inputHandler.bind(this));
	}

	_inputHandler() {
		const { name, value } = this._field;

		if (this._input.checkValidity()) {
			localStorage.setItem(name, value);
			this._savedValue = value;
		}
	}
}
