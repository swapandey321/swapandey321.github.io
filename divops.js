function init (parentDoc, menuId, sourceDocUrl, formName, left, top) {
	// Minimum resizable area
		var minWidth = 60;
		var minHeight = 40;
		var divDefaultId = 'pane0';
		var div1=menuId + '_div';
		// Thresholds
		var FULLSCREEN_MARGINS = -10;
		var MARGINS = 4;

		// End of what's configurable.
		var clicked = null;
		var onRightEdge, onBottomEdge, onLeftEdge, onTopEdge;

		var rightScreenEdge, bottomScreenEdge;

		var preSnapped;
		var maximized ;
		var b, x, y;

		var redraw = false;
		
		var pane = parentDoc.getElementById(menuId + '_div');
		if (!pane) {
			
			var panedefault = parentDoc.getElementById(divDefaultId);
			pane = panedefault.cloneNode(true);
			
			pane.id = menuId + '_div';
			pane.style.display='block';
			var titleDiv = pane.childNodes[1];
			titleDiv.id=div1 + '_title';
			var loaderDiv = pane.childNodes[3];
			loaderDiv.id = div1 + '_loader';
			titleDiv.childNodes[0].innerText=formName;
			var closeButton = titleDiv.childNodes[4];
			closeButton.id = div1 + '_close';
			var maxButton = titleDiv.childNodes[8];
			maxButton.id = div1 + '_max';
			parentDoc.body.appendChild(pane);
		}
		pane.style.left = left;
		pane.style.top = top;
		pane.style.width="1200px";
		pane.style.hright="800px";
		//pane = parentDoc.getElementById(div1);
		parentDoc.body.insertBefore(pane, null);
		var maxIcon = parentDoc.getElementById(div1 + '_max');
		//parentDoc.getElementById(div1 + '_loader').innerHTML = '<object type="text/html" data="form1.html" ></object>';
		 $('#contentFrame1').contents().find('#' + div1 + '_loader').load(sourceDocUrl, '', function(response, status, xhr) {
             if (status == 'error') {
                 alert( "Sorry but there was an error: " + xhr.status + " " + xhr.statusText);
                 
             }
         });
		
		var ghostpane = parentDoc.getElementById('ghostpane');
		pane.addEventListener('mousedown', onMouseDown);
		pane.addEventListener('click', bringToFront);
		maxIcon.addEventListener('click', maximize);
		closeButton.addEventListener('click', close);
		parentDoc.addEventListener('mousemove', onMove);
		parentDoc.addEventListener('mouseup', onUp);
		
		pane.addEventListener('touchstart', onTouchDown);
		parentDoc.addEventListener('touchmove', onTouchMove);
		parentDoc.addEventListener('touchend', onTouchEnd);
		
		
		
	function setBounds(element, x, y, w, h) {
		element.style.left = x + 'px';
		element.style.top = y + 'px';
		element.style.width = w + 'px';
		element.style.height = h + 'px';
	}

	function hintHide() {
	  setBounds(ghostpane, b.left, b.top, b.width, b.height);
	  ghostpane.style.opacity = 0;

	  // var b = ghostpane.getBoundingClientRect();
	  // ghostpane.style.top = b.top + b.height / 2;
	  // ghostpane.style.left = b.left + b.width / 2;
	  // ghostpane.style.width = 0;
	  // ghostpane.style.height = 0;
	}


	function onTouchDown(e) {
	  onDown(e.touches[0]);
	  e.preventDefault();
	}

	function onTouchMove(e) {
	  onMove(e.touches[0]);		
	}

	function onTouchEnd(e) {
	  if (e.touches.length ==0) onUp(e.changedTouches[0]);
	}

	function onMouseDown(e) {
	  onDown(e);
	  //e.preventDefault();
	}

	function onDown(e) {
		
	  calc(e);
	  //alert("down");
	  var isResizing = onRightEdge || onBottomEdge || onTopEdge || onLeftEdge;

	  clicked = {
		x: x,
		y: y,
		cx: e.clientX,
		cy: e.clientY,
		w: b.width,
		h: b.height,
		isResizing: isResizing,
		isMoving: !isResizing && canMove() && !maximized,
		onTopEdge: onTopEdge,
		onLeftEdge: onLeftEdge,
		onRightEdge: onRightEdge,
		onBottomEdge: onBottomEdge
	  };
	}

	function canMove() {
	  return x > 0 && x < b.width && y > 0 && y < b.height
	  && y < 30;
	}

	function calc(e) {
	  b = pane.getBoundingClientRect();
	  x = e.clientX - b.left;
	  y = e.clientY - b.top;
	  
	  onTopEdge = y < MARGINS;
	  onLeftEdge = x < MARGINS;
	  onRightEdge = x >= b.width - MARGINS;
	  onBottomEdge = y >= b.height - MARGINS;

	  rightScreenEdge = window.innerWidth - MARGINS;
	  bottomScreenEdge = window.innerHeight - MARGINS;
	}

	var e;

	function onMove(ee) {
	  calc(ee);
	  e = ee;

	  redraw = true;
	  animate();
	}

	function animate() {

	  //requestAnimationFrame(animate);

	  if (!redraw) return;

	  redraw = false;

	  if (clicked && clicked.isResizing && !maximized) {

		if (clicked.onRightEdge) pane.style.width = Math.max(x, minWidth) + 'px';
		if (clicked.onBottomEdge) pane.style.height = Math.max(y, minHeight) + 'px';

		if (clicked.onLeftEdge) {
		  var currentWidth = Math.max(clicked.cx - e.clientX  + clicked.w, minWidth);
		  if (currentWidth > minWidth) {
			pane.style.width = currentWidth + 'px';
			pane.style.left = e.clientX + 'px';	
		  }
		}

		if (clicked.onTopEdge) {
		  var currentHeight = Math.max(clicked.cy - e.clientY  + clicked.h, minHeight);
		  if (currentHeight > minHeight) {
			pane.style.height = currentHeight + 'px';
			pane.style.top = e.clientY + 'px';	
		  }
		}

		hintHide();

		return;
	  }

	  if (clicked && clicked.isMoving && !maximized) {

		if (b.top < FULLSCREEN_MARGINS || b.left < FULLSCREEN_MARGINS || b.right > window.innerWidth - FULLSCREEN_MARGINS || b.bottom > window.innerHeight - FULLSCREEN_MARGINS) {
		  // hintFull();
		  setBounds(ghostpane, 0, 0, window.innerWidth, window.innerHeight);
		  ghostpane.style.opacity = 0.2;
		} else {
		  hintHide();
		}

		if (preSnapped && !maximized) {
		  setBounds(pane,
			e.clientX - preSnapped.width / 2,
			e.clientY - Math.min(clicked.y, preSnapped.height),
			preSnapped.width,
			preSnapped.height
		  );
		  return;
		}

		// moving
		pane.style.top = (e.clientY - clicked.y) + 'px';
		pane.style.left = (e.clientX - clicked.x) + 'px';

		return;
	  }

	  // This code executes when mouse moves without clicking
	 
	  // style cursor
	  if (onRightEdge && onBottomEdge || onLeftEdge && onTopEdge) {
		pane.style.cursor = 'nwse-resize';
	  } else if (onRightEdge && onTopEdge || onBottomEdge && onLeftEdge) {
		pane.style.cursor = 'nesw-resize';
	  } else if (onRightEdge || onLeftEdge) {
		pane.style.cursor = 'ew-resize';
	  } else if (onBottomEdge || onTopEdge) {
		pane.style.cursor = 'ns-resize';
	  } else if (canMove()) {
		  //alert("here");
		pane.style.cursor = 'move';
	  } else {
		pane.style.cursor = 'default';
	  }
	}

	animate();

	function onUp(e) {
	  calc(e);
		if (maximized) {
			return;
		}
	  if (clicked && clicked.isMoving) {
		// Snap
		var snapped = {
		  width: b.width,
		  height: b.height
		};

		if (b.top < FULLSCREEN_MARGINS || b.left < FULLSCREEN_MARGINS || b.right > window.innerWidth - FULLSCREEN_MARGINS || b.bottom > window.innerHeight - FULLSCREEN_MARGINS) {
		  // hintFull();
		  maximized = {
			  left: b.left,
			  top: b.top,
			  width: b.width,
			  height: b.height
		  };
		  maxIcon.className='doublebox';
		  setBounds(pane, 0, 0, window.innerWidth, window.innerHeight);
		  preSnapped = snapped;
		  
		} else {
		  preSnapped = null;
		  maximized = null;
		  maxIcon.className='boxsquare';
		}

		hintHide();

	  }

	  clicked = null;

	}
	function close () {
		//alert("here");
		parentDoc.body.removeChild(pane);
		pane=null;
	}
	function maximize(e) {
		calc(e);
		
		if (maximized) {
			//alert(maximized.left +" " + maximized.top + " " + maximized.width + " " + maximized.height);
			setBounds(pane,
			maximized.left ,
			maximized.top ,
			maximized.width,
			maximized.height
		  );
			maximized = null;
			maxIcon.className='boxsquare';
			preSnapped = null;
		}
		else {
			var snapped = {
			  width: b.width,
			  height: b.height
			};
			maximized = {
				left: b.left,
				top: b.top,
				width: b.width,
				height: b.height
			};
			maxIcon.className='doublebox';
			setBounds(pane, 0, 0, window.innerWidth, window.innerWidth / 2);
			preSnapped = snapped;
			
		}
	}
	function bringToFront (e) {
		parentDoc.body.insertBefore(pane, null);
	}
}