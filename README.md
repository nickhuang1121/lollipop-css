## Why LollipopCSS?

Defining a shortcut takes a little extra work once.

```css
@lollipop {
    normalRed #FF0000
    normalSize 10px

    colorRed color normalRed
    fontSizeMd font-size normalSize
    paddingLNormal padding-left normalSize
}
```

But in a large project, you don't write CSS once.

You write it again...

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

.menu {
    color: #FF0000;
    font-size: 10px;
    padding-left: 10px;
}
```

...and again.

...and again.

With LollipopCSS:

```css
.button {
    colorRed
    fontSizeMd
    paddingLNormal
}

.card {
    colorRed
    fontSizeMd
    paddingLNormal
}

.dialog {
    colorRed
    fontSizeMd
    paddingLNormal
}

.menu {
    colorRed
    fontSizeMd
    paddingLNormal
}
```

And if even that feels like too much typing:

```css
@lollipop {
    normal {
        color: #FF0000;
        font-size: 10px;
        padding-left: 10px;
    }
}

.button {
    ...normal
}

.card {
    ...normal
}

.dialog {
    ...normal
}

.menu {
    ...normal
}
```

That's the point.

**Define once. Type less everywhere else. 🍭**
