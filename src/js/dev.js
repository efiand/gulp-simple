import Pixelperfect from './components/pixelperfect';

const [, page = 'index'] = window.location.pathname.match(/^\/(.*)\.html$/);

new Pixelperfect({
	page,
	bgValue: 'url("img/pixelperfect/{page}-{breakpoint}.jpg")',
	tabletBreakpoint: 768,
	desktopBreakpoint: 1024
});
