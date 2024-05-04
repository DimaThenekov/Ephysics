var right_menu_h = {
	id: -2,
	update_entity: ()=>{
		var nid = canvas_events.selected_entity;
		if (nid==right_menu_h.id) return right_menu_h.change_info();
		right_menu_h.id = nid;
		if (nid<0)
			right_menu_h.open_setup();
		else
			right_menu_h.open_entity();
	},
	change_info: (no_need_change)=>{ // update and disable
		var v_by_id = (id)=>document.getElementById(id).value;
		var set_v_by_id = (id,v)=>{document.getElementById(id).value=v};
		var set_if_by_id = (id,obj,key, changeble)=>{
			var dis = false;
			if (no_need_change===true) {
				if (changeble) {
					dis = true;
					set_v_by_id(id, obj[key]);
				}
			} else {
				if (!right_menu_h.is_valid_float(v_by_id(id)))
					set_v_by_id(id, obj[key]);
				else
					obj[key] = parseFloat(v_by_id(id));
			}
			if (document.getElementById(id).disabled != dis) document.getElementById(id).disabled = dis;
		};
		if (right_menu_h.id<0) {
			/*if (!right_menu_h.is_valid_float(v_by_id('right_menu_data_eps')))
				set_v_by_id('right_menu_data_eps', engine_info.constants.eps);
			else
				engine_info.constants.eps = parseFloat(v_by_id('right_menu_data_eps'));*/
			set_if_by_id('right_menu_data_eps', engine_info.constants, 'eps');
			engine_info.constants.e = parseFloat(v_by_id('right_menu_data_e'));
			engine_info.constants.m = parseFloat(v_by_id('right_menu_data_m'));
			engine_info.constants.scale = parseFloat(v_by_id('right_menu_data_scale'));
		} else {
			var obj = engine_info.get_entities()[right_menu_h.id];
			if (obj.type=='q') {
				set_if_by_id('right_menu_data_q', obj, 'q');
				set_if_by_id('right_menu_data_x', obj, 'x', true);
				set_if_by_id('right_menu_data_y', obj, 'y', true);
				obj.is_const = v_by_id('right_menu_data_is_const')=='true';
				set_if_by_id('right_menu_data_vx', obj, 'vx', true);
				set_if_by_id('right_menu_data_vy', obj, 'vy', true);
				set_if_by_id('right_menu_data_m', obj, 'm');
			} else {
				set_if_by_id('right_menu_data_0', obj.data, 0);
				set_if_by_id('right_menu_data_1', obj.data, 1);
				set_if_by_id('right_menu_data_2', obj.data, 2);
				if (obj.shape != 'circle') set_if_by_id('right_menu_data_3', obj.data, 3);
			}
		}
		if (no_need_change!==true){
			engine_info.change();
			canvas_events.need_repaint();
		}
	},
	is_valid_float: (x) => {
		if (!/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/.test(x))
			return false;

		x = parseFloat(x);
		if (isNaN(x))
			return false;
		return true;
	},
	/*
	engine_info.constants = {
		e: 1e-9,//1.602177e-19, // Элементарный заряд в кулонах
		eps: 8.9875517873681764e9, // Электрическая постоянная в Н·м²/К²
		m: (9.1093837e-32)*1.602177e27, // Масса покоя электрона в килограммах
		scale: 1, // размер одного пикселя canvas
	};
	*/
	open_setup: ()=>{
		var html = '<div class="right_menu_id">Глобальные настройки</div>';
		html+='<div class="right_menu_data">';
		html+='Единица заряда: '+right_menu_h.create_select('right_menu_data_e', engine_info.constants.e, [1e9,1e6,1e3,1,1e-3,1e-6,1e-9], ['гигакулон [ГКл]', 'мегакулон [МКл]', 'килокулон [кКл]', 'кулон [Кл]', 'милликулон [мКл]', 'микрокулон [мкКл]', 'нанокулон [нКл]'])+'<br/>';
		html+='Электрическая постоянная в Н·м²/К²: <input type="text" id="right_menu_data_eps" onchange="setTimeout(right_menu_h.change_info)"><br/>';
		html+='Единица массы: '+right_menu_h.create_select('right_menu_data_m', engine_info.constants.m, [1e6,1e3,1,1e-3,1e-6,1e-9], ['килотонна [Гг]', 'тонна [Мг]', 'килограмм [кг]', 'грамм [г]', 'миллиграмм [мг]', 'микрограмм [мкг]'])+'<br/>';
		html+='Единица расстояния: '+right_menu_h.create_select('right_menu_data_scale', engine_info.constants.scale, [1e9,1e6,1e3,1,1e-3,1e-6,1e-9], ['гигаметр [Гм]', 'мегаметр [Мм]', 'километр [км]', 'метр [м]', 'миллиметр [мм]', 'микрометр [мкм]', 'нанометр [нм]'])+'<br/>';
		html+='</div>';
		right_menu.innerHTML = html;
		setTimeout(right_menu_h.change_info);
	},
	create_select: (id, value, options, texts)=>{
		var html = '<select id="'+id+'" onchange="setTimeout(right_menu_h.change_info)">';
		if (value===true || value===false) {
			html += options.map((x,i)=>'<option value="'+x+'"'+(x===value?' selected':'')+'>'+texts[i]+'</option>').join('');
		} else {
			var best_i = 0;
			options.map((x,i)=>{if (Math.abs(x-value)<Math.abs(options[best_i]-value)) best_i=i});
			html += options.map((x,i)=>'<option value="'+x+'"'+(i===best_i?' selected':'')+'>'+texts[i]+'</option>').join('');
		}
		html += '</select>';
		return html;
	},
	/*	var entities = [
			{
				type: 'q', // Заряд
				is_const: true, // позиция не изменяема
				q: 10000, // заряд в нКл
				x: 5, y: 0, // в метрах
				vx: 0, vy: 0, // Скорость объекта (м/c), у is_const==true всегда 0
				m: 1, // масса в элементарных еденицах, у is_const==true не имет значения
				in_conductor: false // внутри ли проводника, если да, то он не может от туда выйти
			},
			{
				type: 'p', // Электрический проводник
				shape: 'ring', // 'rectangle' || 'circle' || 'ring'
				data: [0, 0, 10, 20] // x, y, ширина, высота, угол (rectangle)
				// data: [0, 0, 10] // x, y, r (circle)
				// data: [0, 0, 10, 10] // x, y, r1, r2 (ring)
			}
		];
	*/
	open_entity: ()=>{
		var html = '';
		var obj = engine_info.get_entities()[right_menu_h.id];
		html+='<div class="right_menu_id">Идентификатор: <var>'+right_menu_h.id+'</var></div>';
		if (obj.type=='q') {
			html+='<div class="right_menu_const_data">Тип: <var>Заряд</var></div>';
			html+='<div class="right_menu_data">';
			html+='Заряд: <input type="text" id="right_menu_data_q" onchange="setTimeout(right_menu_h.change_info)"><br/>';
			html+='Позиция по X: <input type="text" id="right_menu_data_x" onchange="setTimeout(right_menu_h.change_info)"><br/>';
			html+='Позиция по Y: <input type="text" id="right_menu_data_y" onchange="setTimeout(right_menu_h.change_info)"><br/>';
			html+='Позиция: '+right_menu_h.create_select('right_menu_data_is_const', obj.is_const, [true, false], ['неизменяема', 'изменяема'])+'<br/>';
			html+='Скорость по X: <input type="text" id="right_menu_data_vx" onchange="setTimeout(right_menu_h.change_info)"><br/>';
			html+='Скорость по Y: <input type="text" id="right_menu_data_vy" onchange="setTimeout(right_menu_h.change_info)"><br/>';
			html+='Масса: <input type="text" id="right_menu_data_m" onchange="setTimeout(right_menu_h.change_info)">';
			html+='</div>';
			html+='<div class="right_menu_buttons">';
			html+='<input type="button" id="right_menu_data_remove" value="Удалить" onclick="right_menu_h.remove_entities()">';
			html+='</div>';
		} else {
			html+='<div class="right_menu_const_data">Тип: <var>Проводник</var><br/>';
			html+='Фигура: <var>'+{ring:'Кольцо', circle:'Круг', rectangle:'Прямоугольник'}[obj.shape]+'</var></div>';
			var data_text = {
				ring: ['Местоположение по X', 'Местоположение по Y', 'Внутренний радиус', 'Внешний радиус'],
				circle: ['Центр круга по X', 'Центр круга по Y', 'Радиус'],
				rectangle: ['Местоположение по X', 'Местоположение по Y', 'Ширина', 'Высота']
			};
			html+='<div class="right_menu_data">';
			html+=data_text[obj.shape].map((x,i)=>x+': <input type="text" id="right_menu_data_'+i+'" onchange="setTimeout(right_menu_h.change_info)">').join('<br/>');
			html+='</div>';
			html+='<div class="right_menu_buttons">';
			html+='<input type="button" id="right_menu_data_remove" value="Удалить" onclick="right_menu_h.remove_entities()">';
			html+='</div>';
		}
		right_menu.innerHTML = html;
		setTimeout(right_menu_h.change_info);
	},
	remove_entities: ()=>{
		engine_info.set_entities(engine_info.get_entities().filter((x,i)=>i!=right_menu_h.id));
		canvas_events.selected_entity=-1;
		canvas_events.need_repaint();
		right_menu_h.update_entity();
	}
}

_onload.push(right_menu_h.update_entity);
