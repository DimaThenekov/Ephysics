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
	change_info: ()=>{ // update and disable
		
		
	},
	open_setup: ()=>{
		var html = 'Глобальные настройки';
		
		right_menu.innerHTML = html;
		setTimeout(right_menu_h.change_info);
	},
	open_entity: ()=>{
		var html = '';
		html+='id: '+right_menu_h.id+'<br/>';
		right_menu.innerHTML = html;
		setTimeout(right_menu_h.change_info);
	},
}

_onload.push(right_menu_h.update_entity);