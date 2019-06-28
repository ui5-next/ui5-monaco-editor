
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
    },
    defaultProperty: "content"
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
      if (this.getMaxLines() === oPropertyDefaults.maxLines && this.getHeight() === oPropertyDefaults.height
        && oDomRef.height < 20) {
        oDomRef.style.height = "3rem";
      }
    }.bind(this), 0);

    // load requirejs
    jQuery.sap.includeScript("https://cdn.bootcss.com/require.js/2.3.6/require.min.js", "requirejs", () => {

      require.config({ paths: { 'vs': 'https://cdn.bootcss.com/monaco-editor/0.17.0/min/vs' } });

      // load monaco editor
      require(['vs/editor/editor.main'], monaco => {

        this._oEditor = monaco.editor.create(this._oEditorDomRef, {
          value: this.getValue(),
          language: this.getType(),
          readOnly: !this.getEditable()
        });

        this._oEditor.getModel().onDidChangeContent(this._onEditorValueChange.bind(this));

      });

    });

    oDomRef.appendChild(this._oEditorDomRef);

  }

  _onEditorValueChange(e) {

    if (!this.getEditable()) {
      return;
    }

    var sValue = this.getValue();

    this.fireLiveChange({
      value: sValue,
      editorEvent: e
    });

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

}