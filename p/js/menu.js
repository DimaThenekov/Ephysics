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
		html: '|Заряд: <input type="text" id="menu_charge_q" value="1"><i>e</i>|Масса: <input type="text" id="menu_charge_m">',
		save_id: ["menu_charge_q", "menu_charge_m"]
	},
	{
		src: "images/electrical_conductor.png",
		title: "Электрический проводник",
		html: '|Заряд: <input type="text" id="menu_conductor_q" value="40"><i>e</i>|Ширина: <input type="text" id="menu_conductor_w">|Высота: <input type="text" id="menu_conductor_h">',
		save_id: ["menu_conductor_q", "menu_conductor_w", "menu_conductor_h"]
	},
	{
		src: "images/electrical_conductor_circle.png",
		title: "Электрический проводник (круг)",
		html: '|Заряд: <input type="text" id="menu_conductor_circle_q" value="40"><i>e</i>|Радиус: <input type="text" id="menu_conductor_circle_r">',
		save_id: ["menu_conductor_circle_q", "menu_conductor_circle_r"]
	},
	{
		src: "images/electrical_conductor_ring.png",
		title: "Электрический проводник (кольцо)",
		html: '|Заряд: <input type="text" id="menu_conductor_ring_q" value="40"><i>e</i>|Внутренний радиус: <input type="text" id="menu_conductor_ring_r1">|Внешний радиус: <input type="text" id="menu_conductor_ring_r2">',
		save_id: ["menu_conductor_ring_q", "menu_conductor_ring_r1", "menu_conductor_ring_r2"]
	},
	{
		src: "images/downloads.png",
		title: "Сохранить",
		onclick: "export_templates()", // TODO
		save_id: []
	},
	{
		src: "images/upload.png",
		title: "Открыть",
		onclick: "import_templates()", // TODO
		save_id: []
	}
];

var menu = {selected: -1, info: menu_info, on_change: []}

_onload.push(()=>{
	left_menu.innerHTML = menu_info.map((x,i)=>
		'<button>'+
			'<img src="'+x.src+'" '+
				'alt="'+x.title+'" '+
				'title="'+x.title+'" '+
				(x.onclick?'onclick="'+x.onclick+'">':'onclick="select_menu_item('+i+')">')+
		'</button>').join('\n');
});

_onload.push(()=>{
	select_menu_item(0);
});

function select_menu_item(i) {
	if (menu.selected == i) return;
	menu.selected = i;
	
	top_menu.innerHTML = 'Инструмент: ' +
		'<img src="'+menu_info[i].src+'">'+menu_info[i].html.replace(/\|/g,'<div class="dline"></div>');
	
	menu.on_change.map(x=>x());
}