/**
 * H5播放器
 * @authors xipwang
 * @date    2017-07-2 13:56:01
 * @version $1.0$
 */
(function($, win, doc, undefined) {
	var ControllDom = {
		controlls: $("#pdq-controll-wrap"),
		//播放按钮
		playbtn: $("#pdq-plago"),
		//播放按钮
		progressBar: $("#pdq-progressBar"),
		//进度条
		timer: $("#pdq-play-timer"),
		//时间显示
		volumeBox: $("#pdq-play-volume"),
		//音量滑块
		courseType: $("#pdq-play-course-type"),
		//视频类型
		courseMenu: $("#pdq-play-menulist"),
		//视频菜单
		playTimesbox: $("#pdq-playback-rate"),
		//播放倍数
		fullScreenBtn: $("#pdq-play-fullscreen"),
		//全屏按钮
		loading: $("#pdq-load-wrap"),
		//暂停按钮
		pausedBtn: $("#pdq-right-pause")
	};

	function XPVideoPlay(videoObject, option) {
		this.videoObject = videoObject[0]; //video对象
		this.volume = option.volume || "50%"; //初始化音量大小
		this.type = option.type || "流畅"; //视频清晰度初始化
		this.Rate = option.rate || 1; //倍数播放
		this.positionPlay = option.positionPlay || 0; //视频初始化位置
		this.watermarkName = option.watermarkName || "";
		this.videoUrl = option.videoUrl || null;
		this.watermarkTime = option.watermarkTime || 50; //水印展现时间(秒为单位)
		this.markWaitiTime = option.markWaitiTime || 5000 //水印等待时间（毫秒）
		this.arrVideoLink; //用于存储视频路径
		this.overPlay = false;
		this.init();
	}
	XPVideoPlay.prototype = {
		//初始化入口
		init: function() {
			var _this = this;
			this.getResVideo();
			$(_this).on("application", _this.appVideo);
		},
		//获取视频资源
		getResVideo: function() {
			var _this = this;
			$.post(_this.videoUrl, null,
				function(result) {
					_this.arrVideoLink = result;
					$(_this).trigger("application");
				},
				"JSON");
		},
		//功能入口
		appVideo: function() {
			var _this = this;
			_this.initUploume(_this.volume); //初始化音量大小
			_this.playVideo(); //播放/暂停
			_this.videotype(_this.type, _this.positionPlay, _this.Rate); //切换视频清晰度
			_this.videoPlayGo(); //开始播放
			_this.videoswitch(); //手动切换视频类型
			_this.videoPattern(); //切换视频模式
			_this.fullScreen(); //全屏按钮
			_this.volumeControl(); //音量控制
			_this.updatePlaybar(); //更新视频进度
			_this.playTimes(); //播放倍数
		},
		//暂停/播放
		playVideo: function() {
			var _this = this;
			$(_this.videoObject).on("click",
				function() {
					ControllDom.playbtn.click();
				});
			ControllDom.pausedBtn.click(function() {
				ControllDom.playbtn.click();
			});
			ControllDom.playbtn.on("click",
				function() {
					var $this = $(this);
					if(_this.videoObject.paused) {
						$this.removeClass("stop");
						ControllDom.controlls.addClass("vhidden");
						_this.videoObject.play(); //播放                   
						ControllDom.pausedBtn.hide();
						if(_this.overPlay) {
							//当重新播放时再次启用水印
							_this.overPlay = false;
							_this.watermark(); //启用水印
						}
					} else {
						_this.videoObject.pause(); //暂停
						$this.addClass("stop");
						ControllDom.pausedBtn.show();

					}
				});
		},
		//倍数播放
		playTimes: function() {
			var _this = this;
			var ulBox = ControllDom.playTimesbox.find("ul");
			var timeArr = ulBox.children();
			var valuetime = ControllDom.playTimesbox.find("#pdq-playback-text");
			timeArr.click(function() {
				var $this = $(this);
				var multiple = parseInt($this.text());
				valuetime.text($(this).text());
				$this.parent().hide();
				_this.videoObject.playbackRate = multiple;
			});

			_this.upMenu(valuetime, ulBox);
		},
		//音量控制
		volumeControl: function() {
			var _this = this;
			var isVolume = false;
			var mutebtn = ControllDom.volumeBox.find("#pdq-play-icon");
			var Round = ControllDom.volumeBox.find("#vloume-roud");
			var volumeBg = ControllDom.volumeBox.find("#vloume-roud-bg");
			var volumeSli = ControllDom.volumeBox.find("#vloume-roud-slider");
			//静音切换
			mutebtn.click(function() {
				var $this = $(this);
				if($this.hasClass("mute")) {
					if(_this.volume < 10) {
						_this.initUploume("20%");
					} else {
						_this.initUploume(_this.volume);
					}
				} else {
					_this.initUploume(0);
				}
			});
			volumeSli.mousedown(function(e) {
				var e = e || event;
				upVloume(e);
			});
			//拖到圆球控制音量
			Round.mousedown(function(e) {
				isVolume = true;
			});
			volumeSli.mousemove(function(e) {
				var e = e || event;
				if(isVolume) {
					upVloume(e);
				}
			});
			$(document).mouseup(function() {
				isVolume = false;
			});
			//更新音量大小
			function upVloume(e) {
				var volumeWidth = volumeSli.width();
				var upWidth = e.pageX - $(e.target).offset().left;
				Round.css({
					left: upWidth / volumeWidth * 100 + "%"
				});
				volumeBg.width(upWidth / volumeWidth * 100 + "%");
				//记录当前音量更新位置
				_this.volume = upWidth / volumeWidth * 100;
				try {
					_this.videoObject.volume = upWidth / volumeWidth;
				} catch(err) {
					console.log(err);
				}
				_this.initUploume(_this.volume);
			}
		},
		//初始化音量大小
		initUploume: function(value) {
			var _this = this;
			var mutebtn = ControllDom.volumeBox.find("#pdq-play-icon");
			var Round = ControllDom.volumeBox.find("#vloume-roud");
			var volumeBg = ControllDom.volumeBox.find("#vloume-roud-bg");
			if(value < 4) {
				mutebtn.addClass("mute");
			} else if(parseInt(value) * 100 > 0) {
				mutebtn.removeClass("mute");
			}
			Round.stop().animate({
					left: value
				},
				200);
			volumeBg.stop().animate({
					width: value
				},
				200);
			_this.videoObject.volume = parseInt(value) / 100;
		},
		//更新播放进度
		updatePlaybar: function() {
			var _this = this;
			var sliderBox = ControllDom.progressBar.find("#pdq-progress-hidebox");
			var sliderBar1 = sliderBox.find("#pdq-progress-bgh");
			var sliderBar2 = sliderBox.find("#pdq-progress-bgs");
			var sliderbtn = sliderBox.find("#pdq-slider-button");
			var mousebar = sliderBox.find("#pdq-progress-mouse-bar");
			var showBar = sliderBox.find("#pdq-progress-bgs");
			var timeShow = sliderBox.find("#pdq-progress-timeShow");
			//更新视频进度
			function sliderProgress() {
				var offsetX = 0;
				var isMove = false;
				var moveX = 0;
				//进度条任意点进行更新
				mousebar.mousedown(function(e) {
					updataprogress(e.pageX - $(this).offset().left);
					_this.videoObject.play();
					ControllDom.pausedBtn.hide();
					ControllDom.playbtn.removeClass("stop");
					if(_this.overPlay) {
						_this.overPlay = false;
						_this.watermark();
					}
				});
				//当按下圆球
				sliderbtn.mousedown(function(evente) {
					isMove = true;
					offsetX = event.pageX - $(this).position().left;
				});
				//鼠标经过进度条展现锚点时间
				mousebar.mousemove(function(event) {
					var maxWidth = sliderBox.width();
					var nowX = event.pageX - $(event.target).offset().left;
					var timeShowWith = timeShow.outerWidth();
					//计算当前鼠标经过的时间段 = 总时长*(当前偏移量/进度条最大长度)
					var nowTime = _this.timeFormat(_this.videoObject.duration * (nowX / maxWidth));
					timeShow.css({
						left: nowX / maxWidth * 100 + "%"
					}).text(nowTime).css({
						marginLeft: -timeShowWith / 2
					});
					//锚点时间展现不能超出播放器大小
					if(nowX >= maxWidth - timeShowWith / 2) {
						timeShow.css({
							left: maxWidth - timeShowWith / 2
						});
					} else if(nowX <= timeShowWith / 2) {
						timeShow.css({
							left: timeShowWith / 2
						});
					}
				});

				//开始滑动
				$(doc).mousemove(function(event) {
					var sliderbtnLeft = sliderbtn.position().left;
					//判断是否执行更新进度
					if(isMove) {

						//获取鼠标实际移动的X轴距离
						var moveX = event.pageX - offsetX;
						if(sliderbtnLeft <= sliderbtn.width()) {
							moveX = sliderbtn.width();
							isMove = true;
						} else if(sliderbtnLeft > sliderbtn.parent().width() - sliderbtn.width()) {
							moveX = sliderbtn.parent().width();
							//如果拖到距离大于进度条的最大长度将拖动状态取消
							isMove = false;
							return false;
						}
						//更新视频进度
						updataprogress(moveX);
						return false;
					}

					//当鼠标抬起
				}).mouseup(function() {
					isMove = false;
				});

				function updataprogress(x) {
					var maxduration = _this.videoObject.duration;
					var maxWidth = sliderBox.width();
					var changeoren = x / maxWidth * 100;
					if(changeoren > 100) {
						changeoren = 100;
					} else if(changeoren < 0) {
						changeoren = 0;
					}
					sliderbtn.css({
						left: changeoren + "%"
					});
					sliderBar1.width(changeoren + "%");
					sliderBar2.width(changeoren + "%");
					_this.videoObject.currentTime = maxduration * changeoren / 100;
					return false;
				}
			}
			sliderProgress();
		},
		//初始化视频类型
		videotype: function(type, timer, rate) {
			var _this = this;
			var nowTime = 0; //当前播放位置
			var AllTime = 0; //视频时长
			var timebox = _this.timer;
			var nowSpan = ControllDom.timer.find("#pqd-nowTime");
			var allSpan = ControllDom.timer.find("#pdq-allTime");
			var diaolog = new _this.videoDialog(_this)
			var menuParent = ControllDom.courseMenu;
			var valueType = menuParent.find("#pqd-menu-text");
			_this.arrVideoLink;
			switch(type) {
				case "流畅":
					if(_this.arrVideoLink.source[0].LD) {
						diaolog.SwitchVideoMsg("正在为你切换" + type + "视频...");
						valueType.text(type);
						$(_this.videoObject).attr("src", _this.arrVideoLink.source[0].LD); //流畅                     
						diaolog.remove($(".pdq-switch-box"));
						ControllDom.playbtn.removeClass("stop");
						ControllDom.pausedBtn.hide();
					} else {
						diaolog.Msg("该课程没有" + type + "版本哦亲！");
					}
					break;
				case "标清":
					if(_this.arrVideoLink.source[1].HD) {
						diaolog.SwitchVideoMsg("正在为你切换" + type + "视频....");
						valueType.text(type);
						$(_this.videoObject).attr("src", _this.arrVideoLink.source[1].HD); //标清                  
						diaolog.remove($(".pdq-switch-box"));
						ControllDom.playbtn.removeClass("stop");
						ControllDom.pausedBtn.hide();
					} else {
						diaolog.Msg("该课程没有" + type + "版本哦亲！");
					}
					break;
				case "高清":
					if(_this.arrVideoLink.source[2].SD) {
						diaolog.SwitchVideoMsg("正在为你切换" + type + "视频...");
						valueType.text(type);
						$(_this.videoObject).attr("src", _this.arrVideoLink.source[2].SD); //高清                    
						diaolog.remove($(".pdq-switch-box"));
						ControllDom.playbtn.removeClass("stop");
						ControllDom.pausedBtn.hide();
					} else {
						diaolog.Msg("该课程没有" + type + "版本哦亲！");
					}
					break;
			}
			//当浏览器已加载音频/视频的元数据时
			$(_this.videoObject).on("loadedmetadata",
				function(e) {
					_this.videoObject.currentTime = timer;
					_this.videoObject.playbackRate = rate;
					AllTime = _this.videoObject.duration;
					allSpan.text(_this.timeFormat(_this.videoObject.duration));
				});
			//当目前的播放位置已更改时
			$(_this.videoObject).on("timeupdate",
				function(e) {
					var nowTime = _this.videoObject.currentTime;
					nowSpan.text(_this.timeFormat(_this.videoObject.currentTime));
					ControllDom.progressBar.find("#pdq-progress-bgs").width(nowTime / AllTime * 100 + "%");
					ControllDom.progressBar.find("#pdq-progress-bgh").width(nowTime / AllTime * 100 + "%");
					ControllDom.progressBar.find("#pdq-slider-button").css({
						left: nowTime / AllTime * 100 + "%"
					});
					ControllDom.progressBar.find("#pdq-progress-buff").width(_this.videoObject.buffered.end(0) / AllTime * 100 + "%");
				});
		},
		//视频切换
		videoswitch: function() {
			var _this = this;
			var menuParent = ControllDom.courseMenu;
			var MenuBox = menuParent.find("ul");
			var listMenu = MenuBox.children();
			var valueType = menuParent.find("#pqd-menu-text");
			listMenu.click(function() {
				nowTime = _this.videoObject.currentTime;
				nowRate = _this.videoObject.playbackRate;
				var texType = $(this).text();
				$(this).parent().hide();
				//切换视频&类型&进度&速率
				_this.videotype(texType, nowTime, nowRate);
			});
			_this.upMenu(valueType, MenuBox);
		},
		//模式切换
		videoPattern: function() {
			var _this = this;
			var patternParent = ControllDom.courseType
			var patterBox = patternParent.find('ul');
			var valueTypes = patternParent.find("#pdq-type-text");
			_this.upMenu(valueTypes, patterBox);
		},
		//开始播放
		videoPlayGo: function() {
			var _this = this;
			_this.watermark()
			//当视频播放结束
			$(_this.videoObject).on("ended",
				function() {
					ControllDom.playbtn.addClass("stop");
					_this.overPlay = true;
				});
			//当视频已开始播放时
			$(_this.videoObject).on("playing",
				function() {
					ControllDom.loading.hide();
				});
			//当视频已停止播放但打算继续播放时
			$(_this.videoObject).on("waiting",
				function() {
					ControllDom.loading.show();
				});
			//当文件就绪可以开始播放时运行的脚本（缓冲已足够开始时）
			$(_this.videoObject).on("canplay",
				function() {
					ControllDom.loading.hide();
				});
		},
		//时间格式化
		timeFormat: function(value) {
			var time;
			if(value > -1) {
				var h = Math.floor(value / 3600) > 10 ? Math.floor(value / 3600) : Math.floor(value / 3600) == 0 ? "" : "0" + Math.floor(value / 3600);
				var m = Math.floor(value / 60) % 60 > 10 ? Math.floor(value / 60) % 60 : "0" + Math.floor(value / 60) % 60;
				var s = value % 60 > 10 ? Math.floor(value % 60) : "0" + Math.floor(value % 60);
				time = (h == 0 ? "" : h + ":") + m + ":" + s;
			}
			return time;
		},
		//水印滚动动画
		watermark: function() {
			var _this = this;

			function MarkShow(name, parent) {
				this.name = name;
				var canvas = $("<canvas width='200' height='25'></canvas>");
				var context = canvas[0].getContext("2d");
				//创建水印文字
				this.createdom = function() {
					canvas.css({
						zIndex: 21474836478,
						left: "50%",
						position: "absolute",
					});
					context.fillStyle = "#fff";
					context.font = "14px microsoft yahei"
					context.fillText("ID" + this.name, 10, 20);
					parent.append(canvas);
				}
				//移动方法   
				this.moveMark = function(obj, callback) {
					var intX = -10;
					var intY = -10;
					var listTime = 0;
					var timeshow = null
					var timeTop = null;
					var timeLeft = null;
					var timeing = 0;
					var maxX = $(_this.videoObject).width();
					var maxY = $(_this.videoObject).height();
					timeTop = setInterval(top, 200);

					function left() {
						intX += 10;
						intY = 0;
						$(obj).css({
							left: intX,
							top: "50%"
						});
						if(parseInt($(obj).css("left")) > maxX) {
							clearInterval(timeLeft);
							timeTop = setInterval(top, 200);
						}
					}

					function top() {
						intY += 10;
						intX = 0;
						$(obj).css({
							top: intY,
							left: "50%"
						});
						if(parseInt($(obj).css("top")) >= maxY - 50) {
							clearInterval(timeTop);
							timeLeft = setInterval(left, 200);
						}
					}
					//计时监听
					timeing = setInterval(function() {
						listTime += 1;
						//判断是否播放结束且 水印展现时间是否到达                             
						if(listTime == _this.watermarkTime || _this.overPlay) {
							listTime = 0;
							_this.overPlay = false;
							canvas.remove();
							clearInterval(timeTop);
							clearInterval(timeLeft);
							clearInterval(timeing);
							if(typeof callback == "function") {
								callback(_this);
							}
						}
					}, 1000)
					//当屏幕大小发送改变的初始化X,Y
					$(window).resize(function() {
						maxX = $(_this.videoObject).width();
						maxY = $(_this.videoObject).height();
					});
				}
				this.moveGo = function(that) {
					var that = this;
					that.createdom();
					that.moveMark(canvas[0], function(_that) {
						debugger
						//回调递归执行                           
						timeshow = setTimeout(function() {
							if(_that.overPlay) { //判断视频是否播放结束
								//结束清除计时
								clearTimeout(timeshow);
							} else {
								that.moveGo(that);
							}
						}, 4000)
					});
				}
				this.init = function() {
					this.moveGo(this);
				};
				return this.init();
			}
			new MarkShow(_this.watermarkName, $(_this.videoObject).parent());

		},
		//对话框
		videoDialog: function(that) {
			var Xp = that
			this.Msgbox = $('<div id="pdq-prompt-box" class="pdq-prompt-box">');
			this.Switchbox = $('<div id="pdq-switch-box" class="pdq-switch-box"></div>')
			//对话框
			this.Msg = function(text) {
				var $this = this;
				if($("#pdq-prompt-box").length == 0) {
					$(Xp.videoObject).parent().append(this.Msgbox);
					$this.animates($this.Msgbox, text)
					$this.remove($this.Msgbox);
				}
			}
			this.SwitchVideoMsg = function(text) {
				var $this = this;
				$(Xp.videoObject).parent().append(this.Switchbox);
				$this.animates($this.Switchbox, text);
			}
			this.remove = function(objBox) {
				setTimeout(function() {
					objBox.remove();
				}, 2000);
			}
			this.animates = function(objBox, text) {
				var $this = this;
				objBox.css("-webkit-transform", "scale(0,1)")
				setTimeout(function() {
					objBox.css("-webkit-transform", "scale(1,1)").text(text);
				}, 200);
			}
		},
		//全屏
		fullScreen: function() {
			var _this = this;
			var $this = null;
			var isFullScreen = false;
			var videos = document.getElementById("videoObject");
			ControllDom.fullScreenBtn.click(function() {
				$this = $(this);
				if($(this).hasClass("cancleScreen")) {
					if(doc.exitFullscreen) {
						doc.exitFullscreen();
					} else if(doc.mozCancelFullScreen) {
						doc.mozCancelFullScreen();
					} else if(doc.webkitExitFullscreen) {
						doc.webkitExitFullscreen();
					}
				} else {
					if(_this.videoObject.requestFullscreen) {
						_this.videoObject.requestFullscreen();
					} else if($("#videoObject")[0].mozRequestFullScreen) {
						// 火狐好像不允许同级元素全屏坑点在这里直接把父级全屏
						$("#videoObject")[0].mozRequestFullScreen();
					} else if(_this.videoObject.webkitRequestFullscreen) {
						_this.videoObject.webkitRequestFullscreen();
					} else if(_this.videoObject.msRequestFullscreen) {
						_this.videoObject.msRequestFullscreen();
					}
				}
			});
			//浏览器全屏无法监听到ESC键盘事件试了好几种方法还是有个别浏览器没有不能兼容
			win.onresize = function() {
				//当浏览器窗口发生变化时判断此时全屏按钮状态来改变样式
				if(ControllDom.fullScreenBtn.hasClass("cancleScreen")) {
					ControllDom.fullScreenBtn.removeClass("cancleScreen");
				} else {
					ControllDom.fullScreenBtn.addClass("cancleScreen");
				}
				if(!checkFull()) {
					ControllDom.fullScreenBtn.removeClass("cancleScreen");
				}
			};

			function checkFull() {
				var isFull = doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenEnabled || doc.fullscreenEnabled || doc.webkitIsFullScreen;
				if(isFull === undefined) isFull = false;
				return isFull;
			}
		},
		//菜单显示隐藏
		upMenu: function(menuEl, menuBox) {
			function Upmenu(menuEl, menuBox) {
				this.time = null;
				this.Menuname = menuEl;
				this.Menuconten = menuBox;
				this.init = function() {
					this.hoverBtn();
					this.hoverConten();
				};
				return this.init();
			}
			Upmenu.prototype = {
				constructor: Upmenu,
				ShowContent: function(index) {
					this.Menuconten.stop().show(0);
				},
				HedeContent: function(that) {
					this.Menuconten.stop().hide(0,
						function() {
							that.removeClass("oen");
						});
				},
				hoverBtn: function() {
					var self = this;
					this.Menuname.hover(function() {
							$(this).addClass("active");
							self.ShowContent();
						},
						function() {
							var $this = $(this);
							self.time = setTimeout(function() {
									self.HedeContent($this);
									self.Menuname.removeClass("active");
								},
								200);
						});
				},
				hoverConten: function() {
					var self = this;
					self.Menuconten.hover(function() {
							clearTimeout(self.time);
						},
						function() {
							$(this).hide();
							self.Menuname.removeClass("active");
						});
				}
			};
			return new Upmenu(menuEl, menuBox);
		}
	};
	window.XPVideoPlay = XPVideoPlay;
})(jQuery, window, document);