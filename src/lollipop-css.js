

class LollipopCSS {
    findClosingBrace(source, openBrace) {
        let depth = 0;
        let quote = "";
        let escaped = false;
        let lineComment = false;
        let blockComment = false;

        for (let i = openBrace; i < source.length; i++) {
            const char = source[i];
            const next = source[i + 1];

            if (lineComment) {
                if (char === "\n" || char === "\r") lineComment = false;
                continue;
            }
            if (blockComment) {
                if (char === "*" && next === "/") {
                    blockComment = false;
                    i++;
                }
                continue;
            }
            if (quote) {
                if (escaped) {
                    escaped = false;
                } else if (char === "\\") {
                    escaped = true;
                } else if (char === quote) {
                    quote = "";
                }
                continue;
            }
            if (char === "/" && next === "/") {
                lineComment = true;
                i++;
                continue;
            }
            if (char === "/" && next === "*") {
                blockComment = true;
                i++;
                continue;
            }
            if (char === '"' || char === "'") {
                quote = char;
                continue;
            }
            if (char === "{") depth++;
            if (char === "}" && --depth === 0) return i;
        }

        return -1;
    }

    findLollipopBlock(source) {
        let quote = "";
        let escaped = false;
        let lineComment = false;
        let blockComment = false;

        for (let i = 0; i < source.length; i++) {
            const char = source[i];
            const next = source[i + 1];

            if (lineComment) {
                if (char === "\n" || char === "\r") lineComment = false;
                continue;
            }
            if (blockComment) {
                if (char === "*" && next === "/") {
                    blockComment = false;
                    i++;
                }
                continue;
            }
            if (quote) {
                if (escaped) escaped = false;
                else if (char === "\\") escaped = true;
                else if (char === quote) quote = "";
                continue;
            }
            if (char === "/" && next === "/") {
                lineComment = true;
                i++;
                continue;
            }
            if (char === "/" && next === "*") {
                blockComment = true;
                i++;
                continue;
            }
            if (char === '"' || char === "'") {
                quote = char;
                continue;
            }
            if (!source.startsWith("@lollipop", i)) continue;

            const nameEnd = i + "@lollipop".length;
            if (/[\w-]/.test(source[nameEnd] || "")) continue;

            let openBrace = nameEnd;
            while (/\s/.test(source[openBrace] || "")) openBrace++;
            if (source[openBrace] === "{") return { start: i, openBrace };
        }

        return null;
    }

    extractSweetBlock(source) {
        const configs = [];
        let css = source;
        let block;

        while ((block = this.findLollipopBlock(css)) !== null) {
            const { start, openBrace } = block;
            const closeBrace = this.findClosingBrace(css, openBrace);
            if (closeBrace === -1) {
                throw new Error("@lollipop block is missing a closing }");
            }

            configs.push(css.slice(openBrace + 1, closeBrace));
            // Remove the entire block so its line breaks do not add blank space
            // to the beginning of the compiled output.
            css = css.slice(0, start) + css.slice(closeBrace + 1);
        }

        if (!configs.length) {
            // The @lollipop configuration is optional, so plain CSS/SCSS files
            // can pass through the automatic loader unchanged.
            return { config: "", css: source };
        }

        return {
            config: configs.join("\n"),
            css
        };
    }

    parseConfig(config) {
        const values = {};
        const utilities = {};
        const snippets = {};
        let simpleConfig = config;

        // Extract name { ... } snippets first while preserving line breaks for
        // the remaining configuration parser.
        const blockPattern = /(^|[\r\n])([ \t]*)([a-zA-Z_][\w-]*)[ \t]*\{/g;
        let blockMatch;
        while ((blockMatch = blockPattern.exec(config)) !== null) {
            const name = blockMatch[3];
            const openBrace = config.indexOf("{", blockMatch.index + blockMatch[1].length);
            const closeBrace = this.findClosingBrace(config, openBrace);
            if (closeBrace === -1) {
                throw new Error(`Snippet "${name}" is missing a closing }`);
            }

            snippets[name] = config.slice(openBrace + 1, closeBrace);
            simpleConfig = simpleConfig.slice(0, blockMatch.index)
                + simpleConfig.slice(blockMatch.index, closeBrace + 1).replace(/[^\r\n]/g, " ")
                + simpleConfig.slice(closeBrace + 1);
            blockPattern.lastIndex = closeBrace + 1;
        }

        const lines = simpleConfig
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line && !line.startsWith("//") && !line.startsWith("/*"));
       

        // Parse custom values.
        for (const line of lines) {
            const parts = line.split(/\s+/);
            if (parts.length === 2) {
                const [name, value] = parts;
                values[name] = value;
            }
        }

        // Parse CSS utilities. Every token after the property belongs to its
        // value, allowing space-separated values such as margins and shadows.
        for (const line of lines) {
            const parts = line.split(/\s+/);

            if (parts.length >= 3) {
                const [name, property, ...rawValues] = parts;
                utilities[name] = {
                    property,
                    value: rawValues
                        .map(rawValue => values[rawValue] ?? rawValue)
                        .join(" ")
                }
            }
        }

        return { values, utilities, snippets };
    }

    formatSnippet(snippet, indentation, newline) {
        const lines = snippet.split(/\r\n|\n|\r/);
        while (lines.length && !lines[0].trim()) lines.shift();
        while (lines.length && !lines[lines.length - 1].trim()) lines.pop();

        const indents = lines
            .filter(line => line.trim())
            .map(line => line.match(/^[ \t]*/)[0].length);
        const commonIndent = indents.length ? Math.min(...indents) : 0;

        return lines
            .map(line => indentation + line.slice(commonIndent))
            .join(newline);
    }

    advanceSyntaxState(text, state) {
        let lineComment = false;
        let escaped = false;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const next = text[i + 1];

            if (lineComment) {
                if (char === "\n" || char === "\r") lineComment = false;
                continue;
            }
            if (state.blockComment) {
                if (char === "*" && next === "/") {
                    state.blockComment = false;
                    i++;
                }
                continue;
            }
            if (state.quote) {
                if (escaped) {
                    escaped = false;
                } else if (char === "\\") {
                    escaped = true;
                } else if (char === state.quote) {
                    state.quote = "";
                }
                continue;
            }
            if (char === "/" && next === "*") {
                state.blockComment = true;
                i++;
                continue;
            }
            if (char === "/" && next === "/") {
                lineComment = true;
                i++;
                continue;
            }
            if (char === '"' || char === "'") {
                state.quote = char;
            }
        }
    }

    replaceConfigValues(value, values) {
        const names = Object.keys(values).sort((a, b) => b.length - a.length);
        if (!names.length) return value;

        const escapedNames = names.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
        const pattern = new RegExp(`(?<![\\w-])(${escapedNames.join("|")})(?![\\w-])`, "g");
        return value.replace(pattern, name => values[name]);
    }

    compileCss(css, values, utilities, snippets) {
        const parts = css.split(/(\r\n|\n|\r)/);
        const defaultNewline = css.match(/\r\n|\n|\r/)?.[0] ?? "\n";
        const syntaxState = { blockComment: false, quote: "" };

        for (let i = 0; i < parts.length; i += 2) {
            const line = parts[i];
            const command = line.trim();
            const indentation = line.match(/^[ \t]*/)?.[0] ?? "";
            const newline = parts[i + 1] || defaultNewline;
            const canExpand = !syntaxState.blockComment && !syntaxState.quote;

            const snippetMatch = command.match(/^\.\.\.([a-zA-Z_][\w-]*)$/);
            if (canExpand && snippetMatch && snippets[snippetMatch[1]] !== undefined) {
                // Compile utility commands and configured values inside the snippet
                // before inserting it into the surrounding selector. Nested snippets
                // are disabled here to prevent accidental recursive expansion.
                const snippet = this.compileCss(
                    snippets[snippetMatch[1]],
                    values,
                    utilities,
                    {}
                );
                parts[i] = this.formatSnippet(snippet, indentation, newline);
            } else if (canExpand && utilities[command]) {
                const { property, value } = utilities[command];
                parts[i] = `${indentation}${property}: ${value};`;
            } else if (canExpand) {
                // Normal CSS declarations can also use configured values, for example:
                // border: 1px solid colorDeepSky;
                const declaration = line.match(/^(\s*[-\w]+\s*:\s*)(.*?)(;?\s*)$/);
                if (declaration) {
                    const suffix = declaration[3].startsWith(";")
                        ? declaration[3]
                        : `;${declaration[3]}`;
                    parts[i] = declaration[1]
                        + this.replaceConfigValues(declaration[2], values)
                        + suffix;
                }
            }
            // Preserve content that does not belong to LollipopCSS.
            this.advanceSyntaxState(parts[i] + (parts[i + 1] || ""), syntaxState);
        }

        return parts.join("");
    }

    hasImportDirective(source) {
        const parts = source.split(/(\r\n|\n|\r)/);
        const syntaxState = { blockComment: false, quote: "" };

        for (let i = 0; i < parts.length; i += 2) {
            const line = parts[i];
            if (!syntaxState.blockComment && !syntaxState.quote
                && /^@importlollipop\s+(["']).+?\1\s*;?$/.test(line.trim())) {
                return true;
            }
            this.advanceSyntaxState(line + (parts[i + 1] || ""), syntaxState);
        }

        return false;
    }

    compile(source) {
        if (this.hasImportDirective(source)) {
            throw new Error(
                "@importlollipop requires compileAsync() or LollipopCSS.load()"
            );
        }
        const { config, css } = this.extractSweetBlock(source);
        const { values, utilities, snippets } = this.parseConfig(config);
        return this.compileCss(css, values, utilities, snippets);
    }

    async expandImports(source, options = {}, importStack = new Set()) {
        const parts = source.split(/(\r\n|\n|\r)/);
        const syntaxState = { blockComment: false, quote: "" };
        const loadImport = options.loadImport || LollipopCSS.fetchImport;

        for (let i = 0; i < parts.length; i += 2) {
            const line = parts[i];
            const canImport = !syntaxState.blockComment && !syntaxState.quote;
            const match = canImport && line.trim().match(
                /^@importlollipop\s+(["'])(.+?)\1\s*;?$/
            );

            if (!match) {
                this.advanceSyntaxState(line + (parts[i + 1] || ""), syntaxState);
                continue;
            }

            const imported = await loadImport(match[2], options.baseUrl || "");
            const importedSource = typeof imported === "string"
                ? imported
                : imported.source;
            const importedBaseUrl = typeof imported === "string"
                ? match[2]
                : (imported.baseUrl || match[2]);

            if (typeof importedSource !== "string") {
                throw new Error(`Import loader returned no source for ${match[2]}`);
            }
            if (importStack.has(importedBaseUrl)) {
                throw new Error(`Circular @importlollipop detected: ${importedBaseUrl}`);
            }

            const nextStack = new Set(importStack);
            nextStack.add(importedBaseUrl);
            parts[i] = await this.expandImports(importedSource, {
                ...options,
                baseUrl: importedBaseUrl,
                loadImport
            }, nextStack);
        }

        return parts.join("");
    }

    async compileAsync(source, options = {}) {
        const stack = new Set();
        if (options.baseUrl) stack.add(options.baseUrl);
        return this.compile(await this.expandImports(source, options, stack));
    }

    static async fetchImport(specifier, baseUrl) {
        const url = new URL(specifier, baseUrl).href;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load ${url}: ${response.status}`);
        }
        return {
            source: await response.text(),
            baseUrl: response.url || url
        };
    }

    static apply(css, target = document.head) {
        const style = document.createElement("style");
        style.textContent = css;
        target.appendChild(style);
        return style;
    }

    static download(content, options = {}) {
        const filename = options.filename || "style.css";
        const extension = filename.split(".").pop().toLowerCase();
        const type = extension === "scss"
            ? "text/x-scss;charset=utf-8"
            : "text/css;charset=utf-8";
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = filename;
        anchor.style.display = "none";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 0);

        return filename;
    }

    static async load(url, options = {}) {
        const output = options.output || "style";
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load ${url}: ${response.status}`);
        }

        const compiler = new LollipopCSS();
        const css = await compiler.compileAsync(await response.text(), {
            baseUrl: response.url || new URL(url, document.baseURI).href
        });

        if (output === "text") return css;
        if (output === "download") {
            return LollipopCSS.download(css, {
                filename: options.filename || "style.css"
            });
        }
        if (output !== "style") {
            throw new Error(`Unsupported output mode: ${output}`);
        }

        const style = LollipopCSS.apply(css, options.target || document.head);
        style.dataset.lollipopSource = url;
        return style;
    }

    static async loadLinks(root = document) {
        const links = root.querySelectorAll('link[rel="lollipop-stylesheet"]');
        return Promise.all(Array.from(links, async link => {
            const css = await LollipopCSS.load(link.href, { output: "text" });
            const style = document.createElement("style");
            style.dataset.lollipopSource = link.href;
            style.textContent = css;
            link.replaceWith(style);
            return style;
        }));
    }

    static compileInline(root = document) {
        const sources = root.querySelectorAll('style[type="text/lollipop"]');
        return Array.from(sources, source => {
            const compiler = new LollipopCSS();
            const style = document.createElement("style");
            style.dataset.lollipopInline = "";
            style.textContent = compiler.compile(source.textContent);
            source.replaceWith(style);
            return style;
        });
    }

    static async auto(root = document) {
        LollipopCSS.compileInline(root);
        return LollipopCSS.loadLinks(root);
    }

}

LollipopCSS.version = "0.2.0";
globalThis.LollipopCSS = LollipopCSS;

// CommonJS export for Node.js tests and server-side compilation.
if (typeof module !== "undefined" && module.exports) {
    module.exports = LollipopCSS;
}

// Automatic loading is a browser-only feature.
if (typeof document !== "undefined" && document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        LollipopCSS.auto().catch(error => console.error("LollipopCSS auto-load failed:", error));
    });
} else if (typeof document !== "undefined") {
    LollipopCSS.auto().catch(error => console.error("LollipopCSS auto-load failed:", error));
}
