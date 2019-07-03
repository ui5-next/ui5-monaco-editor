import MonacoEditor from "./control/MonacoEditor";
import App from "sap/m/App";
import Page from "sap/m/Page";
import MessageBox from "sap/m/MessageBox";

const encodeSource = (s = "") => s.replace(/(\{|\})/g, "\\$1");

const persistKey = "latestValue";

var defaultValue = `"use strict";

class Chuck \\{
    greet() \\{
        return Facts.next();
    \\}
\\}

`;


if (localStorage) {

  var latestValue = localStorage.getItem(persistKey);

  if (latestValue != null && latestValue) {
    defaultValue = encodeSource(latestValue);
  }

}

const onChange = (e) => {
  if (localStorage) {
    localStorage.setItem(persistKey, e.getParameter("value"));
  }
};

const onSave = (e)=>{
  MessageBox.information("Save triggered but not support.");
};

var editor = <MonacoEditor value={defaultValue} theme="vs" liveChange={onChange} save={onSave} />;

var app = <App
  pages={
    <Page
      title="MonacoEditor Demo"
      content={editor}
    />
  }
/>;

app.placeAt("content");
