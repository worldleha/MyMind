
/*
function read_mind(jm, name, onloadmind){
	var ajax = new XMLHttpRequest();
	ajax.open("GET", "database/"+name+".json");
	ajax.onload = function(){

		if (ajax.readyState = 4 && ajax.status == 200){
		
			var mind = JSON.parse(ajax.responseText);
			onloadmind(jm, mind);
		}
		
	}
	ajax.send();
}
*/
function open_file_click(node){
	node.firstChild.click()
}
function open_image_click(node){
	var out_c = get_out_c(node)
	if (!!out_c){
		var selected_node = out_c.jm.get_selected_node()
		if (!!selected_node){
			node.firstChild.click()
		}else{
			alert("请选中结点")
		}
	}else{
		alert("请打开导图文件，并选中结点")
	}
}

function get_out_c(node){
	
	while (node != null && node.jm == null){
		node = node.parentNode
	}
	return node;
}
function from_out_c_search_mind_c(out_c){
	var mind_c;
	for (let i of out_c.childNodes){
		if (i.className == "mind_master"){
			mind_c = i;
		}
	}
	return mind_c;
}

//创建 jm对象 
function init_node(out_c, id){
	var mind_c = from_out_c_search_mind_c(out_c);
	
	if(!!out_c.jm){
		if (confirm("是否保存")){
			send_mind(out_c);
		}
		delete out_c.jm;
		mind_c.innerHTML = "";
	}

	mind_c.id = id;
	var options = {
	    container:id, 
	    editable:true,               
	    theme:'orange',
	};
	out_c.jm = new jsMind(options);
	out_c.m_id = id;
}

function open_file(fi){
	var files = fi.files;
	if (files.length>0){
		var out_c = fi.parentNode.parentNode.parentNode;

		init_node(out_c, files[0].name.slice(0,-5));
		var file = new FileReader();
		file.onload = function(res){
			
			var mind = JSON.parse(res.target.result);
			var out_c = get_out_c(fi);
			out_c.jm.show(mind);
		}
		file.readAsText(files[0])
	}
	
}



function send_mind(out_c, callback = null){
	
	if (!!out_c && !!out_c.jm){
		var jm = out_c.jm;
		var ajax = new XMLHttpRequest();
		ajax.open("POST", "http://127.0.0.1:8840")
		/*
		ajax.onreadystatechange = function(){
			if (ajax.readyState = 4 && ajax.status == 200){
				
				alert(ajax.responseText);
			}
			alert(ajax.responseText);
			
		}
		*/
	   ajax.onreadystatechange = function(){
			if (ajax.readyState == 4 && ajax.status == 200)
				alert(ajax.responseText)
	   }
		ajax.send(out_c.m_id+'~~$~~'+out_c.m_id+".json"+'~~$~~'+JSON.stringify(jm.get_data())+"$$\r\n");
		
		//save_images(out_c);
		
	}else{
		alert("无结点");
	}
}

function stringToArray(str){
	var keys = new Array();
	for(let i of str){
		var key = i.charCodeAt()
		keys.push(key);
	}
	
	return keys
}

function save_image(bytes, out_c, name, callback){

	var ajax = new XMLHttpRequest();
	var filepath = out_c.m_id;
	ajax.open("POST", "http://127.0.0.1:8840")
	var start = stringToArray(filepath+'~~$~~'+name+'~~$~~')
	var end = stringToArray("$$\r\n")
	var ioarray = new Uint8Array(start.concat(Array.from(bytes)).concat(end))
	ajax.onreadystatechange = function(){

		if (ajax.readyState == 4 && ajax.status == 200){
			alert(ajax.responseText)
			callback();
		}
	}
	ajax.send(ioarray);
	
	
}

function get_image_path(fileid, filename){
	return "database/"+fileid+"/"+filename;
}

function get_image(fi){
	var out_c = get_out_c(fi);
	var files = fi.files;
	if (files.length>0 ){
		
		var file = new FileReader();
		file.onload = function(res){
			var callback = function(){
				out_c.jm.get_selected_node().data["background-image"]=get_image_path(out_c.m_id, files[0].name);
			}
			var img = res.target.result;
			var bytes = new Uint8Array(img);
			save_image(bytes, out_c, files[0].name, callback);
		}
		file.readAsArrayBuffer(files[0]);
	}
}


function create_mind(node){
	var out_c = node.parentNode.parentNode;
	var name = prompt("请输入文件名:","newMind");
	init_node(out_c, name);
	var mind = {"meta": {"name": "思维导图","author": "邵泽考","version": "limit"},"format": "node_tree","data": {"id": "root","topic": "Root","expanded": true,"children": [{"id": "Child","topic": "Child","expanded": true,"direction": "right"}]}};
	out_c.jm.show(mind);
	
}

function expand(node){
	get_out_c(node).jm.expand_all()
	
}

function replay(node){
		var _node = document.getElementById(get_out_c(node).m_id).childNodes[0];
		if (_node.style.overflow== "hidden"){
			_node.style ="overflow:auto;";
		}else{
			_node.style = "overflow:hidden;"
		}
}