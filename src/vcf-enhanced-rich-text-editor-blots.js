const Quill = window.Quill;
const BlockEmbed = Quill.import('blots/block/embed');
const Block = Quill.import('blots/block');
const Inline = Quill.import('blots/inline');
const Embed = Quill.import('blots/embed');
const TextBlot = Quill.import('blots/text');
const ListItem = Quill.import('formats/list/item');
const ListContainer = Quill.import('formats/list');

/**
 * @class ReadOnlyBlot
 * @extends {Inline}
 */
class ReadOnlyBlot extends Inline {
  static create(value) {
    const node = super.create(value);
    if (value) {
      node.setAttribute('contenteditable', 'false');
    } else {
      node.removeAttribute('contenteditable');
    }
    return node;
  }

  static formats() {
    return true;
  }
}

ReadOnlyBlot.blotName = 'readonly';
ReadOnlyBlot.tagName = 'span';
ReadOnlyBlot.className = 'ql-readonly';
ReadOnlyBlot.allowedChildren = [Block, BlockEmbed, Inline, TextBlot, ListItem, ListContainer];

Quill.register(ReadOnlyBlot);

/**
 * @class TabStopBlot
 * @extends {BlockEmbed}
 */
class TabStopBlot extends BlockEmbed {
  static create(data) {
    const node = super.create(data);
    node.style.left = '100px';
    node.textContent = data;

    return node;
  }
}

TabStopBlot.blotName = 'tabstop';
TabStopBlot.tagName = 'span';
TabStopBlot.className = 'v-block';
TabStopBlot.allowedChildren = [Text];

Quill.register(TabStopBlot);

/**
 * @class TabBlot
 * @extends {Inline}
 */
class TabBlot extends Inline {
  static create(level) {
    const node = super.create();

    node.innerHTML = '&#65279;';
    node.style.width = `1px`;
    node.setAttribute('contenteditable', false);

    node.setAttribute('level', level);
    return node;
  }

  static formats(node) {
    return node.getAttribute('level');
  }
}

TabBlot.blotName = 'tab';
TabBlot.tagName = 'tab';

Quill.register(TabBlot);

/**
 * @class PreTabBlot
 * @extends {Inline}
 */
class PreTabBlot extends Inline {
  static create() {
    const node = super.create();

    node.innerHTML = '&#65279;';
    node.style.width = `1px`;
    node.setAttribute('contenteditable', false);
    return node;
  }
}

PreTabBlot.blotName = 'pre-tab';
PreTabBlot.tagName = 'pre-tab';

Quill.register(PreTabBlot);

/**
 * @class LinePartBlot
 * @extends {Inline}
 */
class LinePartBlot extends Inline {
  static create() {
    const node = super.create();
    return node;
  }
}

LinePartBlot.blotName = 'line-part';
LinePartBlot.tagName = 'line-part';

Quill.register(LinePartBlot);

const emptyRegEx = new RegExp('\uFEFF', 'g');

/**
 * @class TabsContBlot
 * @extends {Block}
 */
class TabsContBlot extends Block {
  static create() {
    const node = super.create();

    return node;
  }

  static getPrevTab(preTab) {
    if (!preTab.previousElementSibling) {
      return null;
    }

    if (preTab.previousElementSibling.nodeName == TabBlot.tagName.toUpperCase()) {
      return preTab.previousElementSibling;
    }

    if (!preTab.previousElementSibling.previousElementSibling) {
      return null;
    }

    if (preTab.previousElementSibling.innerText.trim() === '' && preTab.previousElementSibling.previousElementSibling.nodeName == TabBlot.tagName.toUpperCase()) {
      return preTab.previousElementSibling.previousElementSibling;
    }

    return null;
  }

  static convertPreTabs(node) {
    const preTab = node.querySelector(PreTabBlot.tagName);
    if (preTab) {
      const tab = this.getPrevTab(preTab);
      if (tab) {
        if (!preTab.getAttribute('locked')) {
          preTab.setAttribute('locked', true);

          let level = parseInt(tab.getAttribute('level')) || 1;
          tab.setAttribute('level', ++level);
        }
        preTab.remove();
      } else {
        const tab = document.createElement(TabBlot.tagName);
        tab.innerHTML = preTab.innerHTML;
        tab.style.width = `1px`;
        tab.setAttribute('contenteditable', false);
        tab.setAttribute('level', 1);

        preTab.parentElement.replaceChild(tab, preTab);
      }
    }
  }

  static formats(node) {
    this.convertPreTabs(node);
    const separators = node.querySelectorAll(TabBlot.tagName);

    if (node.getAttribute('tabs-count') != separators.length) {
      node.setAttribute('tabs-count', separators.length);
      separators.forEach(separator => {
        const prev = separator.previousSibling;
        if (prev != null && prev.nodeName != LinePartBlot.tagName.toUpperCase()) {
          const leftEl = document.createElement('line-part');
          if (prev.nodeName == '#text') {
            leftEl.textContent = prev.textContent.replace(emptyRegEx, '');
          } else {
            const prevClone = prev.cloneNode(true);
            prevClone.innerHTML = prevClone.innerHTML.replace(emptyRegEx, '');
            leftEl.appendChild(prevClone);
          }

          separator.parentElement.replaceChild(leftEl, prev);
        }

        const next = separator.nextSibling;
        if (next != null) {
          if (next.nodeName != LinePartBlot.tagName.toUpperCase()) {
            const rightEl = document.createElement('line-part');

            if (next.nodeName == '#text') {
              rightEl.innerHTML = separator.textContent.replace(emptyRegEx, '') + next.textContent.replace(emptyRegEx, '');
            } else {
              const nextClone = next.cloneNode(true);
              // TODO check if not ZERO WIDTH NO-BREAK SPACE
              nextClone.innerHTML = separator.textContent.replace(emptyRegEx, '') + nextClone.innerHTML.replace(emptyRegEx, '');
              rightEl.appendChild(nextClone);
            }
            separator.parentElement.replaceChild(rightEl, next);
          }
        } else {
          const rightEl = document.createElement('line-part');
          rightEl.innerHTML = '&#65279;';
          if (separator.parentElement) {
            separator.parentElement.appendChild(rightEl);
          }
        }

        // TODO fix currsor shifting
        separator.innerHTML = '&#65279;';
      });
    }

    return TabsContBlot.tagName;
  }
}

TabsContBlot.blotName = 'tabs-cont';
TabsContBlot.tagName = 'tabs-cont';

Quill.register(TabsContBlot);

/**
 * Non-breaking space
 * @class Nbsp
 * @extends {Inline}
 */
class Nbsp extends Inline {
  static create(value) {
    const node = super.create(value);
    node.innerHTML = '&nbsp;';
    return node;
  }
}

Nbsp.blotName = 'nbsp';
Nbsp.tagName = 'SPAN';

Quill.register({ 'formats/nbsp': Nbsp });

/**
 * Placeholder token
 * @class PlaceholderBlot
 * @extends {Embed}
 */
class PlaceholderBlot extends Embed {
  static create(value) {
    const node = super.create();
    node.placeholder = value;
    PlaceholderBlot.setText(node);
    return node;
  }

  format() {
    PlaceholderBlot.setText(this.domNode);
  }

  formats() {
    const formats = super.formats;
    formats.placeholder = true;
    return formats;
  }

  static value(node) {
    PlaceholderBlot.applyFormat(node);
    return node.placeholder || true;
  }

  static setText(node) {
    let altText = '';
    let text = node.placeholder.text;
    if (PlaceholderBlot.altAppearanceRegex) {
      altText = new RegExp(PlaceholderBlot.altAppearanceRegex).exec(node.placeholder.text) || '';
      const altTextNodeStr = `<span alt>${altText}</span>`;
      if (altText && node.placeholder.altAppearance) text = altTextNodeStr;
      else text = node.placeholder.text.replace(altText, altTextNodeStr);
    }
    node.innerHTML = text;
  }

  static applyFormat(node) {
    if (node.placeholder.altFormat) {
      const altTextNode = node.querySelector('[alt]');
      PlaceholderBlot.deltaToInline(altTextNode, node.placeholder.altFormat);
    }
    if (node.placeholder.format) {
      const contentNode = node.querySelector('[contenteditable="false"]');
      PlaceholderBlot.deltaToInline(contentNode, node.placeholder.format);
    }
  }

  static deltaToInline(node, attr) {
    if (node) {
      Object.keys(attr).forEach(key => {
        const value = attr[key];
        switch (key) {
          case 'bold':
            node.style.fontWeight = value ? 'bold' : 'normal';
            break;
          case 'code':
            this._wrapContent('code', node);
            break;
          case 'font':
            node.style.fontFamily = value;
            break;
          case 'italic':
            node.style.fontStyle = value ? 'italic' : 'normal';
            break;
          case 'link':
            this._wrapContent('a', node, [{ name: 'href', value: value }]);
            break;
          default:
            node.style[key] = value;
        }
      });
    }
  }

  static _wrapContent(tag, node, attrs = []) {
    if (!node.querySelector(tag)) {
      const el = document.createElement(tag);
      el.innerHTML = node.innerHTML;
      node.innerHTML = '';
      node.appendChild(el);
      attrs.forEach(attr => el.setAttribute(attr.name, attr.value));
    }
  }
}

PlaceholderBlot.blotName = 'placeholder';
PlaceholderBlot.className = 'ql-placeholder';
PlaceholderBlot.tagName = 'SPAN';

Quill.register(PlaceholderBlot);

export { ReadOnlyBlot, LinePartBlot, TabBlot, PreTabBlot, TabsContBlot, PlaceholderBlot };
