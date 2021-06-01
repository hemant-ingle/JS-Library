function $$$$$(elem)
{
var element=elem;
this.val=function(){
if(element.value) return element.value;
throw element.tagName+" doesn't have value property";
};
this.innerHTML=function(text){
element.innerHTML=text;
};
}
function $$$(elementSelector)
{
var element;
if(!elementSelector) throw "Argument is missing";
if(elementSelector.startsWith("#"))
{
var elementId=elementSelector.slice(1);
element=document.getElementById(elementId);
if(!element) throw "Invalid id : "+elementId;
}
return new $$$$$(element);
}
$$$.getJSON=function(jsonObject){
if(!jsonObject.url) throw "url property is missing in json/url is boolean";
if(typeof jsonObject.url!="string") throw "url property should be of string type";
if(jsonObject.success && typeof jsonObject.success!="function") throw "success property should represent a function";
if(jsonObject.exception && typeof jsonObject.exception!="function") throw "exception property should represent a function";
if(jsonObject.failed && typeof jsonObject.failed!="function") throw "failed property should represent a function";
if(jsonObject.queryStringData && typeof jsonObject.queryStringData!="object") throw "queryStringData property should be of object type";
var url=jsonObject.url;
if(jsonObject.queryStringData)
{
var keys=Object.keys(jsonObject.queryStringData);
if(keys.length>0)
{
url+="?"+keys[0]+"="+encodeURI(jsonObject.queryStringData[keys[0]]);
var i;
for(i=1;i<keys.length;i++)
{
url=url+"&"+keys[i]+"="+encodeURI(jsonObject.queryStringData[keys[i]]);
}
}
}
var xmlHttpRequest=new XMLHttpRequest();
xmlHttpRequest.onreadystatechange=function(){
if(this.readyState==4)
{
if(this.status==200)
{
var responseString=this.responseText;
var responseJSON=JSON.parse(responseString);
if(responseJSON.success)
{
if(jsonObject.success) jsonObject.success(responseJSON.response);
}
else
{
if(jsonObject.exception) jsonObject.exception(responseJSON.exception);
}
}
else
{
if(jsonObject.failed) jsonObject.failed();
}
}
};
xmlHttpRequest.open("GET",url,true);
xmlHttpRequest.send();
};
$$$.postJSON=function(jsonObject){
if(!jsonObject.url) throw "url property is missing in json/url is boolean";
if(jsonObject.url && typeof jsonObject.url!="string") throw "url property should be of string type";
if(jsonObject.success && typeof jsonObject.success!="function") throw "success property should represent a function";
if(jsonObject.exception && typeof jsonObject.exception!="function") throw "exception property should represent a function";
if(jsonObject.failed && typeof jsonObject.failed!="function") throw "failed property should represent a function";
var data;
if(jsonObject.data) data=JSON.stringify(jsonObject.data);
var xmlHttpRequest=new XMLHttpRequest();
xmlHttpRequest.onreadystatechange=function(){
if(this.readyState==4)
{
if(this.status==200)
{
var responseString=this.responseText;
var responseJSON=JSON.parse(responseString);
if(responseJSON.success)
{
if(jsonObject.success) jsonObject.success(responseJSON.response);
}
else
{
if(jsonObject.exception) jsonObject.exception(responseJSON.exception);
}
}
else
{
if(jsonObject.failed) jsonObject.failed();
}
}
};
xmlHttpRequest.open("POST",jsonObject.url,true);
xmlHttpRequest.setRequestHeader("Content-type","x-www-form-urlencoded");
xmlHttpRequest.send(data);
};

$$$.setProperty=function(pointer,path,value){
var pathList=path.split(/\[|\]\.|\./g);
var i;
var p=pointer,key;
for(i=0;i<pathList.length-1;i++)
{
key=pathList[i];
if(p.hasOwnProperty(key)==false) throw "Invalid property : "+key;
p=p[key];
}
key=pathList[i];
p[key]=value;
};
$$$.getProperty=function(pointer,path){
var pathList=path.split(/\[|\]\.|\./g);
var i;
var p=pointer,key;
for(i=0;i<pathList.length;i++)
{
key=pathList[i];
if(p.hasOwnProperty(key)==false) return null;
p=p[key];
}
return p;
};

$$$.setModel=function(model){
var list=[];

//helper function area starts

var setModelProperty=function(path,value)
{
$$$.setProperty(model,path,value);
};
var getModelProperty=function(path){
return $$$.getProperty(model,path);
};

$$$.callFunction=function(thisArg,callBack,...args){
if(args.length==0) return callBack.apply(thisArg);
return callBack.apply(thisArg,args);
};
var callModelFunction=function(callBack,...args){
if(args.length==0) return $$$.callFunction(model,callBack);
var newArgs=[];
var i,modelProperty;
for(i=0;i<args.length;i++)
{
modelProperty=getModelProperty(args[i]);
if(modelProperty==null) throw "Invalid argument : "+args[i];
newArgs.push(modelProperty);
}
return $$$.callFunction(model,callBack,newArgs);
}
var twoWayObserver=function(b)
{
var presentValueOfProperty;
var presentValueOfNode;
var lastValueOfProperty="";
var lastValueOfNode="";
var observe=function()
{
presentValueOfProperty=getModelProperty(b.property);
presentValueOfNode=b.node.value;
if(presentValueOfNode!=lastValueOfNode) 
{
setModelProperty(b.property,presentValueOfNode);
lastValueOfProperty=presentValueOfProperty;
lastValueOfNode=b.node.value;
}
if(presentValueOfProperty!=lastValueOfProperty)
{
b.node.value=presentValueOfProperty; 
lastValueOfNode=b.node.value;
lastValueOfProperty=presentValueOfProperty;
}
setTimeout(observe,500);
}
observe();
};
var oneWayObserver=function(b)
{
var last=[];
var lastValueOfColumnTitle=[];
var observe=function()
{
var i,j;
var tableModel,numberOfRows,numberOfColumns,columnTitle;
var thead,tbody,tr,th,td,textNode,attribute,temp;
if(b.node.nodeName=="TABLE")
{
attribute=b.node.getAttribute("tableModel").trim();
tableModel=getModelProperty(attribute);
if(tableModel==null) throw "Table Model required.";
numberOfRows=tableModel.getRowCount();
numberOfColumns=tableModel.getColumnCount();
columnTitle=tableModel.getColumnTitle();
for(i=0;i<numberOfColumns && lastValueOfColumnTitle[i]==columnTitle[i];i++);

if(i<numberOfColumns)
{
if(b.node.tHead) b.node.tHead.remove();
thead=b.node.createTHead();
tr=document.createElement("tr");
for(i=0;i<numberOfColumns;i++)
{
th=document.createElement("th");
textNode=document.createTextNode(columnTitle[i]);
th.appendChild(textNode);
tr.appendChild(th);
lastValueOfColumnTitle[i]=columnTitle[i];
}
thead.appendChild(tr);
}
for(i=0;i<numberOfRows;i++)
{
for(j=0;j<numberOfColumns && last[i] && last[i][j]==tableModel.getValueAt(i,j);j++);
if(j<numberOfColumns) break;
}
if(i<numberOfRows && numberOfRows!=0)
{
if(b.node.tBodies[0]) b.node.tBodies[0].remove();
tbody=b.node.createTBody();
last=[];
for(i=0;i<numberOfRows;i++)
{
tr=document.createElement("tr");
temp=[];
for(j=0;j<numberOfColumns;j++)
{
td=document.createElement("td");
textNode=document.createTextNode(tableModel.getValueAt(i,j));
td.appendChild(textNode);
tr.appendChild(td);
temp[j]=tableModel.getValueAt(i,j);
}
tbody.appendChild(tr);
last.push(temp);
}
}
}
setTimeout(observe,500);
};
observe();
};
var textNodeObserver=function(b){
if(b.node.nodeType!=3) throw "Invaid node"; 
var last=[];
var itemsList;
var property,i,data;
var regex=/{{{[A-Za-z\$_][A-Za-z0-9\$_\[\]\.]*}}}/g;
itemsList=b.text.match(regex).filter(function(element,index,array){return (array.indexOf(element)==index);});
var observe=function(){
var i;
var data=b.text;
for(i=0;i<itemsList.length && last[i]==getModelProperty(itemsList[i].substring(3,itemsList[i].length-3));i++);
if(i<itemsList.length)
{
for(i=0;i<itemsList.length;i++)
{
property=itemsList[i].substring(3,itemsList[i].length-3);
data=data.split(itemsList[i]).join(getModelProperty(property));
last[i]=getModelProperty(property);
}
b.node.replaceData(0,b.node.data.length,data);
}
setTimeout(observe,500);
};
observe();
};

//helper function area ends

var i,j,node,iterator,attributevar,functionVariable;
iterator=document.createTreeWalker(document.body,NodeFilter.SHOW_ALL,{acceptNode:function(node){return NodeFilter.FILTER_ACCEPT;}},false);
var textNodeString="";
var nodeIterator,cNode,cloneNode,g,loopType;
var variable,from,to,step,collection;
do
{
node=iterator.currentNode;
if(node.nodeType!=3 && node.nodeType!=8 && node.hasAttribute("tm-for"))
{
attribute=node.getAttribute("tm-for").trim();
node.removeAttribute("tm-for");
g=attribute.split(/\s+/g);
if(g.length>3) g=attribute.split(/\s+=\s+|\s+=|=\s+|\s+|=/g);
//validation
if(g.length!=3 && g.length!=6) throw "Invalid syntax : "+attribute;
if(g.length==6)
{
if(attribute.substring(g[0].length,attribute.search(g[1])).trim()!='=' || g[2]!='to' || g[4]!='step') throw "Invalid attribute : "+attribute;
if(g[0].match(/[A-Za-z\$_][A-Za-z0-9\$_]*/)[0].length!=g[0].length) throw "Invalid "+g[0]+" : "+attribute;
if(getModelProperty(g[0])!=null) throw "Variable "+g[0]+" already exist";
variable=g[0];
from=parseInt(g[1]);
if(isNaN(from)) throw "Invalid "+g[1]+" : "+attribute;
to=parseInt(g[3]);
if(isNaN(to)) throw "Invalid "+g[3]+" : "+attribute;
step=parseInt(g[5]);
if(isNaN(step)) throw "Invalid "+g[5]+" : "+attribute;
loopType=0;
}
if(g.length==3) loopType=1;
if(loopType==0)
{
for(i=from;(step>0)?i<=to:i>=to;i+=step)
{
cloneNode=node.cloneNode(true);
nodeIterator=document.createTreeWalker(cloneNode,NodeFilter.SHOW_ALL,{acceptNode:function(node){return NodeFilter.FILTER_ACCEPT;}},false);
nodeIterator.nextNode();
do
{
cNode=nodeIterator.currentNode;
if(cNode.nodeType==3 && cNode.data.search("{{{"+variable+"}}}")!=-1)
{
cNode.replaceData(0,cNode.data.length,cNode.data.split("{{{"+variable+"}}}").join(i));
}
}while(nodeIterator.nextNode())
node.parentNode.insertBefore(cloneNode,node);
iterator.previousSibling();
}
iterator.previousSibling();
node.remove();
}
if(loopType==1)
{
if(g[1]!='in') throw "Invalid syntax : "+attribute;
if(g[0].match(/[A-Za-z\$_][A-Za-z0-9\$_]*/)[0].length!=g[0].length) throw "Invalid "+g[0]+" : "+attribute;
if(getModelProperty(g[0])!=null) throw "Attribute tm-for : '"+attribute+"', '"+g[0]+"' already exist.";
variable=g[0];
if(g[2].match(/[A-Za-z\$_][A-Za-z0-9\$_]*/)[0].length!=g[2].length || getModelProperty(g[2])==null ) throw "Invalid '"+g[2]+"' in '"+attribute+"'";
collection=getModelProperty(g[2]);
for(i=0;i<collection.length;i++)
{
cloneNode=node.cloneNode(true);
nodeIterator=document.createTreeWalker(cloneNode,NodeFilter.SHOW_ALL,{acceptNode:function(node){return NodeFilter.FILTER_ACCEPT;}},false);
nodeIterator.nextNode();
do
{
cNode=nodeIterator.currentNode;
if(cNode.nodeType==3)
{
var regex1=new RegExp('{{{'+variable+'\.[A-Za-z0-9\$_\\[\\]\\.]*}}}','g');
variablesList=cNode.data.match(regex1);
if(variablesList!=null) 
{
variablesList=variablesList.filter(function(element,index,array){return (array.indexOf(element)==index);});
for(j=0;j<variablesList.length;j++)
{
g=variablesList[j].substring(variable.length+4,variablesList[j].length-3);
cNode.replaceData(0,cNode.data.length,cNode.data.split(variablesList[j]).join($$$.getProperty(collection[i],g)));
}
}
}
}while(nodeIterator.nextNode())
node.parentNode.insertBefore(cloneNode,node);
iterator.previousSibling();
}
iterator.previousSibling();
node.remove();
}
}
if(node.nodeType!=3 && node.nodeType!=8 && node.hasAttribute("tm-if"))
{
attribute=node.getAttribute("tm-if");
g=attribute.split(/\s+|=='?"?|'|"/g).filter(function(element,index,array){return element.length!=0;});
if(g.length!=2) throw "Invalid syntax : "+attribute;
if(g[0].match(/[A-Za-z\$_][A-Za-z0-9\$_]*/)[0].length!=g[0].length) throw "Invalid "+g[0]+" : "+attribute;
if(getModelProperty(g[0])!=g[1])
{
iterator.nextSibling();
node.remove();
}
}
if(node.nodeType==3)
{
if(node.data.match(/{{{[A-Za-z\$_][A-Za-z0-9\$_\[\]\.]*}}}/g)!=null) 
{
functionVariable=node.data.match(/{{{\$\$[A-Za-z0-9\$_]*}}}/g);
if(functionVariable!=null)
{
functionVariable=functionVariable[0];
if(typeof getModelProperty(functionVariable.substring(5,functionVariable.length-3))=="function")
{
j=callModelFunction(getModelProperty(functionVariable.substring(5,functionVariable.length-3)));
node.replaceData(0,node.data.length,node.data.split(functionVariable).join(j));
}
}
if(node.data.match(/{{{[A-Za-z\$_][A-Za-z0-9\$_\[\]\.]*}}}/g)!=null) list.push({"node":node,"text":node.data});
}
}
if(node.nodeType!=3 && node.nodeType!=8 && node.hasAttribute("tm-bind"))
{
attribute=node.getAttribute("tm-bind").trim();
if(getModelProperty(attribute)!=null) list.push({"node":node,"property":attribute});
}
}while(iterator.nextNode())
//console.log(list);
for(i=0;i<list.length;i++)
{
if(list[i].node.nodeName=="INPUT") twoWayObserver(list[i]);
else if(list[i].node.nodeType==3) textNodeObserver(list[i]);
else if(list[i].node.nodeName=="TABLE")  oneWayObserver(list[i]);
}
};