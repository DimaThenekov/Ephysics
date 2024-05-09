var engine_info = (()=>{
	
	var constants = {
		e: 1e-9,//1.602177e-19, /* Элементарный заряд в кулонах*/
		eps: 8.9875517873681764e9, /* Электрическая постоянная в Н·м²/К² */
		t: 1, /* Время симуляции для одной миллисекунды реального времени */
		m: 1e-3, /* Масса покоя электрона в килограммах */
		scale: 1, /* размер одного пикселя canvas */
	};
	
	var in_shape = {
		rectangle: (data, x, y) => {
			const [x1, y1, width, height] = data;
			if (x >= x1 && x <= x1 + width && y >= y1 && y <= y1 + height) {
				return true;
			} else {
				return false;
			}
		},

		circle: (data, x, y) => {
			const [cx, cy, r] = data;
			const distance = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
			if (distance <= r) {
				return true;
			} else {
				return false;
			}
		},

		ring: (data, x, y) => {
			const [cx, cy, r1, r2] = data;
			const distance = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
			if (distance <= r2 && distance >= r1) {
				return true;
			} else {
				return false;
			}
		}
	};
	
	var entities = [
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
	
	[... new Array(800)].map((x,i)=>{
		var phi = Math.random()*3.1415*2;
		var r = Math.random()*10+10;
		entities.push({
			type: 'q', // Заряд
			is_const: false, // позиция не изменяема
			q: Math.random()>0.5?10:-10, // заряд в нКл
			x: Math.cos(phi)*r, y: Math.sin(phi)*r, // в метрах
			vx: 0, vy: 0, // Скорость объекта (м/c), у is_const==true всегда 0
			m: 0.001, // масса в элементарных еденицах, у is_const==true не имет значения
			in_conductor: false // внутри ли проводника, если да, то он не может от туда выйти
		})
	});
	/*[... new Array(1)].map((x,i)=>entities.push({
			type: 'q', // Заряд
			is_const: true, // позиция не изменяема
			q: 10*1000, // заряд в нКл
			x: 5, y: 0, // в метрах
			vx: 0, vy: 0, // Скорость объекта (м/c), у is_const==true всегда 0
			m: 1, // масса в элементарных еденицах, у is_const==true не имет значения
			in_conductor: false // внутри ли проводника, если да, то он не может от туда выйти
		}));*/
	
	var feelds_in_line = 10;
	var canvas_electric_field = [];
	function change() {
		var [canvas, ctx] = canvas_events.get_canvas();
		var state = canvas_events.get_canvas_state();
		if (!canvas) return;
		if (!ctx) return;
		if (!state) return;
		var pos_x = -state.x;
		var pos_y = -state.y;
		var xx = 1000;
		if (entities.length>50) xx=500;
		if (entities.length>500) xx=300;
		if (entities.length>1000) xx=200;
		if (entities.length>10000) xx=100;
		feelds_in_line = Math.max(Math.floor(Math.sqrt(xx)),4);
		var step = Math.max(canvas.height,canvas.width)/feelds_in_line/state.size;
		
		canvas_electric_field = [];
		for (var yi = 0; yi<=feelds_in_line; yi++)
			for (var xi = 0; xi<=feelds_in_line; xi++)
				canvas_electric_field.push({x:Math.max(canvas.height,canvas.width)/feelds_in_line*xi,y:Math.max(canvas.height,canvas.width)/feelds_in_line*yi, feeld:get_electric_field(pos_x/state.size+xi*step,pos_y/state.size+yi*step)});
		if (runner.running) right_menu_h.change_info(true);
	}
	
	function get_electric_field(x, y) { 
		// 	{
		//		Ex: поток вектора напряженности электрического поля по x
		//		Ey: поток вектора напряженности электрического поля по y
		//		p: потенциал электрического поля
		//	}
		let total_e_x = 0;
		let total_e_y = 0;
		let total_p = 0;

		// Рассчитываем общую силу, действующую на объект
		entities.forEach((e,j) => {
			if (e.type == 'q') {
				const dx = (e.x - x)*constants.scale;
				const dy = (e.y - y)*constants.scale;
				var distance_squared = dx * dx + dy * dy;
				if (distance_squared<0.01) return;
				const e_local = constants.eps * e.q * constants.e / distance_squared;
				const p_local = constants.eps * e.q * constants.e / Math.sqrt(distance_squared);
				
				total_e_x += e_local * dx / Math.sqrt(distance_squared);
				total_e_y += e_local * dy / Math.sqrt(distance_squared);
				total_p += p_local;
			}
		});
		return {ex: total_e_x, ey: total_e_y, p: total_p};
	}
	
	function engine_iteration(t) {
		// Здесь будет основной код итерации движка, использующий параметр времени t
		// Логика обновления положения объектов, расчета сил, энергии и прочего
		list_conductor = entities.filter(x=>x.type == 'p');
		
		entities.forEach((entity,i) => {
			if (entity.type == 'q' && !entity.is_const) {
				let total_force_x = 0;
				let total_force_y = 0;

				// Рассчитываем общую силу, действующую на объект
				entities.forEach((e,j) => {
					if (j != i && e.type == 'q') {
						const dx = (e.x - entity.x)*constants.scale;
						const dy = (e.y - entity.y)*constants.scale;
						var distance_squared = dx * dx + dy * dy;
						if (!distance_squared) return;
						const force_magnitude = constants.eps * entity.q * e.q * (constants.e**2) / distance_squared;
						
						// Рассчитываем компоненты силы по осям
						const force_x = -force_magnitude * dx / Math.sqrt(distance_squared);
						const force_y = -force_magnitude * dy / Math.sqrt(distance_squared);

						total_force_x += force_x;
						total_force_y += force_y;
					}
				});
				// Рассчитываем ускорение на основе общей силы
				const acceleration_x = total_force_x / (entity.m * constants.m);
				const acceleration_y = total_force_y / (entity.m * constants.m);
				
				entity.vx += acceleration_x * t * constants.t;
				entity.vy += acceleration_y * t * constants.t;
				//while(Math.abs(entity.vx)>100) entity.vx /= 2;
				//while(Math.abs(entity.vy)>100) entity.vy /= 2;
			}
		});
		var tmp = [{x:1,y:1}, {x:0.5,y:0.5}, {x:0.25,y:0.25}, {x:0.125,y:0.125}, {x:0.001,y:0.001},
					{x:0,y:1}, {x:1,y:0}, {x:0,y:1}, {x:1,y:0},
					//{x:-0.0001,y:-0.0001}, {x:0.0001,y:-0.0001}, {x:-0.0001,y:0.0001},
					{x:0,y:0}];
		entities.forEach((entity,i) => {
			if (entity.type == 'q' && !entity.is_const) {
				var _in_shape = list_conductor.some(x=>in_shape[x.shape](x.data,entity.x,entity.y));
				var new_in_shape=false;
				var i = 0;
				if (_in_shape) {
					while (true) {
						var nx = entity.x+tmp[i].x*(entity.vx * t * constants.t)/constants.scale;
						var ny = entity.y+tmp[i].y*(entity.vy * t * constants.t)/constants.scale;
						new_in_shape = list_conductor.some(x=>in_shape[x.shape](x.data,nx,ny));
						if (new_in_shape) break;
						if (i+1==tmp.length) break;
						i++;
					}
				}
				var dx = tmp[i].x*(entity.vx * t * constants.t)/constants.scale;
				var dy = tmp[i].y*(entity.vy * t * constants.t)/constants.scale;
				entity.x += dx;
				entity.y += dy;
				entity.vx=tmp[i].x*entity.vx;
				entity.vy=tmp[i].y*entity.vy;
				//if(Math.max(Math.abs(dx), Math.abs(dy))<=0.00001) { entity.vx = Math.max(Math.min(entity.vx,1),-1); entity.vy = Math.max(Math.min(entity.vy,1),-1);}
			}
		});
		
		change();
		canvas_events.need_repaint();
	}
	
	return {
		constants: constants,
		run: engine_iteration,
		get_entities: ()=>entities,
		set_entities: e=>{entities=e},
		electric_field: get_electric_field,
		change: change,
		get_electric_field: ()=>canvas_electric_field,
		get_feelds_in_line: ()=>feelds_in_line,
		in_shape: in_shape
	};
})();
