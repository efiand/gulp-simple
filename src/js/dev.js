import Pixelperfect from './components/pixelperfect';

const pageMatch = window.location.pathname.match(/^\/(.*)\.html$/);

const pixelPerfect = new Pixelperfect({
	page: pageMatch ? pageMatch[1] : 'index',
	bgValue: `url("img/pixelperfect/{page}.jpg")`
});
pixelPerfect.init();
