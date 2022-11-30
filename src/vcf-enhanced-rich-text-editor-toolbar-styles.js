import './vcf-enhanced-rich-text-editor-icons.js';
const documentContainer = document.createElement('template');

documentContainer.innerHTML = `
  <dom-module id="vcf-enhanced-rich-text-editor-toolbar-styles">
    <template>
      <style include="vcf-enhanced-rich-text-editor-icons">
        [part="toolbar"] {
          display: flex;
          flex-wrap: wrap;
          flex-shrink: 0;
        }

        [part~="toolbar-button"],
        ::slotted([part~="toolbar-button"]) {
          width: 2em;
          height: 2em;
          margin: 0;
          padding: 0;
          font: inherit;
          line-height: 1;
          text-transform: none;
          background: transparent;
          border: none;
          position: relative;
        }

        ::slotted([part~="toolbar-button"]) {
          width: auto;
          height: var(--lumo-size-m);
          border-radius: var(--lumo-border-radius);
          color: var(--lumo-contrast-80pct);
          margin: 2px 1px;
          cursor: default;
          transition: background-color 100ms, color 100ms;
          padding: 0 var(--lumo-space-s);
        }

        ::slotted([part~="toolbar-button"]:hover) {
          background-color: var(--lumo-contrast-5pct);
          color: var(--lumo-contrast);
          box-shadow: none;
        }

        [part~="toolbar-button"]:hover,
        ::slotted([part~="toolbar-button"]:hover) {
          outline: none;
        }

        [part~="toolbar-button"]::before,
        ::slotted([part~="toolbar-button"]::before) {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        [part~="toolbar-button-undo"]::before,
        [part~="toolbar-button-redo"]::before,
        [part~="toolbar-button-list-ordered"]::before,
        [part~="toolbar-button-list-bullet"]::before,       
        [part~="toolbar-button-image"]::before,
        [part~="toolbar-button-link"]::before,
        [part~="toolbar-button-clean"]::before {
          font-family: "vaadin-rte-icons", sans-serif;
        }

        [part~="toolbar-button-align-justify"] iron-icon, 
        [part~="toolbar-button-align-left"] iron-icon,
        [part~="toolbar-button-align-center"] iron-icon,
        [part~="toolbar-button-align-right"] iron-icon,
        [part~="toolbar-button-deindent"] iron-icon, 
        [part~="toolbar-button-indent"] iron-icon {
          padding: 0.25em;
          box-sizing: border-box !important;
        }

        [part~="toolbar-group"] {
          display: flex;
          margin: 0 0.5em;
        }

        [part~="toolbar-button-bold"]::before {
          content: "B";
          font-weight: 700;
        }

        [part~="toolbar-button-italic"]::before {
          content: "I";
          font-style: italic;
        }

        [part~="toolbar-button-underline"]::before {
          content: "U";
          text-decoration: underline;
        }

        [part~="toolbar-button-strike"]::before {
          content: "T";
          text-decoration: line-through;
        }

        [part~="toolbar-button-h1"]::before {
          content: "H1";
          font-size: 1.25em;
        }

        [part~="toolbar-button-h2"]::before {
          content: "H2";
          font-size: 1em;
        }

        [part~="toolbar-button-h3"]::before {
          content: "H3";
          font-size: 0.875em;
        }

        [part~="toolbar-button-h1"]::before,
        [part~="toolbar-button-h2"]::before,
        [part~="toolbar-button-h3"]::before {
          letter-spacing: -0.05em;
        }

        [part~="toolbar-button-subscript"]::before,
        [part~="toolbar-button-superscript"]::before {
          content: "X";
        }

        [part~="toolbar-button-subscript"]::after,
        [part~="toolbar-button-superscript"]::after {
          content: "2";
          position: absolute;
          top: 50%;
          left: 70%;
          font-size: 0.625em;
        }

        [part~="toolbar-button-superscript"]::after {
          top: 20%;
        }

        [part~="toolbar-button-blockquote"]::before {
          content: "”";
          font-size: 2em;
          height: 0.6em;
        }

        [part~="toolbar-button-code-block"]::before {
          content: "</>";
          font-size: 0.875em;
        }
        
        [part~="toolbar-button"][part~="toolbar-button-placeholder-display"] {
          width: auto;
          min-width: var(--lumo-size-l);
          padding: 0 var(--lumo-space-xs);
          font-size: 0.875em;
        }
      </style>
    </template>
  </dom-module>
`;

document.head.appendChild(documentContainer.content);
