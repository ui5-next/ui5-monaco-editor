import MonacoEditor from "./control/MonacoEditor";
import App from "sap/m/App";
import Page from "sap/m/Page";

var value = `"use strict";

class Chuck \\{
    greet() \\{
        return Facts.next();
    \\}
\\}`;

var editor = <MonacoEditor value={value} />;

var app = <App
  pages={<Page
    title="MonacoEditor Demo"
    content={editor}
  />}
/>;

app.placeAt("content");
