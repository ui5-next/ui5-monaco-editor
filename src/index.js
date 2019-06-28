import MonacoEditor from "./control/MonacoEditor";
import App from "sap/m/App";
import Page from "sap/m/Page";
import JSONModel from "sap/ui/model/json/JSONModel";

var src = `
"use strict";

class Chuck {
    greet() {
        return Facts.next();
    }
}`;

var model = new JSONModel({
  src
});


var editor = <MonacoEditor value="{/src}" />;

var app = <App
  pages={<Page
    title="MonacoEditor Demo"
    content={editor}
  />}
/>;

app.setModel(model).placeAt("content");
