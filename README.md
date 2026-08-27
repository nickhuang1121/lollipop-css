# 🍭 LollipopCSS

**Write less CSS. Stay lazy.**

LollipopCSS is a tiny CSS preprocessor for defining your own reusable values, shortcuts, and style snippets.

### 🍭 Live Demo

**[Try LollipopCSS →](https://nickhuang1121.github.io/lollipop-css/)**

SCSS can already do all of this. That's not the problem.

The problem is that when I'm maintaining a large project, I'm too lazy to keep writing `@mixin` and `@include` over and over again.

So I made LollipopCSS.

**Yes, I'm lazy. Very lazy. 🍭**

I have better things to do — like eating McFlurries and lollipops. 🍦🍭

---

## Why LollipopCSS?

CSS and SCSS already have variables.

### CSS

Native CSS variables work perfectly fine:

```css
:root {
    --normal-red: #FF0000;
    --normal-size: 10px;
}

.button {
    color: var(--normal-red);
    font-size: var(--normal-size);
    padding-left: var(--normal-size);
}

.card {
    color: var(--normal-red);
    font-size: var(--normal-size);
    padding-left: var(--normal-size);
}
```

Nothing wrong with that.

It's just more typing than I want to do.

### SCSS

SCSS makes variables shorter:

```scss
$normalRed: #FF0000;
$normalSize: 10px;

.button {
    color: $normalRed;
    font-size: $normalSize;
    padding-left: $normalSize;
}

.card {
    color: $normalRed;
    font-size: $normalSize;
    padding-left: $normalSize;
}
```

And of course, SCSS can go further with mixins:

```scss
$normalRed: #FF0000;
$normalSize: 10px;

@mixin normalStyle {
    color: $normalRed;
    font-size: $normalSize;
    padding-left: $normalSize;
}

.button {
    @include normalStyle;
}

.card {
    @include normalStyle;
}
```

SCSS can already do all of this.

**That's not the problem.**

The problem is that I'm lazy.

I don't want to keep typing:

```scss
@include normalStyle;
```

when this would do:

```css
...normalStyle
```

And sometimes I don't even want to type:

```css
color: var(--normal-red);
```

when this would do:

```css
colorRed
```

That's where LollipopCSS comes in.

---

## LollipopCSS 🍭

Define your values and shortcuts once:

```css
@lollipop {
    normalRed #FF0000
    normalSize 10px

    colorRed color normalRed
    fontSizeMd font-size normalSize
    paddingLNormal padding-left normalSize
    padding padding normalSize
}
```

Then use them anywhere:

```css
.button {
    colorRed
    fontSizeMd
    paddingLNormal
}

.card {
    colorRed
    fontSizeMd
    padding
}
```

LollipopCSS compiles it to normal CSS:

```css
.button {
    color: #FF0000;
    font-size: 10px;
    padding-left: 10px;
}

.card {
    color: #FF0000;
    font-size: 10px;
    padding: 10px;
}
```

**Define once. Type less everywhere else.**

---

## Features

* 🍭 Define reusable values
* 🍭 Create your own CSS shortcuts
* 🍭 Reuse entire style blocks with snippets
* 🍭 Mix LollipopCSS with normal CSS
* 🍭 Unknown CSS is left untouched
* 🍭 Handles nested braces
* 🍭 Handles strings and comments while parsing
* 🍭 Browser runtime support
* 🍭 External `.lcss` stylesheets
* 🍭 Inline LollipopCSS
* 🍭 No dependencies

---

## Values

A value is the simplest LollipopCSS definition.

```css
@lollipop {
    normalRed #FF0000
    normalSize 10px
    largeSize 24px
}
```

Syntax:

```text
<name> <value>
```

For example:

```css
normalRed #FF0000
```

Values can then be referenced by shortcuts.

---

## Shortcuts

A shortcut maps your own command to a CSS property and value.

Syntax:

```text
<name> <css-property> <value>
```

For example:

```css
@lollipop {
    normalRed #FF0000
    normalSize 10px

    colorRed color normalRed
    fontSizeMd font-size normalSize
    padding padding normalSize
}
```

Now instead of:

```css
.button {
    color: #FF0000;
    font-size: 10px;
    padding: 10px;
}
```

you can write:

```css
.button {
    colorRed
    fontSizeMd
    padding
}
```

The names are completely up to you.

Want shorter names?

```css
@lollipop {
    red #FF0000
    md 10px

    cr color red
    fs font-size md
    p padding md
}

.button {
    cr
    fs
    p
}
```

Go for it.

LollipopCSS doesn't care what you call them.

**Your shortcuts. Your rules.**

---

## Snippets

Sometimes even shortcuts are too much typing.

Define an entire reusable CSS block:

```css
@lollipop {
    normalStyle {
        color: #FF0000;
        font-size: 10px;
        padding-left: 10px;
    }
}
```

Then use it with `...`:

```css
.button {
    ...normalStyle
}

.card {
    ...normalStyle
}

.dialog {
    ...normalStyle
}
```

Compiled CSS:

```css
.button {
    color: #FF0000;
    font-size: 10px;
    padding-left: 10px;
}

.card {
    color: #FF0000;
    font-size: 10px;
    padding-left: 10px;
}

.dialog {
    color: #FF0000;
    font-size: 10px;
    padding-left: 10px;
}
```

No `@mixin`.

No `@include`.

Just:

```css
...normalStyle
```

Because I'm lazy.

---

## Mix Everything Together

Values, shortcuts, snippets, and normal CSS can all live together:

```css
@lollipop {
    primaryColor #FF0000
    normalSize 10px
    cardRadius 8px

    textPrimary color primaryColor
    fontNormal font-size normalSize

    flexCenter {
        display: flex;
        justify-content: center;
        align-items: center;
    }
}

.button {
    ...flexCenter

    textPrimary
    fontNormal

    width: 200px;
    height: 50px;
    border-radius: 8px;
}

.card {
    ...flexCenter

    background: white;
    border-radius: 8px;
}
```

LollipopCSS only expands the things it recognizes.

Everything else stays normal CSS.

---

## Normal CSS Is Still CSS

LollipopCSS isn't trying to replace CSS.

You don't have to create a shortcut for everything.

This is perfectly valid:

```css
.container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;

    textPrimary
    fontNormal
}
```

Use shortcuts where they save you time.

Use normal CSS everywhere else.

---

## Browser Usage

LollipopCSS can compile styles directly in the browser.

### External `.lcss` File

Create a LollipopCSS stylesheet:

```text
style.lcss
```

Then load it with:

```html
<script src="lollipop-css.js"></script>

<link
    rel="lollipop-stylesheet"
    href="style.lcss"
>
```

LollipopCSS will fetch the file, compile it, and inject the resulting CSS into the document.

---

## Inline LollipopCSS

You can also write LollipopCSS directly inside HTML:

```html
<script src="lollipop-css.js"></script>

<style type="text/lollipop">
@lollipop {
    red #FF0000
    normalSize 10px

    colorRed color red
    fontNormal font-size normalSize
}

.title {
    colorRed
    fontNormal
}
</style>
```

LollipopCSS automatically compiles it when the document is ready.

---

## JavaScript Usage

You can compile LollipopCSS manually:

```js
const compiler = new LollipopCSS();

const source = `
@lollipop {
    red #FF0000
    colorRed color red
}

.title {
    colorRed
}
`;

const css = compiler.compile(source);

console.log(css);
```

Output:

```css
.title {
    color: #FF0000;
}
```

---

## Apply Compiled CSS

Compiled CSS can be injected into the document:

```js
const compiler = new LollipopCSS();

const css = compiler.compile(source);

LollipopCSS.apply(css);
```

---

## Load an `.lcss` File

You can also load a stylesheet manually:

```js
LollipopCSS.load("./style.lcss");
```

Or get the compiled CSS as text:

```js
const css = await LollipopCSS.load("./style.lcss", {
    output: "text"
});
```

---

## Download Compiled CSS

LollipopCSS can generate a normal `.css` file in the browser:

```js
const compiler = new LollipopCSS();
const css = compiler.compile(source);

LollipopCSS.download(css, {
    filename: "style.css"
});
```

---

## CSS vs SCSS vs LollipopCSS

They aren't competitors trying to solve exactly the same problem.

### CSS

```css
color: var(--normal-red);
```

Powerful, native, and standard.

### SCSS

```scss
color: $normalRed;
```

More concise and much more powerful as a preprocessor.

### LollipopCSS

```css
colorRed
```

Less typing.

For reusable blocks:

### SCSS

```scss
@include normalStyle;
```

### LollipopCSS

```css
...normalStyle
```

That's basically the philosophy.

LollipopCSS isn't trying to beat SCSS on features.

**It is trying to beat me at being lazy.**

---

## Philosophy

LollipopCSS isn't trying to replace CSS.

It isn't trying to replace SCSS.

SCSS is mature, powerful, and can already accomplish the same kinds of things.

LollipopCSS has a much smaller goal:

> **If you're tired of typing something, make it shorter.**

Define your own vocabulary.

```css
colorRed
fontSizeMd
padding
...flexCenter
```

LollipopCSS turns it back into boring, normal CSS.

**Your shortcuts.
Your naming.
Your CSS.**

---

## Why "Lollipop"?

Because it's syntax sugar. 🍭

That's pretty much it.

Also, I needed an excuse to put a lollipop in the logo.

---

## Live Demo

Want to see it in action?

### 🍭 [Try LollipopCSS Live](https://nickhuang1121.github.io/lollipop-css/)

---

## Project Status

🚧 **Experimental**

LollipopCSS is currently under development.

The syntax and API may change before the first stable release.

If something breaks, congratulations — you may have found a bug.

---

## Contributing

Issues, ideas, bug reports, and pull requests are welcome.

Especially ideas that require me to type less.

---

## License

MIT License

---

# 🍭 LollipopCSS

**Write less CSS. Stay lazy.**

I have better things to do — like eating McFlurries and lollipops. 🍦🍭
