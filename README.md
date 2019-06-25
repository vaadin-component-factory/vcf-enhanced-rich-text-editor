# &lt;vcf-enhanced-rich-text-editor&gt;
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/vaadin/web-components?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![Published on Vaadin  Directory](https://img.shields.io/badge/Vaadin%20Directory-published-00b4f0.svg)](https://vaadin.com/directory/component/vaadin-component-factoryvcf-enhanced-rich-text-editor)

&lt;vcf-enhanced-rich-text-editor&gt; is a Web Component providing rich text editor functionality.
This component is fork of [vaadin-rich-text-editor](https://vaadin.com/components/rich-text-editor), with enhanced functionality. 
On top of basic functionality of vaadin-rich-text-editor, you can use:
  * Tab-stops
  * Non-breaking space
  * Toolbar customization
  * Readonly text 

  [Live Demo ↗](https://incubator.app.fi/enhanced-rich-text-editor-demo/enhanced-rich-text-editor)

## Usage

```html
<vcf-enhanced-rich-text-editor>
  ...
</vcf-enhanced-rich-text-editor>
```


### Tabstops
Tabstops can be set in UI by clicking on horizontal rullen, on top of the editor. There are 3 tabstop types: left, right and middle. When you click on ruller left tabstop will appear, then if you click on left tabstop it will change to right tabstop, and if you click on right tabstop it will change to middle tabstop.
It is also possible to set tabstops programaticaly by using `tabStops` property of editor. For example:
```js
editor.tabStops = [{direction: 'left', position: 150}, {direction: 'middle', position: 350}, {direction: 'right', position: 500}];
```

After tabstops are set, you can use them in editor. when you are focused in editor, press `tab` button and cursore will move to next tabstop. If there are no more tabstops, then tab symbol will be inserted in to text. 


### Customizing toolbar
```js
<vcf-enhanced-rich-text-editor></vcf-enhanced-rich-text-editor>
<script>
  window.addEventListener('WebComponentsReady', function() {
    var rte = document.querySelector("vcf-enhanced-rich-text-editor");
    rte.toolbarButtons = {undo: false, redo: false, h1: false, h2: false, h3: false, image: false, link: false};
  });
</script>
```

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


# Vaadin Prime

This component is available in Vaadin Prime subscription. It is still open source, but you need to have a valid CVAL license in order to use it. Read more at: https://vaadin.com/pricing

## License

Commercial Vaadin Add-on License version 3 (CVALv3). For license terms, see LICENSE.

Vaadin collects development time usage statistics to improve this product. For details and to opt-out, see https://github.com/vaadin/vaadin-usage-statistics.
