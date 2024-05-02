var menu_info = [
	{
		src: "images/cursor.png",
		title: "Курсор",
		html: '',
		save_id: []
	},
	{
		src: "images/move.png",
		title: "Переместить",
		html: '',
		save_id: []
	},
	{
		src: "images/charge.png",
		title: "Заряд +/-",
		html: '|Заряд: <input type="text" id="menu_charge_q" value="1"><i>e</i>|Масса: <input type="text" id="menu_charge_m" value="1">|<input type="checkbox" id="menu_charge_const"> позиция неизменяема|Количество: <input type="text" id="menu_charge_count" value="1">',
		save_id: ["menu_charge_q", "menu_charge_m", "menu_charge_count"],
		canvas_click_check_float_id: ["menu_charge_q", "menu_charge_m", "menu_charge_count"],
		canvas_click: (x,y)=>{
			for(var i=0;i<parseFloat(document.getElementById('menu_charge_count').value);i++)
				engine_info.set_entities(engine_info.get_entities().concat([{
					type: 'q', // Заряд
					is_const: document.getElementById('menu_charge_const').checked, // позиция не изменяема
					q: parseFloat(document.getElementById('menu_charge_q').value), // заряд в нКл
					x: x+Math.random()*0.11, y: y+Math.random()*0.1, // в метрах
					vx: 0, vy: 0, // Скорость объекта (м/c), у is_const==true всегда 0
					m: parseFloat(document.getElementById('menu_charge_m').value), // масса в элементарных еденицах, у is_const==true не имет значения
					in_conductor: false // внутри ли проводника, если да, то он не может от туда выйти
				}]));
		}
	},
	{
		src: "images/electrical_conductor.png",
		title: "Электрический проводник",
		html: '|Ширина: <input type="text" id="menu_conductor_w">|Высота: <input type="text" id="menu_conductor_h">',
		save_id: ["menu_conductor_w", "menu_conductor_h"],
		canvas_click_check_float_id: ["menu_conductor_w", "menu_conductor_h"],
		canvas_click: (x,y)=>{
			engine_info.set_entities(engine_info.get_entities().concat([{
				type: 'p', // Электрический проводник
				shape: 'rectangle',
				data: [x, y, parseFloat(document.getElementById('menu_conductor_w').value), parseFloat(document.getElementById('menu_conductor_h').value)] // x, y, ширина, высота
			}]));
		}
	},
	{
		src: "images/electrical_conductor_circle.png",
		title: "Электрический проводник (круг)",
		html: '|Радиус: <input type="text" id="menu_conductor_circle_r">',
		save_id: ["menu_conductor_circle_r"],
		canvas_click_check_float_id: ["menu_conductor_circle_r"],
		canvas_click: (x,y)=>{
			engine_info.set_entities(engine_info.get_entities().concat([{
				type: 'p', // Электрический проводник
				shape: 'circle',
				data: [x, y, parseFloat(document.getElementById('menu_conductor_circle_r').value)] // x, y, r (circle)
			}]));
		}
	},
	{
		src: "images/electrical_conductor_ring.png",
		title: "Электрический проводник (кольцо)",
		html: '|Внутренний радиус: <input type="text" id="menu_conductor_ring_r1">|Внешний радиус: <input type="text" id="menu_conductor_ring_r2">',
		save_id: ["menu_conductor_ring_r1", "menu_conductor_ring_r2"],
		canvas_click_check_float_id: ["menu_conductor_ring_r1", "menu_conductor_ring_r2"],
		canvas_click: (x,y)=>{
			engine_info.set_entities(engine_info.get_entities().concat([{
				type: 'p', // Электрический проводник
				shape: 'ring',
				data: [x, y, parseFloat(document.getElementById('menu_conductor_ring_r1').value), parseFloat(document.getElementById('menu_conductor_ring_r2').value)] // x, y, r1, r2 (ring)
			}]));
		}
	},
	{
		src: "images/downloads.png",
		title: "Сохранить",
		onclick: "export_templates()",
		save_id: []
	},
	{
		src: "images/upload.png",
		title: "Открыть",
		html: '',
		save_id: []
	}
];

var menu = {selected: -1, info: menu_info, on_change: [], value_of_save_id:{}}

_onload.push(()=>{
	canvas_events.on_click.push((x,y,_x,_y)=>{
		var valid = true;
		if (menu_info[menu.selected].canvas_click_check_float_id)
			menu_info[menu.selected].canvas_click_check_float_id.map(x=>document.getElementById(x)).map(x=>{
				if (!/^[+-]?\d+(\.\d+)?$/.test(x.value)) {
					valid = false;
					x.style.background = '#900';
					setTimeout(()=>x.style.background = '',250);
					setTimeout(()=>x.style.background = '#900',500);
					setTimeout(()=>x.style.background = '',750);
					setTimeout(()=>x.style.background = '#900',190);
					setTimeout(()=>x.style.background = '',1100);
				}
			});
		if (menu_info[menu.selected].canvas_click && valid)
			menu_info[menu.selected].canvas_click(_x,_y);
	});
	left_menu.innerHTML = menu_info.map((x,i)=>
		'<button '+
			'alt="'+x.title+'" '+
			'title="'+x.title+'" '+
			'onclick="'+
					(x.html!==undefined?'select_menu_item('+i+');':'')+
					(x.onclick?x.onclick:'')+
				'" '+
			'style="'+
			'background: url('+x.src+') no-repeat center;'+
			'background-size: 38.8px;'+
			'">'+
		'</button>').join('\n');
});

_onload.push(()=>{
	select_menu_item(0);
});

function select_menu_item(i) {
	if (menu.selected == i) return;
	
	if (menu.selected+1)menu_info[menu.selected].save_id.map(x=>menu.value_of_save_id[x]=document.getElementById(x).value)
	
	menu.selected = i;
	
	top_menu.innerHTML = 'Инструмент: ' +
		'<img src="'+menu_info[i].src+'">'+menu_info[i].html.replace(/\|/g,'<div class="dline"></div>');
	
	setTimeout(()=>{
		menu_info[i].save_id.filter(x=>menu.value_of_save_id[x]!==undefined).map(x=>document.getElementById(x).value=menu.value_of_save_id[x]);
		menu.on_change.map(x=>x());
	});
}


// EXPORT
function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function export_templates() {
	var save_obj = {
		"e": engine_info.get_entities(),
		"canvas": canvas_events.get_canvas_state()
	};
	
	download(JSON.stringify(save_obj), 'Ephysics_'+new Date().toJSON().slice(0,19).replace(/[T:-]/g,'_')+'.ephy', 'text/plain');
}


// IMPORT
function upload(callback) {
	var f = document.createElement('input');
	f.style.display='none';
	f.type='file';
	f.name='file';
	f.accept='.ephy';
	f.addEventListener("cancel", () => {
		callback();
	});
	f.addEventListener("change", () => {
		if (f.files.length == 1) {
			var fileReader = new FileReader();
			fileReader.onload = function(fileLoadedEvent){
				var textFromFileLoaded = fileLoadedEvent.target.result;
				callback(textFromFileLoaded);
			};
			fileReader.readAsText(f.files[0], "UTF-8");
		}
	});
	document.body.appendChild(f);
	f.click();
}
var import_examples = [
	{file_name: "00001.ephy", "text": "example 1"},
	{file_name: "e00002.ephy", "text": "example 2"},
	{file_name: "", "text": "Из файла"}
];
_onload.push(()=>{
	menu.on_change.push(()=>{
		if (menu_info[menu.selected].title != 'Открыть') {
			select_file.style.display = 'none';
			canvas.style.display = '';
			setTimeout(front_resize);
		} else {
			select_file.style.display = '';
			canvas.style.display = 'none';
			var html = '';
			import_examples.map((x,i)=>{
				html+='<input type="button" value="'+x.text+'" onclick="import_templates('+i+')"/>';
			});
			select_file.innerHTML = html;
		}
	});
});

function import_init(s){
	try {
		var load_obj = JSON.parse(s);
		engine_info.set_entities(load_obj['e']);
		canvas_events.set_canvas_state(load_obj['canvas']);
	} catch (e) {
		alert(e);
	}
}

function import_templates(i) {
	if (i==import_examples.length-1){
		upload(s=>{
			if(s) {
				import_init(s);
				select_menu_item(0);
			}
		});
	} else {
		fetch('examples/'+import_examples[i].file_name).then(x=>x.text()).then(s=>{
			import_init(s);
			select_menu_item(0);
		});
	}
}