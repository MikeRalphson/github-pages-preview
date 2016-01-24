# README #

JekyllJS is a Node.js replacement for Jekyll sites, allowing you to build your site, as-is, without needing to install Ruby or Python. [The story behind it](http://divillysausages.com/2016/01/24/leaving-jekyll-behind/)

## Features ##

- No need to convert your site - liquid markup is handled using [liquid-node](https://github.com/sirlantis/liquid-node)
- Near identical output (see *Differences* below)
- Can optionally serve your site (including 404 page), so you can see your changes immediately
- Bonus liquid templates for generating a tags page, an archive page, and a RSS feed (found in the *bonus/* folder)
- It's very simple, so I'm having a hard time coming up with a fifth feature

## Differences ##

- **Code highlighting**: Jekyll uses Pygments or Rouge for code highlighting, while JekyllJS uses [highlight.js](https://highlightjs.org/). Your code still gets highlighted, just the output will be different
- **Dates**: Dates in JavaScript handle [Romance Daylight Time](https://en.wikipedia.org/wiki/Central_European_Time), meaning that if you're in Europe, any dates between the end of March to the end of October will have an extra hour in the output, i.e. `new Date( "2016-04-01 00:00:00 +0100" )` will print as `Fri Apr 01 2016 01:00:00 GMT+0200 (Romance Daylight Time)`. This may or may not be a problem for you, depending on how you use dates in your site
- **Categories**: JekyllJS doesn't support them, as I don't use them in my site. If there's a need, however, that can be changed
- **Include variables**: Assigning [variables for the `{% include %}` tag](http://jekyllrb.com/docs/templates/#includes) isn't supported. If you need support for tokens (for dynamic includes), you need to apply the patch listed below
- **Null `{% if %}` checks**: If you check for null via `{% if someVar == null %}`, you'll need to change it to `{% if someVar == undefined %}` or just simply `{% if someVar %}`

## Patches ##

Liquid-node doesn't currently support tokens in the `{% include %}` tag, so if it's something you need, you can apply the quick patch fix in the *patches/* directory. Just copy the file to the *node_modules/liquid-node/lib/liquid/tags/* folder after you've installed your dependencies.

## Config ##

JekyllJS comes with a [simple config](https://github.com/lorenwest/node-config) file, *config/default.json*, meaning you can change a few things without having to re-compile the project. It looks like this:

```
{
	"log":{
		"level":"info"
	},
	"src":{
		"path":"C:/PATH/TO/WEBSITE/",
		"404":"/404/"
	},
	"highlight":{
		"parentClassName":"highlight",
		"shouldWrap":true
	},
	"server":{
		"port":4000
	}
}
```

which translates as:

- `log.level`: the level used by [Bunyan](https://github.com/trentm/node-bunyan), the logger used by JekyllJS
- `src.path`: the full path to the folder containing your Jekyll site (i.e. where *_layouts/* and *_posts/* live)
- `src.404`: the path for the file to serve as the 404 page, if you have one
- `highlight.parentClassname`: the classname for the parent node for highlighted code. Use `highlight` to keep with the Jekyll generated code, or `hljs` to use the highlight.js version
- `highlight.shouldWrap`: Should we wrap our generated code in a div? Use `true` to keep with the Jekyll generated code, or `false` to use the highlight.js version (in which case the `highlight.parentClassname` will be applied to the code tag
- `server.port`: the port to use when serving the site

## Compiling JekyllJS ##

JekyllJS is written in [TypeScript](http://www.typescriptlang.org/), and comes with a project file for [Visual Studio Code](https://code.visualstudio.com/). You can install TypeScript using 

```npm install -g typescript```

The js files are included, so you don't need to have TypeScript in order to run JekyllJS.

## Running JekyllJS ##

To compile your site, make sure the config in *config/default.json* is up to date, then open a command line and type

```node app.js | "./node_modules/.bin/bunyan" -o short```

If you want JekyllJS to serve your site as well, use

```node app.js serve | "./node_modules/.bin/bunyan" -o short```