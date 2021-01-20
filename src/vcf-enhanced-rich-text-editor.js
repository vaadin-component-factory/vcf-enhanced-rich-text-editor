/**
 * @license
 * Copyright (C) 2015 Vaadin Ltd.
 * This program is available under Commercial Vaadin Add-On License 3.0 (CVALv3).
 * See the file LICENSE.md distributed with this software for more information about licensing.
 * See [the website]{@link https://vaadin.com/license/cval-3} for the complete license.
 */

import { html, PolymerElement } from '@polymer/polymer/polymer-element';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { resetMouseCanceller } from '@polymer/polymer/lib/utils/gestures';
import { useShadow } from '@polymer/polymer/lib/utils/settings';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin';
import { ElementMixin } from '@vaadin/vaadin-element-mixin';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-confirm-dialog';
import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-combo-box';
import '@vaadin/vaadin-license-checker/vaadin-license-checker';
import '@vaadin/vaadin-icons';
import './vendor/vaadin-quill';
import './vcf-enhanced-rich-text-editor-styles';
import './vcf-enhanced-rich-text-editor-toolbar-styles';
import { ReadOnlyBlot, LinePartBlot, TabBlot, PreTabBlot, TabsContBlot, PlaceholderBlot } from './vcf-enhanced-rich-text-editor-blots';

const Quill = window.Quill;
const Inline = Quill.import('blots/inline');

Inline.order.push(PlaceholderBlot.blotName, ReadOnlyBlot.blotName, LinePartBlot.blotName, TabBlot.blotName, PreTabBlot.blotName);

(function() {
  'use strict';

  const Quill = window.Quill;

  const HANDLERS = ['bold', 'italic', 'underline', 'strike', 'header', 'script', 'list', 'align', 'blockquote', 'code-block', 'placeholder'];

  const TOOLBAR_BUTTON_GROUPS = {
    history: ['undo', 'redo'],
    emphasis: ['bold', 'italic', 'underline', 'strike'],
    heading: ['h1', 'h2', 'h3'],
    'glyph-transformation': ['subscript', 'superscript'],
    list: ['listOrdered', 'listBullet'],
    alignment: ['alignLeft', 'alignCenter', 'alignRight'],
    'rich-text': ['image', 'link'],
    block: ['blockquote', 'codeBlock', 'placeholder', 'placeholderAppearance'],
    format: ['readonly', 'clean'],
    custom: []
  };

  const SOURCE = {
    USER: 'user',
    SILENT: 'silent'
  };

  const STATE = {
    DEFAULT: 0,
    FOCUSED: 1,
    CLICKED: 2
  };

  const DELETE_KEY = 46;
  const BACKSPACE_KEY = 8;
  const TAB_KEY = 9;
  const QL_EDITOR_PADDING_LEFT = 16;

  /**
   * `<vcf-enhanced-rich-text-editor>` is a Web Component for rich text editing.
   * It provides a set of toolbar controls to apply formatting on the content,
   * which is stored and can be accessed as HTML5 or JSON string.
   *
   * ```
   * <vcf-enhanced-rich-text-editor></vcf-enhanced-rich-text-editor>
   * ```
   *
   * Vaadin Rich Text Editor focuses on the structure, not the styling of content.
   * Therefore, the semantic HTML5 tags such as <h1>, <strong> and <ul> are used,
   * and CSS usage is limited to most common cases, like horizontal text alignment.
   *
   * ### Styling
   *
   * The following state attributes are available for styling:
   *
   * Attribute    | Description | Part name
   * -------------|-------------|------------
   * `disabled`   | Set to a disabled text editor | :host
   * `readonly`   | Set to a readonly text editor | :host
   * `on`         | Set to a toolbar button applied to the selected text | toolbar-button
   *
   * The following shadow DOM parts are available for styling:
   *
   * Part name                            | Description
   * -------------------------------------|----------------
   * `content`                            | The content wrapper
   * `toolbar`                            | The toolbar wrapper
   * `toolbar-group`                      | The group for toolbar controls
   * `toolbar-group-history`              | The group for histroy controls
   * `toolbar-group-emphasis`             | The group for emphasis controls
   * `toolbar-group-heading`              | The group for heading controls
   * `toolbar-group-glyph-transformation` | The group for glyph transformation controls
   * `toolbar-group-group-list`           | The group for group list controls
   * `toolbar-group-alignment`            | The group for alignment controls
   * `toolbar-group-rich-text`            | The group for rich text controls
   * `toolbar-group-block`                | The group for preformatted block controls
   * `toolbar-group-format`               | The group for format controls
   * `toolbar-button`                     | The toolbar button (applies to all buttons)
   * `toolbar-button-undo`                | The "undo" button
   * `toolbar-button-redo`                | The "redo" button
   * `toolbar-button-bold`                | The "bold" button
   * `toolbar-button-italic`              | The "italic" button
   * `toolbar-button-underline`           | The "underline" button
   * `toolbar-button-strike`              | The "strike-through" button
   * `toolbar-button-h1`                  | The "header 1" button
   * `toolbar-button-h2`                  | The "header 2" button
   * `toolbar-button-h3`                  | The "header 3" button
   * `toolbar-button-subscript`           | The "subscript" button
   * `toolbar-button-superscript`         | The "superscript" button
   * `toolbar-button-list-ordered`        | The "ordered list" button
   * `toolbar-button-list-bullet`         | The "bullet list" button
   * `toolbar-button-align-left`          | The "left align" button
   * `toolbar-button-align-center`        | The "center align" button
   * `toolbar-button-align-right`         | The "right align" button
   * `toolbar-button-image`               | The "image" button
   * `toolbar-button-link`                | The "link" button
   * `toolbar-button-blockquote`          | The "blockquote" button
   * `toolbar-button-code-block`          | The "code block" button
   * `toolbar-button-clean`               | The "clean formatting" button
   *
   * See [ThemableMixin – how to apply styles for shadow parts](https://github.com/vaadin/vaadin-themable-mixin/wiki)
   *
   * ### Keyboard Hotkeys
   *
   * Keyboard Hotkeys | Description
   * --|--
   * `Alt + F10` | Focus on the toolbar.
   * `Shift + Space` | Insert non-breaking space.
   * `Ctrl + P` (Mac: `Meta + P`) | Insert placeholder.
   *
   * @memberof Vaadin
   * @mixes Vaadin.ElementMixin
   * @mixes Vaadin.ThemableMixin
   * @demo demo/index.html
   */
  class VcfEnhancedRichTextEditor extends ElementMixin(ThemableMixin(PolymerElement)) {
    static get template() {
      return html`
        <style include="vcf-enhanced-rich-text-editor-styles">
          :host {
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            overflow: hidden;
          }

          :host([hidden]),
          button[hidden] {
            display: none !important;
          }

          .announcer {
            position: fixed;
            clip: rect(0, 0, 0, 0);
          }

          input[type='file'] {
            display: none;
          }

          .vcf-enhanced-rich-text-editor-container {
            display: flex;
            flex-direction: column;
            min-height: inherit;
            max-height: inherit;
            flex: auto;
          }

          .ql-readonly {
            color: #676767;
            /* background: #f9f9f9; */
            background: #f1f1f1;
            border-radius: 0.1em;
          }

          /* FIXME (Yuriy): workaround for auto-grow feature in flex layout for IE11 */
          @media all and (-ms-high-contrast: none) {
            .ql-editor {
              flex: auto;
            }
          }
        </style>

        <div class="vcf-enhanced-rich-text-editor-container">
          <!-- Create toolbar container -->
          <div part="toolbar">
            <span part="toolbar-group toolbar-group-history" style="display: [[_buttonGroupDisplay(toolbarButtons, 'history')]];">
              <!-- Undo and Redo -->
              <button type="button" part="toolbar-button toolbar-button-undo" on-click="_undo" title$="[[i18n.undo]]" style="display: [[_buttonDisplay(toolbarButtons, 'undo')]];"></button>
              <button type="button" part="toolbar-button toolbar-button-redo" on-click="_redo" title$="[[i18n.redo]]" style="display: [[_buttonDisplay(toolbarButtons, 'redo')]];"></button>
            </span>

            <span part="toolbar-group toolbar-group-emphasis" style="display: [[_buttonGroupDisplay(toolbarButtons, 'emphasis')]];">
              <!-- Bold -->
              <button class="ql-bold" part="toolbar-button toolbar-button-bold" title$="[[i18n.bold]]" style="display: [[_buttonDisplay(toolbarButtons, 'bold')]];"></button>

              <!-- Italic -->
              <button class="ql-italic" part="toolbar-button toolbar-button-italic" title$="[[i18n.italic]]" style="display: [[_buttonDisplay(toolbarButtons, 'italic')]];"></button>

              <!-- Underline -->
              <button class="ql-underline" part="toolbar-button toolbar-button-underline" title$="[[i18n.underline]]" style="display: [[_buttonDisplay(toolbarButtons, 'underline')]];"></button>

              <!-- Strike -->
              <button class="ql-strike" part="toolbar-button toolbar-button-strike" title$="[[i18n.strike]]" style="display: [[_buttonDisplay(toolbarButtons, 'strike')]];"></button>
            </span>

            <span part="toolbar-group toolbar-group-heading" style="display: [[_buttonGroupDisplay(toolbarButtons, 'heading')]];">
              <!-- Header buttons -->
              <button type="button" class="ql-header" value="1" part="toolbar-button toolbar-button-h1" title$="[[i18n.h1]]" style="display: [[_buttonDisplay(toolbarButtons, 'h1')]];"></button>
              <button type="button" class="ql-header" value="2" part="toolbar-button toolbar-button-h2" title$="[[i18n.h2]]" style="display: [[_buttonDisplay(toolbarButtons, 'h2')]];"></button>
              <button type="button" class="ql-header" value="3" part="toolbar-button toolbar-button-h3" title$="[[i18n.h3]]" style="display: [[_buttonDisplay(toolbarButtons, 'h3')]];"></button>
            </span>

            <span part="toolbar-group toolbar-group-glyph-transformation" style="display: [[_buttonGroupDisplay(toolbarButtons, 'glyph-transformation')]];">
              <!-- Subscript and superscript -->
              <button class="ql-script" value="sub" part="toolbar-button toolbar-button-subscript" title$="[[i18n.subscript]]" style="display: [[_buttonDisplay(toolbarButtons, 'subscript')]];"></button>
              <button class="ql-script" value="super" part="toolbar-button toolbar-button-superscript" title$="[[i18n.superscript]]" style="display: [[_buttonDisplay(toolbarButtons, 'superscript')]];"></button>
            </span>

            <span part="toolbar-group toolbar-group-list" style="display: [[_buttonGroupDisplay(toolbarButtons, 'list')]];">
              <!-- List buttons -->
              <button type="button" class="ql-list" value="ordered" part="toolbar-button toolbar-button-list-ordered" title$="[[i18n.listOrdered]]" style="display: [[_buttonDisplay(toolbarButtons, 'listOrdered')]];"></button>
              <button type="button" class="ql-list" value="bullet" part="toolbar-button toolbar-button-list-bullet" title$="[[i18n.listBullet]]" style="display: [[_buttonDisplay(toolbarButtons, 'listBullet')]];"></button>
            </span>

            <span part="toolbar-group toolbar-group-alignment" style="display: [[_buttonGroupDisplay(toolbarButtons, 'alignment')]];">
              <!-- Align buttons -->
              <button type="button" class="ql-align" value="" part="toolbar-button toolbar-button-align-left" title$="[[i18n.alignLeft]]" style="display: [[_buttonDisplay(toolbarButtons, 'alignLeft')]];"></button>
              <button type="button" class="ql-align" value="center" part="toolbar-button toolbar-button-align-center" title$="[[i18n.alignCenter]]" style="display: [[_buttonDisplay(toolbarButtons, 'alignCenter')]];"></button>
              <button type="button" class="ql-align" value="right" part="toolbar-button toolbar-button-align-right" title$="[[i18n.alignRight]]" style="display: [[_buttonDisplay(toolbarButtons, 'alignRight')]];"></button>
            </span>

            <span part="toolbar-group toolbar-group-rich-text" style="display: [[_buttonGroupDisplay(toolbarButtons, 'rich-text')]];">
              <!-- Image -->
              <button type="button" part="toolbar-button toolbar-button-image" title$="[[i18n.image]]" on-touchend="_onImageTouchEnd" on-click="_onImageClick" style="display: [[_buttonDisplay(toolbarButtons, 'image')]];"></button>
              <!-- Link -->
              <button type="button" part="toolbar-button toolbar-button-link" title$="[[i18n.link]]" on-click="_onLinkClick" style="display: [[_buttonDisplay(toolbarButtons, 'link')]];"></button>
            </span>

            <span part="toolbar-group toolbar-group-block" style="display: [[_buttonGroupDisplay(toolbarButtons, 'block')]];">
              <!-- Blockquote -->
              <button type="button" class="ql-blockquote" part="toolbar-button toolbar-button-blockquote" title$="[[i18n.blockquote]]" style="display: [[_buttonDisplay(toolbarButtons, 'blockquote')]];"></button>

              <!-- Code block -->
              <button type="button" class="ql-code-block" part="toolbar-button toolbar-button-code-block" title$="[[i18n.codeBlock]]" style="display: [[_buttonDisplay(toolbarButtons, 'codeBlock')]];"></button>

              <!-- Placeholder -->
              <button id="placeholderBtn" type="button" class="ql-placeholder" part="toolbar-button toolbar-button-placeholder" title$="[[i18n.placeholder]]" style="display: [[_buttonDisplay(toolbarButtons, 'placeholder')]];" hidden>
                [[placeholderTags.start]]
              </button>

              <!-- Placeholder display -->
              <button id="placeholderAppearanceBtn" type="button" part="toolbar-button toolbar-button-placeholder-display" title$="[[i18n.placeholderAppearance]]" style="display: [[_buttonDisplay(toolbarButtons, 'placeholderAppearance')]];" hidden>
                [[placeholderAppearance]]
              </button>
            </span>

            <span part="toolbar-group toolbar-group-format" style="display: [[_buttonGroupDisplay(toolbarButtons, 'format')]];">
              <!-- Read-only -->
              <button type="button" class="rte-readonly" part="toolbar-button toolbar-button-readonly" title$="[[i18n.readonly]]" style="display: [[_buttonDisplay(toolbarButtons, 'readonly')]];" on-click="_onReadonlyClick">
                <iron-icon icon="vaadin:lock"></iron-icon>
              </button>

              <!-- Clean -->
              <button type="button" class="ql-clean" part="toolbar-button toolbar-button-clean" title$="[[i18n.clean]]" style="display: [[_buttonDisplay(toolbarButtons, 'clean')]];"></button>
            </span>

            <span part="toolbar-group toolbar-group-custom" style="display: [[_buttonGroupDisplay(toolbarButtons, 'custom')]];">
              <slot name="toolbar" on-slot-change="_onToolbarSlotChange"></slot>
            </span>

            <input id="fileInput" type="file" accept="image/png, image/gif, image/jpeg, image/bmp, image/x-icon" on-change="_uploadImage" />
          </div>

          <div style="overflow: hidden; box-sizing: content-box; width: 100% !important; height: 15px !important; flex-shrink: 0; display: flex;">
            <div style="overflow: hidden; box-sizing: content-box; border-color: rgb(158, 170, 182); border-style: solid; border-width: 0 1px 1px 0; width: 14px !important; height: 14px !important;"></div>
            <div style="position:relative; overflow: hidden; box-sizing: content-box; background: url('[[_rulerHori]]') repeat-x; flex-grow: 1; height: 15px !important; padding: 0;" on-click="_addTabStop" part="horizontalRuler"></div>
          </div>

          <div style="display: flex; flex-grow: 1;">
            <div style="overflow: hidden; box-sizing: content-box; background: url('[[_rulerVert]]') repeat-y; width: 15px !important; flex-shrink: 0;"></div>
            <div part="content"></div>
          </div>

          <div class="announcer" aria-live="polite"></div>
        </div>

        <vaadin-confirm-dialog id="linkDialog" opened="{{_linkEditing}}" header="[[i18n.linkDialogTitle]]">
          <vaadin-text-field id="linkUrl" value="{{_linkUrl}}" style="width: 100%;" on-keydown="_onLinkKeydown"> </vaadin-text-field>
          <vaadin-button id="confirmLink" slot="confirm-button" theme="primary" on-click="_onLinkEditConfirm">
            [[i18n.ok]]
          </vaadin-button>
          <vaadin-button id="removeLink" slot="reject-button" theme="error" on-click="_onLinkEditRemove" hidden$="[[!_linkRange]]">
            [[i18n.remove]]
          </vaadin-button>
          <vaadin-button id="cancelLink" slot="cancel-button" on-click="_onLinkEditCancel">
            [[i18n.cancel]]
          </vaadin-button>
        </vaadin-confirm-dialog>

        <vaadin-confirm-dialog id="placeholderDialog" header="[[i18n.placeholderDialogTitle]]">
          <vaadin-combo-box label="[[i18n.placeholderComboBoxLabel]]" id="placeholderComboBox" value="{{_placeholder}}" item-label-path="text" item-value-path="text" style="width: 100%;" on-value-changed="{{_placeholderChanged}}"></vaadin-combo-box>
          <vaadin-button slot="confirm-button" theme="primary" on-click="_onPlaceholderEditConfirm">
            [[i18n.ok]]
          </vaadin-button>
          <vaadin-button id="placeholderRemoveButton" slot="reject-button" theme="error" on-click="_onPlaceholderEditRemove" hidden$="[[!_placeholderRange]]">
            [[i18n.remove]]
          </vaadin-button>
          <vaadin-button slot="cancel-button" on-click="_onPlaceholderEditCancel">
            [[i18n.cancel]]
          </vaadin-button>
        </vaadin-confirm-dialog>
      `;
    }

    static get is() {
      return 'vcf-enhanced-rich-text-editor';
    }

    static get version() {
      return '1.4.0';
    }

    static get properties() {
      return {
        /**
         * Value is a list of the operations which describe change to the document.
         * Each of those operations describe the change at the current index.
         * They can be an `insert`, `delete` or `retain`. The format is as follows:
         *
         * ```js
         *  [
         *    { insert: 'Hello World' },
         *    { insert: '!', attributes: { bold: true }}
         *  ]
         * ```
         *
         * See also https://github.com/quilljs/delta for detailed documentation.
         */
        value: {
          type: String,
          notify: true,
          value: ''
        },

        /**
         * HTML representation of the rich text editor content.
         */
        htmlValue: {
          type: String,
          notify: true,
          readOnly: true
        },

        /**
         * When true, the user can not modify, nor copy the editor content.
         */
        disabled: {
          type: Boolean,
          value: false,
          reflectToAttribute: true
        },

        /**
         * When true, the user can not modify the editor content, but can copy it.
         */
        readonly: {
          type: Boolean,
          value: false,
          reflectToAttribute: true
        },

        /**
         * An object used to localize this component. The properties are used
         * e.g. as the tooltips for the editor toolbar buttons.
         *
         * @default {English/US}
         */
        i18n: {
          type: Array,
          value: () => {
            return {
              undo: 'undo',
              redo: 'redo',
              bold: 'bold',
              italic: 'italic',
              underline: 'underline',
              strike: 'strike',
              h1: 'h1',
              h2: 'h2',
              h3: 'h3',
              subscript: 'subscript',
              superscript: 'superscript',
              listOrdered: 'list ordered',
              listBullet: 'list bullet',
              alignLeft: 'align left',
              alignCenter: 'align center',
              alignRight: 'align right',
              image: 'image',
              link: 'link',
              blockquote: 'blockquote',
              codeBlock: 'code block',
              readonly: 'readonly',
              placeholder: 'placeholder',
              placeholderAppearance: 'toggle placeholder appearance',
              placeholderComboBoxLabel: 'Select a placeholder',
              placeholderAppearanceLabel1: 'Plain',
              placeholderAppearanceLabel2: 'Value',
              placeholderDialogTitle: 'Placeholders',
              clean: 'clean',
              linkDialogTitle: 'Link address',
              ok: 'OK',
              cancel: 'Cancel',
              remove: 'Remove'
            };
          }
        },

        /**
         * An object used to show/hide toolbar buttons.
         * Default value of any unspecified button is true.
         */
        toolbarButtons: {
          type: Object,
          value: {}
        },

        tabStops: {
          type: Array,
          notify: true,
          value: () => []
        },

        /**
         * An array of strings or a `Placeholder` objects. Here is the syntax for a `Placeholder` object:
         * ```
         * {
         *   text: 'placeholder',
         *   format: { bold: true, italic: false }, // main placeholder format
         *   altFormat:  { underline: true, bold: false } // alternate placeholder appearance format
         * }
         * ```
         * The `format` and `altFormat` properties accept [Inline](https://quilljs.com/docs/formats/#inline) formats.
         */
        placeholders: {
          type: Array,
          notify: true,
          observer: '_placeholdersChanged'
        },

        /**
         * Object containing `start` and `end` properties used for the start and end tags of a placeholder.
         */
        placeholderTags: {
          type: Object,
          value: () => ({
            start: '@',
            end: ''
          }),
          observer: '_placeholderTagsChanged'
        },

        /**
         * Label for current placeholder appearance.
         */
        placeholderAppearance: String,

        /**
         * Returns whether alternate appearance is active.
         */
        placeholderAltAppearance: {
          type: Boolean,
          observer: '_placeholderAltAppearanceChanged'
        },

        /**
         * Regular expression used for placeholder alternate appearance.
         */
        placeholderAltAppearancePattern: {
          type: String,
          observer: '_placeholderAltAppearancePatternChanged'
        },

        _editor: {
          type: Object
        },

        /**
         * Stores old value
         */
        _oldValue: String,

        _lastCommittedChange: {
          type: String,
          value: ''
        },

        _linkEditing: {
          type: Boolean
        },

        _linkRange: {
          type: Object,
          value: null
        },

        _linkIndex: {
          type: Number,
          value: null
        },

        _linkUrl: {
          type: String,
          value: ''
        },

        _rulerHori: {
          type: String,
          value:
            // eslint-disable-next-line max-len
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAV4AAAAPBAMAAABeoLrPAAAAA3NCSVQICAjb4U/gAAAAHlBMVEXS0tLR0dHQ0NCerLmfq7eeqrafqbOdqbWcqLT///9ePaWcAAAACnRSTlP///////////8AsswszwAAAAlwSFlzAAALEgAACxIB0t1+/AAAACB0RVh0U29mdHdhcmUATWFjcm9tZWRpYSBGaXJld29ya3MgTVi7kSokAAAAFnRFWHRDcmVhdGlvbiBUaW1lADA1LzEwLzEyhpCxGgAAAKtJREFUeJztksENgCAMRXt1BEZgICdwBvco3NxWqwYDFGMrajT2QOD/0v8kwvCugqcBhPXzXluf4XViA+uNKmfIeX09Q5Eh5y0+o9xQZFT8H24xINgXLwmMdtl4fVjcruYO9nEans6YeA2NMSQaEtedYzQMx0RLbkTzbHmeImPibWhrY8cy2to3IyRalM7P89ldVQZk39ksPZhpXJ9hUHfeDanlVAZ0ffumGgEWlrgeDxx/xAAAAABJRU5ErkJggg=='
        },

        _rulerVert: {
          type: String,
          value:
            // eslint-disable-next-line max-len
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAyBAMAAABxHJwKAAAAA3NCSVQICAjb4U/gAAAAG1BMVEXS0tLR0dHQ0NCfq7eeqradq7idqbWcqLT///+TeDeAAAAACXRSTlP//////////wBTT3gSAAAACXBIWXMAAAsSAAALEgHS3X78AAAAIHRFWHRTb2Z0d2FyZQBNYWNyb21lZGlhIEZpcmV3b3JrcyBNWLuRKiQAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDUvMTAvMTKGkLEaAAAATklEQVR4nGPogIAABijDAMZwQGM0CqKLYGNAtDcK4lOcgGGyAS4pDF1NgoIJuJ2KLtKIUIxpcgKGmzHV4AkNTClc2pFDo4Bq4awoCAYOAKbZvafXusxYAAAAAElFTkSuQmCC'
        },

        _placeholderEditing: {
          type: Boolean,
          observer: '_placeholderEditingChanged'
        },

        _placeholderRange: {
          type: Object,
          value: null
        },

        _placeholderIndex: {
          type: Number,
          value: null
        },

        _placeholder: {
          type: String,
          value: ''
        }
      };
    }

    _buttonDisplay(toolbarButtons, button) {
      if (toolbarButtons[button] === false) return 'none';
      return '';
    }

    _buttonGroupDisplay(toolbarButtons, group) {
      var visible = false;
      TOOLBAR_BUTTON_GROUPS[group].forEach(button => {
        if (toolbarButtons[button] !== false) {
          visible = true;
          return;
        }
      });

      return visible ? '' : 'none';
    }

    _cleanUpLineParts() {
      const lineParts = this.shadowRoot.querySelectorAll(LinePartBlot.tagName);
      lineParts.forEach(line => {
        if (!line.previousElementSibling || line.previousElementSibling.nodeName != TabBlot.tagName.toUpperCase()) {
          line.style.paddingLeft = '0px';
        }
        if (line.nextElementSibling && line.nextElementSibling.nodeName != TabBlot.tagName.toUpperCase() && line.textContent.trim().length == 0) {
          line.remove();
        }
      });
    }

    _simulateTabs() {
      const allTabsConts = this.shadowRoot.querySelectorAll(TabsContBlot.tagName);
      allTabsConts.forEach(tabsCont => {
        const tabElements = tabsCont.querySelectorAll(TabBlot.tagName);
        let tabNumber = 0;
        tabElements.forEach(tabElement => {
          let el = tabElement.nextSibling;
          if (el) {
            if (el.nodeName == '#text') {
              const linePart = document.createElement('line-part');
              linePart.innerText = el.wholeText;
              el.replaceWith(linePart);
              el = linePart;
            }
            tabNumber += tabElement.getAttribute('level') ? parseInt(tabElement.getAttribute('level')) : 1;
            const tabInfo = this.tabStops[tabNumber - 1];
            if (tabInfo) {
              let newPadding = tabInfo.position - QL_EDITOR_PADDING_LEFT - (el.offsetLeft - tabsCont.offsetLeft);

              if (tabInfo.direction == 'right' || tabInfo.direction == 'middle') {
                const prevPadding = el.style.paddingLeft ? parseInt(el.style.paddingLeft.split('px')[0]) : 0;
                let elWidth = el.offsetWidth - prevPadding;

                if (tabInfo.direction == 'middle') {
                  elWidth /= 2;
                }
                newPadding -= elWidth;
              }

              el.style.paddingLeft = newPadding + 'px';
            } else {
              const strTab = document.createElement('line-part');
              strTab.innerHTML = String.fromCharCode(9);
              tabElement.replaceWith(strTab);
            }
          }
        });
      });
    }

    static get observers() {
      return ['_valueChanged(value, _editor)', '_disabledChanged(disabled, readonly, _editor)', '_tabStopsChanged(tabStops, _editor)'];
    }

    constructor() {
      super();
      this._setCustomButtons();
    }

    ready() {
      super.ready();

      const editor = this.shadowRoot.querySelector('[part="content"]');
      const toolbarConfig = this._prepareToolbar();
      this._toolbar = toolbarConfig.container;

      this._addToolbarListeners();

      this._editor = new Quill(editor, {
        modules: {
          toolbar: toolbarConfig
        }
      });
      const _editor = this._editor;

      this._editor.on('text-change', function(delta, oldDelta, source) {
        if (source === 'user' && delta.ops.some(o => !!o.delete)) {
          // Prevent user to delete a readonly Blot
          const currentDelta = _editor.getContents().ops;
          if (oldDelta.ops.some(v => !!v.insert && v.insert.readonly)) {
            // There were sections in the previous value. Check for them in the new value.
            const readonlySectionsCount = oldDelta.ops.filter(v => !!v.insert && v.insert.readonly).length;
            const newReadonlySectionsCount = currentDelta.filter(v => !!v.insert && v.insert.readonly).length;

            if (readonlySectionsCount != newReadonlySectionsCount) {
              _editor.setContents(oldDelta);
              _editor.setSelection(delta.ops[0].retain + 1, 0);
            }
          }
        }
      });

      this._patchToolbar();
      this._patchKeyboard();

      /* istanbul ignore if */
      if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 && useShadow) {
        this._patchFirefoxFocus();
      }

      this.$.linkDialog.$.dialog.$.overlay.addEventListener('vaadin-overlay-open', () => {
        this.$.linkUrl.focus();
      });

      const editorContent = editor.querySelector('.ql-editor');

      editorContent.setAttribute('role', 'textbox');
      editorContent.setAttribute('aria-multiline', 'true');

      this._editor.on('text-change', () => {
        const timeout = 200;
        this._debounceSetValue = Debouncer.debounce(this._debounceSetValue, timeOut.after(timeout), () => {
          if (!this._silentTextChange) this.value = JSON.stringify(this._editor.getContents().ops);
          this._silentTextChange = false;
        });
      });

      this._editor.on('text-change', () => {
        this._cleanUpLineParts();
        this._simulateTabs();
      });

      editorContent.addEventListener('focusout', () => {
        if (this._toolbarState === STATE.FOCUSED) {
          this._cleanToolbarState();
        } else {
          this._emitChangeEvent();
        }
      });

      editorContent.addEventListener('focus', () => {
        // format changed, but no value changed happened
        if (this._toolbarState === STATE.CLICKED) {
          this._cleanToolbarState();
        }
      });

      this._editor.on('selection-change', this._announceFormatting.bind(this));

      this._editor.emitter.emit('text-change');

      this._editor.on('selection-change', opt => {
        if (opt !== null) {
          const timeout = 50;
          this.__debounceSetPlaceholder = Debouncer.debounce(this.__debounceSetPlaceholder, timeOut.after(timeout), () => {
            const placeholders = this.selectedPlaceholders;
            if (placeholders.length) {
              this._inPlaceholder = true;
              this.$.placeholderBtn.classList.add('ql-active');
              this.$.placeholderBtn.setAttribute('on', true);
              const detail = { placeholders };
              this.dispatchEvent(new CustomEvent('placeholder-select', { bubbles: true, cancelable: false, detail }));
            } else {
              if (this._inPlaceholder === true) this._inPlaceholder = false;
              this.$.placeholderBtn.classList.remove('ql-active');
              this.$.placeholderBtn.removeAttribute('on');
            }
            if (this._inPlaceholder === false) {
              this.dispatchEvent(new CustomEvent('placeholder-leave', { bubbles: true }));
              delete this._inPlaceholder;
            }
          });
        }
      });

      // Prevent cursor inside placeholder
      this._editor.root.addEventListener('selectstart', e => {
        let node = e.target.nodeType === 3 ? e.target.parentElement : e.target;
        const isPlaceholder = node => node.classList.contains('ql-placeholder');
        while (node.parentElement && !isPlaceholder(node)) node = node.parentElement;
        if (isPlaceholder(node)) {
          e.preventDefault();
          this._setSelectionNode(node.childNodes[2], 1);
        }
      });

      // Placeholder delete on character keypress
      this._editor.root.addEventListener('keypress', e => {
        const sel = this._editor.getSelection();
        if (this._isCharacterKey(e) && sel.length && this.selectedPlaceholders.length) {
          e.preventDefault();
          this._removePlaceholders(this.selectedPlaceholders, false, e.key);
        }
      });

      // Placeholder insert on paste
      this._editor.clipboard.addMatcher('.ql-placeholder', (node, delta) => {
        const index = this._editor.selection.savedRange.index;
        const placeholder = node.dataset.placeholder;
        this._confirmInsertPlaceholders([{ placeholder, index }], false, true);
        return delta;
      });

      this._ready = true;
    }

    _onToolbarSlotChange() {
      this._setCustomButtons();
    }

    _setSelectionNode(node, index) {
      const sel = window.getSelection();
      const range = document.createRange();
      range.setStart(node, index);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    _setCustomButtons() {
      const buttons = this._customButtons;
      TOOLBAR_BUTTON_GROUPS.custom = [];
      buttons.forEach((btn, i) => {
        btn.setAttribute('part', `toolbar-button toolbar-button-custom-${i}`);
        TOOLBAR_BUTTON_GROUPS.custom.push(btn.innerText);
      });
    }

    /**
     * Adds custom toolbar button.
     * @param {string} label
     * @param {string} icon
     * @param {Function} clickListener
     * @param {KeyboardShortcut} keyboardShortcut
     */
    addCustomButton(label, tooltip, icon = '', clickListener, keyboardShortcut) {
      const btn = document.createElement('vaadin-button');
      btn.setAttribute('slot', 'toolbar');
      this.setCustomButtonLabel(label, btn);
      this.setCustomButtonTooltip(tooltip, btn);
      this.setCustomButtonIcon(icon, btn);
      this.setCustomButtonClickListener(clickListener, btn);
      this.setCustomButtonKeyboardShortcut(keyboardShortcut, btn);
      this.appendChild(btn);
      this._setCustomButtons();
    }

    setCustomButtonLabel(label, btn) {
      if (btn && label) btn.innerText = label;
    }

    setCustomButtonTooltip(tooltip, btn) {
      if (btn && tooltip) btn.title = tooltip;
    }

    setCustomButtonIcon(icon, btn, suffix = false) {
      if (btn && icon) {
        let iconEl = btn.querySelector('iron-icon');
        if (!iconEl) {
          iconEl = document.createElement('iron-icon');
          btn.appendChild(iconEl);
        }
        if (btn.tagName.toLowerCase() !== 'vaadin-button') {
          const vaadinBtn = document.createElement('vaadin-button');
          vaadinBtn.setAttribute('title', btn.getAttribute('title'));
          vaadinBtn.setAttribute('part', btn.getAttribute('part'));
          vaadinBtn.appendChild(iconEl);
          vaadinBtn.innerText = btn.innerText;
          btn.parentElement.replaceChild(vaadinBtn, btn);
          btn = vaadinBtn;
        }
        if (!btn.innerText) btn.setAttribute('theme', 'icon');
        else iconEl.setAttribute('slot', suffix ? 'suffix' : 'prefix');
        iconEl.setAttribute('icon', icon);
      }
    }

    setCustomButtonClickListener(clickListener, btn) {
      if (btn && clickListener) btn.addEventListener('click', e => clickListener(e));
    }

    setCustomButtonKeyboardShortcut(keyboardShortcut, btn) {
      if (btn && keyboardShortcut) {
        const keyboard = this._editor.getModule('keyboard');
        const bindings = keyboard.bindings[keyboardShortcut.key] || [];
        keyboard.bindings[keyboardShortcut.key] = [
          {
            key: keyboardShortcut.key,
            shiftKey: keyboardShortcut.shiftKey,
            shortKey: keyboardShortcut.shortKey,
            altKey: keyboardShortcut.altKey,
            handler: keyboardShortcut.handler
          },
          ...bindings
        ];
      }
    }

    _prepareToolbar() {
      const clean = Quill.imports['modules/toolbar'].DEFAULTS.handlers.clean;
      const self = this;
      const toolbar = {
        container: this.shadowRoot.querySelector('[part="toolbar"]'),
        handlers: {
          clean: function() {
            self._markToolbarClicked();
            clean.call(this);
          }
        }
      };

      HANDLERS.forEach(handler => {
        toolbar.handlers[handler] = value => {
          if (handler === 'placeholder') {
            this._onPlaceholderClick();
          } else {
            this._markToolbarClicked();
            this._editor.format(handler, value, SOURCE.USER);
          }
        };
      });

      this.$.placeholderAppearanceBtn.classList.add('ql-active');
      this.$.placeholderAppearanceBtn.setAttribute('on', true);
      this.$.placeholderAppearanceBtn.addEventListener('click', () => {
        this._markToolbarClicked();
        this.placeholderAltAppearance = !this.placeholderAltAppearance;
      });

      return toolbar;
    }

    _addToolbarListeners() {
      const buttons = this._toolbarButtons;
      const toolbar = this._toolbar;

      // Disable tabbing to all buttons but the first one
      buttons.forEach((button, index) => index > 0 && button.setAttribute('tabindex', '-1'));

      toolbar.addEventListener('keydown', e => {
        // Use roving tab-index for the toolbar buttons
        if ([37, 39].indexOf(e.keyCode) > -1) {
          e.preventDefault();
          let index = buttons.indexOf(e.target);
          buttons[index].setAttribute('tabindex', '-1');
          if (e.keyCode === 39 && ++index === buttons.length) {
            index = 0;
          } else if (e.keyCode === 37 && --index === -1) {
            index = buttons.length - 1;
          }
          buttons[index].removeAttribute('tabindex');
          buttons[index].focus();
        }
        // Esc and Tab focuses the content
        if (e.keyCode === 27 || (e.keyCode === TAB_KEY && !e.shiftKey)) {
          e.preventDefault();
          this._editor.focus();
        }
      });

      // mousedown happens before editor focusout
      toolbar.addEventListener('mousedown', e => {
        if (buttons.indexOf(e.composedPath()[0]) > -1) {
          this._markToolbarFocused();
        }
      });
    }

    _markToolbarClicked() {
      this._toolbarState = STATE.CLICKED;
    }

    _markToolbarFocused() {
      this._toolbarState = STATE.FOCUSED;
    }

    _cleanToolbarState() {
      this._toolbarState = STATE.DEFAULT;
    }

    _createFakeFocusTarget() {
      const isRTL = document.documentElement.getAttribute('dir') == 'rtl';
      const elem = document.createElement('textarea');
      // Reset box model
      elem.style.border = '0';
      elem.style.padding = '0';
      elem.style.margin = '0';
      // Move element out of screen horizontally
      elem.style.position = 'absolute';
      elem.style[isRTL ? 'right' : 'left'] = '-9999px';
      // Move element to the same position vertically
      const yPosition = window.pageYOffset || document.documentElement.scrollTop;
      elem.style.top = `${yPosition}px`;
      return elem;
    }

    _patchFirefoxFocus() {
      // in Firefox 63 with native Shadow DOM, when moving focus out of
      // contenteditable and back again within same shadow root, cursor
      // disappears. See https://jsfiddle.net/webpadawan/g6vku9L3/
      const editorContent = this.shadowRoot.querySelector('.ql-editor');
      let isFake = false;

      const focusFake = () => {
        isFake = true;
        this._fakeTarget = this._createFakeFocusTarget();
        document.body.appendChild(this._fakeTarget);
        // let the focus step out of shadow root!
        this._fakeTarget.focus();
        return new Promise(resolve => setTimeout(resolve));
      };

      const focusBack = (offsetNode, offset) => {
        this._editor.focus();
        if (offsetNode) {
          this._editor.selection.setNativeRange(offsetNode, offset);
        }
        document.body.removeChild(this._fakeTarget);
        delete this._fakeTarget;
        isFake = false;
      };

      editorContent.addEventListener('mousedown', e => {
        if (!this._editor.hasFocus()) {
          const { x, y } = e;
          const { offset, offsetNode } = document.caretPositionFromPoint(x, y);
          focusFake().then(() => {
            focusBack(offsetNode, offset);
          });
        }
      });

      editorContent.addEventListener('focusin', () => {
        if (isFake === false) {
          focusFake().then(() => focusBack());
        }
      });
    }

    _patchToolbar() {
      const toolbar = this._editor.getModule('toolbar');
      const update = toolbar.update;

      // add custom link button to toggle state attribute
      const linkButton = this.shadowRoot.querySelector('[part~="toolbar-button-link"]');
      if (linkButton) {
        toolbar.controls.push(['link', linkButton]);
      }

      const readonlyButton = this.shadowRoot.querySelector('[part~="toolbar-button-readonly"]');
      if (readonlyButton) {
        toolbar.controls.push(['readonly', readonlyButton]);
      }

      toolbar.update = function(range) {
        update.call(toolbar, range);

        toolbar.controls.forEach(pair => {
          const input = pair[1];
          if (input.classList.contains('ql-active')) {
            input.setAttribute('on', '');
          } else {
            input.removeAttribute('on');
          }
        });
      };
    }

    _patchKeyboard() {
      const focusToolbar = () => {
        this._markToolbarFocused();
        this._toolbar.querySelector('button:not([tabindex])').focus();
      };

      const keyboard = this._editor.getModule('keyboard');
      const bindings = keyboard.bindings[TAB_KEY];

      // exclude Quill shift-tab bindings, except for code block,
      // as some of those are breaking when on a newline in the list
      // https://github.com/vaadin/vcf-enhanced-rich-text-editor/issues/67
      const originalBindings = bindings.filter(b => !b.shiftKey || (b.format && b.format['code-block']));
      const moveFocusBinding = { key: TAB_KEY, shiftKey: true, handler: focusToolbar };
      const self = this;
      // Binding for tabstop functionality.
      const tabStopBinding = {
        key: TAB_KEY,
        handler: function() {
          if (self.tabStops.length > 0) {
            const selection = self._getSelection();
            self._editor.format(PreTabBlot.blotName, true);
            self._editor.format(TabsContBlot.blotName, true);
            setTimeout(() => {
              selection.length = 0;
              selection.index += 2;
              self._editor.focus();
              self._editor.setSelection(selection, 'user');
            }, 0);

            // If we have tabstops defined in the component, the default tab functionality should be overriden.
            return false;
          } else {
            // In case we have no tabstops, go ahead with the default functionality.
            return true;
          }
        }
      };

      keyboard.bindings[TAB_KEY] = [tabStopBinding, ...originalBindings, moveFocusBinding];

      // Backspace key bindings
      const backspaceKeyBindings = keyboard.bindings[BACKSPACE_KEY];
      keyboard.bindings[BACKSPACE_KEY] = [
        {
          key: BACKSPACE_KEY,
          handler: () => {
            if (this.selectedPlaceholders.length) this._removePlaceholders();
            else return true;
          }
        },
        ...backspaceKeyBindings
      ];

      // Delete key bindings
      const deleteKeyBindings = keyboard.bindings[DELETE_KEY];
      keyboard.bindings[DELETE_KEY] = [
        {
          key: DELETE_KEY,
          handler: () => {
            const sel = this._editor.getSelection();
            let nextPlaceholder = false;
            if (sel.length === 0) {
              const index = sel.index + 1;
              const ops = this._editor.getContents(index).ops || [];
              nextPlaceholder = ops[0].insert && ops[0].insert.placeholder;
              this._editor.setSelection(index, 1);
            }
            if (this.selectedPlaceholders.length || nextPlaceholder) this._removePlaceholders();
            else return true;
          }
        },
        ...deleteKeyBindings
      ];

      // Z key bindings
      const Z_KEY = 90;
      const zKeyBindings = keyboard.bindings[Z_KEY];
      keyboard.bindings[Z_KEY] = [
        {
          key: Z_KEY,
          shortKey: true,
          handler: () => {
            this._undoPlaceholderEvents();
            return true;
          }
        },
        {
          key: Z_KEY,
          shiftKey: true,
          shortKey: true,
          handler: () => {
            this._undoPlaceholderEvents();
            return true;
          }
        },
        ...zKeyBindings
      ];

      // V key bindings
      const V_KEY = 86;
      keyboard.bindings[V_KEY] = [
        {
          key: V_KEY,
          shortKey: true,
          handler: () => {
            const placeholders = this.selectedPlaceholders;
            if (placeholders.length) this._confirmRemovePlaceholders(placeholders, false, true);
            return true;
          }
        }
      ];

      // alt-f10 focuses a toolbar button
      keyboard.addBinding({ key: 121, altKey: true, handler: focusToolbar });

      // Shift+Space inserts a non-breaking space.
      keyboard.addBinding({ key: ' ', shiftKey: true }, () => {
        var index = this.quill.getSelection().index;
        this.quill.insertEmbed(index, 'nbsp', '');
      });

      // Ctrl + P inserts placeholder.
      keyboard.addBinding({ key: 80, shortKey: true }, () => this._onPlaceholderClick());
    }

    _emitPlaceholderHistoryEvents(ops) {
      const placeholders = [];
      let insert = true;
      for (const op of ops) {
        if (op.delete) {
          insert = false;
          break;
        }
      }
      if (insert) {
        // Get placeholders from insert ops
        let insertIndex = -1;
        const end = this._editor.getLength() + 1;
        for (const op of ops) {
          if (op.retain) insertIndex = op.retain;
          if (op.insert) {
            insertIndex = insertIndex > 0 ? insertIndex : end;
            const placeholder = op.insert.placeholder;
            if (placeholder) {
              placeholders.push({ placeholder, index: insertIndex });
              insertIndex++;
            } else if (typeof op.insert === 'string') {
              insertIndex += op.insert.length;
            }
          }
        }
      } else {
        // Get placeholders from delete ops
        let deleteIndex = -1;
        let deleteLength = 0;
        for (const op of ops) {
          if (op.retain) deleteIndex = op.retain;
          if (op.delete) {
            deleteIndex = deleteIndex > 0 ? deleteIndex : 0;
            deleteLength = op.delete;
            const selected = this._getPlaceholdersInSelection(deleteIndex, deleteLength);
            selected.forEach(placeholder => placeholders.push(placeholder));
            deleteIndex = -1;
            deleteLength = 0;
          }
        }
      }
      if (placeholders.length) {
        const placeholderHistoryEventMethod = `_confirm${insert ? 'Insert' : 'Remove'}Placeholders`;

        // Event only confirm insert/delete
        this[placeholderHistoryEventMethod](placeholders, false, true);
      }
      return true;
    }

    _isCharacterKey(e) {
      let result = false;
      // This is IE, which only fires keypress events for printable keys
      if (typeof e.keyCode === 'undefined') result = true;
      else if (typeof e.which == 'number' && e.which > 0) {
        // In other browsers except old versions of WebKit, evt.which is
        // only greater than zero if the keypress is a printable key.
        // We need to filter out backspace and ctrl/alt/meta key combinations
        result = !e.ctrlKey && !e.metaKey && !e.altKey && e.keyCode !== 8;
      }
      return result;
    }

    _undoPlaceholderEvents() {
      const historyStack = this._editor.history.stack;
      const undo = historyStack.undo[historyStack.undo.length - 1] || [];
      if (undo && undo.undo) this._emitPlaceholderHistoryEvents(undo.undo.ops);
      return true;
    }

    _redoPlaceholderEvents() {
      const historyStack = this._editor.history.stack;
      const redo = historyStack.redo[historyStack.redo.length - 1] || [];
      if (redo && redo.redo) this._emitPlaceholderHistoryEvents(redo.redo.ops);
      return true;
    }

    _emitChangeEvent() {
      this._debounceSetValue && this._debounceSetValue.flush();

      if (this._lastCommittedChange !== this.value) {
        this.dispatchEvent(new CustomEvent('change', { bubbles: true, cancelable: false }));
        this._lastCommittedChange = this.value;
      }
    }

    _onReadonlyClick() {
      const range = this._getSelection();
      if (range) {
        const [readOnlySection] = this._editor.scroll.descendant(ReadOnlyBlot, range.index);
        this._editor.formatText(range.index, range.length, 'readonly', readOnlySection == null, 'user');
      }
    }

    _onLinkClick() {
      const range = this._getSelection();
      if (range) {
        const LinkBlot = Quill.imports['formats/link'];
        const [link, offset] = this._editor.scroll.descendant(LinkBlot, range.index);
        if (link != null) {
          // existing link
          this._linkRange = { index: range.index - offset, length: link.length() };
          this._linkUrl = LinkBlot.formats(link.domNode);
        } else if (range.length === 0) {
          this._linkIndex = range.index;
        }
        this._linkEditing = true;
      }
    }

    _applyLink(link) {
      if (link) {
        this._markToolbarClicked();
        this._editor.format('link', link, SOURCE.USER);
        this._editor.getModule('toolbar').update(this._editor.selection.savedRange);
      }
      this._closeLinkDialog();
    }

    _insertLink(link, position) {
      if (link) {
        this._markToolbarClicked();
        this._editor.insertText(position, link, { link });
        this._editor.setSelection(position, link.length);
      }
      this._closeLinkDialog();
    }

    _updateLink(link, range) {
      this._markToolbarClicked();
      this._editor.formatText(range, 'link', link, SOURCE.USER);
      this._closeLinkDialog();
    }

    _removeLink() {
      this._markToolbarClicked();
      if (this._linkRange != null) {
        this._editor.formatText(this._linkRange, { link: false, color: false }, SOURCE.USER);
      }
      this._closeLinkDialog();
    }

    _closeLinkDialog() {
      this._linkEditing = false;
      this._linkUrl = '';
      this._linkIndex = null;
      this._linkRange = null;
    }

    _onLinkEditConfirm() {
      if (this._linkIndex != null) {
        this._insertLink(this._linkUrl, this._linkIndex);
      } else if (this._linkRange) {
        this._updateLink(this._linkUrl, this._linkRange);
      } else {
        this._applyLink(this._linkUrl);
      }
    }

    _onLinkEditCancel() {
      this._closeLinkDialog();
      this._editor.focus();
    }

    _onLinkEditRemove() {
      this._removeLink();
      this._closeLinkDialog();
    }

    _onLinkKeydown(e) {
      if (e.keyCode === 13) {
        e.preventDefault();
        e.stopPropagation();
        this.$.confirmLink.click();
      }
    }

    _updateHtmlValue() {
      const className = 'ql-editor';
      const editor = this.shadowRoot.querySelector(`.${className}`);
      let content = editor.innerHTML;

      // Remove style-scoped classes that are appended when ShadyDOM is enabled
      Array.from(editor.classList).forEach(c => (content = content.replace(new RegExp('\\s*' + c, 'g'), '')));

      // Remove Quill classes, e.g. ql-syntax, except for align
      content = content.replace(/\s*ql-(?!align)[\w\-]*\s*/g, '');

      // Replace Quill align classes with inline styles
      ['right', 'center', 'justify'].forEach(align => {
        content = content.replace(new RegExp(` class=[\\\\]?"\\s?ql-align-${align}[\\\\]?"`, 'g'), ` style="text-align: ${align}"`);
      });

      content = content.replace(/ class=""/g, '');

      this._setHtmlValue(content);
    }

    _announceFormatting() {
      const timeout = 200;

      const announcer = this.shadowRoot.querySelector('.announcer');
      announcer.textContent = '';

      this._debounceAnnounceFormatting = Debouncer.debounce(this._debounceAnnounceFormatting, timeOut.after(timeout), () => {
        const formatting = Array.from(this.shadowRoot.querySelectorAll('[part="toolbar"] .ql-active'))
          .map(button => button.getAttribute('title'))
          .join(', ');
        announcer.textContent = formatting;
      });
    }

    get _customButtons() {
      return Array.from(this.querySelectorAll('button, vaadin-button, [part="custom-button"]')).filter(el => el.getAttribute('slot') === 'toolbar');
    }

    get _toolbarButtons() {
      return Array.from(this.shadowRoot.querySelectorAll('[part="toolbar"] button'))
        .filter(btn => btn.clientHeight > 0)
        .concat(this._customButtons);
    }

    _clear() {
      this._editor.deleteText(0, this._editor.getLength(), SOURCE.SILENT);
      this._updateHtmlValue();
    }

    _undo(e) {
      e.preventDefault();
      this._undoPlaceholderEvents();
      this._editor.history.undo();
      this._editor.focus();
    }

    _redo(e) {
      e.preventDefault();
      this._redoPlaceholderEvents();
      this._editor.history.redo();
      this._editor.focus();
    }

    _toggleToolbarDisabled(disable) {
      const buttons = this._toolbarButtons;
      if (disable) {
        buttons.forEach(btn => btn.setAttribute('disabled', 'true'));
      } else {
        buttons.forEach(btn => btn.removeAttribute('disabled'));
      }
    }

    _onImageTouchEnd(e) {
      // Cancel the event to avoid the following click event
      e.preventDefault();
      // FIXME(platosha): workaround for Polymer Gestures mouseCanceller
      // cancelling the following synthetic click. See also:
      // https://github.com/Polymer/polymer/issues/5289
      this._resetMouseCanceller();
      this._onImageClick();
    }

    _resetMouseCanceller() {
      resetMouseCanceller();
    }

    _onImageClick() {
      this.$.fileInput.value = '';
      this.$.fileInput.click();
    }

    _uploadImage(e) {
      const fileInput = e.target;
      // NOTE: copied from https://github.com/quilljs/quill/blob/1.3.6/themes/base.js#L128
      // needs to be updated in case of switching to Quill 2.0.0
      if (fileInput.files != null && fileInput.files[0] != null) {
        const reader = new FileReader();
        reader.onload = e => {
          const image = e.target.result;
          const range = this._getSelection(true);
          this._editor.updateContents(
            new Quill.imports.delta()
              .retain(range.index)
              .delete(range.length)
              .insert({ image }),
            SOURCE.USER
          );
          this._markToolbarClicked();
          this._editor.setSelection(range.index + 1, SOURCE.SILENT);
          fileInput.value = '';
        };
        reader.readAsDataURL(fileInput.files[0]);
      }
    }

    _disabledChanged(disabled, readonly, editor) {
      if (disabled === undefined || readonly === undefined || editor === undefined) {
        return;
      }

      if (disabled || readonly) {
        editor.enable(false);

        if (disabled) {
          this._toggleToolbarDisabled(true);
        }
      } else {
        editor.enable();

        if (this._oldDisabled) {
          this._toggleToolbarDisabled(false);
        }
      }

      this._oldDisabled = disabled;
    }

    _tabStopsChanged(tabStops, _editor) {
      const horizontalRuler = this.shadowRoot.querySelector('[part="horizontalRuler"]');
      if (horizontalRuler) {
        horizontalRuler.innerHTML = '';
      }

      tabStops.forEach(stop => {
        this._addTabStopIcon(stop);
      });
      if (_editor) {
        _editor.emitter.emit('text-change');
      }
    }

    _valueChanged(value, editor) {
      if (editor === undefined) {
        return;
      }

      if (value == null || value == '[{"insert":"\\n"}]') {
        this.value = '';
        return;
      }

      if (value === '') {
        this._clear();
        return;
      }

      let parsedValue;
      try {
        parsedValue = JSON.parse(value);
        if (Array.isArray(parsedValue)) {
          this._oldValue = value;
          // Set altAppearance
          let AltAppearance = false;
          for (const op of parsedValue) {
            if (op.insert.placeholder) {
              AltAppearance = op.insert.placeholder.altAppearance || false;
              break;
            }
          }
          this.placeholderAltAppearance = AltAppearance;
        } else {
          throw new Error('expected JSON string with array of objects, got: ' + value);
        }
      } catch (err) {
        // Use old value in case new one is not suitable
        this.value = this._oldValue;
        console.error('Invalid value set to rich-text-editor:', err);
        return;
      }
      const delta = new Quill.imports.delta(parsedValue);
      // suppress text-change event to prevent infinite loop
      if (JSON.stringify(editor.getContents()) !== JSON.stringify(delta)) {
        editor.setContents(delta, SOURCE.SILENT);
        // in case we have tabstops, they will be rendered in on text-change, so we need to trigger it
        editor.emitter.emit('text-change');
      }
      this._updateHtmlValue();

      if (this._toolbarState === STATE.CLICKED) {
        this._cleanToolbarState();
        this._emitChangeEvent();
      } else if (!this._editor.hasFocus()) {
        // value changed from outside
        this._lastCommittedChange = this.value;
      }
    }

    _addTabStopIcon(tabStop) {
      var icon = document.createElement('iron-icon');
      let iconIcon;
      if (tabStop.direction == 'left') {
        iconIcon = 'vaadin:caret-right';
      } else if (tabStop.direction == 'right') {
        iconIcon = 'vaadin:caret-left';
      } else {
        iconIcon = 'vaadin:dot-circle';
      }

      icon.setAttribute('icon', iconIcon);
      icon.style.width = '15px';
      icon.style.height = '15px';
      icon.style.position = 'absolute';
      icon.style.top = '0px';
      icon.style.left = tabStop.position - 7 + 'px';
      const horizontalRuler = this.shadowRoot.querySelector('[part="horizontalRuler"]');
      horizontalRuler.appendChild(icon);
      icon.tabStop = tabStop;

      var self = this;
      icon.onclick = function(iconEvent) {
        var icon = iconEvent.target;
        var index = self.tabStops.indexOf(icon.tabStop);

        if (icon.getAttribute('icon') == 'vaadin:caret-right') {
          icon.setAttribute('icon', 'vaadin:caret-left');
          icon.tabStop.direction = 'right';
          self.tabStops[index] = icon.tabStop;
        } else if (icon.getAttribute('icon') == 'vaadin:caret-left') {
          icon.setAttribute('icon', 'vaadin:dot-circle');
          icon.tabStop.direction = 'middle';
          self.tabStops[index] = icon.tabStop;
        } else {
          self.tabStops.splice(index, 1);
          icon.parentElement.removeChild(icon);
          icon.remove();
        }

        self.tabStops = Object.assign([], self.tabStops);

        iconEvent.stopPropagation();
        self._editor.emitter.emit('text-change');
      };
    }

    _addTabStop(event) {
      const tabStop = { direction: 'left', position: event.offsetX };
      this.tabStops.push(tabStop);
      this.tabStops.sort((a, b) => a['position'] - b['position']);
      this.tabStops = Object.assign([], this.tabStops);
      this._editor.emitter.emit('text-change');
    }

    _placeholderEditingChanged(value) {
      this.$.placeholderDialog.opened = value;
    }

    _onPlaceholderChanged(e) {
      this._placeholder = e.detail.value;
    }

    _onPlaceholderClick() {
      const range = this._getSelection();

      if (range) {
        const placeholder = this.selectedPlaceholder;
        if (placeholder && placeholder.text) {
          const value = placeholder.text.replace(this.placeholderTags.start, '').replace(this.placeholderTags.end, '');
          this.$.placeholderRemoveButton.style.display = 'block';
          this._placeholderRange = { index: range.index - 1, length: 1 };
          this._placeholder = value;
        } else if (range.length === 0) {
          this.$.placeholderRemoveButton.style.display = 'none';
          this._insertPlaceholderIndex = range.index;
        }

        const detail = { position: range.index };
        const event = new CustomEvent('placeholder-button-click', { bubbles: true, cancelable: true, detail });
        const cancelled = !this.dispatchEvent(event);
        if (!cancelled) this._placeholderEditing = true;
      }
    }

    get selectedPlaceholder() {
      const op = this._editor.getContents(this._getSelection().index - 1, 1).ops[0];
      return (op && op.insert.placeholder) || null;
    }

    get selectedPlaceholders() {
      const range = this._getSelection();
      const placeholders = [];
      for (let i = range.index - 1; i < range.index + range.length; i++) {
        const op = this._editor.getContents(i, 1).ops[0];
        const placeholder = (op && op.insert.placeholder) || null;
        if (placeholder) placeholders.push(placeholder);
      }
      return placeholders;
    }

    _getPlaceholdersInSelection(index, length) {
      const sel = this._editor.getSelection();
      index = index || sel.index;
      length = length || sel.length;
      this._editor.setSelection(index, length, SOURCE.SILENT);
      const placeholders = this.selectedPlaceholders;
      if (index !== sel.index && length !== sel.length) {
        this._editor.setSelection(sel.index, sel.length, SOURCE.SILENT);
      }
      return placeholders;
    }

    _insertPlaceholders(placeholders, index = 0, remove = false) {
      if (!Array.isArray(placeholders)) placeholders = [{ placeholder: placeholders, index }];
      this._markToolbarClicked();
      const detail = { placeholders };
      const event = new CustomEvent(`placeholder-before-insert`, { bubbles: true, cancelable: true, detail });
      const cancelled = !this.dispatchEvent(event);
      this._insertPlaceholdersList = placeholders;
      if (!cancelled && placeholders) this._confirmInsertPlaceholders(placeholders);
      else if (remove) this._confirmRemovePlaceholders(placeholders, true);
      this._closePlaceholderDialog();
    }

    _updatePlaceholder(placeholder) {
      this._markToolbarClicked();
      const detail = { placeholder };
      const event = new CustomEvent(`placeholder-before-update`, { bubbles: true, cancelable: true, detail });
      const cancelled = !this.dispatchEvent(event);
      if (!cancelled && placeholder && this._placeholderRange) {
        this._confirmRemovePlaceholders(placeholder);
        this._confirmInsertPlaceholders([{ placeholder, index: this._placeholderRange.index }]);
      }
      this._closePlaceholderDialog();
    }

    _setInsertPlaceholder(placeholder, index) {
      if (placeholder) this._placeholder = placeholder;
      if (index) this._insertPlaceholderIndex = index;
    }

    _confirmInsertPlaceholders(placeholders = this._insertPlaceholdersList, silent = false, eventsOnly = false) {
      const detail = { placeholders: placeholders.map(i => i.placeholder) };
      let selectIndex = 0;
      if (!eventsOnly) {
        placeholders.forEach(({ placeholder, index: i }) => {
          if (this.placeholderAltAppearance) placeholder.altAppearance = true;
          this._editor.insertEmbed(i, 'placeholder', placeholder);
          selectIndex = i;
        });
        this._editor.setSelection(selectIndex + 1, 0);
      }
      if (!silent) this.dispatchEvent(new CustomEvent('placeholder-insert', { bubbles: true, cancelable: false, detail }));
    }

    _getSelection(focus = false) {
      return this._editor.getSelection(focus);
    }

    _getPlaceholderOptions(placeholder) {
      let placeholderOptions = this.placeholders.filter(i => i.text === placeholder)[0] || placeholder;
      if (typeof placeholderOptions === 'string') placeholderOptions = { text: placeholder };
      else if (placeholderOptions.text) placeholderOptions = { ...placeholderOptions };
      else console.error('Invalid placeholder format');
      return placeholderOptions;
    }

    _removePlaceholders(placeholders = this.selectedPlaceholders, restore = false, replace = '') {
      this._markToolbarClicked();
      if (placeholders.length) {
        const detail = { placeholders };
        const event = new CustomEvent(`placeholder-before-delete`, { bubbles: true, cancelable: true, detail });
        const cancelled = !this.dispatchEvent(event);
        if (!cancelled) this._confirmRemovePlaceholders(placeholders, false, false, replace);
        else if (restore) this._confirmInsertPlaceholders(placeholders, true);
      }
      this._closePlaceholderDialog();
    }

    _confirmRemovePlaceholders(placeholders = this.selectedPlaceholders, silent = false, eventsOnly = false, replace = '') {
      if (placeholders.length) {
        if (!eventsOnly) {
          const range = this._getSelection();
          let deleteRange = range;
          if (!this._placeholderRange) this._placeholderRange = { index: range.index - 1, length: 1 };
          if (range.length > 1) deleteRange = range;
          else deleteRange = this._placeholderRange;
          this._editor.deleteText(deleteRange.index, deleteRange.length);
          if (replace) {
            this._editor.insertText(deleteRange.index, replace);
            this._editor.setSelection(deleteRange.index + replace.length, 0);
          } else {
            this._editor.setSelection(deleteRange.index, 0);
          }
        }
        if (!silent) {
          const detail = { placeholders };
          this.dispatchEvent(new CustomEvent('placeholder-delete', { bubbles: true, cancelable: false, detail }));
        }
      }
    }

    _closePlaceholderDialog() {
      this._placeholderEditing = false;
      this._placeholder = '';
      this._insertPlaceholderIndex = null;
      this._placeholderRange = null;
    }

    _onPlaceholderEditConfirm() {
      const placeholder = this._getPlaceholderOptions(this._placeholder);
      if (this._insertPlaceholderIndex !== null) this._insertPlaceholders(placeholder, this._insertPlaceholderIndex);
      else if (this._placeholderRange) this._updatePlaceholder(placeholder, this._placeholderRange);
    }

    _onPlaceholderEditCancel() {
      this._closePlaceholderDialog();
      this._editor.focus();
    }

    _onPlaceholderEditRemove() {
      this._removePlaceholders();
      this._closePlaceholderDialog();
    }

    _placeholderAltAppearanceChanged(altAppearance) {
      if (altAppearance) this.set('placeholderAppearance', this.i18n.placeholderAppearanceLabel2);
      else this.set('placeholderAppearance', this.i18n.placeholderAppearanceLabel1);
      if (this.value) {
        this.value = JSON.stringify(
          JSON.parse(this.value).map(op => {
            if (typeof op.insert === 'object' && op.insert.placeholder) {
              op.insert.placeholder.altAppearance = altAppearance;
            }
            return op;
          })
        );
        this._silentTextChange = true;
        if (this._ready) {
          const detail = { altAppearance: this.placeholderAltAppearance, appearanceLabel: this.placeholderAppearance };
          this.dispatchEvent(new CustomEvent('placeholder-appearance-change', { bubbles: true, cancelable: false, detail }));
        }
      }
    }

    _placeholderTagsChanged(tags) {
      PlaceholderBlot.tags = tags;
      this._resetPlaceholderAppearance();
    }

    _resetPlaceholderAppearance() {
      [1, 2].forEach(() => (this.placeholderAltAppearance = !this.placeholderAltAppearance));
    }

    _placeholderAltAppearancePatternChanged(altAppearanceRegex) {
      PlaceholderBlot.altAppearanceRegex = altAppearanceRegex;
      this.$.placeholderAppearanceBtn.hidden = !(this.placeholders.length && altAppearanceRegex);
    }

    _placeholdersChanged(placeholders) {
      this.$.placeholderBtn.hidden = !placeholders.length;
      this.$.placeholderAppearanceBtn.hidden = !(placeholders.length && this.placeholderAltAppearancePattern);
      if (placeholders.length) this.$.placeholderComboBox.items = placeholders.map(placeholder => this._getPlaceholderOptions(placeholder));
    }

    /**
     * Fired when the user commits a value change.
     *
     * @event change
     */

    /**
     * Fired when the user commits a value change.
     *
     * @event placeholder-appearance-change
     * ```
     * e.detail = { altAppearance: boolean, appearanceLabel: string }
     * ```
     */

    /**
     * Fired when the user selects a placeholder.
     *
     * @event placeholder-select
     * ```
     * e.detail = { placeholder: object }
     * ```
     */

    /**
     * Fired after clicking addPlaceholder button.
     *
     * @event placeholder-button-click
     * ```
     * e.detail = { position: number }
     * ```
     */

    /**
     * Fired before updating a placeholder.
     *
     * @event placeholder-before-update
     * ```
     * e.detail = { placeholder: object }
     * ```
     */

    /**
     * Fired before a placeholder is inserted.
     *
     * @event placeholder-before-insert
     */

    /**
     * Fired after a placeholder is inserted.
     *
     * @event placeholder-insert
     * ```
     * e.detail = { placeholder: object }
     * ```
     */

    /**
     * Fired before a placeholder is deleted.
     *
     * @event placeholder-before-delete
     * ```
     * e.detail = { placeholder: object }
     * ```
     */

    /**
     * Fired after a placeholder is deleted.
     *
     * @event placeholder-delete
     * ```
     * e.detail = { placeholder: object }
     * ```
     */

    /**
     * @protected
     */
    static _finalizeClass() {
      super._finalizeClass();

      const devModeCallback = window.Vaadin.developmentModeCallback;
      const licenseChecker = devModeCallback && devModeCallback['vaadin-license-checker'];
      if (typeof licenseChecker === 'function') {
        licenseChecker(VcfEnhancedRichTextEditor);
      }
    }
  }

  customElements.define(VcfEnhancedRichTextEditor.is, VcfEnhancedRichTextEditor);

  /**
   * @namespace Vaadin
   */
  window.Vaadin.VcfEnhancedRichTextEditor = VcfEnhancedRichTextEditor;
})();
