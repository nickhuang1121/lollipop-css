const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");
const LollipopCSS = require("../src/lollipop-css.js");

const compiler = new LollipopCSS();
let passed = 0;

function test(name, callback) {
    try {
        callback();
        passed++;
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        throw error;
    }
}

async function testAsync(name, callback) {
    try {
        await callback();
        passed++;
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        throw error;
    }
}

test("exposes the package version", () => {
    assert.equal(LollipopCSS.version, "0.2.0");
});

test("keeps plain CSS unchanged", () => {
    const source = ".card { color: red; }";
    assert.equal(compiler.compile(source), source);
});

test("expands values and utilities", () => {
    const result = compiler.compile(`@lollipop {
    pink #ffafcc
    BGpink background pink
}
.card {
    BGpink
}`);

    assert.match(result, /background: #ffafcc;/);
    assert.doesNotMatch(result, /@lollipop|BGpink/);
});

test("supports multi-part utility values", () => {
    const result = compiler.compile(`@lollipop {
    small 10px
    rounded border-radius 20px 20px small small
}
.card {
    rounded
}`);

    assert.match(result, /border-radius: 20px 20px 10px 10px;/);
});

test("replaces values in normal CSS declarations", () => {
    const result = compiler.compile(`@lollipop {
    sky #a2d2ff
}
.card {
    border: 1px solid sky;
    color: sky
}`);

    assert.match(result, /border: 1px solid #a2d2ff;/);
    assert.match(result, /color: #a2d2ff;/);
});

test("expands reusable snippets", () => {
    const result = compiler.compile(`@lollipop {
    spacing 10px
    displayGrid display grid
    card {
        displayGrid
        gap: spacing;
    }
}
.product {
    ...card
}`);

    assert.match(result, /display: grid;/);
    assert.doesNotMatch(result, /^\s*displayGrid\s*$/m);
    assert.match(result, /gap: 10px;/);
    assert.doesNotMatch(result, /gap: spacing;/);
    assert.doesNotMatch(result, /\.\.\.card/);
});

test("reports an unclosed @lollipop block", () => {
    assert.throws(
        () => compiler.compile("@lollipop {\nvalue 10px"),
        /@lollipop block is missing a closing }/
    );
});

test("directs imports to the asynchronous compiler", () => {
    assert.throws(
        () => compiler.compile('@importlollipop "./vars.lcss"'),
        /requires compileAsync\(\) or LollipopCSS\.load\(\)/
    );
});

async function runAsyncTests() {
    await testAsync("imports another LCSS file", async () => {
        const files = {
            "https://example.test/vars.lcss": `@lollipop {
    pink #ffafcc
}`
        };
        const result = await compiler.compileAsync(`@importlollipop "./vars.lcss"
@lollipop {
    BGpink background pink
}
.card {
    BGpink
}`, {
            baseUrl: "https://example.test/style.lcss",
            loadImport: async (specifier, baseUrl) => {
                const url = new URL(specifier, baseUrl).href;
                return { source: files[url], baseUrl: url };
            }
        });

        assert.match(result, /background: #ffafcc;/);
        assert.doesNotMatch(result, /@importlollipop|@lollipop|BGpink/);
    });

    await testAsync("compiles the imported public example", async () => {
        const examplePath = path.join(__dirname, "..", "examples", "style.lcss");
        const result = await compiler.compileAsync(
            fs.readFileSync(examplePath, "utf8"),
            {
                baseUrl: examplePath,
                loadImport: async (specifier, baseUrl) => {
                    const filePath = path.resolve(path.dirname(baseUrl), specifier);
                    return {
                        source: fs.readFileSync(filePath, "utf8"),
                        baseUrl: filePath
                    };
                }
            }
        );

        assert.doesNotMatch(result, /@importlollipop|@lollipop/);
        assert.match(result, /linear-gradient/);
        assert.match(result, /grid-template-columns/);
    });

    await testAsync("detects circular LCSS imports", async () => {
        const files = {
            "https://example.test/a.lcss": '@importlollipop "./b.lcss"',
            "https://example.test/b.lcss": '@importlollipop "./a.lcss"'
        };
        const loadImport = async (specifier, baseUrl) => {
            const url = new URL(specifier, baseUrl).href;
            return { source: files[url], baseUrl: url };
        };

        await assert.rejects(
            compiler.compileAsync(files["https://example.test/a.lcss"], {
                baseUrl: "https://example.test/a.lcss",
                loadImport
            }),
            /Circular @importlollipop detected/
        );
    });

    console.log(`\nAll ${passed} tests passed.`);
}

runAsyncTests().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
