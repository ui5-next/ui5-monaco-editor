import Control from "sap/ui/core/Control";

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
      }
    },
    events: {
      liveChange: {},
      change: {}
    }
  }

  init() {

    super.init();

    this._oEditorDomRef = document.createElement("div");
    this._oEditorDomRef.style.height = "100%";
    this._oEditorDomRef.style.width = "100%";

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
      jQuery.sap.includeScript("https://cdn.bootcss.com/require.js/2.3.6/require.min.js", "requirejs", this._setupEditor.bind(this));
    } else {
      this._setupEditor.bind(this)();
    }

    oDomRef.appendChild(this._oEditorDomRef);

  }

  _setupEditor() {

    window.require.config({ paths: { 'vs': 'https://cdn.bootcss.com/monaco-editor/0.17.0/min/vs' } });

    // load monaco editor
    require(['vs/editor/editor.main'], monaco => {

      this._oEditor = monaco.editor.create(this._oEditorDomRef, {
        value: this.getValue(),
        language: this.getType(),
        readOnly: !this.getEditable(),
        fontSize: this.getFontSize(),
        automaticLayout: true,
        minimap: { enabled: false } // disable minimap to increase performance
      });

      this._oEditor.getModel().onDidChangeContent(this._onEditorValueChange.bind(this));

      this._oEditor.onDidBlurEditorText(this._onBlur.bind(this));

      this._loadTypes();

    });

  }

  _loadTypes() {

    require(['vs/editor/editor.main'], monaco => {

      // load types
      var types = this.getTypes() || [];

      if (types) {
        Promise.all(
          types.map(
            t => fetch(t)
              .then(
                res => res.text().then(typeContent => ({ path: t, typeContent: typeContent }))
              )
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
      this.setProperty("value", sValue, true);

      this.fireLiveChange({
        value: sValue,
        editorEvent: e
      });
    }

  }

  setEditable(bEditable) {
    if (this._oEditor) {
      this._oEditor.updateOptions({ readOnly: !bEditable });
    }
    this.setProperty("editable", bEditable, true);
    return this;
  }

  setType(sType) {
    if (this._oEditor) {
      this._oEditor.updateOptions({ language: sType });
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