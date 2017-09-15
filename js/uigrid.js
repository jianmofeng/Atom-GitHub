/*!
* uigrid.js by @hyj
* Copyright 2016
*/
define(function(require, exports, module) {
	var $ = jQuery = require('jquery');
	var WdatePicker = require('date');
	var uploader = require('upload');
    var Helper = require('common/widget.helper');
	require('common/widget.selector');

	!function($){
		var _defaults = {
			checkClassName : 'checks',
			resizeClass : 'uigrid-line',
			dragColClassName : 'ug_drag_col',
			pageClass : 'uigrid-pages',
			pageRightClass : 'uigrid-pagesright',
			pageDataClass : 'uigrid-pagedata',
			pagePaginaClass : 'uigrid-pagina',
			paginationClass : 'uigrid-pagination',
			paginationNavClass : 'pagination',
			dropdownMenu : 'uigrid-pagina-dropdown',
			layout : ['layout1','layout2'],
			required : '<font class="text-danger">*</font>',
			view : '<div class="uigrid-view1" {view1Style}>{view1}<div class="uigrid-body" {bodyStyle}><div class="uigrid-body-inner">{table}</div>'+
					'</div></div><div class="uigrid-view2" {style}>{view2}<div class="uigrid-body" {bodyStyle}>{table}</div></div>',
			header : '<div class="uigrid-head"><div class="uigrid-head-box"><table><tr>{table}</tr></table></div></div>',
			headerTh : '<th id="{id}" {className} {thStyle}>{headerText}</th>',
			headerText : '<div style="{style}">{required}<span>{header}</span>{i}</div>',
			checkbox : '<label class="i-checks"><input type="checkbox" {checked} id="{checkId}"><i></i></label>',
			radio : '<label class="i-checks"><input type="radio" name="{radioName}" {checked} id="{checkId}"><i></i></label>',
			sup : '<div id="{id}" style="{style}" class="ug-drag-header">{content}</div>',
			table : '<table {className} {style}>{tr}</table>',
			tr : '<tr id="{id}" {rowClass}>{td}</tr>',
			td : '<td {className} {tdStyle} title="{title}" data-index="{index}">{content}</td>',
			content : '<div style="{style}">{content}</div>',
			treeContent : '<div style="{style}"><span class="{treeIcon}"></span><div>{content}</div></div>',
			btnList : '<a {id} {code} {className}>{name}</a>',
			loading : '<div class="loading-mark"><div class="loading-mark-img"></div>数据加载中...</div>',
			line : '<div class="{resizeClass}" style="{leftStyle}"></div><div class="{resizeClass}" style="{rightStyle}" id="{id}"></div>',
			dragBox : '<div class="ug-dragBox" style="height:{height}px;left:{left}px;"></div>',
			menuExt : '<div class="uigrid-menuext" style="{style}"><ul><li id="ug_fixedCol">固定当前列</li>'+
					  '<li id="ug_fixedRow">固定当前行</li><li id="ug_fixedColRow">固定当前行列</li>'+
					  '<li id="ug_unfixed">取消固定</li></ul></div>',
			childrenModel : '<tr class="ug-child"><td colspan="{length}"><table>{content}</table></td></tr>',
			edit:{
				input: {
					format: '<input type="text" id="{id}" class="form-control" value="{value}"'+
						' style="{style}" name="{property}" />',
					parentStyle: 'padding: 4px 5px 5px;',
					parentOffset: 10,
					offset: -12,
					type: 'input',
					done: function(row){
						$('#' + this.id).unbind().bind('click', function(e){
							e||e.stopPropagation()?e.stopPropagation():(window.event.cancelBubble = true);
						});
					},
					resize: function(elem){
						$('input', elem).width(this.width + this.parentOffset + this.offset);
					},
					update: function(data, model, grid){
						$('#' + this.id).val(data[model.property]);
					}
				},
				select: {
					create: function(){
						var selector = '<select class="form-control" id="' + this.id + '"'+
							' style="'+this.style+'" name="'+this.property+'">'
						if(this.option){
							var option = this.option, len = this.option.length||0;
							for(var i=0; i<len; i++){
								var _option = option[i];
								selector += this.value==_option.value?
								'<option value="'+_option.value+'" selected="selected">'+_option.name+'</option>':
								'<option value="'+_option.value+'">'+_option.name+'</option>'
							}
						}
						selector += '</select>';
						return selector;
					},
					done: function(row){
						$('#' + this.id).unbind().bind('click', function(e){
							e||e.stopPropagation()?e.stopPropagation():(window.event.cancelBubble = true);
						});
					},
					format: '{options}',
					parentStyle: 'padding: 4px 5px 5px;',
					done: function(row){
						$('#' + this.id).unbind().bind('click', function(e){
							e||e.stopPropagation()?e.stopPropagation():(window.event.cancelBubble = true);
						});
					},
					parentOffset: 10,
					type: 'select',
					resize: function(elem){
						$('select', elem).width(this.width + this.parentOffset + this.offset);
					},
					update: function(data, model, grid){
						
					},
				},
				date: {
					click: "WdatePicker({minDate : '%y-%M-%d',dateFmt : 'yyyy-MM-dd'})",
					done: function(row, grid){
						var settings = $.extend({
							readOnly: true,
							dateFmt : 'yyyy-MM-dd'
						}, this.settings);
						settings.minDate = this.filter(settings.minDate, row);
						settings.maxDate = this.filter(settings.maxDate, row);
						$('#' + this.id).click(function(e){
							e||e.stopPropagation()?e.stopPropagation():
							(window.event.cancelBubble = true);
							WdatePicker(settings);
						});
					},
					format: '<input type="text" class="form-control date" style="{style}"'+
						' id="{id}" name="{property}" value="{value}" />',
					offset: -12,
					parentStyle: 'padding: 4px 5px 5px;',
					parentOffset: 10,
					resize: function(elem){
						$('input', elem).width(this.width + this.parentOffset + this.offset);
					},
					type: 'date',
					filter: function(str, row){
						if(str&&typeof str === 'string'){
							var header = row.getPluginByParam('property', str);
							return header?"#F{$dp.$D(\'"+header.id+"\');}":str;
						}
						return '';
					},
					update: function(data, model, grid){
						
					},
				},
				upload: {
					create: function(data, grid){
						var format;
						this.maxWidth = this.parentWidth - 80;
						if(data[this.url]){
							this.fileName = data[this.name];
							this.fileUrl = data[this.url];
							this.disabled&&(this.delBtn = null)
							this.finished = grid.renderText(this.finished, this);
							format = grid.renderText(this.format, this);
						}else{
							this.className = null;
							this.finished = null;
							format = this.disabled?'':grid.renderText(this.format, this);
						}
						return format;
					},
					format: '<div class="upload" style="width:{parentWidth}px;" id="{progressId}"><div class="upload-start {className}">'+
						'<i class="attach"></i><input type="file" name="file" id="{fileId}" />'+
						'<span class="upload-btn text-info">上传附件<font>(最大100M)</font></span></div>{finished}</div>',
					finished: '<div class="file_complete">'+
                		'<i class="attach"></i>'+
                		'<span class="upload-name" style="max-Width:{maxWidth}px;" title="{fileName}">{fileName}</span>'+
                		'<span class="file_delete upload-btn text-danger m-l-xs pull-right">删除</span>'+
                		'{delBtn}'+
                	'</div>',
                	className: 'hide',
                	delBtn: '<span class="file_download upload-btn text-info m-l-xs pull-right">下载</span>',
					parentOffset: 10,
					parentStyle: 'padding: 4px 5px 5px;',
					type: 'upload',
					download: function(){
                		if(this.fileUrl){
                			$('#fileDownload').attr('src', ctx+'/file/handle/download.htm?fileUrl='+
                			this.fileUrl + '&fileName=' + this.fileName);
            				$('#fileDownload').submit();
                		}
					},
					done: function(row, grid){
						var that = this;
						$('#'+that.progressId).bind('click', function(e){
							e||e.stopPropagation()?e.stopPropagation():(window.event.cancelBubble = true);
						});
						!this.disabled&&uploader.createFileUpload({
		                    trigger: '#'+that.fileId,
		                    maxFileUploadSize: 100,
		                    limitFileUploads: 20,
		                    url: ctx + '/file/handle/upload.htm',
		                    custom_settings: {
		                        progressTarget: '#'+that.progressId,
		                        fileCompleteSections: '{{#files}}<div class="file_complete">'+
		                        	'<i class="attach"></i>'+
			                		'<span class="upload-name" title="{{fileName}}">{{fileName}}</span>'+
			                		'<span class="file_download upload-btn text-info m-l-xs pull-left">下载</span>'+
			                		'<span class="file_delete upload-btn text-danger m-l-xs pull-left">删除</span>'+
			                	'</div>{{/files}}',
		                        fileProcessSections: '{{#files}}<div class="file_loading">'+
		                        		'<span class="file_handle_msg"></span>'+
		                        		'<span class="file_progress_percent percent">{{percent}}</span>'+
		                        		'<span class="loading-bar"><span class="file_progress_bar bar"></span></span>'+
		                        	'</div>{{/files}}'
		                    },
		                    callback: {
		                        uploadStart: function(file) {
		                            $('#'+that.progressId+' .upload-start').hide();
		                        },
		                        uploadError: function(msg){
		                        	/*$('#'+that.progressId+' .file_loading').remove()
		                        	$('#'+that.fileId).clearFiles();
		                        	arguments[2]&&(arguments[2].files_number = 0);
		                            console.error(msg);*/
                                    $('#'+that.progressId+' .file_loading').remove()
                                    $('#'+that.fileId).clearFiles();
                                    Helper.warn('文件上传失败!');
                                    $('#'+that.progressId+' .upload-start').show();
                                    that.fileUrl = row.data[that.url] = "";
                                    that.fileName = row.data[that.name] = "";
                                    throw Error('文件上传失败!');
		                        },
		                        deleteFile: function(){
		                        	$('#'+that.progressId+' .upload-start').show();
		                        	that.fileUrl = row.data[that.url] = "";
		                        	that.fileName = row.data[that.name] = "";
		                        },
		                        uploadFinished: function(data){
		                        	that.fileUrl = row.data[that.url] = data.fileUrl;
		                        	that.fileName = row.data[that.name] = data.fileName;
		                        	$('#'+that.progressId+' .upload-name').css({maxWidth: that.maxWidth+'px'});
		                        	$('#'+that.progressId+' .file_download').unbind().bind('click', function(e){
		                        		e||e.stopPropagation()?e.stopPropagation():(window.event.cancelBubble = true);
		                        		that.download();
		                            });
		                        }
		                    }
		                });
						if(this.fileUrl){
							$('#'+this.progressId+' .file_download').unbind().bind('click', function(e){
                        		e||e.stopPropagation()?e.stopPropagation():(window.event.cancelBubble = true);
                        		that.download();
                            });
							$('#'+this.progressId+' .file_delete').unbind().bind('click', function(e){
                        		e||e.stopPropagation()?e.stopPropagation():(window.event.cancelBubble = true);
                        		$('#'+that.progressId+' .file_complete').remove();
                        		$('#'+that.progressId+' .upload-start').show();
                        		that.fileUrl = row.data[that.url] = null;
                        		that.fileName = row.data[that.name] = null;
                            });
						}
						if($('#fileDownload').length!==1){
							$('#fileDownload').remove();
							$('body').append('<iframe class="hide" name="fileDownload" id="fileDownload" src=""></iframe>');
						}
					},
					update: function(data, model, grid){
						
					},
					resize: function(){
						
					}
				}
			},
			editIndex: 0
		};
		/*'use strict';*/
		var ugExpr = /{[^}]+}/g;
		function uiGrid(settings, el) {
			var async = $.extend({},uiGrid.defaults.async, settings.async);
			this.linkBackEnd = async.url?true:false;
			this.loaddate = $.extend({}, {curPage : async.curPage, pageData : async.pageData,}, async.data);
			var page = $.extend({},uiGrid.defaults.page, settings.page);
			this.settings = $.extend({},uiGrid.defaults, settings);
			this.settings.async = async;
			this.settings.page = page;
			el.id = this.id = this.settings.id||el.id||uigridManager.getId();
			this.layout = this.getlayout(this.toArray(el.className));
			this.layout != _defaults.layout[0]&&(this.settings.menuExt = false);
			el.className = 'uigrid ' + this.layout||"";
			if(this.settings.hover===true){el.className += ' has-hover'}
			this.resizable = {resizeClass:_defaults.resizeClass};
			this.striped = this.isStriped();
			this.draggable = {};
			this.settings.viewTop = this.settings.viewLeft = this.settings.scrollLeft = this.settings.scrollTop = 0;
			this.createView().initButton();
		};
		/**
		 * rowModel
		 *   rowFilter 设置表格渲染过滤
		 *   rowModelList 设置表格风格
		 *     header        表头名称 设置为checkbox时表头也为checkbox
		 *     property      设置对应数据name
		 *     type          设置列为tree,link,checkbox,index,radio类型
		 *     width         设置表格宽度
		 *     align         对齐方式
		 *     sortable      是否进行排序
		 *     sortproperty  排序传递的参数
		 *     linkClick     设置type为link时td点击事件的回调函数
		 *     resizable     是否可以修改表格列宽度
		 *     draggable     是否可以拖拽表格列
		 *     headerStyle   设置表头样式
		 *     rowStyle      设置表格样式
		 *     edit          设置表内容是否可编辑
		 *       enabled     设置是否开启组件
		 *       type        设置组件类型input,date,upload
		 *       format      设置自定义组件模板
		 *       create      设置自定义组件创建函数（优先于模板执行）
		 *       parentOffset设置组件父容器的偏移值，主要是由parentStyle引起的
		 *       parentStyle 设置组件父容器的样式
		 *       offset		 设置组件偏移值，主要是由parentStyle引起的
		 *       done        设置组件创建成功后的回调函数
		 *       update      设置调用rowUpdate后的回调函数
		 *       resize      设置动态修改列宽后的回调函数
		 *       minDate     如果组件类型是date可设置date最小值，如果最小值是本行其他date组件则直接设置为该组件的property
		 *       maxDate     同minDate用于设置最大值
		 *       option      组件类型是select时，设置数组[{name:'',value:''}]name为名称 value为property
		 *       
		 * 
		 * 设置表格风格按钮operate
		 * name          设置按钮名称
		 * code          设置按钮code，用于权限过滤
		 * type			 设置按钮样式
		 * click		 设置按钮点击事件回调，将当前行数据当做参数返回回调函数，this指向按钮对象
		 * operateFilter 权限过滤回调函数，将当前行数据当做参数返回回调函数，不设置默认全部展示
		 * 
		 * 
		 * grid函数
		 * adaptHeight   设置自适应高度，值为数字或者function(返回值为对应数字)，该值表示表格整个高度
		 * addLoading    加载loading图标
		 * addRow        增加行，arguments为data,可以是某行的数据也可以是一个数组
		 * animate       动画效果
		 * appendRow     增加行，arguments可传入data(增加row的data值),index(控制row加在什么位置)
		 * clear         清除表格数据
		 * delRow        删除行，arguments为row，删除对应的行
		 * delSltRow     删除选中行
		 * edit          
		 * emptyRow      删除所有行
		 * fixedRow      设置固定行列，arguments为colIndex（列）， rowIndex（行）
		 * getAllData    获取所有行数据
		 * getGridData   获取所有行数据，包括表头数据
		 * getHeaderByParam 依据Param获取表头对象(param(对应对象属性名), content(对应对象属性内容))
		 * getRowByEl    根据row内元素对象获取row
		 * getRowById    根据row的id获取row
		 * getRowByParam 依据Param获取row对象(param(对应对象属性名), content(对应对象属性内容))
		 * getSelectedData 获取选中行数据
		 * getSelectedRow 获取选中行
		 * hasRowByData  根据数据判断是否有当前行(data(对应数据), key(数据内的唯一key值名称))
		 * rowUpdate     更新row数据(data(对应数据), row(对应row对象))
		 * validate      验证设置required = true的列是否不为空
		 * 
		 **/
		uiGrid.defaults = {
			id : null, 							//设置grid的id
			reload : true, 						//初始化时是否加载属性
			loading : false,					//
			hover: true,                        //设置是否开启hover
			striped: true,                      //隔行变色
			isTree : false,						//设置是否为树表格
			searchTextId : 'searchText',		//设置模糊查询输入框
			searchForm : '#advanced-search', 	//设置查询区域
			searchBtnId : 'searchBtn',			//设置模糊查询按钮
			selectedId : 'selected',			//设置查询按钮
			emptyId : 'empty',					//设置清空按钮
			//cancelId : 'cancel',              //设置取消按钮
			adaptHeight : null, 				//设置高度自适应计算，不设置会调用默认计算函数
			rowModel : null,					//设置表格行属性
			fixedRow : null,                    //设置表格固定行列
			menuExt : false,                     //设置表格右键菜单，false为不显示
			callback : {
				createFinished : null,			//表格创建成功回调
				rowClick : null,				//表格行单击事件回调
				dataFilter : null,				//表格数据加载成功回调
				dbRowClick : null,				//表格行双击事件回调
				onRowCreated : null,            //row创建完成后回调
				onloaded: null,                 //表格ajax加载并渲染完成后回调
			},
			async: {
				url : null,
				type : 'post',
				dataType : 'text',
				async : true,
				curPage : 1,					//设置当前页
				pageData : 50,					//设置每页展示数据条数
				data : null,                    //初始化时设置初始传入参数
				parmakey : null //设置行数据data里需要传给后台的key值，如果多个用','分隔。如'billCode,shortName,checkStatusStr'
			},
			page: {
				type : 'default',               //设置分页类型,default默认,pagination分页
				showPages : true,               //是否展示分页
				showToteData : true,			//是否展示总数
				showpageData : true,
				showPaginData : true,
				paginationLength : 10,
				pageData : [10, 20, 30, 50, 100],
				pageDataText : '<span>每页展示<select id="{pageDataId}">{options}</select>条</span>',
				pageText : '<div class="{pageClass}"><div class="{pageRightClass}">{pageText}</div></div>',
				ToteDataText : '<span>共<em>{totalData}</em>条数据</span>',
				paginDataText : '<div class="{pagePaginaClass}"><i class="{angleLeft}"></i><div id="{paginId}">'
								+'<span>{curPage}</span><i class="icon-up-dir"></i><ul class="{dropdownMenu}">'
								+'{paginaList}</ul></div><i class="{angleRight}"></i></div>',
				paginListText : '<li data-pagedata="{paginCurData}"><a>{paginListData}</a></li>',
				paginationText : '<div class="{pageClass} {paginationNavClass} sm">{pageText}</div>',
				paginationNavText : '<ul><li><a><i class="{angleLeft}"></i></a></li>{navText}'+
									'<li><a><i class="{angleRight}"></i></a></li></ul>'
			},
			operate : null,
			operateFilter :null
		};
		uiGrid.prototype = {
			toArray: function(str){
				return str.replace(/[\n\t\r]/g, " ").split(' ');
			},
			getlayout: function(className){
				for(var i in _defaults.layout){
					var layout = _defaults.layout[i];
					for(var l in className){
						if(className[l]===layout){
							return layout;
						}
					}
				}
				return "";
			},
			mapToArray: function(map, index){
				var arr = [];
				index = index||"index";
				for(var i in map)arr.push(map[i]);
				for(var x=0;x<arr.length;x++){
					var len = arr.length-x-1;
					for(var y=0;y<len;y++){
						if(arr[y][index]>arr[y+1][index]){
							var _arr = arr[y];
							arr[y] = arr[y+1];
							arr[y+1] = _arr;
						}
					}
				}
				return arr;
			},
			isArrayIndex: function(index, arr){
				return index&&typeof(index)==='number'&&index<arr.length&&index>0;
			},
			index: function(el){
				var row = this.getRowByEl(el);
				el = el instanceof $?el:$(el);
				var colIndex = this.settings.fixedRow[0];
				var index = el.index();
				var id = el.parent().attr('id');
				return id==row.view1_id?{rowIndex:row.index,colIndex:index}:id==row.view2_id?{rowIndex:row.index,colIndex:index+colIndex}:null;
			},
			//移动数组元素位置 _index原始位置 index需要移动到的位置
			moveArray: function(arr , _index, index){
				if(arr&&arr instanceof Array){
					if(this.isArrayIndex(_index, arr)&&this.isArrayIndex(index, arr)){
						var _arr = arr.splice(_index, 1)[0];
						arr.splice(index, 0, _arr);
					}
				}
				return arr;
			},
			trim: function(str){
				return typeof(str)==="string"&&str.replace(/null/g, "").replace(/undefined/g, "")||typeof(str)==="number"&&!isNaN(str)?str:"";
			},
			clearFixedRow: function(){
				this.settings.fixedRow[1] = 0;
				return this;
			},
			initFixed: function(){
				var fixedRow = this.settings.fixedRow, colIndex = 0, rowIndex = 0,
					len = this.settings.rowModel.rowModelList.length;
				if(fixedRow&&fixedRow instanceof Array){
					colIndex = fixedRow[0]?fixedRow[0]<len?fixedRow[0]:colIndex:colIndex;
					rowIndex = fixedRow[1]||0;
				}
				this.settings.fixedRow = [colIndex, rowIndex];
				return this;
			},
			initModel: function(){
				var rowModel = this.settings.rowModel.rowModelList, grid = this;
				$.each(rowModel, function(){
					if(!this.isFiliter){
						this.isFiliter = true;
						this.width = this.width>31?this.width - 21:10;
						!this.minWidth&&(this.minWidth = 10);
						if(grid.layout == 'layout1'){
							this.sortable = typeof(this.sortable)!=='boolean'?false:this.sortable;
							this.resizable = typeof(this.resizable)!=='boolean'?true:this.resizable;
							this.draggable = typeof(this.draggable)!=='boolean'?false:this.draggable;
							this.required = typeof(this.required)!=='boolean'?false:this.required;
						}
						switch(this.type){
							case 'checkbox':
								this.width = 24;
								this.sortable = this.resizable = false;
								break;
							case 'radio':
								this.width = 24;
								this.sortable = this.resizable = false;
								break;
							case 'index':
								this.width = 30;
								this.sortable = this.resizable = false;
								break;
							case 'operate':
								this.width = 100;
								this.sortable = this.resizable = false;
								break;
						};
						typeof(this.show)!=='boolean'&&(this.show = true);
					}
				});
				return this;
			},
			createView: function(){
				this.initModel().initFixed();
				var model = this.settings.rowModel.rowModelList, view1 = {table: ''}, view2 = {table: ''},
					colIndex = this.settings.fixedRow[0], rowIndex = this.settings.fixedRow[1],
					set = this.settings, sl = set.scrollLeft, vl = set.viewLeft, st = set.scrollTop,
					vt = set.viewTop, width = 0, tr_class = this.id + '_removetr', that = this;
				this.row = [];
				for(var i = 0; i<model.length; i++){
					var _model = model[i];
					_model.id = this.id + "_header_" + i;
					_model.index = parseInt(i);
					var text = this.getHeaderText(_model);
					i<colIndex?(view1.table += text,width += _model.width + 21):view2.table += text;
				}
				this.layout == "layout2"&&(view2.table += '<th class="th_scroll"><div></div></th>');
				vl = (width + vl - sl)>0?vl - sl:0;
				var data = {
					view1 : this.renderText(_defaults.header, view1),
					view2 : this.renderText(_defaults.header, view2),
					style : 'style="margin-left:' + (width + vl) + 'px;"',
					table : (rowIndex&&rowIndex>0&&this.renderText(_defaults.table, {
						className:'class="uigrid-fixed"'})||'') + this.renderText(_defaults.table,{
							tr: '<tr class="' + tr_class + '"><td><div></div></td></tr>'
						}),
					view1Style : 'style="left:' + vl + 'px;"'
				};
				$('#' + this.id).find('.uigrid-view1, .uigrid-view2').remove()
				.end().prepend(this.renderText(_defaults.view, data));
				if(!set.hh||!set.rh){
					$('#' + this.id + ' .uigrid-head').each(function(){
						var height = that.headerHeight = $(this).hideCompute('outerHeight');
						set.hh = set.hh?Math.max(set.hh, height):height;
					});
					set.rh = $('#' + this.id + ' .' + tr_class + ':eq(0)').parent().parent().hideCompute('outerHeight');
					set.ht = set.hh;
				}
				$('#' + this.id + ' .' + tr_class).remove();
				set.ht = rowIndex>0&&(rowIndex*set.rh + set.ht - st)>0?set.ht - st:set.hh;
				vt = rowIndex*set.rh + set.ht - set.hh;
				$('#' + this.id + ' .uigrid-fixed').css({top: set.ht});
				$('#' + this.id + ' .uigrid-body').css({marginTop: vt});
				this.settings.scrollTop = this.settings.scrollLeft = 0;
				this.settings.viewLeft = vl;
				this.settings.viewTop = vt;
				return this;
			},
			getHeaderText: function(model){
				if(model.show){
					var data = {id: model.id};
					if(model.type == "checkbox"){
						this.settings.hasChecked = true;
						data.checkId = model.checkId = this.settings.checkId = this.id + "_check";
						var TPL = model.header=="checkbox"?_defaults.checkbox:_defaults.headerText;
						data.className = 'class="' + _defaults.checkClassName +'"';
						data.headerText = this.renderText(TPL, data);
					}else if(model.type == "operate"){
						data.className = 'class="uigrid-operate"';
						data.headerText = '<div>'+model.header+'</div>';
					}else{
						data.header = model.header;
						model.sortable&&(data.i = '<i class="icon-sort"></i>');
						if(model.required){
							data.required = _defaults.required;
						}
						data.style = 'width:' + model.width + 'px;text-align:' + this.getAlign(model.align) + ';';
						data.headerStyle&&(data.style += model.headerStyle);
						data.headerText = this.renderText(_defaults.headerText, data);
					}
					return this.renderText(_defaults.headerTh, data);
				}
				return '';
			},
			getAlign: function(str){
				return typeof(str)==="string"&&(str==="center"||str==="right")?str:'left';
			},
			configPages: function(datas){
				var page = this.settings.page;
				var data = datas?{
					curPage   : datas.curPage,
					limit     : datas.limit,
					offset    : datas.offset,
					orderName : datas.orderName||'',
					sortOrder : datas.sortOrder||this.loaddate.sortOrder,
					orderBy   : datas.orderBy||this.loaddate.orderBy,
					pageData  : datas.pageData,
					totalData : datas.totalData,
					totalPage : datas.totalPage
				}:{totalData: 0,totalPage: 0};
				$.extend(this.loaddate, data);
				page.showPages&&this.edit(page.type + 'Page', this.loaddate);
				return this;
			},
			defaultPage: function(datas){
				var page = this.settings.page;
				_defaults.pageText = "";
				page.showToteData&&(_defaults.pageText = this.renderText(page.ToteDataText, datas));
				if(page.showpageData){
					var pageData = page.pageData;
					_defaults.options = "";
					this.settings.pageDataId = _defaults.pageDataId = this.id + "_pagedata";
					for(var i in pageData){
						var _pageData = pageData[i];
						if(datas.pageData===_pageData){
							_defaults.options += '<option selected="selected">' + _pageData + '</option>';
						}else{
							_defaults.options += "<option>" + _pageData + "</option>";
						}
					}
					_defaults.pageText += this.renderText(page.pageDataText, _defaults);
				}
				if(page.showPaginData){
					_defaults.curPage = this.trim(datas.curPage + "/" + datas.totalPage);
					this.settings.paginId = _defaults.paginId = this.id + "_pagin";
					_defaults.angleLeft = datas.curPage===1?"icon-angle-left disabled":"icon-angle-left";
					_defaults.angleRight = datas.curPage===datas.totalPage?"icon-angle-right disabled":"icon-angle-right";
					_defaults.paginaList = "";
					this.loaddate.totalPage = datas.totalPage;
					for(var i=1;i<=datas.totalPage;i++){
						_defaults.paginCurData = i;
						_defaults.paginListData = this.trim(i + "/" + datas.totalPage);
						_defaults.paginaList += this.renderText(page.paginListText, _defaults);
					}
					_defaults.pageText += this.renderText(page.paginDataText, _defaults);
				}
				$('#' + this.id).children('.' + _defaults.pageClass).remove().end().append(this.renderText(page.pageText, _defaults));
				this.bindPages();
				return this;
			},
			paginationPage: function(datas){
				var page = this.settings.page, n = 0, reload = false,
					len = page.paginationLength,
					totalPage = datas.totalPage,
					curPage = datas.curPage,
					pagin = page.paginationData;
				_defaults.pageText = "";
				page.showToteData&&(_defaults.pageText = this.renderText(page.ToteDataText, datas));
				if(!curPage||!totalPage){
					$('#' + this.id).children('.' + _defaults.pageClass).remove().end().append(this.renderText(page.paginationText, _defaults));
				}else if(!pagin||pagin&&((pagin[len-1]-1)<curPage||(pagin[0]+1)>curPage)){
					len = totalPage?totalPage<len?totalPage:len:0;
					var cur = curPage?curPage:1;
					page.paginationData = [];
					for(var i=1;i<=len;i++) page.paginationData.push(i);
					reload = true;
				}
				if(reload){
					if(page.paginationData){
						_defaults.navText = '';
						_defaults.angleLeft = datas.curPage===1?"icon-angle-left disabled":"icon-angle-left";
						_defaults.angleRight = datas.curPage===datas.totalPage?"icon-angle-right disabled":"icon-angle-right";
						while(page.paginationData[n]){
							var cur = page.paginationData[n];
							_defaults.navText += datas.curPage===cur?'<li class="active"><a>'+cur+'</a></li>':'<li><a>'+cur+'</a></li>';
							n++;
						}
						_defaults.pageText += this.renderText(page.paginationNavText, _defaults);
					}
					$('#' + this.id).children('.' + _defaults.pageClass).remove().end().append(this.renderText(page.paginationText, _defaults));
					this.bindPagination();
				}
			},
			renderText: function(TPL, datas){
				var data = TPL?TPL.match(ugExpr):null, _data = [];
				if(data&&data.length>0){
					$.each(data, function(){
						var property = this.replace('{','').replace('}','');
						_data.push(property);
					});
					for(var i in _data){
						var content = this.getForJson(_data[i], datas);
						content==null&&(content = '');
						TPL = TPL.replace(new RegExp('{+'+_data[i]+'+}'), content);
					}
				}
				return TPL;
			},
			getForJson: function(expre, json){
				expre = expre.split(/\./);
				var len = expre.length, i = 0, result = json;
				for(; i<len; i++){
					var property = expre[i];
					if(result[property]!=null||result[property]!=undefined){
						result = result[property];
					}else{
						return null;
					}
				}
				return result;
			},
			initButton: function(){
				var operate = this.settings.operate, filter = window.gridButtons;
				if(operate instanceof Array){
					for(var i in operate){
						var _operate = operate[i];
						_operate.deleted = true;
						if(filter instanceof Array){
							for(var o in filter){
								if(filter[o].compCode==_operate.code){
									_operate.deleted = false;
								}
							}
						}
					}
				}
				return this;
			},
			createExt: function(left, top, index){
				var data = {style:'top:'+top+'px;left:'+left+'px;'};
				this.extData = index;
				$('#' + this.id).append(this.renderText(_defaults.menuExt, data));
				return this.bindMenuExt();
			},
			delExt: function(){
				if(this.extData){
					this.extData = null;
					$('#' + this.id + ' .uigrid-menuext').remove();
				}
				return this;
			},
			createPopHeader: function(header){
				if(this.dragged){
					var dragged = this.dragged;
					var id = this.id + '_pop';
					var _header = $('#' + header.id + '>div');
					$('body').append(this.renderText(_defaults.sup, {id: id, content: header.header}));
					this.dragged.el = $('#'+id).css({
						height: _header.css('height'),
						width: _header.css('width'),
						padding: _header.css('padding'),
						fontWeight: _header.css('fontWeight'),
						color : _header.css('color'),
						left: _header.offset().left + 'px',
						top: _header.offset().top + 'px'
					})[0];
				}
				return this;
			},
			scroll: function(sl){
				sl = sl||this.settings.scrollLeft||0;
				if(sl&&typeof sl == "number"&&sl>0){
					this.moveEl?this.moveEl.scrollLeft(sl):$('#' + this.id).find('.uigrid-head,.uigrid-body').scrollLeft(sl);
				}
				return this;
			},
			scrollMove: function(right){
				if(!this.moving){
					var scrollMax = this.scrollMax(), timer;
					var moveEl = $('#'+this.id+' .uigrid-view2 .uigrid-body');
					this.moving = true;
					this.dragged.notGet = true;
					this.removeBoxEl();
					if(right){
						timer = (scrollMax - (this.settings.scrollLeft||0))*5;
						this.animate(moveEl, {'scrollLeft': scrollMax}, timer, 'linear');
					}else{
						timer = this.settings.scrollLeft*5;
						this.animate(moveEl, {'scrollLeft': 0}, timer, 'linear');
					}
				}
			},
			endMove: function(){
				if(this.moving){
					this.dragged.notGet&&this.getDragList();
					this.stop($('#'+this.id+' .uigrid-view2 .uigrid-body'));
					this.moving = false;
				}
				return this;
			},
			isStriped: function(){
				if(this.settings.striped){
					return function(index){
						return index%2?'odd':'';
					};
				}else{
					return function(){
						return '';
					};
				}
			}
		};
		var uiGridHelper = {
			createFinished: function() {
				var createfinished = this.settings.callback.createFinished;
				this.finishBind();
				if(createfinished&&typeof(createfinished)=='function'){
					createfinished.call(this);
				}
				return this;
			},
			//绑定事件
			finishBind: function() {
				var el = $('#' + this.id), grid = this;
				
				//查询
				$('#' + this.settings.selectedId).unbind().bind('click', function(e){
					grid.load();
				});
				//清空
				$('#' + this.settings.emptyId).unbind().bind('click', function(e){
					var form = $(grid.settings.searchForm);
					if(form&&form.length>0){
						var input = form.find('.form-wrap input[name]:not(*.clear_no,[type=button],[type=radio])'),
							select = form.find('.form-wrap select:not(*.clear_no)');
						input.each(function(){this.value=""});
						select.each(function(){this.options[0].selected = true});
					}
				});
				//取消
				$('#cancel').unbind().bind('click', function(e){
					$(this).closest('.dropdown-menu').hide();
				});
				
				$(window).on('resize', function() {
					grid.resize();
				});
				
				$('#search-more').unbind().on('click', function(){
					$(this).next('.dropdown-menu').toggle();
				});
				
				$('#'+this.settings.searchBtnId).unbind().on('click', function(){
					grid.load();
				});
				
				$('#'+this.settings.searchTextId).unbind().keypress(function(e){
					if(e.keyCode == '13'){
						grid.load();
					}
				});
				
				$(document).mousemove(function(e){
					if(grid.resized){
						grid.removeSelectEvent(true);
						var resizable = grid.resizable;
						var diff = e.pageX - resizable.pageX;
						if(resizable.header&&(resizable.header.width + diff)>=resizable.header.minWidth){
							$('body').css("cursor",'e-resize');
							resizable.diff = diff;
							resizable.lineEl.style.left = resizable.rleft + resizable.diff + "px";
						}
					}
					if(grid.dragged){
						grid.removeSelectEvent(true);
						var dragx = e.pageX - grid.dragged.diffx;
						var dragy = e.pageY - grid.dragged.diffy;
						var dragged = grid.dragged;
						dragx>0&&dragx<dragged.maxWidth&&(dragged.el.style.left = dragx + 'px');
						dragy>0&&dragy<dragged.maxHeight&&(dragged.el.style.top = dragy + 'px');
						if(dragy>dragged.vt&&dragy<dragged.vb&&dragx>dragged.vl&&dragx<dragged.vr){
							dragx>dragged.max?grid.scrollMove(true):dragx<dragged.min?
							grid.scrollMove(false):grid.endMove().setDragBox(dragx);
						}
					}
					if(!grid.isshow){
						$('#' + grid.id).is(':visible')&&(grid.resize(),grid.isshow = true);
					}
				}).mouseup(function(){
					grid.resized&&grid.removeLine();
					grid.dragged&&grid.dragEnd();
				}).hover(function(){}, function(){
					grid.resized&&grid.removeLine();
					grid.dragged&&grid.dragEnd();
				});
				
				if(window.dropDownManager){
					grid.dropId = dropDownManager.addDropEvent(function(){
						return grid.dropDownEvent();
					});
				}else{
					$('body').click(function(){
						grid.dropDownEvent();
					})
				}
				grid.bindTitle();
			},
			bindTitle: function(){
				var el = $('#' + this.id), grid = this, timer;
				
				$('#'+this.settings.checkId).bind('click', function(e){
					grid.childrenCheckStatus(grid.row, this.checked);
				});
				
				$('.uigrid-view2 .uigrid-body', el).unbind().scroll(function(e){
					var that = $(this), sl = that.scrollLeft(), st = that.scrollTop();
					if(sl!=grid.settings.scrollLeft){
						$('.uigrid-view2 .uigrid-head', el).scrollLeft(sl);
						$('.uigrid-view2 .uigrid-fixed', el).css({left:-sl});
					};
					st!=grid.settings.scrollTop&&$('.uigrid-view1 .uigrid-body', el).scrollTop(st);
					grid.settings.scrollLeft = sl;
					grid.settings.scrollTop = st;
					grid.delExt();
				});
				
				$('.uigrid-head th:not(.th_scroll)', el).unbind('mousedown').bind('mousedown', function(e){
					var header = grid.getHeaderByParam("id", this.id);
					if($(this).css('cursor')==="e-resize"){
						grid.setLine(this, e, header);
					}else{
						if(header.draggable){
							timer = setTimeout(function(){
								grid.fn = null;
								grid.drag(header, e);
							},500);
							grid.fn = grid.sort;
						}else{
							grid.sort(header);
						}
					}
				}).unbind('mouseup').bind('mouseup', function(){
					var header = grid.getHeaderByParam("id", this.id);
					if(header.draggable){
						if(timer){
							clearTimeout(timer);
							timer = null;
						}
						grid.fn&&typeof(grid.fn)==="function"&&grid.fn(header);
						grid.fn = null;
					}
				}).unbind('mousemove').bind('mousemove', function(e){
					var header = grid.getHeaderByParam("id", this.id);
					if(header.draggable&&timer){
						clearTimeout(timer);
						timer = null;
					}
					if(!grid.dragged&&header.resizable){
						var maxLeft = $(this).offset().left + $(this).outerWidth();
						if(e.pageX>(maxLeft-5)&&e.pageX<maxLeft){
							$(this).css("cursor",'e-resize');
						}else if(!grid.resized){
							$(this).css("cursor",'');
						}
					}
				});
				
				return this;
			},
			//动态绑定事件
			bind: function() {
				var el = $('#' + this.id), grid = this;
				$('.uigrid-body tr:not(.tr_child, .ug-child)', el).unbind('click').bind('click', function(){
					var row = grid.getRowById(this.id),
						rowClick = grid.settings.callback.rowClick;
					if(row){
						if(rowClick&&typeof(rowClick)=="function"){
							if(rowClick.call(this, row.data)===false)return false;
						}
						if(row.children){
							var rowEl = $(row._id), treeEl = rowEl.find('.ui-tree:eq(0) span');
							if(treeEl.hasClass('tree_open')){
								treeEl.removeClass('tree_open').addClass('tree_close');
								rowEl.next('.ug-child').hide();
							}else{
								treeEl.addClass('tree_open').removeClass('tree_close');
								rowEl.next('.ug-child').show();
							}
						}else{
							row.type&&grid[row.type](row, !row.checked);
						}
					}
				}).unbind('dblclick').bind('dblclick', function(e){
					var dbRowClick = grid.settings.callback.dbRowClick,
						row = grid.getRowById(this.id);
					if(dbRowClick&&typeof(dbRowClick)==="function"){
						dbRowClick.call(this, row.data, e);
					}
				});
				
				$('.uigrid-operate', el).unbind('click').bind('click', function(e){
					e||e.stopPropagation()?e.stopPropagation():(window.event.cancelBubble = true);
				});
				
				//展开收起表格内按钮
				$('.uigrid-operate i', el).unbind('click').bind('click', function(e){
					var icon = $(this), pop = icon.parent(), isOpen = pop.hasClass('pop'),
						_icon = $('.uigrid-operate i', el);
					_icon.removeClass('icon-angle-double-up').addClass('icon-angle-double-down');
					_icon.parent().removeClass('pop');
					if(!isOpen){
						icon.removeClass('icon-angle-double-down').addClass('icon-angle-double-up');
						pop.addClass('pop');
					}
				}).unbind('dblclick').bind('dblclick', function(e){
					e||e.stopPropagation()?e.stopPropagation():(window.event.cancelBubble = true);
				})
				
				$('.uigrid-operate i', el)
				
				$('.uigrid-operate a', el).unbind('click').bind('click', function(e){
					var row = grid.getRowByEl(this), code = this.getAttribute('code');
					if(row&&row.operate&&code&&row.operate[code]){
						var _fun = row.operate[code].click;
						if(_fun&&typeof(_fun)==="function"){
							_fun.call(this, row.data, e);
						}
					}
				});
				
				el.find('.uigrid-link a').unbind('click').bind('click', function(e){
					e||e.stopPropagation()?e.stopPropagation():(window.event.cancelBubble = true);
					var row = grid.getRowByEl(this),
						index = $(this).closest('td').data('index');
					if(typeof index === 'number'){
						var model = grid.getHeaderByParam('index', index);
						if(typeof model.linkClick === "function"){
							model.linkClick.call(this, row.data, grid);
						}
					}
				});
				
				grid.bindRightMenu().bindCkeckClick(grid.row);
				
				$.each(grid.row, function(){
					var plugins = this.plugins, that = this;
					if(!this.isbind&&plugins&&plugins.length>0){
						$.each(plugins, function(){
							this.done&&this.done(that, grid);
						});
						this.isbind = true;
					}
				})
			},
			bindRightMenu: function(){
				if(this.settings.menuExt){
					var grid = this;
					var EXP = ' .uigrid-body tr:not(.tr_child)>td:not(.checks,.index,.uigrid-operate)';
					$('#' + this.id + EXP).unbind().bind('contextmenu', function(e){
						var index = grid.index(this);
						var left = e.pageX - $('#' + grid.id).offset().left;
						var top = e.pageY - $('#' + grid.id).offset().top;
						grid.delExt().createExt(left, top, index);
						return false;
					});
				}
				return this;
			},
			bindMenuExt: function(){
				var grid = this;
				
				$('.uigrid-menuext li').unbind().bind('click', function(){
					var index = grid.extData;
					grid.delExt();
					switch(this.id){
						case 'ug_fixedCol':
							grid.edit('fixedRow', index.colIndex+1, 0);
							break;
						case 'ug_fixedRow':
							grid.edit('fixedRow', 0, index.rowIndex+1);
							break;
						case 'ug_fixedColRow':
							grid.edit('fixedRow', index.colIndex+1, index.rowIndex+1);
							break;
						case 'ug_unfixed':
							grid.edit('fixedRow', 0, 0);
							break;
					}
				});
				
				return this;
			},
			bindPages: function(){
				var grid = this;
				
				$('#'+this.settings.paginId).unbind('click').bind('click', function(e){
					e||e.stopPropagation()?e.stopPropagation():(window.event.cancelBubble = true);
					$(this).find('ul').toggle();
				});
				
				$('#' + this.settings.paginId + ' li').unbind('click').bind('click', function(){
					grid.loaddate.curPage = this.getAttribute('data-pagedata');
					grid.load();
				});
				
				$('#'+this.settings.paginId).prev('.icon-angle-left').unbind('click').bind('click', function(){
					if(grid.loaddate.curPage>1&&!$(this).hasClass('disabled')){
						grid.loaddate.curPage -= 1;
						grid.load();
					}
				});
				
				$('#'+this.settings.paginId+'~.icon-angle-right').unbind('click').bind('click', function(){
					if(grid.loaddate.curPage<grid.loaddate.totalPage&&!$(this).hasClass('disabled')){
						grid.loaddate.curPage += 1;
						grid.load();
					}
				});
				
				$('#'+this.settings.pageDataId).unbind('change').bind('change', function(){
					grid.loaddate.pageData = this.value;
					grid.load();
				});
			},
			bindPagination: function(){
				var grid = this;
				
				$('#'+this.id+' .pagination li').unbind().bind('click', function(){
					var node = $(this),
						icon = node.find('i'),
						index = node.index(),
						curPage = grid.loaddate.curPage,
						totalPage = grid.loaddate.totalPage;
					if(icon.length>0){
						var cur = icon.hasClass('disabled')?0:index===0?curPage>1?-1:0:curPage<totalPage?1:0;
						curPage += cur;
						cur!==0&&grid.load(function(){
							return {curPage:curPage};
						});
					}else if(!node.hasClass('active')){
						var cur = node.find('a').text();
						if(cur>0&&cur<=totalPage){
							$(this).addClass('active').siblings().removeClass('active');
							grid.load(function(){
								return {curPage:cur};
							});
						}
					}
				});
			},
			dropDownEvent: function(){
				$('#' + this.id + ' .uigrid-pagina-dropdown').hide();
				$('#' + this.id + ' .uigrid-operate .pop').each(function(){
					var icon = $(this).find('i');
					$(this).removeClass('pop');
					icon.removeClass('icon-angle-double-up').addClass('icon-angle-double-down');
				});
				return this.delExt();
			},
			bindCkeckClick: function(row){
				var grid = this;
				for(var i in row){
					var _row = row[i];
					$('#'+_row.checkId).closest('td').unbind('click').bind('click', function(e){
						e||e.stopPropagation()?e.stopPropagation():(window.event.cancelBubble = true);
						var e = e||window.event, target = e.target||e.srcElement, row = grid.getRowByEl(this);
						target.nodeName!="I"&&row.type&&grid[row.type](row, !row.checked);
					});
				}
			},
			radio: function(row, checked){
				if(checked){
					var i = 0, len = this.row.length;
					for(; i<len; i++){
						var _row = this.row[i];
						if(i==row.index){
							this.refreshCheckStatus(_row, checked)
						}else{
							this.refreshCheckStatus(_row, !checked);
						}
					}
				}else{
					this.refreshCheckStatus(row, checked);
				}
			},
			checkbox: function(row, checked){
				this.refreshCheckStatus(row, checked);
				row.children&&row.children.length>0&&this.childrenCheckStatus(row.children, checked);
				this.parentCheckStatus(row);
			},
			refreshCheckStatus: function(row, checked){
				if(row.checked!=checked){
					row.checked = checked;
					$('#' + row.checkId).attr('checked', checked);
					checked?$(row._id).addClass('active'):$(row._id).removeClass('active');
				}
				return this;
			},
			childrenCheckStatus: function(row, checked){
				for(var i = 0; i<row.length; i++){
					var _row = row[i];
					this.refreshCheckStatus(_row, checked);
					if(_row.row)this.childrenCheckStatus(_row.row, checked);
				}
			},
			parentCheckStatus: function(row){
				if(row){
					var checked = true, rows;
					if(row.pid){
						var prow = this.getRowById(row.pid);
						rows = prow.children;
					}else{
						rows = this.row;
					}
					for(var i = 0; i<rows.length; i++){
						var _rows = rows[i];
						if(!_rows.checked){
							checked = false;
							break;
						}
					}
					if(row.pid){
						this.refreshCheckStatus(prow, checked);
						this.parentCheckStatus(prow);
					}else{
						$('#'+this.settings.checkId).attr('checked', checked);
					}
				}
			},
			//将列表数据转换成树结构
			constructTreeData: function(list, pid, id){
				var dataList = [];
				if($.isArray(list)){
					pid = pid&&typeof pid === 'string'?pid:'pid';
					id = id&&typeof id === 'string'?id:'id';
					for(var i = 0; i<list.length; ){
						var data = list[i];
						data[pid]?i++:(dataList.push(data), list.splice(i, 1));
					}
					if(dataList.length>0&&list.length>0){
						dataList.map(function(item){
							arrayToTree(item, list, pid, id);
						});
					}
				}
				function arrayToTree(parent, list, pid, id){
					parent.children = [];
					for(var i = 0; i<list.length; ){
						var data = list[i];
						if(data[pid] == parent[id]){
							parent.children.push(data);
							list.splice(i, 1);
							arrayToTree(data, list, pid, id);
						}else{
							i++;
						}
					}
					if(parent.children.length === 0){
						delete parent.children;
					}
				}
				return dataList;
			},
			resetRow: function(){
				var row = this.row, _this = this, elems = [];
				$.each(row, function(i, n){
					if(this.index != i){
						this.index = i;
						this.data.index = i + 1;
						this.id = _this.id + "_row_" + this.index;
						var view1_id = this.id + '_view1',
							view2_id = this.id + '_view2',
							header = _this.getHeaderByParam('type', 'index');
						if(header&&header.index){
							$(this._id).find('td:eq(' + header.index + ')').find('div')
							.html(this.data.index);
						}
						elems.push({
							view1: document.getElementById(this.view1_id),
							view2: document.getElementById(this.view2_id),
							view1_id: view1_id,
							view2_id: view2_id
						});
						this.view1_id = view1_id;
						this.view2_id = view2_id;
						this._id = '#' + this.view1_id + ',#' + this.view2_id;
					}
				});
				for(var i=0; i<elems.length; i++){
					var elem = elems[i];
					elem.view1.id = elem.view1_id;
					elem.view2.id = elem.view2_id;
				}
				return this.bind();
			},
			setSearchData: function(){
				var grid = this;
				$(this.settings.searchForm).each(function(){
					if(this.nodeName==="FORM"){
						var fd = $(this).serializeArray();
						$.each(fd, function(){
							grid.loaddate[this.name] = $.trim(this.value);
						});
					} 
					return false;
				});
				this.loaddate['searchTitle'] = $.trim($('#'+this.settings.searchTextId).val());
			},
			load: function(el) {
				var grid = this, async = grid.settings.async;
				if(!grid.settings.loading&&grid.linkBackEnd){
					this.setSearchData();
					if(typeof(el)==="function"){
						$.extend(grid.loaddate, el.call(this));
						el = null;
					}
					!el&&$('#'+this.settings.checkId).attr({checked:false});
					grid.settings.loading = true;
					$.ajax({
						url        : async.url,
						type       : async.type,
						data       : grid.loaddate,
						async      : async.async,
						dataType   : async.dataType,
						beforeSend : function(){
							if(grid.settings.fixedRow[1]>0){
								grid.clearFixedRow().addLoading().createView().resize().bindTitle();
							}else{
								grid.clear(el);
							}
						},
						success: function(result){
							grid.settings.loading = false;					
							typeof(result)==="string"&&(result = $.parseJSON(result));
							if(result.jdo&&result.jdo.success){
								var datafilter = grid.settings.callback.dataFilter;
								datafilter&&typeof(datafilter)==="function"&&(result = datafilter.call(grid, result));
								if(result&&result.dataList){
									grid.removeLoading().render(result.dataList, el);
									grid.configPages(result).bind();
									var onloaded = grid.settings.callback.onloaded;
									onloaded&&typeof(onloaded)==="function"&&(onloaded.call(grid));
								}else{
									grid.error('返回数据格式不正确');
								}
							}else{
								if(!result.success){
									grid.error(result.message);
								}
							}
						},
						error: function(XMLHttpRequest, textStatus, errorThrown) {
							//grid.error("系统错误,请联系管理员");
						}
					});
				}
			},
			render: function(dataList, row, content, model, lIndex, rIndex) {
				if(row){
					var tbody = {view1 : '', view2 : ''};
					for(var i = 0;i<dataList.length; i++){
						var data = dataList[i];
						var _row = new Row(data, this, row);
						row.children.push(_row);
						var html = _row.create(this, model);
						tbody.view1 += html.view1;
						tbody.view2 += html.view2;
						if(data&&data.children&&$.isArray(data.children)){
							_row.children = [];
							this.render(data.children, _row, content);
						}
					}
					content.view1 += this.renderText(_defaults.childrenModel, {
						content: tbody.view1,
						length: lIndex
					});
					content.view2 += this.renderText(_defaults.childrenModel, {
						content: tbody.view2,
						length: rIndex
					});
				}else{
					var row = this.row,
						table = $('#' + this.id+' .uigrid-body table.uigrid-fixed'),
						model = this.settings.rowModel,
						lIndex = this.settings.fixedRow[0],
						rIndex = model.rowModelList.length - lIndex,
						content = {view1 : '', view2 : ''},
						rowIndex = this.settings.fixedRow[1];
					for(var i = 0;i<dataList.length; i++){
						if(i==rowIndex){
							table.eq(0).append(content.view1).end().eq(1).append(content.view2);
							content = {view1 : '', view2 : ''};
							table = $('#'+this.id+' .uigrid-body table:not(.uigrid-fixed)');
						}
						var data = dataList[i];
						var _row = new Row(data, this);//
						row.push(_row);//
						var html = _row.create(this, model);//
						content.view1 += html.view1;
						content.view2 += html.view2;
						if(model.childrenFormat&&typeof model.childrenFormat === 'function'){
							var childrenHtml = {
								length:model.rowModelList.length,
								content: model.childrenFormat.call(this, data)
							};
							content.view2 += this.renderText(_defaults.childrenModel, childrenHtml);
						}
						if(data&&data.children&&$.isArray(data.children)){
							_row.children = [];
							this.render(data.children, _row, content, model, lIndex, rIndex);
						}
					}
					table.eq(0).append(content.view1).end().eq(1).append(content.view2);
				}
				return this;
			},
			//grid 增加行方法
			addRow: function(data){
				data = data instanceof Array?data:[data];
				this.render(data).configPages({totalData:this.row.length}).removeLoading().bind();
				return this;
			},
			appendRow: function(data, index){		
				if((!data||data=='')&&!index){
					this.addRow();
				}else{
					var row = null, _data = null;
					if(typeof data === 'number'){
						row = this.getRowByParam('index', data);
					}else{
						_data = data.length&&data.length>0?data:[data];
						row = typeof index === 'number'?this.getRowByParam('index', data):index;
					}
					if(row instanceof Row){
						var content = {view1 : '', view2 : ''};
						var model = this.settings.rowModel;
						for(var i in _data){
							var datas = _data[i];
							var num = row.index + parseInt(i) + 1;
							var _row = new Row(datas, this);
							this.row.splice(num, 0, _row);
							var html = _row.create(this, model);
							content.view1 += html.view1;
							content.view2 += html.view2;
						}
						$(row._id).eq(0).after(content.view1).end().eq(1).after(content.view2);
						this.configPages({totalData:this.row.length}).resetRow();
					}else{
						this.addRow(_data);
					}
				}
				return this;
			},
			rowUpdate: function(data, row){
				if(row instanceof Row){
					var model = this.settings.rowModel.rowModelList;
					var rowEl = $(row._id);
					for(var i = 0; i<model.length; i++){
						var _model = model[i];
						if(_model.property){
							var property = _model.property;
							var value = data[property];
							if(value!=null&&value!=undefined&&value!=row.data[property]&&_model.index>=0){
								if(_model.edit){
									var plugins = row.getPlugin(_model.index);
									if(plugins.update&&typeof plugins.update === 'function'){
										plugins.update.call(plugins, data, _model, this);
										continue;
									}
								}
								rowEl.find('td:eq('+_model.index+') div:first').html(value);
							}
						}
					}
					row.data = $.extend({}, row.data, data);
				};
				return this;
			},
			validate: function(){
				return this;
			},
			//查询数据是否已有根据属性值
			hasRowByData: function(data, parma){
				if(parma&&typeof(parma)==="string"){
					var datas = this.getAllData(),
						_parma = this.toArray(parma);
					if(_parma.length==1){
						_parma = _parma[0];
						for(var i in datas){
							var _data = datas[i];
							if(_parma&&_data[_parma] == data[_parma]){
								return true;
							}
						}
					}else if(_parma.length>1){
						for(var i in datas){
							var _data = datas[i];
							var hasData = true;
							$.each(_parma, function(){
								if(_data[this]!==data[this]){
									hasData = false;
									return false;
								}
							})
							if(hasData)return true;
						}
					}
				}
				return false;
			},
			delSltRow: function(){
				var i = 0, row = this.row;
				for(;i<row.length;){
					var _row = this.row[i];
					if(_row.checked){
						$(_row._id).remove();
						row.splice(i,1)
					}else{
						i++;
					}
				}
				this.configPages({totalData:this.row.length}).parentCheckStatus();
				return this.resetRow();
			},
			emptyRow: function(){
				return this.clear().removeLoading().configPages({totalData:this.row.length});
			},
			delRow: function(row){
				if(row){
					$(row._id).remove();
					this.configPages({totalData:this.row.length}).parentCheckStatus();
				}
			},
			error: function(message) {
				var error = this.settings.async.error;
				if(error&&typeof(error)==="function")error.call(this, message);
			},
			clear: function(el) {
				this.addLoading();
				if(el){
					var row = this.getRowById(this.id);
					el.next('.tr_child').empty();
				}else{
					this.row = [];
					$('#'+this.id+' .uigrid-body table').empty();
				}
				return this;
			},
			addLoading: function(){
				$('#'+this.id).append(_defaults.loading);
				return this;
			},
			removeLoading: function(){
				$('#'+this.id + ' .loading-mark').remove();
				return this;
			},
			refreshRow: function(row){
				var tr = $('#'+row.id);
				if(this.settings.async.parmakey){
					var parmakey = this.settings.async.parmakey;
					parmakey = parmakey.split(',');
					for(var i in parmakey){
						var _parmakey = parmakey[i];
						this.loaddate[_parmakey] = row.data[_parmakey];
					}
				}
				this.load(tr);
			},
			//修改树样式
			openTreeCss: function(tr){
				tr.next('.tr_child').is(':hidden')?
				$('.ui-tree span', tr).addClass('tree_close').removeClass('tree_open'):
				$('.ui-tree span', tr).addClass('tree_open').removeClass('tree_close');
			},
			getHeaderByParam: function(param, content) {
				var header = this.settings.rowModel.rowModelList, _header = null;
				for(var i in header){
					_header = header[i];
					if(_header[param] == content){
						return _header;
					}
				}
				return null;
			},
			getRowById: function(id, row) {
				var rows = row||this.row;
				for(var i in rows){
					var _row = rows[i];
					if(_row.id==id||_row.view1_id==id||_row.view2_id==id){
						return _row;
					}
					if(_row.children&&_row.children.length>0){
						var a = this.getRowById(id, _row.children);
						if(a)return a;
					}
				}
			},
			getRowByEl: function(el){
				el = el?el instanceof jQuery?el:$(el):null;
				if(!el)return null;
				var id = el[0].nodeName==="TR"?el.attr('id'):el.closest('tr').attr('id');
				return this.getRowById(id);
			},
			getSltRow: function(){
				var rows = this.row, selector = [];
				for(var i in rows){
					var _row = rows[i];
					if(_row.checked){
						selector.push(_row);
					}
				};
				return selector;
			},
			getSelectedRow: function(){
				return this.getSltRow();
			},
			//通过属性获取node值
			//property 属性名称
			//value 属性值
			getRowByParam: function(property, value, row) {
				var rows = row||this.row;
				if(property&&typeof(property)=="string"&&value&&(typeof(value)=="string"||typeof(value)=="number")){
					for(var i in rows){
						var _row = rows[i];
						if(_row.data[property]==value){
							return _row;
						}
						if(_row['row']&&_row['row'].length>0){
							var a = this.getRowByParam(property, value, _row['row']);
							if(a)return a;
						}
					}
				}
			},
			//获取选中状态的数据
			getSelectedData: function(){
				return this.getSltData();
			},
			getSltData: function(row, data){
				var grid = this;
				row = row||this.row;
				data = data||[];
				$.each(row, function(){
					if(this.checked){
						data.push(this.data);
					}else{
						if(this.row)grid.getSelectedData(this.row, data);
					}
				});
				return data;
			},
			getAllData: function(){
				var data = [];
				$.each(this.row, function(){
					if(this.plugins.length>0){
						this.reset();
					}
					data.push(this.data);
				});
				return data;
			},
			//获取表格数据包括表头
			getGridData: function(){
				var header = this.settings.rowModel.rowModelList, data = {header:[],dataList:[]};
				var propertys = [];
				for(var i in header){
					var _header = header[i];
					if(_header.property){
						data.header.push(_header.header);
						propertys.push(_header.property);
					}
				}
				for(var j = 0; j<this.row.length; j++){
					var rowData = this.row[j].data, _rowData = [];
					for(var n = 0; n < propertys.length; n++){
						var property = propertys[n];
						_rowData.push(this.trim(rowData[property]));
					}
					data.dataList.push(_rowData);
				}
				return data;
			},
			resize: function() {
				var settings = this.settings;
				settings.height = this.adaptHeight();
				if(settings.adaptHeight){
					if(typeof(settings.adaptHeight)=='function'){
						try{
							settings.height = settings.adaptHeight(settings.height);
						}catch(e){
							console.error(e.stack);
						}
					}else if(typeof(settings.adaptHeight) === 'number'){
						settings.height = settings.adaptHeight;
					}
				}
				settings.lineHeight = settings.height - $('#' + this.id + ' .uigrid-pages').outerHeight();
				settings.bodyheight = settings.lineHeight - this.headerHeight - settings.viewTop + 1;
				$('#' + this.id).height(settings.height).find('.uigrid-body').height(settings.bodyheight);
				return this;
			},
			adaptHeight: function() {
				var contentHeight;
				self!=top?contentHeight=window.frameElement.height:contentHeight=window.document.body.clientHeight;
				return contentHeight - $('#' + this.id).offset().top - 1;
			},
			setLine: function(el, e, header){
				this.resized = true;
				var resizable = this.resizable, _el = $('#'+this.id),
					left = $(el).offset().left - _el.offset().left;
				resizable.rleft = left + $(el).outerWidth();
				if(!header.width)header.width = $('#'+header.id+'>div').width();
				resizable.header = header;
				resizable.leftStyle = resizable.rightStyle = 'height:'+this.settings.lineHeight+'px;';
				resizable.leftStyle += 'left:' + left + 'px;';
				resizable.rightStyle += 'left:' + resizable.rleft + 'px;';
				resizable.id = el.id +　'_line';
				_el.append(this.renderText(_defaults.line, resizable));
				resizable.lineEl = document.getElementById(resizable.id);
				resizable.pageX = e.pageX;
				this.removeSelectEvent(true);
			},
			removeLine: function(){
				$('#' + this.id + ' .' + this.resizable.resizeClass).remove();
				$('body').css("cursor",'');
				var resizable = this.resizable;
				if(resizable.header&&resizable.diff&&resizable.header.width){
					var width = resizable.header.width + resizable.diff;
					this.resetRowWidth(width, resizable.header.index).removeSelectEvent(false);
				}
				this.resized = false;
				this.resizable = {resizeClass:_defaults.resizeClass};
			},
			resetRowWidth: function(width, index, row, id, _index, flg){
				if(flg||(width&&typeof(width)==='number')){
					if(!row){
						row = this.row;
						var colIndex = this.settings.fixedRow[0];
						var header = this.getHeaderByParam('index', index);
						id = index<colIndex?'view1_id':'view2_id';
						_index = index<colIndex?index:index - colIndex;
						header.width = width;
						$('#'+header.id+'>div').width(width);
						$('#'+this.id+' .uigrid-view2').css({marginLeft:$('#'+this.id+' .uigrid-view1 .uigrid-head-box').width()});
					}
					for(var i in row){
						var _row = row[i];
						var div = $('#'+ _row[id] + '>td:eq('+ _index +')>div');
						var ml = parseInt(div.css("marginLeft"));
						var plugins = _row.getPlugin(index);
						var parentOffset = 0;
						if(plugins){
							parentOffset = plugins.parentOffset;
							plugins.width = width;
							plugins.resize&&plugins.resize(div);
						}
						var _width = width - ml + parentOffset;
						div.css("width", _width);
						if(_row.row){
							this.resetRowWidth(width, index, _row.row, id, _index, true);
						}
					}
				}
				return this;
			},
			removeSelectEvent: function(remove){
				if(remove){
					try{
						window.getSelection?window.getSelection().removeAllRanges():document.selection.empty();
					}catch(e){
						
					}
				}else{
					if(document.all){
					    document.onselectstart= function(){return true;};
					}else{
					    document.onmousedown= function(){return true;};
					    document.onmouseup= function(){return true;};
					}
					document.onselectstart = new Function('event.returnValue=true;');
				}
				return this;
			},
			sort: function(header){
				if(header.sortable){
					$('#' + this.id + ' .uigrid-head th[id] i').removeClass().addClass('icon-sort');
					var icon = $('#'+header.id + ' i')
					header.sortOrder = header.sortOrder?0:1;
					icon.removeClass();
					header.sortOrder===1?icon.addClass('icon-sort-down'):icon.addClass('icon-sort-up');
					if(header.sortproperty === "string"||header.sortproperty === "number"){
						var dataList = this.getAllData();
						var property = header.type==="index"?"index":header.property;
						dataList = this.sortByParam(dataList, property, header.sortproperty, header.sortOrder);
						this.clear().removeLoading().addRow(dataList);
					}else{
						this.loaddate.sortOrder = header.sortOrder;
						this.loaddate.orderBy = header.sortproperty;
						this.load();
					}
				}
			},
			//排序数组 data要排序的数组， property排序对应属性，
			//orderby number或者string， ascending升序或者降序 0升序1降序
			sortByParam: function(data, property, orderby, ascending){
				if(!data||!data instanceof Array||!property||!orderby)return null;
				ascending = ascending?true:false;
				return orderby==="string"?data.sort(this.compareSort(property, ascending)):
					orderby==="number"?data.sort(this.compare(property, ascending)):null;
			},
			compareSort: function(property, ascending){
				return function(a, b){
					return ascending?b[property].localeCompare(a[property]):
						a[property].localeCompare(b[property]);
				}
			},
			compare: function(property, ascending){
				return function(a, b){
					return ascending?b[property] - a[property]:a[property] - b[property];
				}
			},
			drag: function(header, e){
				if(header.draggable&&header.index>this.settings.fixedRow[0]){
					var _header = $('#' + header.id);
					var view = $('#'+this.id+' .uigrid-view2');
					var grid = $('#'+this.id);
					var body = view.find('.uigrid-body')[0];
					var dragged = this.dragged = {
						header   : header,
						gl       : grid.offset().left,
						vl       : view.offset().left,
						vt       : view.offset().top,
						vw       : view.width(),
						vh       : view.height(),
						left     : _header.offset().left,
						top      : _header.offset().top,
						width    : _header.width(),
						height   : _header.height()
					};
					dragged.boxHeight = this.settings.lineHeight - (body.scrollWidth>body.clientWidth?17:0);
					dragged.diffx = e.pageX - dragged.left;
					dragged.diffy = e.pageY - dragged.top;
					dragged.vr = dragged.vl + dragged.vw - 20;
					dragged.vb = grid.offset().top + grid.width() - 20;
					dragged.max = dragged.vr - dragged.width;
					dragged.min = dragged.vl + 20;
					dragged.maxWidth = document.body.clientWidth - dragged.width;
					dragged.maxHeight = document.body.clientHeight - dragged.height - 10;
					this.createPopHeader(header).hide(header.index).getDragList();
				}
			},
			dragEnd: function(){
				if(this.dragged){
					var dragged = this.dragged, grid = this, el = $(dragged.el);
					if(dragged.inset&&typeof(dragged.inset==="number")&&dragged.inset!=dragged.index){
						var header = this.getHeaderByParam('index', dragged.inset);
						var _header = $('#'+header.id);
						this.animate(el, {
							left: _header.offset().left,
							top: _header.offset().top
						},300,function(){
							return grid.insetHeader(dragged.header, header.index, function(){
								el.remove();
							});
						});
					}else{
						this.animate(el, {
							left: dragged.left,
							top: dragged.top
						},300,function(){
							grid.show(dragged.header.index);
							el.remove();
						})
					}
				}
				this.removeBoxEl().dragged = null;
			},
			getDragList: function(){
				var dragged = this.dragged;
				var model = this.settings.rowModel.rowModelList;
				dragged.dragList = [];
				for(var i in model){
					var _model = model[i];
					var left = $('#' + _model.id).offset().left;
					if(left>dragged.min){
						if(left<dragged.max){
							dragged.dragList.push({left:left,index:_model.index});
						}else{
							break;
						}
					}
				}
				dragged.notGet = false;
				return this;
			},
			setDragBox: function(dragx){
				var dragged = this.dragged;
				var width = dragged.width;
				var i = 0, len = dragged.dragList.length, flg = true;
				for(i;i<len;i++){
					var _line = dragged.dragList[i];
					if(dragx>(_line.left - width)&&dragx<_line.left){
						if(!dragged.inset||_line.index!=dragged.inset){
							this.removeBoxEl();
							dragged.inset = parseInt(_line.index);
							$('#'+this.id).append(this.renderText(_defaults.dragBox,{
								left:_line.left-10-dragged.gl,
								height:dragged.boxHeight
							}));
						}
						flg = false;
						break;
					}
				}
				flg&&this.removeBoxEl();
				return this;
			},
			removeBoxEl: function(){
				$('#' + this.id + ' .ug-dragBox').remove();
				this.dragged.inset = null;
				return this;
			},
			insetHeader: function(_header, index, fn){
				if(_header&&index&&typeof(index)==="number"){
					var data = this.getAllData(), grid = this;
					this.header(function(header){
						var _index = parseInt(_header.index);
						index>_index&&index--;
						return grid.moveArray(header, _index, index);
					}).render(data).bind();
					fn&&typeof(fn)==="function"&&fn.call(this, _header);
				}
				return this;
			},
			//隐藏列
			hide: function(index, timer){
				var colIndex = this.settings.fixedRow[0];
				timer = parseInt(timer)||0;
				if(index&&typeof(index)==="number"&&colIndex<=index){
					index  -= colIndex;
					$('#' + this.id + ' .uigrid-view2 .uigrid-head th:eq(' + index + ')').fadeOut(timer);
					$('#' + this.id + ' .uigrid-view2 .uigrid-body>table>tbody>tr').each(function(){
						$('>td:eq(' + index + ')',this).fadeOut(timer);
					});
				}
				return this;
			},
			show: function(index, timer){
				var colIndex = this.settings.fixedRow[0];
				timer = parseInt(timer)||0;
				if(index&&typeof(index)==="number"&&colIndex<=index){
					index  -= colIndex;
					$('#' + this.id + ' .uigrid-view2 .uigrid-head th:eq(' + index + ')').fadeIn(timer);
					$('#' + this.id + ' .uigrid-view2 .uigrid-body>table>tbody>tr').each(function(){
						$('>td:eq(' + index + ')',this).fadeIn(timer);
					});
				}
				return this;
			},
			edit: function(name, fn1, fn2){
				var grid = this;
				$.each(['header', 'fixedRow', 'defaultPage', 'paginationPage'], function(){
					name==this&&typeof grid[name] === 'function'&&grid[name](fn1, fn2);
				});
				return this;
			},
			header: function(fn){
				var model = this.settings.rowModel.rowModelList;
				fn&&typeof(fn)==="function"&&(this.settings.rowModel.rowModelList = fn.call(this, model));
				this.createView().bindTitle().resize().scroll();
				return this;
			},
			remove: function(index){
				if(index&&typeof(index)==="number"){
					$('#' + this.id + ' .uigrid-head th:eq(' + index + ')').remove();
					$('#' + this.id + ' .uigrid-body>table>tbody>tr').each(function(){
						$('>td:eq(' + index + ')',this).remove();
					});
				}
				return this;
			},
			animate: function(el, properties, options, callback, easing){
				if(easing===undefined&&callback){
					if(typeof callback === 'string'){
						easing = callback;
						callback = null;
					}
				}
				$.each(el, function(){
					var stopped, animation = {
				    	el : this,
				        props : properties,
				        options : options,
				        startTime : Animate.now || Animate.getNow(),
				        tweens : [],
				    };
					for(var k in properties){
						animation.tweens.push(new Tween(properties[k], k, animation, easing));
					};
					var tick = function() {
				        if(stopped){
				            return false;
				        }
				        var remaining = Math.max(0, animation.startTime + animation.options - Animate.now),
				            temp = remaining / animation.options || 0,
				            percent = 1 - temp;
				        var len = animation.tweens.length;
				        for(var index = 0; index < len; index++){
				            animation.tweens[index].run(percent);
				        }
				        return percent <= 1 && len && remaining || false;
				    }
					Animate.timer(tick, callback, animation);
				})
			},
			scrollLeft: function(el){
				if(el){
					!(el instanceof $)&&(el = $(el));
					return el.scrollLeft();
				}
			},
			scrollMax: function(){
				return $('#'+this.id+' .uigrid-view2 .uigrid-body>table:not(.uigrid-fixed)').outerWidth(true) 
						- $('#'+this.id+' .uigrid-view2 .uigrid-body').outerWidth(true);
			},
			isAnimated: function(el){
				this;
			},
			stop: function(el){
				if(!el) return false;
				!(el instanceof $)&&(el = $(el));
				el.each(function(){
					var timers = Animate.timers;
					for(var j in timers){
						var timer = timers[j];
						if(timer.tween.el == this){
							timers.splice( j, 1 );
						}
					}
				});
			},
			fixedRow: function(colIndex, rowIndex){
				this.settings.fixedRow = [colIndex, rowIndex];
				var data = this.getAllData();
				this.addLoading().createView().bindTitle().render(data).resize().removeLoading().bind();
				return this;
			}
		};
		!window.uigridManager&&function(settings){
			window.uigridManager = settings;
		}({
			index : 0,
			uigridMap : {},
			setuigrid: function(grid){
				this.uigridMap[grid.id] = grid;
			},
			getuigrid: function(id){
				return this.uigridMap[id]||null;
			},
			getId: function(){
				return "ug" + (1000 + this.index++);
			}
		});
		$.fn.uigrid = function(settings) {
			var grid = null;
			this.each(function(i,n) {
				grid = new uiGrid(settings, this);
				$.extend(grid, uiGridHelper);
				uigridManager.setuigrid(grid);
				grid.configPages();
				grid.isshow = !$('#'+grid.id).is(':hidden')||
				typeof grid.settings.adaptHeight === 'number'?grid.resize()&&true:false;
				grid.createFinished();
				grid.settings.reload&&grid.load();
				return false;
			});
			return grid;
		};
		$.fn.getuigrid = function(all){
			var uigridMap = new uigridSeletor();
			this.each(function(){
				var uigrid = uigridManager.getuigrid(this.id);
				if(uigrid){
					uigridMap.push(uigrid);
				}
			});
			return all?uigridMap:uigridMap[0];
		};
		var uigridSeletor = function(){
			var uigrid = this;
			this.length = 0;
			this.name = 'uigrid';
			this.push = function(grid){
				uigrid[uigrid.length] = grid;
				uigrid.length ++;
			};
			this.resize = function(){
				for(var i = 0; i < uigrid.length; i++) {
					uigrid[i].resize();
                }
			};
		};
		function Row (data, grid, row){
			if(row&&row instanceof Row){
				this.index = row.children.length;
				this.id = row.id + '_' + this.index;
				this.level = row.level + 1;
				this.pid = row.id;
			}else{
				this.index = grid.row.length;
				this.id = grid.id + "_row_" + this.index;
				this.level = 0;
			}
			this.showBtns = false;
			this.data = data||{};
			this.checked = this.data.checked === true?true:false;
			this.plugins = [];
			this.view1_id = this.id + '_view1';
			this.view2_id = this.id + '_view2';
			this._id = '#' + this.view1_id + ',#' + this.view2_id;
		};
		Row.prototype = {
			unitNum: 20,
			create: function(grid, model) {
				var	view1 = {td: '', id: this.view1_id},
					view2 = {td: '', id: this.view2_id},
					colIndex = grid.settings.fixedRow[0],
					models = model.rowModelList;
				for(var i = 0; i < models.length; i++){
					var _model = models[i];
					var text = this.getRowText(_model, grid);
					i<colIndex?view1.td += text:view2.td += text;
				}
				this.rowFilter(model.rowFilter);
				var className = grid.striped(this.index);
				className += this.className?className?' '+this.className:this.className:'';
				view2.rowClass = view1.rowClass = className?'class="'+className+'"':'';
				return {
					view1: grid.renderText(_defaults.tr, view1),
					view2: grid.renderText(_defaults.tr, view2)
				};
			},
			getRowText: function(model, grid){
				var type = model.type;
				return model.show?type=="index"?this._index(model, grid):this[type]&&typeof this[type] === 'function'?
					this[type](grid):this.createRowText(model, grid):'';
			},
			checkbox: function(grid){
				var datas = {};
				this.checked&&(datas.checked = 'checked="' + this.checked + '"');
				this.checkId = datas.checkId = this.id + '_check';
				this.type = 'checkbox';
				datas.content = grid.renderText(_defaults.checkbox, datas);
				datas.className = 'class="' + _defaults.checkClassName + '"';
				return grid.renderText(_defaults.td, datas);
			},
			radio: function(grid){
				var datas = {};
				this.checked&&(datas.checked = 'checked="' + this.checked + '"');
				this.checkId = datas.checkId = this.id + '_radio';
				this.type = 'radio';
				datas.radioName = grid.id + '_radio';
				datas.content = grid.renderText(_defaults.radio, datas);
				datas.className = 'class="' + _defaults.checkClassName + '"';
				return grid.renderText(_defaults.td, datas);
			},
			_index: function(model, grid){
				var datas = {}, data = this.data;
				datas.content = data.index?data.index:(this.index+1);
				data.index = datas.content;
				datas.className = 'class="index"';
				datas.style = "text-align:" + grid.getAlign(model.align) + ";";
				datas.style += "width:" + model.width + "px;";
				datas.content = grid.renderText(_defaults.content, datas);
				return grid.renderText(_defaults.td, datas);
			},
			operate: function(grid){
				var datas = {};
				datas.className = 'class="uigrid-operate"';
				datas.content = this.createBtn(grid, this.data);
				return grid.renderText(_defaults.td, datas);
			},
			createRowText: function(model, grid){
				if(model.header){
					var datas = {style: '', index: model.index},
						content = _defaults.content,
						data = this.data;
					model.edit?datas = this.edit(model, data, grid):datas.title = 
					datas.content = grid.trim(data[model.property]);
					datas.style += "text-align:" + grid.getAlign(model.align) + ";";
					var width = datas.width||model.width;
					if(model.type=="tree"){
						datas.className = 'class="ui-tree"';
						datas.treeIcon = data.children?"tree_open":data.isParent?"tree_close":"tree_child";
						var marginLeft = this.level*this.unitNum;
						width = width - marginLeft
						datas.style += "width:" + width + "px;margin-left:" + marginLeft + "px;"
						content = _defaults.treeContent;
					}else{
						model.type=="link"&&(datas.className = 'class="uigrid-link"',
						datas.content = "<a>" + datas.content + "</a>");
						datas.style += "width:" + width + "px;";
					}
					datas.content = grid.renderText(content, datas);
					return grid.renderText(_defaults.td, datas);
				}else{
					return '';
				}
			},
			createBtn: function(grid, data){
				var TPL = '<div><div>{buttons}{icon}</div></div>',
					datas = {}, filter = grid.settings.operateFilter,len = 0;
				datas.buttons = "";
				this.operate = {};
				for(var i in grid.settings.operate){
					var _operate = grid.settings.operate[i];
					this.operate[_operate.code] = new operate(_operate, i);
				}
				if(filter&&typeof(filter)==="function"){
					try{
						filter.call(this, data);
					}catch(e){
						console.error(e.stack);
					}
				}else{
					this.showBtns = true;
				}
				for(var j in this.operate){
					var button = this.operate[j], _data = {};
					if((button.show&&typeof(button.show)==="boolean"&&!button.deleted)||this.showBtns){
						len ++ ;
						_data.name = button.name;
						button.id && (_data.id = 'id="'+button.id+'"');
						button.code && (_data.code = 'code="'+button.code+'"');
						button.type && (_data.className = 'class="'+button.type+'"');
						datas.buttons += grid.renderText(_defaults.btnList, _data);
					}
				}
				len>2&&(datas.icon = '<i class="icon-angle-double-down"></i>');
				return grid.renderText(TPL, datas);
			},
			//设置表格行的各类属性
			rowFilter: function(filter){
				filter&&typeof filter === 'function'&&filter.call(this)
				return this;
			},
			edit: function(model, data, grid){
				var datas = {}, type = model.edit.type, gridId = grid.id;
				var edits = type&&typeof type=== 'string'&&_defaults.edit[type]?
				$.extend({}, _defaults.edit[type], model.edit):model.edit;
				var plugins = new gridPlugin(model, edits, gridId, data);
				this.plugins.push(plugins);
				datas.content = plugins.enabled?edits.create&&typeof edits.create === "function"?
				edits.create.call(plugins, data, grid):edits.format&&typeof edits.format === "string"?
				grid.renderText(edits.format, plugins):'':grid.trim(data[model.property]);
				datas.style = edits.parentStyle||'';
				datas.width = plugins.parentWidth;
				return datas;
			},
			getPlugin: function(index){
				var plugin = this.plugins;
				for(var i=0; i<plugin.length; i++){
					var _plugin = plugin[i];
					if(_plugin.index==index){
						return _plugin;
					}
				};
				return null;
			},
			getPluginByParam: function(param, content){
				var plugin = this.plugins;
				for(var i=0; i<plugin.length; i++){
					var _plugin = plugin[i];
					if(_plugin[param]==content){
						return _plugin;
					}
				};
				return null;
			},
			reset: function(){
				var data = this.data;
				$(this._id).find('input[type=text]').each(function(){
					if(this.name){
						data[this.name] = this.value;
					}
				}).end().find('input[type=hidden]').each(function(){
					if(this.name){
						data[this.name] = this.value;
					}
				}).end().find('select').each(function(){
					if(this.name){
						data[this.name] = this.value;
					}
				});
				return this;
			}
		};
		function gridPlugin(model, edit, gridId, data){
			this.property = model.property;
			this.width = model.width;
			data[this.property]&&(this.value = data[this.property]);
			for(var i in edit){
				this[i] = edit[i];
			}
			this.index = model.index;
			typeof this.enabled !== "boolean"&&(this.enabled = true);
			this.parentOffset = this.getNumber(this.parentOffset);
			this.offset = this.getNumber(this.offset);
			this.done = this.done&&typeof this.done === "function"?this.done:null;
			this.resize = this.resize&&typeof this.resize === "function"?this.resize:null;
			this.id = gridId+'_'+(this.type||('plugin'+this.index))+'_'+(_defaults.editIndex++)
			this.parentWidth = this.width +　this.parentOffset;
			this.style = 'width:' + (this.parentWidth + this.offset) + 'px;';
			this.type&&this[this.type]&&this[this.type](model);
			this.beforeCreate&&typeof this.beforeCreate === "function"&&this.beforeCreate(data);
		};
		gridPlugin.prototype = {
			getNumber: function(num){
				return num&&typeof num === 'number'&&num!=NaN?num:0;
			},
			date: function(model){
				var settings = {}, option = model.edit;
				$.each(['minDate', 'maxDate'], function(){
					option[this]&&(settings[this] = option[this])
				});
				this.settings = settings;
			},
			upload: function(model){
				var file = model.property||'';
				this.progressId = this.id + '_progress';
				this.fileId = this.id + '_file';
				this.name = file + 'fileName';
                this.url = file + 'fileUrl';
			}
		};
		function operate(settings, i){
			this.index = parseInt(i);
			this.code = settings.code;
			this.name = settings.name;
			this.show = false;
			this.type = settings.type;
			this.click = settings.click;
			this.deleted = settings.deleted;
		};
		function Tween(value, prop, animate, easing){
			this.el = animate.el;
			this.prop = prop;
			this.easing = easing==="linear"?easing:"swing";
			this.options = animate.options;
			this.start = this.now = this.get();
			this.end = value;
			this.unit = "px";
		}
		Tween.prototype = {
			getStyles: function(el){
				return el.ownerDocument.defaultView.getComputedStyle(el, null);
			},
			get: function(){
				var ret = null;
				if(this.prop=='scrollLeft'||this.prop=='scrollTop'){
					ret = this.el[this.prop];
				}else{
					var computed = this.getStyles(this.el);
					ret = computed.getPropertyValue(this.prop) || computed[this.prop];
				}
				return parseFloat(ret||0);
			},
			swing: function(p){
				return 0.5 - Math.cos(p * Math.PI) / 2;
			},
			linear: function(p){
				return p;
			},
			run: function(percent){
				var eased = this[this.easing](percent);
				this.pos = eased;
				this.now = (this.end - this.start) * eased + this.start;
				if(this.prop=="opacity"){
					try{
						if(this.el.filters){
							this.el.filters("alpha").opacity = this.now * 100; 
						}else{
							this.el.style.opacity = this.now;
						}
					}catch(e){}
				}else if(this.prop=="scrollLeft"||this.prop=='scrollTop'){
					this.el[this.prop] = this.now;
				}else{
					this.el.style[this.prop] = this.now + this.unit;
				}
				return this;
			}
		};
		var Animate = {
			timers: [],
			getNow: function(){
				setTimeout(function(){
					Animate.now = undefined;
				});
				return (Animate.now = Date.now());
			},
			timer: function(timer, callback, tween){
				Animate.timers.push({timer: timer, callback: callback, tween: tween});
				timer()?Animate.start():Animate.timers.pop();
			},
			start: function(){
				if(!Animate.timerId){
					Animate.timerId = setInterval(Animate.tick, 13);
				}
			},
			stop: function(){
				clearInterval(Animate.timerId);
				Animate.timerId = null;
			},
			tick: function(){
				var timers = Animate.timers;
				Animate.now = Date.now();
				for(var i in timers){
					var timer = timers[i];
					!timer.timer() && timers[i] === timer && timers.splice(i--, 1) &&
					timer.callback && typeof(timer.callback)=="function" && timer.callback();
				}
				!timers.length && Animate.stop();
				Animate.now = undefined;
			}
		};
		$.fn.hideCompute = function(type) {
			var seletor = new hideHeightSeletor();
			this.each(function(i,n) {
				var elems = $(this).parents(':hidden');
				if(elems.length>0){
					var elem = elems.eq(elems.length-1);
					var _elem = seletor.cloneElement(this, elem);
					elem.after(_elem);
					var _el = $('#'+seletor.id).parents(':hidden').show().end();
					seletor.compute(_el);
					_elem.remove();
				}else{
					seletor.compute($(this));
				}
				return false;
			});
			return seletor[type]||0;
		};
		var hideHeightSeletor = function(){
			this.count = 0;
			this.cloneElement = function(el, parent){
				this.id = 'hideHSlt_'　+　this.count++;
				this._id = el.id||null;
				el.id = this.id;
				var _parent = parent.clone();
				this._id?el.setAttribute('id', this._id):el.removeAttribute('id');
				_parent.css({display:"block",visibility:"hidden",position: "absolute",top: -9999});
				return _parent;
			};
			this.compute = function(el){
				this.width = el.width();
				this.outerWidth = el.outerWidth(true);
				this.height = el.height();
				this.outerHeight = el.outerHeight(true);
				return this;
			};
		};
	}(jQuery);
})