// Модули
const { src, dest, watch, series, parallel } = require('gulp');
const {
	htmlhint,
	lintspaces,
	data,
	twig,
	htmlmin,
	w3cHtmlValidator,
	stylelint,
	less,
	postcss,
	eslint,
	imagemin,
	webp,
	svgstore
} = require('gulp-load-plugins')();
const browserSync = require('browser-sync').create();

// Настройки
const {
	DEST,
	ESLINT,
	HTMLHINT,
	HTMLMIN,
	JPEGOPTIM,
	LINTSPACES,
	SERVER,
	STYLELINT,
	SVGO,
	SVGSTORE,
	WEBP,
	WEBPACK
} = require('pineglade-config').gulp;

const { IS_DEV = 0 } = process.env;
const LESS_SRC = ['src/less/style.less'];
const JS_SRC = ['src/js/script.js'];
if (IS_DEV) {
	LESS_SRC.push('src/less/dev.less');
	JS_SRC.push('src/js/dev.js');
}

// Сборка HTML
const buildHTML = () => src('src/twig/pages/**/*.twig')
	.pipe(data((file) => {
		const page = file.path.replace(/\\/g, '/').replace(/^.*?twig\/pages\/(.*)\.twig$/, '$1');
		const rootSrc = page.split('/');
		rootSrc.pop();

		return {
			IS_DEV,
			page,
			root: rootSrc.fill('../').join('')
		};
	}))
	.pipe(twig({
		filters: [
			{
				func(str, nbsp) {
					// Висячие предлоги, союзы и единицы измерения
					return str.replace(/( | |&nbsp;|\(|>){1}([№а-уА-У]{1}|\d+) /gu, `$1$2${nbsp || ' '}`); // eslint-disable-line
				},
				name: 'typograph'
			}
		]
	}))
	.pipe(htmlmin(HTMLMIN))
	.pipe(dest(DEST))
	.pipe(w3cHtmlValidator())
	.pipe(w3cHtmlValidator.reporter());

// Тестирование HTML
const testHTML = () => src('src/twig/**/*.twig')
	.pipe(htmlhint(HTMLHINT))
	.pipe(htmlhint.reporter())
	.pipe(lintspaces(LINTSPACES))
	.pipe(lintspaces.reporter());

// Сборка CSS
const buildCSS = () => src(LESS_SRC)
	.pipe(less())
	.pipe(postcss([
		require('mqpacker'),
		require('autoprefixer'),
		require('cssnano')
	]))
	.pipe(dest(`${DEST}/css`));

// Тестирование CSS
const testCSS = () => src('src/less/**/*.less')
	.pipe(stylelint(STYLELINT))
	.pipe(lintspaces(LINTSPACES))
	.pipe(lintspaces.reporter());

// Сборка JS
const buildJS = () => src(JS_SRC)
	.pipe(require('vinyl-named')())
	.pipe(require('webpack-stream')(WEBPACK, require('webpack')))
	.pipe(dest(`${DEST}/js`));

// Тестирование JS
const testJS = () => src(['gulpfile.js', 'src/js/**/.js'])
	.pipe(eslint(ESLINT))
	.pipe(eslint.format())
	.pipe(lintspaces(LINTSPACES))
	.pipe(lintspaces.reporter());

// Оптимизация изображений
const buildImages = () => src('src/img/**/*.{svg,png,jpg}')
	.pipe(imagemin([
		imagemin.svgo(SVGO),
		imagemin.optipng(),
		require('imagemin-jpegoptim')(JPEGOPTIM)
	]))
	.pipe(dest(`${DEST}/img`))
	.pipe(webp(WEBP))
	.pipe(dest(`${DEST}/img`));

// Сборка спрайта
const buildSprite = () => src('src/sprite/**/*.svg')
	.pipe(imagemin([imagemin.svgo(SVGO)]))
	.pipe(svgstore(SVGSTORE))
	.pipe(dest(`${DEST}/img`));

// Копирование не нуждающихся в обработке исходников в билд
const copyStatic = () => src('src/as-is/**/*')
	.pipe(dest(DEST));

// Копирование файлов PP
const copyPP = () => src('pixelperfect/**/*')
	.pipe(dest(`${DEST}/img/pixelperfect`));

// Перезагрузка страницы в браузере
const reload = (done) => {
	browserSync.reload();
	done();
};

// Запуск сервера со слежением
const server = () => {
	browserSync.init(SERVER);

	watch('src/twig/**/*.twig', series(testHTML, buildHTML, reload));
	watch('src/less/**/*.less', series(testCSS, buildCSS, reload));
	watch(['gulpfile.js', 'src/js/**/*.js'], series(testJS, buildJS, reload));
	watch('src/img/**/*.{svg,png,jpg}', series(buildImages, reload));
	watch('src/sprite/**/*.svg', series(buildSprite, reload));
	watch('src/as-is/**/*', series(copyStatic, reload));
	watch('pixelperfect/**/*', series(copyPP, reload));
};

// Очистка каталога билда перед сборкой
const cleanDest = () => require('del')(DEST);

const test = parallel(testHTML, testCSS, testJS);
const compile = parallel(buildHTML, buildCSS, buildJS, buildImages, buildSprite, copyStatic);
const build = series(parallel(test, cleanDest), compile);
exports.test = test;
exports.build = build;
exports.default = series(build, copyPP, server);
