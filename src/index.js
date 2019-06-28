import MonacoEditor from "./control/MonacoEditor";
import App from "sap/m/App";
import Page from "sap/m/Page";
import Title from "sap/m/Title";
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
    headerContent={<Title> MonacoEditor Demo</Title>}
    content={editor}
  />}
/>;

app.setModel(model).placeAt("content");
