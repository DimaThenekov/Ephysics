var canvas_events={
	selected_entity: -1,
	on_draw_background: [
		(_,canvas)=>{
			var feelds_in_line = engine_info.get_feelds_in_line();
			var electric_field = engine_info.get_electric_field();
			if (electric_field.length) {
				const imageData = _.createImageData(feelds_in_line+1, feelds_in_line+1);
				const data = imageData.data;
				for (let i = 0; i < data.length; i += 4) {
					var clr1 = Math.round(Math.max(Math.min(electric_field[i>>2].feeld.p*0.4+85,255),0));
					var clr2 = Math.round(Math.max(Math.min(85-Math.abs(electric_field[i>>2].feeld.p*0.4),255),0));
					var clr3 = Math.round(Math.max(Math.min(-electric_field[i>>2].feeld.p*0.4+85,255),0));
					data[i] = clr1; // red
					data[i + 1] = clr2; // green
					data[i + 2] = clr3; // blue
					data[i + 3] = 255; // alpha
				}
				_.putImageData(imageData, 0, 0);
				_.drawImage(canvas, 0, 0, feelds_in_line+1, feelds_in_line+1, 0, 0, Math.max(canvas.width,canvas.height), Math.max(canvas.width,canvas.height));
				
				//_.fillStyle = "#"+Math.floor(Math.random()*0xeff+0x100).toString(16);
				//_.fillRect(0, 0, 5, 5);
				
				_.lineWidth = 1;
				var length_line = Math.max(canvas.width,canvas.height)/feelds_in_line*0.4;
				electric_field.map(e=>{
					var feeld = Math.sqrt(e.feeld.ex**2+e.feeld.ey**2);
					var x=Math.min(feeld,10)/10;
					//var clr='ff';
					var clr=(127*(x)-128*(1-x)+0x180).toString(16).replace(/\..*/,'').replace(/./,'');
					//var clr2 = (Math.floor(Math.max(Math.min(e.feeld.p+127,255),0))+0x100).toString(16).slice(1);
					//var clr3 = (Math.floor(Math.max(Math.min(-e.feeld.p+127,255),0))+0x100).toString(16).slice(1);
					_.strokeStyle = '#ffffff'+clr;
					//_.fillRect(e.x-2, e.y-2, 4, 4);
					
					//_.fillRect(e.x-2-e.feeld[0], e.y-2-e.feeld[1], 4, 4);
					
					_.beginPath();
					_.moveTo(e.x, e.y);
					var xl = (e.feeld.ex/feeld)*x*length_line;
					var yl = (e.feeld.ey/feeld)*x*length_line;
					_.lineTo(e.x-xl, e.y-yl);
					_.lineTo(e.x-xl*0.9+yl*0.1, e.y-xl*0.1-yl*0.9); // WTF
					_.moveTo(e.x-xl, e.y-yl);
					_.lineTo(e.x-xl*0.9-yl*0.1, e.y+xl*0.1-yl*0.9); 
					_.stroke();
				})
			}
		}
	],
	on_draw: [
		(_,canvas,state)=>{
			var px=1/state.size;
			//_.fillStyle = "#111";
			//for (var j=0;j<100;j++)
			//	for (var i=0;i<100;i++)
			//		_.fillRect(i*20, j*20, 10, 10);
			
			var many = engine_info.get_entities().length>1200;
			
			engine_info.get_entities().map((x,i)=>[x,i]).filter(x=>x[0].type=='p').map(d=>{
				var e=d[0]; var ind=d[1];
				if (e.shape=="rectangle") {
					_.lineWidth = 2*px;
					if (ind==canvas_events.selected_entity){
						_.strokeStyle = "#fff";
						_.fillStyle = "#6669"
					}else{
						_.strokeStyle = "#000";
						_.fillStyle = "#5559";
					}
					_.fillRect(e.data[0], e.data[1], e.data[2], e.data[3]);
					_.strokeRect(e.data[0], e.data[1], e.data[2], e.data[3]);
				}else if (e.shape=="ring") {
					_.lineWidth = e.data[3]-e.data[2];
					if (ind==canvas_events.selected_entity)
						_.strokeStyle = "#6669";
					else
						_.strokeStyle = "#5559";
					_.beginPath();
					_.arc(e.data[0], e.data[1], (e.data[2]+e.data[3])/2, 0, 2 * Math.PI);
					_.stroke();
					
					if (ind==canvas_events.selected_entity)
						_.strokeStyle = "#fff";
					else
						_.strokeStyle = "#000";
					_.lineWidth = 2*px;
					
					_.beginPath();
					_.arc(e.data[0], e.data[1], e.data[2], 0, 2 * Math.PI);
					_.stroke();
					
					_.beginPath();
					_.arc(e.data[0], e.data[1], e.data[3], 0, 2 * Math.PI);
					_.stroke();
				}else if (e.shape=="circle") {
					_.lineWidth = 2*px;
					if (ind==canvas_events.selected_entity){
						_.strokeStyle = "#fff";
						_.fillStyle = "#6669"
					}else{
						_.strokeStyle = "#000";
						_.fillStyle = "#5559";
					}
					_.beginPath();
					_.arc(e.data[0], e.data[1], e.data[2], 0, 2 * Math.PI);
					_.fill();
					_.stroke();
				}
			});
			
			_.lineWidth = 2*px;
			_.strokeStyle = "#000";
			
			engine_info.get_entities().map((x,i)=>[x,i]).filter(x=>x[0].type=='q').map(d=>{
				var e=d[0]; var ind=d[1];
				if (canvas_events.selected_entity==ind)
					_.strokeStyle = "#fff";
				else
					_.strokeStyle = "#000";
				if (e.q>=0)_.fillStyle = "#f00";
				else _.fillStyle = "#00f";
				
				if (many) {
					_.fillRect(e.x-12*px, e.y-12*px, 24*px, 24*px);
				} else {
					_.beginPath();
					_.arc(e.x, e.y, 12*px, 0, 2 * Math.PI);
					_.fill();
					_.stroke();
				}
				
				_.fillStyle = "#fff";
				if (e.q>=0)_.fillRect(e.x-1*px, e.y-6*px, 2*px, 12*px);
				_.fillRect(e.x-6*px, e.y-1*px, 12*px, 2*px);
			});
		}
		
	],
	on_move: [],
	on_click: [],
	
	autopaint: false,
	need_repaint: ()=>{
		if (!canvas_events.autopaint)
			requestAnimationFrame(canvas_events.repaint); 
		canvas_events.autopaint = true;
	},
	get_canvas: ()=>{return [0, 0]},
	
	repaint: ()=>{},
	get_canvas_state: ()=>({x:0,y:0,size:1}),
	set_canvas_state: ()=>{}
};


// RAWRITE CamelCase to Snake case
_onload.push(() => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
	canvas_events.get_canvas = ()=> {return [canvas, ctx];};
    // See individual pixels when zooming
    ctx.imageSmoothingEnabled = false;


    // Simply used to display the mouse position and transformed mouse position
    const mousePos = document.getElementById('mouse-pos');
    const transformedMousePos = document.getElementById('transformed-mouse-pos');


    let isDragging = false;
    let dragStartPosition = { x: 0, y: 0 };
    let currentTransformedCursor;

   canvas_events.repaint = ()=>{
		canvas_events.autopaint = false;
		var state = canvas_events.get_canvas_state();
        ctx.save();
        ctx.setTransform(1,0,0,1,0,0);
        ctx.clearRect(0,0,canvas.width,canvas.height);
		canvas_events.on_draw_background.map(x=>x(ctx,canvas,state));
        ctx.restore();
		canvas_events.on_draw.map(x=>x(ctx,canvas,state));
    }

    function getTransformedPoint(x, y) {
      const originalPoint = new DOMPoint(x, y);
      return ctx.getTransform().invertSelf().transformPoint(originalPoint);
    }
	canvas_events.get_canvas_state = ()=>{
		const p = ctx.getTransform();
		return {x:p.e, y:p.f, size: p.a};
	}
	canvas_events.set_canvas_state = (obj)=>{
        ctx.setTransform(obj.size,0,0,obj.size,obj.x,obj.y);
		canvas_events.need_repaint();
	}
	var start_pos = {x:0,y:0,click:true}
    function onMouseDown(event) {
        isDragging = true;
		start_pos.x = event.offsetX;
		start_pos.y = event.offsetY;
		start_pos.click = true;
        dragStartPosition = getTransformedPoint(event.offsetX, event.offsetY);
    }

    function onMouseMove(event) {
        currentTransformedCursor = getTransformedPoint(event.offsetX, event.offsetY);
        mousePos.innerText = `Original X: ${event.offsetX}, Y: ${event.offsetY}`;
        transformedMousePos.innerText = `Transformed X: ${currentTransformedCursor.x}, Y: ${currentTransformedCursor.y}`;
        
        if (isDragging) {
            ctx.translate(currentTransformedCursor.x - dragStartPosition.x, currentTransformedCursor.y - dragStartPosition.y);
			if ((event.offsetX-start_pos.x)**2+(event.offsetY-start_pos.y)**2>25)start_pos.click = false;
            
			if (!runner.running) engine_info.change();
			canvas_events.need_repaint();
        }
    }

    function onMouseUp() {
		if (isDragging&&start_pos.click) {
			var tmp = getTransformedPoint(start_pos.x,start_pos.y);
			canvas_events.on_click.map(x=>x(start_pos.x,start_pos.y,tmp.x,tmp.y));
		}
        isDragging = false;
		if (!runner.running) engine_info.change();
		canvas_events.need_repaint();
    }

    function onWheel(event) {
        let zoom = Math.pow(Math.E,-event.deltaY*Math.log(1.1)/100); //event.deltaY < 0 ? 1.1 : 0.9;
		ctx.translate(currentTransformedCursor.x, currentTransformedCursor.y);
        ctx.scale(zoom, zoom);
        ctx.translate(-currentTransformedCursor.x, -currentTransformedCursor.y);
            
		if (!runner.running) engine_info.change();
        canvas_events.need_repaint();
        //event.preventDefault();
    }

    canvas.addEventListener('mousedown', onMouseDown, {passive: true});
    canvas.addEventListener('mousemove', onMouseMove, {passive: true});
    canvas.addEventListener('mouseup', onMouseUp, {passive: true});
    canvas.addEventListener('mouseleave', onMouseUp, {passive: true});
	
    canvas.addEventListener('touchstart', (e)=>{
			const {x, y, width, height} = e.target.getBoundingClientRect();
			e.offsetX = (e.touches[0].clientX-x)/width*e.target.offsetWidth;
			e.offsetY = (e.touches[0].clientY-y)/height*e.target.offsetHeight;
			onMouseDown(e);
		}, {passive: true});
    canvas.addEventListener('touchmove', (e)=>{
			const {x, y, width, height} = e.target.getBoundingClientRect();
			e.offsetX = (e.touches[0].clientX-x)/width*e.target.offsetWidth;
			e.offsetY = (e.touches[0].clientY-y)/height*e.target.offsetHeight;
			onMouseMove(e);
		}, {passive: true});
    canvas.addEventListener('touchend', (e)=>{
			const {x, y, width, height} = e.target.getBoundingClientRect();
			e.offsetX = (e.changedTouches[0].clientX-x)/width*e.target.offsetWidth;
			e.offsetY = (e.changedTouches[0].clientY-y)/height*e.target.offsetHeight;
			onMouseUp(e);
		}, {passive: true});
    canvas.addEventListener('touchcancel', (e)=>{
			const {x, y, width, height} = e.target.getBoundingClientRect();
			e.offsetX = (e.changedTouches[0].clientX-x)/width*e.target.offsetWidth;
			e.offsetY = (e.changedTouches[0].clientY-y)/height*e.target.offsetHeight;
			onMouseUp(e);
		}, {passive: true});
	
    canvas.addEventListener('wheel', onWheel, {passive: true});
	canvas_events.need_repaint();
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
});
