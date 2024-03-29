// See blogpost here for more details: https://roblouie.com/article/617

var canvas_events={
	on_draw_background: [
		(_,canvas)=>{
			_.fillStyle = "#"+Math.floor(Math.random()*0xeff+0x100).toString(16);
			_.fillRect(0, 0, 5, 5);
			
			_.lineWidth = 1;
			var length_line = Math.max(canvas.width,canvas.height)/engine_info.get_feelds_in_line()*0.4;
			engine_info.get_electric_field().map(e=>{
				var feeld = Math.sqrt(e.feeld[0]**2+e.feeld[1]**2);
				var x=Math.min(feeld,10)/10;
				//var clr='ff';
				var clr=(127*(x)-128*(1-x)+0x180).toString(16).replace(/\..*/,'').replace(/./,'');
				_.strokeStyle = "#ffffff"+clr;
				//_.fillRect(e.x-2, e.y-2, 4, 4);
				
				//_.fillRect(e.x-2-e.feeld[0], e.y-2-e.feeld[1], 4, 4);
				
				_.beginPath();
				_.moveTo(e.x, e.y);
				var xl = (e.feeld[0]/feeld)*x*length_line;
				var yl = (e.feeld[1]/feeld)*x*length_line;
				_.lineTo(e.x-xl, e.y-yl);
				_.lineTo(e.x-xl*0.9+yl*0.1, e.y-xl*0.1-yl*0.9); // WTF
				_.moveTo(e.x-xl, e.y-yl);
				_.lineTo(e.x-xl*0.9-yl*0.1, e.y+xl*0.1-yl*0.9); 
				_.stroke();
			})
		}
	],
	on_draw: [
		(_,canvas,state)=>{
			var px=1/state.size;
			//_.fillStyle = "#111";
			//for (var j=0;j<100;j++)
			//	for (var i=0;i<100;i++)
			//		_.fillRect(i*20, j*20, 10, 10);
			
			_.strokeStyle = "#000";
			_.lineWidth = 2*px;
			var many = engine_info.entities.length>1200;
			engine_info.entities.map(e=>{
				if (e.type=='q'){
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
				}
			})
			
				
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
    function onMouseDown(event) {
        isDragging = true;
        dragStartPosition = getTransformedPoint(event.offsetX, event.offsetY);
    }

    function onMouseMove(event) {
        currentTransformedCursor = getTransformedPoint(event.offsetX, event.offsetY);
        mousePos.innerText = `Original X: ${event.offsetX}, Y: ${event.offsetY}`;
        transformedMousePos.innerText = `Transformed X: ${currentTransformedCursor.x}, Y: ${currentTransformedCursor.y}`;
        
        if (isDragging) {
            ctx.translate(currentTransformedCursor.x - dragStartPosition.x, currentTransformedCursor.y - dragStartPosition.y);
            engine_info.change();
			canvas_events.need_repaint();
        }
    }

    function onMouseUp() {
        isDragging = false;
		engine_info.change();
		canvas_events.need_repaint();
    }

    function onWheel(event) {
        let zoom = Math.pow(Math.E,-event.deltaY*Math.log(1.1)/100); //event.deltaY < 0 ? 1.1 : 0.9;
		ctx.translate(currentTransformedCursor.x, currentTransformedCursor.y);
        ctx.scale(zoom, zoom);
        ctx.translate(-currentTransformedCursor.x, -currentTransformedCursor.y);
            
		engine_info.change();
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
