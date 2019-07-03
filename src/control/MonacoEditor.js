import Control from "sap/ui/core/Control";

/**
 * MonacoEditor Control
 */
export default class MonacoEditor extends Control {

  metadata = {
    properties: {
      value: {
        type: "string",
        group: "Misc",
        defaultValue: ""
      },
      type: {
        type: "string",
        group: "Appearance",
        defaultValue: "javascript"
      },
      theme: {
        type: "string",
        group: "Appearance",
        defaultValue: ""
      },
      types: {
        type: "any",
        defaultValue: [
          "https://raw.githubusercontent.com/larshp/xsjs.d.ts/master/xsjs.d.ts",
          "https://raw.githubusercontent.com/SAP/ui5-typescript/master/packages/ts-types/types/sap.ui.core.d.ts",
          "https://raw.githubusercontent.com/SAP/ui5-typescript/master/packages/ts-types/types/sap.m.d.ts"
        ]
      },
      width: {
        type: "sap.ui.core.CSSSize",
        group: "Appearance",
        defaultValue: "100%"
      },
      height: {
        type: "sap.ui.core.CSSSize",
        group: "Appearance",
        defaultValue: "100%"
      },
      fontSize: {
        type: "float",
        defaultValue: 14
      },
      editable: {
        type: "boolean",
        group: "Behavior",
        defaultValue: true
      },
      lineNumbers: {
        type: "boolean",
        group: "Behavior",
        defaultValue: true
      },
      valueSelection: {
        type: "boolean",
        group: "Behavior",
        defaultValue: false
      },
      maxLines: {
        type: "int",
        group: "Behavior",
        defaultValue: 0
      },
      colorTheme: {
        type: "string",
        group: "Behavior",
        defaultValue: "default"
      },
      syntaxHints: {
        type: "boolean",
        group: "Behavior",
        defaultValue: true
      },
      requirejsSource: {
        type: "string",
        defaultValue: "https://cdn.bootcss.com/require.js/2.3.6/require.min.js"
      },
      monacoEditorSource: {
        type: "string",
        defaultValue: "https://cdn.bootcss.com/monaco-editor/0.17.0/min/vs"
      }
    },
    events: {
      liveChange: {},
      change: {},
      save: {}
    }
  }

  init() {

    super.init();

    this._oEditorDomRef = document.createElement("div");
    this._oEditorDomRef.style.height = "100%";
    this._oEditorDomRef.style.width = "100%";

    this.setBusyIndicatorDelay(0);

  }

  onAfterRendering() {
    var oDomRef = this.getDomRef(),
      oPropertyDefaults = this.getMetadata().getPropertyDefaults();

    setTimeout(function() {
      if (
        this.getMaxLines() === oPropertyDefaults.maxLines
        && this.getHeight() === oPropertyDefaults.height
        && oDomRef.height < 20
      ) {
        oDomRef.style.height = "3rem";
      }
    }.bind(this), 0);

    if (!window.require) {
      // load requirejs
      jQuery.sap.includeScript(this.getRequirejsSource(), "requirejs", this._setupEditor.bind(this));
    } else {
      this._setupEditor.bind(this)();
    }

    oDomRef.appendChild(this._oEditorDomRef);

  }

  /**
   * get current editor option
   */
  _getEditorOption() {
    return {
      value: this.getValue(),
      language: this.getType(),
      readOnly: !this.getEditable(),
      fontSize: this.getFontSize(),
      theme: this.getTheme(),
      automaticLayout: true,
      wordWrap: "on",
      minimap: { enabled: false } // disable minimap to increase performance
    };
  }

  /**
   * setup editor with options
   */
  _setupEditor() {

    this.setBusy(true);

    window.require.config({ paths: { 'vs': this.getMonacoEditorSource() } });

    // load monaco editor
    require(['vs/editor/editor.main'], monaco => {

      this._oEditor = monaco.editor.create(this._oEditorDomRef, this._getEditorOption());

      this._oEditor.getModel().onDidChangeContent(this._onEditorValueChange.bind(this));

      this._oEditor.onDidBlurEditorText(this._onBlur.bind(this));

      this._oEditor.addAction({
        id: "save",
        label: "Save",
        keybindings: [
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S
        ],
        run: e => {
          this.fireEvent("save", { e });
        }
      });

      this._loadTypes();

      this.setBusy(false);

    });

  }

  /**
   * load type definitions from remote
   */
  _loadTypes() {

    // requirejs
    require(['vs/editor/editor.main'], monaco => {

      // load types
      var types = this.getTypes() || [];

      if (types) {
        Promise.all(
          types.map(
            t => fetch(t)
              .then(res => res.text())
              .then(typeContent => ({ path: t, typeContent: typeContent }))
          )
        ).then(typeContents => {
          typeContents.forEach(t => {
            monaco.languages.typescript.javascriptDefaults.addExtraLib(t.typeContent, t.path);
          });
        });
      }

    });

  }

  _onBlur() {
    var sEditorValue = this._oEditor.getValue();
    var sCurrentValue = this.getValue();
    if (sEditorValue != sCurrentValue) {
      this.setProperty("value", sEditorValue, true);
      this.fireChange({
        value: sEditorValue,
        oldValue: sCurrentValue
      });
    }
  }

  _onEditorValueChange(e) {

    if (!this.getEditable()) {
      return;
    }

    var sValue = this._oEditor.getValue();
    var sCurrentValue = this.getValue();

    if (sValue != sCurrentValue) {

      this.fireLiveChange({
        value: sValue,
        editorEvent: e
      });
    }

  }

  setEditable(bEditable) {
    if (this._oEditor) {
      this._oEditor.updateOptions(this._getEditorOption());
    }
    this.setProperty("editable", bEditable, true);
    return this;
  }

  setType(sType) {
    if (this._oEditor) {
      this._oEditor.updateOptions(this._getEditorOption());
    }
    this.setProperty("type", sType, true);
    return this;
  }

  setValue(sValue) {
    if (this._oEditor) {
      this._oEditor.setValue(`${sValue}`);
    }
    this.setProperty("value", sValue, true);
    return this;
  }

  renderer(oRm, oControl) {
    oRm.write("<div ");
    oRm.writeControlData(oControl);
    oRm.addStyle("width", oControl.getWidth());
    oRm.addStyle("height", oControl.getHeight());
    oRm.addClass("sapCEd");
    oRm.writeAttributeEscaped("data-sap-ui-syntaxhints", oControl.getSyntaxHints());
    var sTooltip = oControl.getTooltip_AsString();
    if (sTooltip) {
      oRm.writeAttributeEscaped('title', sTooltip);
    }
    oRm.writeStyles();
    oRm.writeClasses();
    oRm.write(">");
    oRm.write("</div>");
  }

  exit() {
    jQuery(this._oEditorDomRef).remove();
    this._oEditorDomRef = null;
    this._oEditor = null;
  }

}