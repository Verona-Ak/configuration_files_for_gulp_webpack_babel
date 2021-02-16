
let project_folder = "dist";   //папка, которую показываем заказчику
let source_folder = "src";    //папка-исходника

// Прописываем пути

let path = {                                     
    build:{                                     //путь, куда gulp будет выгружать обработанные файлы
        html: project_folder + "/",             //dist/index.html
        css: project_folder + "/css/",          //dist/css/style.css
        js: project_folder + "/js/",
        php: project_folder + "/",
        plugins: project_folder + "/plugins/",
        img: project_folder + "/img/",
        icons: project_folder + "/icons/",
        fonts: project_folder + "/fonts/",
    },
    src:{                                     //путь к исходникам
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html",],         
        css: source_folder + "/scss/style.scss",     //указываем конкретный scss файл, чтобы gulp обрабатывал только его      
        js: source_folder + "/js/**/*.js",
        php: source_folder + "/*.php",
        plugins: source_folder + "/plugins/**/*.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",          //  gulp будет просматривать все папки, кот. есть внутри {} - расширение. Т.о. будут отсеиваться файлы - не картинки
        icons: source_folder + "/icons/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: source_folder + "/fonts/*.ttf",
    },
    watch:{                                     //путь к папкам, кот. нужно "слушать" постоянно,отлавливать их изменения и налету что-то выполнять
        html: source_folder + "/**/*.html",   
        php: source_folder + "/**/*.php",          
        css: source_folder + "/scss/**/*.scss",          
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",          
        icons: source_folder + "/icons/**/*.{jpg,png,svg,gif,ico,webp}",     
    },
    clean: "./" + project_folder + "/",       // этот объект будет отвечать за удаление папки каждый раз, когда запускается gulp
};

//Объявление переменных

let { src, dest} = require('gulp'),
    gulp = require('gulp'),
    browsersync = require("browser-sync").create(),
    fileinclude = require("gulp-file-include"),
    del = require("del"),
    scss = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    group_media = require("gulp-group-css-media-queries"),
    clean_css = require("gulp-clean-css"),
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify-es").default,
    imagemin = require("gulp-imagemin");



function browserSync(params) {    // функция, кот. будет обновлять браузер
    browsersync.init({
        server:{
            baseDir: "./" + project_folder + "/"
        },
        port:3000,
        notify:false
    });

}

function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream());
}
function php() {
    return src(path.src.php)
        .pipe(fileinclude())
        .pipe(dest(path.build.php))
        .pipe(browsersync.stream());
}
function css() {
    return src(path.src.css)
        .pipe(
            scss({
                outputStyle:"expanded"        //не сжатый, развернутый формат
            })
        )
        .pipe(group_media())
        .pipe(
            autoprefixer({
                overrideBrowsweslist: ["lasr 5 versions"],
                cascade: true
            })
        )
        .pipe(dest(path.build.css))
        .pipe(clean_css())
        .pipe(
            rename({
                extname: ".min.css"
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream());
}
function plugins() {
    return src(path.src.plugins)
        .pipe(fileinclude())
        .pipe(dest(path.build.plugins))
        .pipe(browsersync.stream());
}
function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(
            rename({
                extname: ".min.js"
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream());
}
function images() {
    return src(path.src.img)
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                interlaced: true,
                optimizationlevel: 3
            })
        )
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream());
}

function icons() {
    return src(path.src.icons)
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                interlaced: true,
                optimizationlevel: 3
            })
        )
        .pipe(dest(path.build.icons))
        .pipe(browsersync.stream());
}

function watchFiles(params) {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
    gulp.watch([path.watch.icons], icons);
}

function clean(params) {
    return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(js, php, plugins, css, html, images, icons));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.icons = icons;
exports.images = images;
exports.js = js;
exports.php = php;
exports.plugins = plugins;
exports.css = css;
exports.build = build;
exports.html = html;
exports.watch = watch;
exports.default = watch;
