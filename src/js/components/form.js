export default class Form {
	constructor(container) {
		this._form = container;

		this._form.addEventListener('submit', this._submitHandler.bind(this));
	}

	_submitHandler() {
		// Назначаем класс подсвечивания невалидных полей
		this._form.classList.add('form_validable');
	}
}
