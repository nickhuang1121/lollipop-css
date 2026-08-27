# 🍭 LollipopCSS

![Version](https://img.shields.io/badge/version-0.1.0-ffafcc)
![License](https://img.shields.io/badge/license-MIT-cdb4db)

**Write less CSS. Stay lazy.**

LollipopCSS is a tiny CSS preprocessor for defining your own values, shortcuts, and reusable style snippets.

SCSS can already do all of this. That's not the problem.

The problem is that when I'm maintaining a large project, I'm too lazy to keep writing `@mixin` and `@include` over and over again.

So I made LollipopCSS.

**Yes, I'm lazy. Very lazy. 🍭**

I have better things to do — like eating McFlurries and lollipops. 🍦🍭

---

## Why LollipopCSS?

Sometimes this:

```css
.button {
    color: #FF0000;
    font-size: 10px;
    padding-left: 10px;
}
```

still feels like too much typing.

With LollipopCSS, define your shortcuts once:

```css
@lollipop {
    normalRed #FF0000
    normalSize 10px

    colorRed color normalRed
    fontSizeMd font-size normalSize
    paddingLNormal padding-left normalSize
}
```

Then:

```css
.button {
    colorRed
    fontSizeMd
    paddingLNormal
}
```

LollipopCSS compiles it to:

```css
.button {
    color: #FF0000;
    font-size: 10px;
    padding-left: 10px;
}
```

Less typing.

More McFlurry. 🍦

---

## Features

* 🍭 Define reusable values
* 🍭 Create your own CSS shortcuts
* 🍭 Reuse entire blocks with snippets
* 🍭 Mix LollipopCSS with normal CSS
* 🍭 Keeps unknown CSS untouched
* 🍭 Handles nested braces, strings, and comments
* 🍭 Browser runtime support
* 🍭 No dependencies

---

## Values

Define reusable values:

```css
@lollipop {
    normalRed #FF0000
    normalSize 10px
}
```

Syntax:

```text
<name> <value>
```

Values can then be used when defining shortcuts:

```css
@lollipop {
    normalRed #FF0000
    normalSize 10px

    colorRed color normalRed
    fontSizeMd font-size normalSize
}
```

---

## Shortcuts

A shortcut consists of:

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

Instead of:

```css
.card {
    color: #FF0000;
    font-size: 10px;
    padding: 10px;
}
```

Write:

```css
.card {
    colorRed
    fontSizeMd
    padding
}
```

That's it.

---

## Snippets

Sometimes even shortcuts are too much work.

Define an entire reusable block:

```css
@lollipop {
    card {
        display: flex;
        padding: 10px;
        border-radius: 8px;
    }
}
```

Use it with `...`:

```css
.product {
    ...card
}
```

Compiled:

```css
.product {
    display: flex;
    padding: 10px;
    border-radius: 8px;
}
```

You can combine snippets and shortcuts:

```css
@lollipop {
    normalRed #FF0000

    colorRed color normalRed

    flexCenter {
        display: flex;
        justify-content: center;
        align-items: center;
    }
}

.button {
    colorRed
    ...flexCenter
}
```

---

## Normal CSS Is Still CSS

LollipopCSS doesn't try to replace CSS.

Write normal CSS whenever you want:

```css
.container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;

    colorRed
}
```

If LollipopCSS doesn't recognize a line as one of your shortcuts, it leaves it alone.

---

## Browser Usage

### External `.lcss` File

```html
<script src="lollipop-css.js"></script>

<link
    rel="lollipop-stylesheet"
    href="style.lcss"
>
```

LollipopCSS loads the file, compiles it, and injects the resulting CSS into the document.

---

### Inline LollipopCSS

```html
<script src="lollipop-css.js"></script>

<style type="text/lollipop">
@lollipop {
    red #FF0000
    colorRed color red
}

.title {
    colorRed
}
</style>
```

LollipopCSS automatically compiles it when the document is ready.

---

## JavaScript

You can also compile LollipopCSS manually:

```js
const compiler = new LollipopCSS();

const css = compiler.compile(`
@lollipop {
    red #FF0000
    colorRed color red
}

.title {
    colorRed
}
`);

console.log(css);
```

Output:

```css
.title {
    color: #FF0000;
}
```

---

## Philosophy

LollipopCSS isn't trying to replace CSS.

It isn't trying to replace SCSS either.

SCSS is powerful.

LollipopCSS is lazy.

The idea is simply:

> **If you're tired of typing something, make it shorter.**

Your shortcuts.
Your naming.
Your CSS.

LollipopCSS just expands it.

---

## Why "Lollipop"?

Because it's syntax sugar. 🍭

And because apparently I needed an excuse to put a lollipop in the logo.

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

The lollipop artwork used by the example page is from
[Twemoji](https://github.com/jdecked/twemoji) and is licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

---

**LollipopCSS 🍭**

Write less CSS.
Stay lazy.
Eat more McFlurries.
