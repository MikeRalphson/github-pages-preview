# GitHub-Pages-Preview

GitHub-Pages-Preview is a Node.js replacement for Jekyll sites, allowing you to build your site, as-is, without needing to install Ruby or Python. [The story behind the original version, JekyllJS](http://divillysausages.com/2016/01/24/leaving-jekyll-behind/).

![Screenshot](https://github.com/MikeRalphson/github-pages-preview/blob/master/docs/ghpp1.png?raw=true)

## Features ##

- No need to convert your site - liquid markup is handled using [liquid-node](https://github.com/sirlantis/liquid-node)
- Near identical output (see *Differences* below)
- Can optionally serve your site (including 404 page), so you can see your changes immediately
- Bonus liquid templates for generating a tags page, an archive page, and a RSS feed (found in the *bonus/* folder)
- It's very simple, so I'm having a hard time coming up with a fifth feature

## Differences ##

- **Code highlighting**: Jekyll uses Pygments or Rouge for code highlighting, while GitHub-Pages-Preview uses [highlight.js](https://highlightjs.org/). Your code still gets highlighted, just the output will be different
- **Dates**: Dates in JavaScript handle [Romance Daylight Time](https://en.wikipedia.org/wiki/Central_European_Time), meaning that if you're in Europe, any dates between the end of March to the end of October will have an extra hour in the output, i.e. `new Date( "2016-04-01 00:00:00 +0100" )` will print as `Fri Apr 01 2016 01:00:00 GMT+0200 (Romance Daylight Time)`. This may or may not be a problem for you, depending on how you use dates in your site
- **Categories**: GitHub-Pages-Preview doesn't support them, as I don't use them in my site. If there's a need, however, that can be changed
- **Collections**: Other than posts and drafts, not yet supported
- **Include variables**: Assigning [variables for the `{% include %}` tag](http://jekyllrb.com/docs/templates/#includes) isn't supported. If you need support for tokens (for dynamic includes), you need to apply the patch listed below. Having updated the dependencies, I'm investigating whether this limitation is still true. Third party confirmation would be gratefully received.
- **Null `{% if %}` checks**: If you check for null via `{% if someVar == null %}`, you'll need to change it to `{% if someVar == undefined %}` or just simply `{% if someVar %}`

## Patches ##

Liquid-node doesn't currently support tokens in the `{% include %}` tag, so if it's something you need, you can apply the quick patch fix found in *include.js* in the *patches/* directory. Just copy the file to the *node_modules/liquid-node/lib/liquid/tags/* folder after you've installed your dependencies.

When I added Markdown support using the [marked node.js library](https://github.com/chjj/marked) I found that it was escaping all quotes for all reasons, including normal text ("don't", "can't", "I'm", etc). I don't particularly like this behaviour (it's still valid HTML though), so I added a fix around it. Just replace the *marked.js* file in the *patches/* directory with the one in the *node_modules/marked/lib/* folder if you want to do the same.

## Config ##

GitHub-Pages-Preview comes with a simple config file, `config/default.yaml`, meaning you can change a few things without having to re-compile the project. It looks like this:

```yaml
log:
  level: info
src:
  '404': /404/
  path: /home/mike/nodejs/mermade.github.io/
meta:
  keywords: 'default,keywords,here'
  description: default description
highlight:
  parentClassName: highlight
  shouldWrap: true
server:
  port: 4000
```

which translates as:

- `log.level`: the level used by [Bunyan](https://github.com/trentm/node-bunyan), the logger used by GitHub-Pages-Preview
- `src.path`: the full path to the folder containing your Jekyll site (i.e. where *_layouts/* and *_posts/* live)
- `src.404`: the path for the file to serve as the 404 page, if you have one
- `meta.keywords`: the default meta keywords to add to each page if the page doesn't specify any. Set to null or leave out to ignore this
- `meta.description`: the default meta description to add to each page if the page doesn't specify one. If null or left out, then the description in *_config.yml* will be used (if set)
- `opengraph.fb:admins`: the ID of the Facebook user that you want to associate as the admin of the page. If null, then it's not added to the page
- `opengraph.og:type`: the default type for each page, unless overwritten. If null and not overwritten, then it's not added to the page
- `opengraph.og:image`: the image to use as the default OpenGraph share. If null and not overwritten, then it's not added to the page
- `highlight.parentClassname`: the classname for the parent node for highlighted code. Use `highlight` to keep with the Jekyll generated code, or `hljs` to use the highlight.js version
- `highlight.shouldWrap`: Should we wrap our generated code in a div? Use `true` to keep with the Jekyll generated code, or `false` to use the highlight.js version (in which case the `highlight.parentClassname` will be applied to the code tag
- `server.port`: the port to use when serving the site

NOTE: other basic OpenGraph tags can be auto generated:

- `og:title`: the post title, or the site title if there isn't a post one: `<meta property="og:title" content="{% if page.title %}{{ page.title }}{% else %}{{ site.title }}{% endif %}" />`
- `og:site_name`: taken from *_config.yml*: `<meta property="og:site_name" content="{{ site.title }}"/>`
- `og:url`: the full canonical url of the page; `<meta property="og:url" content="{{ page.url | replace:'index.html','' | prepend: site.baseurl | prepend: site.url }}" />`

## Running GitHub-Pages-Preview ##

To compile your site, make sure the config in `config/default.yaml` is up to date, then open a command line and type:

`./ghpp`

If you want GitHub-Pages-Preview to serve your site as well, use:

`./ghpp serve`

## Sample Post YAML FrontMatter ##

A quick idea of the frontmatter for a post, some of which would override the site defaults:

```yaml
---
date: 2016-04-23 17:19:00 +0100
layout: post
permalink: /intro/
title: "Intro"
meta:
  keywords: one, two, three, four
  description: This is the description for the intro doc
opengraph:
  fb:admins: 1234567
  og:type: website
  og:image: /img/open_graph2.png
  og:locale: en_GB
  og:video: "http://some_video.com"
tracking:
  fbpixel: XXXXXXXXXXXXXXX
---
```

where:

- `date`: the date the post was published
- `layout`: the layout to use for the post
- `permalink`: the permalink for the post
- `title`: the title for the post
- `meta.keywords`: keywords to use for the `<meta>` tag in the page head. If null, then the defaults from the config are used
- `meta.description`: the description to use for the `<meta>` tag in the page head. If null, then the default from the config is used
- `opengraph.fb:admins`: the ID of the Facebook user to set as the admin from the page. If null, then the default from the config is used
- `opengraph.og:type`: the type of the page for opengraph. If null, then the default from the config is used
- `opengraph.og:image`: the image to use for opengraph. If null, then the default from the config is used
- `og:locale`/`og:video`: any other opengraph tag will be added to the page automatically
- `tracking:fbpixel`: the ID of the Facebook tracking pixel that you want to add to the page

## Theme support

Check out GitHub pages themes into the `themes` directory.

You may need to add `{% endseo %}` tags until I can figure out how to create auto-closing tags in Liquid.

You can build the `scss` into plain `css` with the included `buildStyle` script.
