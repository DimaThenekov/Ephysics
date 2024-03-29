var engine_info = (()=>{
	
	var constants = {
		e: 1e-9,//1.602177e-19, /* Элементарный заряд в кулонах*/
		eps: 8.9875517873681764e9, /* Электрическая постоянная в Н·м²/К² */
		t: 1, /* Время симуляции для одной миллисекунды реального времени */
		m: (9.1093837e-32)*1.602177e27, /* Масса покоя электрона в килограммах */
		scale: 1, /* размер одного пикселя canvas */
	};
	
	var in_shape = {
		rectangle: (data, x,y) => {},
		circle: (data, x,y) => {},
		ring: (data, x,y) => {},
	}
	
	var entities = [
		{
			type: 'q', // Заряд
			is_const: false, // позиция не изменяема
			q: -8, // заряд в нКл
			x: 0.2, y: 0, // в метрах
			vx: 0, vy: 0.1, // Скорость объекта (м/c), у is_const==true всегда 0
			m: 1, // масса в элементарных еденицах, у is_const==true не имет значения
			in_conductor: false // внутри ли проводника, если да, то он не может от туда выйти
		},
		{
			type: 'p', // Электрический проводник
			shape: 'rectangle', // 'rectangle' || 'circle' || 'ring'
			data: [0, 0, 10, 10, 0] // x, y, ширина, высота, угол (rectangle)
			// data: [0, 0, 10] // x, y, r (circle)
			// data: [0, 0, 10, 10, 0] // x, y, r1, r2 (ring)
		}
	];
	
	[... new Array(400)].map((x,i)=>entities.push({
			type: 'q', // Заряд
			is_const: false, // позиция не изменяема
			q: -10, // заряд в нКл
			x: i*0.5, y: 0, // в метрах
			vx: 0, vy: 0, // Скорость объекта (м/c), у is_const==true всегда 0
			m: 1, // масса в элементарных еденицах, у is_const==true не имет значения
			in_conductor: false // внутри ли проводника, если да, то он не может от туда выйти
		}));
	[... new Array(400)].map((x,i)=>entities.push({
			type: 'q', // Заряд
			is_const: false, // позиция не изменяема
			q: 10, // заряд в нКл
			x: i*0.5+0.1, y: 0.5, // в метрах
			vx: 0, vy: 0, // Скорость объекта (м/c), у is_const==true всегда 0
			m: 1, // масса в элементарных еденицах, у is_const==true не имет значения
			in_conductor: false // внутри ли проводника, если да, то он не может от туда выйти
		}));
	
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
		for (var xi = 0; xi<=feelds_in_line; xi++)
			for (var yi = 0; yi<=feelds_in_line; yi++)
				canvas_electric_field.push({x:Math.max(canvas.height,canvas.width)/feelds_in_line*xi,y:Math.max(canvas.height,canvas.width)/feelds_in_line*yi, feeld:get_electric_field(pos_x/state.size+xi*step,pos_y/state.size+yi*step)});
	}
	
	function get_electric_field(x, y) { // поток вектора напряженности электрического поля
		let total_e_x = 0;
		let total_e_y = 0;

		// Рассчитываем общую силу, действующую на объект
		entities.forEach((e,j) => {
			if (e.type == 'q') {
				const dx = (e.x - x)*constants.scale;
				const dy = (e.y - y)*constants.scale;
				var distance_squared = dx * dx + dy * dy;
				if (!distance_squared) return;
				const e_local = constants.eps * e.q * constants.e / distance_squared;
				
				// Рассчитываем компоненты силы по осям
				const force_x = e_local * dx / Math.sqrt(distance_squared);
				const force_y = e_local * dy / Math.sqrt(distance_squared);

				total_e_x += force_x;
				total_e_y += force_y;
			}
		});
		return [total_e_x, total_e_y];
	}
	
	function engine_iteration(t) {
		// Здесь будет основной код итерации движка, использующий параметр времени t
		// Логика обновления положения объектов, расчета сил, энергии и прочего
		
		
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
						if (total_force_y != total_force_y) debugger;
					}
				});
				// Рассчитываем ускорение на основе общей силы
				const acceleration_x = total_force_x / (entity.m * constants.m);
				const acceleration_y = total_force_y / (entity.m * constants.m);
				
				entity.vx += acceleration_x * t * constants.t;
				entity.vy += acceleration_y * t * constants.t;
			
				
			}
		});
		entities.forEach((entity,i) => {
			if (entity.type == 'q' && !entity.is_const) {
				entity.x += (entity.vx * t * constants.t)/constants.scale; // TODO check in_shape
				entity.y += (entity.vy * t * constants.t)/constants.scale; // TODO check in_shape
			}
		});
		
		change();
		canvas_events.need_repaint();
	}
	
	return {
		constants: constants,
		run: engine_iteration,
		entities: entities,
		electric_field: get_electric_field,
		change: change,
		get_electric_field: ()=>canvas_electric_field,
		get_feelds_in_line: ()=>feelds_in_line
	};
})();
