/*
	Compilation instructions:
		Requires Flex SDK: http://opensource.adobe.com/flex
		
		shell> mxmlc Layer.as -default-size 1200 1000
			=> Layer.swf
			
	Originally compiled with Flex 4, probably only requires version 2 or 3.
*/

package {
    import flash.display.*
	import flash.events.*;
	import flash.external.*;
	import flash.text.*;
	import flash.utils.*;
	
	import flash.geom.Point;
    
	/**
	 * The Layer class renders a transparent heatmap over a WebAnywhere page.
	 * @author	Krilnon
	 */
    public class Layer extends Sprite {
		// by default, the heatmap is only displayed as large as the stage
        private var mapWidth:Number = stage.stageWidth; // (500)
		private var mapHeight:Number = stage.stageHeight; // (500)
		
		// this scales the bitmap calculations down by the given factor, useful to save cycles
		private var mapDownresScale:Number = 5; // (5)
		
		/* 
			somewhat ambiguous value that determines how much influence each heatpoint has over pixels
			extending out within a certain radius
		*/
		private var influence:Number = 1.25; // (1)

		private var down:Boolean = true;
		private var s:Sprite = new Sprite();
		private var drawLayer:Sprite = new Sprite();
		private var points:Array = [];
		private var debug_txt:TextField = new TextField();
		
		private var numPages:int = 1;
		
		/**
		 * Initializes root and ExternalInterface, and sets up most event listeners.
		 */
		public function Layer(){
			addChild(s);
			addChild(drawLayer);
			addChild(debug_txt); // don't draw it unless it's needed
			
			initTxt();

			stage.scaleMode = StageScaleMode.NO_SCALE;
			stage.align = StageAlign.TOP_LEFT;
			stage.addEventListener(Event.RESIZE, ors);
			
			debug_txt.visible = true; // for now, since the debug info is getting in the way

			stage.addEventListener(MouseEvent.CLICK, removeSelf);
			stage.addEventListener(Event.ENTER_FRAME, oef);

			debug_txt.appendText(String(ExternalInterface.available));
			ExternalInterface.addCallback('invoke', _do);
			ExternalInterface.addCallback('invoke_debug', __do);
		}
		
		/**
		 * onResize handler for the stage.
		 */
		public function ors(e:Event):void {
			mapWidth = stage.stageWidth;
			mapHeight = stage.stageHeight;
			trace(mapWidth, mapHeight);
		}
		
		/**
		 * Initializes various properties of the debug TextField.
		 */
		private function initTxt():void {
			debug_txt.x = 0;
			debug_txt.y = 0;
			debug_txt.width = 350;
			debug_txt.height = 200;
			debug_txt.border = false;
		}

		/**
		 * Attempt to remove this SWF from the DOM when it's clicked. 
		 * @TODO: Fixme.
		 */
		public function removeSelf(e:MouseEvent):void {
			debug_txt.appendText('\n' + String(ExternalInterface.call('WA.Extensions.WebTrax.removeFlash')));
		}
		
		/**
		 * Glue that takes a JS array of { x:Num, y:Num, heat:Num } points and draws the heatmap in AS.
		 * Called by _do, from JS.
		 */
		private function heatmap(pts:*, num_pages:int = 1):* {
			debug_txt.appendText('\nheatmap(' + pts + ', ' + num_pages + ')');
			numPages = num_pages;
			points = objToArray(pts);
			debug_txt.appendText('\nHEATMAP ' + points.length + ' points' + pts);
			drawPoints();
			drawHeatmap();
			return '\nheatmapOKAY' + points.join(', ');
		}
		
		
		/**
		 * Scales a coordinate down so that it can be used on the lower resolution grid
		 * that's used for rendering.
		 */
		private function gridPoint(p:*):Point {
			return new Point(int(p.x / mapDownresScale), int(p.y / mapDownresScale));
		}

		/**
		 * Draws a heatmap onto a bitmap on the stage. The bitmap ends up being scaled so 
		 * that the automatic bitmap smoothing can reduce some processing time.
		 *
		 * The points from JavaScript are compared within a limited radius to generate heat values
		 * for each pixel.
		 */
		private function drawHeatmap():void {
			var grid_w:int = mapWidth / mapDownresScale;
			var grid_h:int = mapHeight / mapDownresScale;
			var grid:Array = new Array(grid_w);
			for(i = 0; i < grid_w; i++){
				grid[i] = new Array(grid_h);
			}

			var dPoints:Array = [];
			var bmp:BitmapData = new BitmapData(grid_w, grid_h, true, 0);
			var plen:int = points.length;
			var maxD:Number = (mapWidth / 100) * influence; // max distance that I want to be reflected(to make a circle)
			for(var k:int = 0; k < plen; k++){
				var p:Point = gridPoint(points[k]);
				for(var i:int = -maxD; i <= maxD; i++){
					for(var j:int = -maxD; j <= maxD; j++){
						var d:Number = Point.distance(p, new Point(p.x + i, p.y + j));
						if(d > maxD) d = maxD;
						d = maxD - d; // inverse distance
						if(d == 0) continue; // these pixels aren't colored

						trace(d);
						if(points[k].heat){
							trace('---', d, points[k].heat);
							if(numPages > 1){
								d *= Math.abs(points[k].heat) / numPages;
							} else {
								d *= Math.abs(points[k].heat);
							}
						} else {
							trace('!!no heat');
						}
						var xx:* = p.x + i;
						var yy:* = p.y + j;
						if(xx < 0 || yy < 0 || xx >= grid_w || yy >= grid_h) continue; // these are out of bounds
						if(!grid[xx][yy]){
							var o:Object = { x: xx, y: yy, d: d / numPages };
							grid[xx][yy] = o;
							dPoints.push(o);
						} else {
							grid[xx][yy].d += d / numPages;
						}
					}
				}
			}

			var dplen:int = dPoints.length;
			for(i = 0; i < dplen; i++){
				o = dPoints[i];
				// (i * 6 ) / 360.0) * (2 * Math.PI)
				
				/*
					TODO: For aggregate heatmap, just add a new property to the points 
					objects passed in from JS, a count of how many visits there were.  
					
					use the visit count for each point to multiply against maxD, because
					o.d could be visitCount * maxD at the max since there are multiple hits
					(potentially) for each point.
				*/
				
				if(o.d < maxD){
					var heat:Number = o.d / maxD;
				} else if(o.d == 0){
					heat = 0;
				} else {
					heat = 1;
				}
				
				//if(heat < 0.2 && heat > 0) heat = 0.2;
				var opacity:Number = uint(255 * heat) << 24;

				trace('heat', heat);
				var angle:Number = ((fitColorRange(o.d, maxD) * 6) / 360.0) * (2 * Math.PI);
				var pixel:uint = hsv2rgb(angle, 1, 1);
				bmp.setPixel32(o.x, o.y, pixel + opacity);

			}

			var b:Bitmap = new Bitmap(bmp, 'auto' ,true); // bmp, snapping, smoothing
			b.width = mapWidth;
			b.height = mapHeight;
			b.alpha = 0.75;
			drawLayer.addChild(b);
		}

		/**
		 * Modifies an HSV 'hue' value to fit within a certain range.  In this case, 
		 * green is taken out of the range, leaving just red-yellow and blue.
		 *
		 * @param	val		The hue value to fit.
		 * @param	max		The maximum value for a hue... used to clamp as well as invert.
		 */
		private function fitColorRange(val:Number, max:Number):Number {
			if(val > max) val = max;
			val = max - val;
			var ret:Number = (val / max) * 22;
			if(ret > 10) ret += 19;
			//trace('fit color range: ', val, max, ret);
			return ret;
		}

		/**
		 * Converts hsv to rgb.  Adapted from Wikipedia =)
		 */
		private function hsv2rgb(h:Number, s:Number, v:Number):uint {
			//trace('hsv:', h);
			var c:Number = v * s;
			var hp:Number = h / (60 * (Math.PI / 180));
			var x:Number = c * (1 - Math.abs((hp % 2) - 1));
			var r1:Number, g1:Number, b1:Number;
			if(isNaN(h)){
				r1 = 0; g1 = 0; b1 = 0;
			} else if(0 <= hp && hp <= 1){
				r1 = c; g1 = x; b1 = 0;
			} else if(1 <= hp && hp <= 2){
				r1 = x; g1 = c; b1 = 0;
			} else if(2 <= hp && hp <= 3){
				r1 = 0; g1 = c; b1 = x;
			} else if(3 <= hp && hp <= 4){
				r1 = 0; g1 = x; b1 = c;
			} else if(4 <= hp && hp <= 5){
				r1 = x; g1 = 0; b1 = c;
			} else if(5 <= hp && hp <= 6){
				r1 = c; g1 = 0; b1 = x;
			}
			var m:Number = v - c;
			return ((r1 + m) * 255 << 16) + ((g1 + m) * 255 << 8) + (b1 + m) * 255;
		}

		/**
		 * Draws small, blue dots on each heatpoint to help visualize the actual data points
		 * used to create the heatmap.
		 */
		private function drawPoints():void {
			var s:Shape = new Shape();
			for(var i:int = 0; i < points.length; i++){
				s.graphics.beginFill(0x4ba3fe);
				s.graphics.drawEllipse(points[i].x - 2, points[i].y - 2, 4, 4);
				s.graphics.endFill();
			}
			addChild(s);
		}

		/**
		 * This function can be called directly by JavaScript.  Currently, it is called 
		 * after the user activates the heatmap shortcut (ctrl 2), via fl.invoke('heatmap', args)
		 */
		public function _do(f:*, ...args:*):* {
			debug_txt.appendText('\ngot args: ' + f + ', ' + args);
			try {
				return {
					heatmap: heatmap,

					debug: function(args:*):void {
						__do.apply(this, args);
					}
				}[f].apply(this, args);
			} catch(err:Error){
				return 'error: ' + err.toString();
			}
		}

		/**
		 * A mysteriously-named debugging method that will print the arguments that 
		 * JavaScript sent to an exposed function (called via this._do('debug'))
		 */
		private function __do(f:*, ...args):* {
			debug_txt.appendText('\n' + f + '(');
			for each(var arg:* in args){
				if(getQualifiedClassName(arg) == 'Object'){
					debug_txt.appendText('{');
					for(var key:* in arg){
						debug_txt.appendText('\n"' + key + '": ' + arg[key] + ', ');
					}
					debug_txt.appendText('}');
				}
				debug_txt.appendText(arg + ', ');
			}
			debug_txt.appendText(')');
		}

		/**
		 * Utility to convert a JS object to an AS3 array.  It just so happens that 
		 * JS arrays are converted into AS3 objects with string keys that can be converted 
		 * to the proper indices.  
		 * 
		 * @param 	o	A serialized JavaScript array.
		 */
		private function objToArray(o:Object):Array {
			var a:Array = [];
			for(var key:* in o){
				a[uint(key)] = o[key];
			}
			return a;
		}

		/**
		 * No longer needed, but this was called on Event.ENTER_FRAME for a progress bar.
		 */
		private function oef(e:Event):void {
			stage.removeEventListener(Event.ENTER_FRAME, oef);
			return;
		}

		/**
		 * No longer used.  It was used to manually add heatpoints for debugging purposes.
		 */
		private function omm(e:MouseEvent):void {
			s.graphics.lineTo(stage.mouseX, stage.mouseY);
			e.updateAfterEvent();
		}
    }
}