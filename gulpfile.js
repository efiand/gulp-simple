const { src, dest, watch, series, parallel } = require('gulp');
const {
	htmlhint,
	lintspaces,
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
const pkg = require('./package.json');
const { codeguide, config } = require('pineglade-config');

// Сборка HTML
const html = () => src('src/twig/pages/**/*.twig')
	.pipe(twig())
	.pipe(htmlmin(config.htmlmin))
	.pipe(dest('build'))
	.pipe(w3cHtmlValidator())
	.pipe(w3cHtmlValidator.reporter());

// Тестирование HTML
const htmlTest = () => src('src/twig/**/*.twig')
	.pipe(htmlhint(codeguide.htmlhint))
	.pipe(htmlhint.reporter())
	.pipe(lintspaces(pkg.lintspaces))
	.pipe(lintspaces.reporter());

// Сборка CSS
const css = () => src('src/less/style.less')
	.pipe(less())
	.pipe(postcss([
		require('mqpacker'),
		require('autoprefixer'),
		require('cssnano')
	]))
	.pipe(dest('build/css'));

// Тестирование CSS
const cssTest = () => src('src/less/**/*.less')
	.pipe(stylelint({
		reporters: [
			{
				console: true,
				formatter: 'string'
			}
		]
	}))
	.pipe(lintspaces(pkg.lintspaces))
	.pipe(lintspaces.reporter());

// Сборка JS
const js = () => src('src/js/script.js')
	.pipe(require('vinyl-named')())
	.pipe(require('webpack-stream')({
		mode: 'production',
		module: {
			rules: [
				{
					test: /\.js$/,
					use: {
						loader: 'babel-loader',
						options: pkg.babel
					}
				}
			]
		},
		optimization: {
			minimize:
				true
		}
	}, require('webpack')))
	.pipe(dest('build/js'));

// Тестирование JS
const jsTest = () => src(['gulpfile.js', 'src/js/**/.js'])
	.pipe(eslint({
		fix: false
	}))
	.pipe(eslint.format())
	.pipe(lintspaces(pkg.lintspaces))
	.pipe(lintspaces.reporter());

// Оптимизация изображений
const img = () => src('source/img/**/*.{svg,png,jpg}')
	.pipe(imagemin([
		imagemin.svgo(config.svgo),
		imagemin.optipng(),
		require('imagemin-jpegoptim')({
			max: 80,
			progressive: true
		})
	]))
	.pipe(dest('build/img'))
	.pipe(webp({
		quality: 80
	}))
	.pipe(dest('build/img'));

// Сборка спрайта
const sprite = () => src('src/sprite/**/*.svg')
	.pipe(imagemin([imagemin.svgo(config.svgo)]))
	.pipe(svgstore({
		inlineSvg: true
	}))
	.pipe(dest('build/img'));

// Копирование не нуждающихся в обработке исходников в билд
const copy = () => src('src/as-is/**/*.*')
	.pipe(dest('build'));

// Перезагрузка страницы в браузере
const reload = (done) => {
	browserSync.reload();
	done();
};

// Запуск сервера со слежением
const server = () => {
	browserSync.init({
		cors: true,
		notify: false,
		server: 'build',
		ui: false
	});

	watch('src/twig/**/*.twig', series(htmlTest, html, reload));
	watch('src/less/**/*.less', series(cssTest, css, reload));
	watch(['gulpfile.js', 'src/js/**/*.js'], series(jsTest, js, reload));
	watch('src/img/**/*.{svg,png,jpg}', series(img, reload));
	watch('src/sprite/**/*.svg', series(sprite, reload));
	watch('src/as-is/**/*.*', series(copy, reload));
};

// Очистка каталога билда перед сборкой
const clean = () => require('del')('build');

const test = parallel(htmlTest, cssTest, jsTest);
const build = series(parallel(test, clean), parallel(html, css, js, img, sprite, copy));
exports.test = test;
exports.build = build;
exports.default = series(build, server);
