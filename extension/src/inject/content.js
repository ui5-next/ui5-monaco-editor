if (window.sap && window.sap.ui && window.sap.ui.define) {

  sap.ui.loader._.unloadResources("sap/ui/codeeditor/CodeEditor.js", false, true)

  sap.ui.define("sap/ui/codeeditor/CodeEditor", ["sap/ui/core/Control"], function (Control) {
    var _default = {};

    var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

    /**
     * MonacoEditor Control
     */
    var MonacoEditor = Control.extend("sap.ui.codeeditor.CodeEditor", {
      metadata: {
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
            defaultValue: ["https://raw.githubusercontent.com/larshp/xsjs.d.ts/master/xsjs.d.ts", "https://raw.githubusercontent.com/SAP/ui5-typescript/master/packages/ts-types/types/sap.ui.core.d.ts", "https://raw.githubusercontent.com/SAP/ui5-typescript/master/packages/ts-types/types/sap.m.d.ts"]
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
      },
      init: function init() {

        Control.prototype.init.apply(this, []);

        this._oEditorDomRef = document.createElement("div");
        this._oEditorDomRef.style.height = "100%";
        this._oEditorDomRef.style.width = "100%";

        this.setBusyIndicatorDelay(0);
      },
      onAfterRendering: function onAfterRendering() {
        var oDomRef = this.getDomRef(),
          oPropertyDefaults = this.getMetadata().getPropertyDefaults();

        setTimeout(function () {
          if (this.getMaxLines() === oPropertyDefaults.maxLines && this.getHeight() === oPropertyDefaults.height && oDomRef.height < 20) {
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
      },
      _setupEditor: function _setupEditor() {
        var _this = this;

        this.setBusy(true);

        window.require.config({ paths: { 'vs': 'https://cdn.bootcss.com/monaco-editor/0.17.0/min/vs' } });

        // load monaco editor
        require(['vs/editor/editor.main'], function (monaco) {

          _this._oEditor = monaco.editor.create(_this._oEditorDomRef, {
            value: _this.getValue(),
            language: _this.getType(),
            readOnly: !_this.getEditable(),
            fontSize: _this.getFontSize(),
            automaticLayout: true,
            minimap: {
              enabled: false // disable minimap to increase performance
            }
          });

          _this._oEditor.getModel().onDidChangeContent(_this._onEditorValueChange.bind(_this));

          _this._oEditor.onDidBlurEditorText(_this._onBlur.bind(_this));

          _this._loadTypes();

          _this.setBusy(false);
        });
      },
      _loadTypes: function _loadTypes() {
        var _this2 = this;

        // requirejs
        require(['vs/editor/editor.main'], function (monaco) {

          // load types
          var types = _this2.getTypes() || [];

          if (types) {
            Promise.all(types.map(function (t) {
              return fetch(t).then(function (res) {
                return res.text();
              }).then(function (typeContent) {
                return { path: t, typeContent: typeContent };
              });
            })).then(function (typeContents) {
              typeContents.forEach(function (t) {
                monaco.languages.typescript.javascriptDefaults.addExtraLib(t.typeContent, t.path);
              });
            });
          }
        });
      },
      _onBlur: function _onBlur() {
        var sEditorValue = this._oEditor.getValue();
        var sCurrentValue = this.getValue();
        if (sEditorValue != sCurrentValue) {
          this.setProperty("value", sEditorValue, true);
          this.fireChange({
            value: sEditorValue,
            oldValue: sCurrentValue
          });
        }
      },
      _onEditorValueChange: function _onEditorValueChange(e) {

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
      },
      setEditable: function setEditable(bEditable) {
        if (this._oEditor) {
          this._oEditor.updateOptions({ readOnly: !bEditable });
        }
        this.setProperty("editable", bEditable, true);
        return this;
      },
      setType: function setType(sType) {
        if (this._oEditor) {
          this._oEditor.updateOptions({ language: sType });
        }
        this.setProperty("type", sType, true);
        return this;
      },
      setValue: function setValue(sValue) {
        if (this._oEditor) {
          this._oEditor.setValue("" + sValue);
        }
        this.setProperty("value", sValue, true);
        return this;
      },
      renderer: function renderer(oRm, oControl) {
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
      },
      exit: function exit() {
        jQuery(this._oEditorDomRef).remove();
        this._oEditorDomRef = null;
        this._oEditor = null;
      }
    });
    _default = _extends(MonacoEditor, _default);
    return _default;
  })
} 