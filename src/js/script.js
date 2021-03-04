import Page from './components/page';
import Field from './components/field';
import Form from './components/form';

window.components = {};

const initComponents = (selector, Component) => {
	window.components[selector] = [];
	for (const element of document.querySelectorAll(selector)) {
		window.components[selector].push(new Component(element));
	}
};

initComponents('.page', Page);
initComponents('.field', Field);
initComponents('.form', Form);
