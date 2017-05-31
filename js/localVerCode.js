/**
 * 本地验证码插件
 */
$.fn.wqzLocalVerCode?console.error("jQuery插件冲突！\n 冲突原因：命名空间重复:$.fn.wqzLocalVerCode"):
(function($){
	$.fn.wqzLocalVerCode = function(options,param){
		// 执行对外开放的方法
		if (typeof options === "string"){
			var state = this.data("_wqzLocalVerCode");
			var method;
			if (state){	// 当前对象已被初始化过
				method = $.fn._wqzLocalVerCode.methods[options];
				if (method){	// 插件中存在此方法
					return method(this,param);
				}else{
					console.error("错误：_wqzGgl插件未提供此方法："+options);	
				}
				return this;
			}else{
				console.error("错误："+this[0].outerHTML+"元素尚未被_wqzLocalVerCode插件渲染过！无法调用方法："+options);
			}
			return this;
		}
		
		// 渲染插件
		return this.each(function(){
			var _options = $.extend(true,{},$.fn.wqzLocalVerCode.defaultSettings,options||{});
			var plugin = new wqzLocalVerCode(_options,$(this));
			plugin.generate();
			$(this).data("_wqzLocalVerCode",plugin);
		});
	}
	
	// 默认配置
	$.fn.wqzLocalVerCode.defaultSettings = {
		coverBg:	"#B0AEAF",
		color:		"#333333",
		font:		"20px Arial",
		rangeCode:	"",
		offsetTop:	13,
		num:		4
	};
	
	// 对外方法
	$.fn.wqzLocalVerCode.methods = {
	};
	
	// 插件对象
	function wqzLocalVerCode(_options,$elem){
		this._options = _options;
		this.$elem = $elem;						// 目标对象
		this.domWidth = $elem.innerWidth();		// 目标元素宽度
		this.domHeight = $elem.innerHeight();	// 目标元素高度
		this.canvas;							// 新增的canvas对象
		this.ctx;								// canvas对应的CanvasRenderingContext2D环境
		this.rangeCode = "abcedefghijkmnpqrstuvwxyz23456789";					// 验证码取值范围
		this.rstCode = "";						// 验证码的值
	};
	
	/* 
	 * 插件对象原型扩展
	 * 	generate		生成插件
	 * 	init			初始化
	 * 	bindEvent		绑定事件
	 */
	wqzLocalVerCode.prototype = {
		generate: function(){
			var $plugin = this;
			$plugin.canvas = document.createElement("canvas");
			$plugin.$elem.append($plugin.canvas);
			
			if($plugin.canvas.getContext("2d")){
				$plugin.ctx = $plugin.canvas.getContext("2d");
				$plugin.init();
				$plugin.bindEvent();
			}else{
				$plugin.canvas.remove();
				console.error("当前浏览器不支持canvas！");
			}
			$plugin.$elem.children().show();
		},
		init: function(){
			var $plugin = this;
			
			// 初始化canvas
			$plugin.initCanvas();
			
			// 整理rangeCode
			$plugin.adjustCode();
			
			// 生成随机字母
			$plugin.getRangeCode();
			
			// 画字母
			$plugin.drawCode();
		},
		bindEvent: function(){
			var $plugin = this;
			$plugin.$elem.on("click",function(event){
				$plugin.readyToReDraw();	// 清除旧字母
				$plugin.getRangeCode();	// 生成随机字母
				$plugin.drawCode();	// 画字母
			});
		},
		initCanvas: function(){
			var $plugin = this;
			
			// 设置canvas大小、位置
			$plugin.canvas.width = $plugin.domWidth;
			$plugin.canvas.height = $plugin.domHeight;
			$plugin.canvas.style.position = "absolute";
			$plugin.canvas.style.left = 0;
			$plugin.canvas.style.top = 0;
			$plugin.canvas.style.cursor = "pointer";
			
			// 填充背景
			$plugin.ctx.fillStyle =  $plugin._options.coverBg;
			$plugin.ctx.fillRect(0,0,$plugin.domWidth,$plugin.domHeight);
			
			// 设置字体
			$plugin.ctx.fillStyle = $plugin._options.color;
			$plugin.ctx.font = $plugin._options.font;
		},
		adjustCode: function(){	// 整合自定义的编码范围
			var $plugin = this;
			if($plugin._options.rangeCode!=undefined && typeof $plugin._options.rangeCode=="string"){
				$plugin.rangeCode += $plugin._options.rangeCode;
				var srcArr = $plugin.rangeCode.split("");
				var rangeCodeArr = new Array();
				var len = srcArr.length;
				for(var i=0; i<len; i++){
					if(rangeCodeArr.indexOf(srcArr[i]) == -1){
						rangeCodeArr.push(srcArr[i]);
					}
				}
				$plugin.rangeCode = rangeCodeArr.join("");
			}
		},
		getRangeCode: function(){
			var $plugin = this;
			$plugin.rstCode = "";
			var rangeCodeArr = $plugin.rangeCode.split("");
			var len = rangeCodeArr.length;
			for(var i=0; i<$plugin._options.num; i++){
				var v = rangeCodeArr[Math.floor(Math.random()*Math.pow(10,len.toString().length)%len)];
				$plugin.rstCode += v;
			}
		},
		drawCode: function(){
			var $plugin = this;
			var rangeCodeArr = $plugin.rstCode.split("");
			var len = rangeCodeArr.length;
			for(var i=0; i<$plugin._options.num; i++){
				var perWidth = ($plugin.domWidth-20)/($plugin._options.num+1);
				var v = rangeCodeArr[i];
				$plugin.ctx.textBaseline = "top";
				$plugin.ctx.fillText(v,(i+1)*perWidth,$plugin.domHeight*0.5-$plugin._options.offsetTop,10);
			}
			$plugin.setValue();
		},
		readyToReDraw: function(){
			var $plugin = this;
			
			// 填充背景
			$plugin.ctx.clearRect(0,0,$plugin.domWidth,$plugin.domHeight);
			$plugin.ctx.fillStyle =  $plugin._options.coverBg;
			$plugin.ctx.fillRect(0,0,$plugin.domWidth,$plugin.domHeight);
			
			// 设置字体
			$plugin.ctx.fillStyle = $plugin._options.color;
		},
		setValue: function(){
			var $plugin = this;
			$plugin.$elem.data("verCode",$plugin.rstCode);
		}
	}
})(jQuery);