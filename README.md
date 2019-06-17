[![npm version](https://badgen.net/npm/v/@vaadin/vcf-enhanced-rich-text-editor)](https://www.npmjs.com/package/@vaadin/vcf-enhanced-rich-text-editor)
[![Bower version](https://badgen.net/github/release/vaadin/vcf-enhanced-rich-text-editor)](https://github.com/vaadin/vcf-enhanced-rich-text-editor/releases)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/vaadin/vcf-enhanced-rich-text-editor)
[![Build Status](https://travis-ci.org/vaadin/vcf-enhanced-rich-text-editor.svg?branch=master)](https://travis-ci.org/vaadin/vcf-enhanced-rich-text-editor)
[![Coverage Status](https://coveralls.io/repos/github/vaadin/vcf-enhanced-rich-text-editor/badge.svg?branch=master)](https://coveralls.io/github/vaadin/vcf-enhanced-rich-text-editor?branch=master)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/vaadin/web-components?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

 [![Published on Vaadin  Directory](https://img.shields.io/badge/Vaadin%20Directory-published-00b4f0.svg)](https://vaadin.com/directory/component/vaadinvcf-enhanced-rich-text-editor)
[![Stars on vaadin.com/directory](https://img.shields.io/vaadin-directory/star/vcf-enhanced-rich-text-editor-directory-urlidentifier.svg)](https://vaadin.com/directory/component/vaadinvcf-enhanced-rich-text-editor)


# &lt;vcf-enhanced-rich-text-editor&gt;

[Live Demo ↗](https://cdn.vaadin.com/vcf-enhanced-rich-text-editor/1.0.0-alpha6/demo/)
|
[API documentation ↗](https://cdn.vaadin.com/vcf-enhanced-rich-text-editor/1.0.0-alpha6)


[&lt;vcf-enhanced-rich-text-editor&gt;](https://vaadin.com/components/vcf-enhanced-rich-text-editor) is a Web Component providing rich text editor functionality, part of the [Vaadin components](https://vaadin.com/components).

<!--
```
<custom-element-demo>
  <template>
    <script src="../webcomponentsjs/webcomponents-lite.js"></script>
    <link rel="import" href="vcf-enhanced-rich-text-editor.html">
    <next-code-block></next-code-block>
  </template>
</custom-element-demo>
```
-->
```html
<vcf-enhanced-rich-text-editor>
  ...
</vcf-enhanced-rich-text-editor>
```

[<img src="https://raw.githubusercontent.com/vaadin/vcf-enhanced-rich-text-editor/master/screenshot.png" width="200" alt="Screenshot of vcf-enhanced-rich-text-editor">](https://vaadin.com/components/vcf-enhanced-rich-text-editor)


## Installation

The Vaadin components are distributed as Bower and npm packages.
Please note that the version range is the same, as the API has not changed.
You should not mix Bower and npm versions in the same application, though.

Unlike the official Polymer Elements, the converted Polymer 3 compatible Vaadin components
are only published on npm, not pushed to GitHub repositories.

### Polymer 2 and HTML Imports compatible version

Install `vcf-enhanced-rich-text-editor`:

```sh
bower i vaadin/vcf-enhanced-rich-text-editor --save
```

Once installed, import it in your application:

```html
<link rel="import" href="bower_components/vcf-enhanced-rich-text-editor/vcf-enhanced-rich-text-editor.html">
```

### Polymer 3 and ES Modules compatible version


Install `vcf-enhanced-rich-text-editor`:

```sh
npm i @vaadin/vcf-enhanced-rich-text-editor --save
```

Once installed, import it in your application:

```js
import '@vaadin/vcf-enhanced-rich-text-editor/vcf-enhanced-rich-text-editor.js';
```

### Bundling with webpack

When using `webpack` to bundle the application, do the following steps:

1. Install the loader:

```sh
npm install expose-loader --save-dev
```

2. Add these lines to the webpack config:
```
module: {
  rules: [
  ...
  {
    test: require.resolve('@vaadin/vcf-enhanced-rich-text-editor/vendor/vaadin-quill.js'),
    use: [{
      loader: 'expose-loader',
      options: 'Quill'
    }]
  }
```

## Getting started

Vaadin components use the Lumo theme by default.

To use the Material theme, import the correspondent file from the `theme/material` folder.

## Entry points

- The component with the Lumo theme:

  `theme/lumo/vcf-enhanced-rich-text-editor.html`

- The component with the Material theme:

  `theme/material/vcf-enhanced-rich-text-editor.html`

- Alias for `theme/lumo/vcf-enhanced-rich-text-editor.html`:

  `vcf-enhanced-rich-text-editor.html`


## Running demos and tests in a browser

1. Fork the `vcf-enhanced-rich-text-editor` repository and clone it locally.

1. Make sure you have [npm](https://www.npmjs.com/) and [Bower](https://bower.io) installed.

1. When in the `vcf-enhanced-rich-text-editor` directory, run `npm install` and then `bower install` to install dependencies.

1. Make sure you have [polymer-cli](https://www.npmjs.com/package/polymer-cli) installed globally: `npm i -g polymer-cli`.

1. Run `npm start`, browser will automatically open the component API documentation.

1. You can also open demo or in-browser tests by adding **demo** or **test** to the URL, for example:

  - http://127.0.0.1:3000/components/vcf-enhanced-rich-text-editor/demo
  - http://127.0.0.1:3000/components/vcf-enhanced-rich-text-editor/test


## Running tests from the command line

1. When in the `vcf-enhanced-rich-text-editor` directory, run `polymer test`


## Following the coding style

We are using [ESLint](http://eslint.org/) for linting JavaScript code. You can check if your code is following our standards by running `npm run lint`, which will automatically lint all `.js` files as well as JavaScript snippets inside `.html` files.


## Big Thanks

Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs](https://saucelabs.com).


## Contributing

  To contribute to the component, please read [the guideline](https://github.com/vaadin/vaadin-core/blob/master/CONTRIBUTING.md) first.


## License

Commercial Vaadin Add-on License version 3 (CVALv3). For license terms, see LICENSE.

Vaadin collects development time usage statistics to improve this product. For details and to opt-out, see https://github.com/vaadin/vaadin-usage-statistics.
