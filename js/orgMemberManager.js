var swTree = require("swTree");

var bootstrapTable = require("bootstrapTable");

require("bootstrapTableLang");

var SweetSlider = require("sweetSlider");
var scrollBar = require("scrollBar");
var validForm = require("Validform");

//获取常规bootstrap-table 配置项
var commonTbOption = require("commonTableOption");


var SweetSelect = require("sweetSelect");


var tableEvents = {
    'click .detail': function(e, value, row, index) {

    }
};

// 批量选择数组
var users;
var tabRefresh;
// 获取展开状态节点
var z_treeOpen = [];
template.helper('arrayToString', function(data, splite) {
    splite = splite ? splite : '';
    return data.join(splite);
});
// 标签添加人员
// 域名操作 新增，删除
var domainEdit = {
    init: function(ele, data) {
        this.$selector = $(ele);
        this.$listBody = this.$selector.find('.domain-edit-body');
        this.$data = data;
        // 是否开启域管理
        this.$acitve = false;

        this.render();
        this.events();
    },
    events: function() {
        this.$selector.on('click', '.add-domain-btn', $.proxy(this.add, this));
        this.$selector.on('click', '.del-domain-btn', $.proxy(this.delete, this));
    },
    render: function() {
        var that = this;
        that.getDomainStatus().done(function(statusData) {
            if (statusData.data) {
                that.$acitve = true;
                that.$selector.removeClass('hide');
                that.getDomain().done(function(domainListData) {
                    that.$domainListData = domainListData.data ? domainListData.data : [];
                    that.tpl();
                });
            } else {
                that.$acitve = false;
                that.$selector.addClass('hide');
            }
        });
    },
    // 获取AD域开启状态
    getDomainStatus: function() {
        return SWXHR.GET('/management-center/tenant/domain-account-supported');
    },
    // 获取域列表
    getDomain: function() {
        return SWXHR.GET('/management-center/tenant/ad/list');
    },
    // 域账号列表模板
    tpl: function(mode) {
        var that = this,
            domainData = mode === "append" ? [] : that.$data ? that.$data : [],
            tplData = {
                domainList: that.$domainListData,
                domainData: domainData
            },
            html = template('domainEditItemTpl', tplData);
        console.log(tplData);
        if (mode === "append") {
            that.$listBody.append(html);
        } else {
            that.$listBody.html(html);
        }

    },
    // 添加域账号
    add: function() {
        this.tpl('append');
    },
    // 删除域账号
    delete: function(ev) {
        SWTOOL.stopPropagation(ev);

        var self = $(ev.currentTarget),
            parentItem = self.parents('.domain-edit-item');
        parentItem.remove();
    },
    // 获取域账号
    getData: function() {
        var that = this;
        if (!that.$acitve) return false;
        var item = that.$listBody.find('.domain-edit-item'),
            data = [],
            newDomainList = {};

        for (var i = 0; i < that.$domainListData.length; i++) {
            newDomainList[that.$domainListData[i].tenantActiveDirectoryId] = that.$domainListData[i].domainName;
        }

        item.each(function() {
            var self = $(this),
                accout = $.trim(self.find('.form-domain-account').val());
            if (accout) {
                data.push({
                    domainAccount: accout,
                    domainId: self.find('.form-domain-name').val()
                });
            }

        });
        console.log(data);
        return data;
    }
};

// 新增人员&添加人员
var sliderAction = {

    init: function() {
        this.initSlider();
        this.isOpen = false;
    },
    initSlider: function() {
        var that = this;
        $('#addMember').on('click', function() {
            if (!orgMemberManagerAction.label) {
                that.open();
                that.isOpen = true;
            } else {
                that.addUserByRoleSlider();
                that.isOpen = true;
            }

        });

    },
    addUserByRoleSlider: function() {
        var _this = this;
        _this.sliderLabel = SweetSlider.open({
            title: "新增人员",

            btns: ['确定', '取消'],
            btnsClass: ['btn-primary', 'btn-default sw-close'],
            btnFn: [_this.addUserSubmit],
            onOpen: function(slider) {
                var html = template("addUserByRole-tpl", {});
                slider.sliderBody.html(html);
                _this.getOrgUserList();
                $('.adminSearch').on('input', function() {
                    var val = $(this).val();
                    _this.getOrgUserList(val);
                });
            },
            onClose: function() {
                _this.sliderLabel.isOpen = false;
                _this.isOpen = false;
            },
            events: {}
        });
        _this.sliderLabel.isOpen = true;
    },
    getOrgUserList: function(key) {
        let isFirst = true;
        var _this = this;
        _this.checkUserList = [];
        let url = '';
        let data = {};
        if (key) {
            url = '/management-center/tenant/user/';
            data = {
                key: key,
                pageNum: 1,
                pageSize: 10
            };
            SWXHR.GET(url, data, 'json').done(function(res) {
                if (res.code === 'success') {
                    var data = res.data ? res.data.items : null;
                    _this.addUserByRoleTree = swTree.init(data, "#addUserByRole-tree", {
                        data: {
                            key: {
                                name: "nickName"
                            },
                            simpleData: {
                                enable: true,
                                idKey: "userId",
                                pIdKey: "   "
                            }
                        },
                        check: {
                            autoCheckTrigger: true,
                            enable: true,
                            chkboxType: {
                                "Y": "ps",
                                "N": "ps"
                            },
                            chkStyle: "checkbox"
                        },
                        callback: {

                            beforeCheck: function(treeId, treeNode) {
                                return true;
                            },
                            onCheck: function(event, treeId, treeNode) {
                                console.log(treeNode)
                                _this._checkUser(treeNode);

                            }
                        }
                    });
                }
            });
        } else {
            url = "/management-center/tenant/org/";
            data = {};
            SWXHR.GET(url, data, "JSON")
                .done(function(data) {
                    if (data.code == "success") {
                        _this.addUserByRoleTree = swTree.init(false, "#addUserByRole-tree", {
                            data: {
                                key: {
                                    name: "orgName"
                                },
                                simpleData: {
                                    enable: true,
                                    idKey: "tenantOrgId",
                                    pIdKey: "parentId"
                                }
                            },
                            check: {
                                autoCheckTrigger: true,
                                enable: true,
                                chkboxType: {
                                    "Y": "ps",
                                    "N": "ps"
                                },
                                chkStyle: "checkbox"
                            },
                            async: {
                                enable: true,
                                type: "GET",
                                dataFilter: function(treeId, parentNode, responseData) {
                                    if (responseData.code == "success") {
                                        if (isFirst) {
                                            responseData.data = {
                                                "userList": [],
                                                "orgList": [{
                                                    "tenantOrgId": -1,
                                                    "orgName": frameAction.session_info.currentTenant.tenantName,
                                                    "parentId": -2
                                                }]
                                            };
                                            isFirst = false;
                                        }
                                        if (parentNode) parentNode.isGetUser = 1;
                                        else parentNode = new Object();
                                        if (responseData.data.orgList.length == 0 && responseData.data.userList.length == 0) {
                                            parentNode.isParent = false;
                                            _this.addUserByRoleTree.updateNode(parentNode);
                                        } else {
                                            return _this._buildUserlistByOrg(parentNode, responseData.data);
                                        }
                                    }
                                }
                            },
                            callback: {
                                beforeExpand: function(treeId, treeNode) {
                                    if (!treeNode.isGetUser) {
                                        _this.addUserByRoleTree.setting.async.url = "/management-center/tenant/org/" + treeNode.tenantOrgId + "/user-org";
                                        _this.addUserByRoleTree.reAsyncChildNodes(treeNode, "!refresh");
                                    }
                                    return true;
                                },
                                beforeCheck: function(treeId, treeNode) {
                                    return true;
                                },
                                onCheck: function(event, treeId, treeNode) {
                                    //选中
                                    if (treeNode.checked) {
                                        _this.addUserByRoleTree.expandNode(treeNode, true, false, false, true)
                                    }
                                    //取消
                                    else {
                                        _this._removeUserByNode(treeNode);
                                        _this.cancleChoose(treeNode.tenantOrgId);
                                    }

                                    if (treeNode.type === "role-user")
                                        _this._checkUser(treeNode);
                                },
                                onAsyncSuccess: function(event, treeId, treeNode, msg) {
                                    if (!treeNode) {
                                        //根节点加载
                                        var nodes = _this.addUserByRoleTree.getNodes();
                                        for (var i = 0; i < nodes.length; i++) {
                                            if (nodes[i].type != "role-user") {
                                                nodes[i].isParent = true;
                                                _this.addUserByRoleTree.updateNode(nodes[i]);
                                            }
                                        }
                                    } else {
                                        if (treeNode.type != "role-user") {
                                            var childs = treeNode.children;
                                            _this.changeParentStatus(treeNode, childs);
                                        }

                                    }
                                }
                            }
                        });
                        _this.addUserByRoleTree.setting.async.url = "/management-center/tenant/org/-1/user-org";
                        _this.addUserByRoleTree.reAsyncChildNodes();
                    }
                });
        }

    },
    expandNodes: function(nodes) {
        for (var i = 0; i < nodes.length; i++) {
            _this.addUserByRoleTree.expandNode(nodes[i]);
        }
    },
    changeParentStatus: function(parent, nodes) {
        var _this = this;
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].type != "role-user") {
                nodes[i].isParent = true;
                if (parent.checked) {
                    _this.addUserByRoleTree.checkNode(nodes[i]);
                    _this.addUserByRoleTree.expandNode(nodes[i], true, false, false, true)
                } else {
                    _this.addUserByRoleTree.updateNode(nodes[i]);
                }

            }
        }
    },
    _buildUserlistByOrg: function(parentNode, obj) {
        var _this = this;
        var results = new Array(),
            userList = obj.userList,
            orgList = obj.orgList;

        if (userList) {
            for (var i = 0; i < userList.length; i++) {
                var str = {
                    orgName: userList[i].nickName,
                    tenantOrgId: "u" + userList[i].userId,
                    parentId: parentNode.tenantOrgId,
                    type: "role-user",
                    checked: parentNode.checked ? true : false,
                    nocheck: false
                };
                if (str.checked)
                    _this._putUser(str);
                results.push(str);
            }
        }

        if (orgList) {
            for (var i = 0; i < orgList.length; i++) {
                results.push(orgList[i]);
            }
        }
        return results;
    },
    _putUser: function(obj) {
        var _this = this;
        var arr = _this.checkUserList;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].tenantOrgId === obj.tenantOrgId) {
                return;
            }
        }
        _this.checkUserList.push(obj);
        _this._showCheckUser();
    },
    _showCheckUser: function() {
        var _this = this;
        var html = template("checkUserList-tpl", {
            data: _this.checkUserList
        });
        $("#checkUserList-div").html(html);
    },
    _checkUser: function(treeNode) {
        var _this = this;
        if (treeNode.checked)
            _this._putUser(treeNode);
    },
    _removeUserByNode: function(treeNode) {
        var _this = this;
        if (treeNode.type === "role-user") {
            for (var i = 0; i < _this.checkUserList.length; i++) {
                if (_this.checkUserList[i].tenantOrgId == treeNode.tenantOrgId) {
                    _this.checkUserList.splice(i, 1);
                }
            }
        }
        _this._showCheckUser();
    },
    cancleChoose: function(id) {
        var _this = this;
        var currentNode = _this.addUserByRoleTree.getNodesByParam("tenantOrgId", id);
        for (var index = 0; index < currentNode.length; index++) {
            if (currentNode[index].tenantOrgId === id) {
                _this.addUserByRoleTree.checkNode(currentNode[index], false, false, true);
            }
        }
    },
    _checkUserNode: function(id) {
        var _this = this;
        var currentNode = _this.addUserByRoleTree.getNodesByParam("tenantOrgId", id);
        for (var index = 0; index < currentNode.length; index++) {
            if (currentNode[index].tenantOrgId === id) {
                _this.addUserByRoleTree.checkNode(currentNode[index], false, true, true);


            }
        }

    },
    _removeAllUser: function() {
        var _this = this;
        var arr = $.extend([], _this.checkUserList);
        for (var i = 0; i < arr.length; i++) {
            var tenantOrgId = arr[i].tenantOrgId;
            _this._removeUserByNode({
                tenantOrgId: tenantOrgId,
                type: "role-user"
            });
            _this._checkUserNode(tenantOrgId);
        }
    },
    _getUserIds: function() {
        var results = new Array(),
            _this = this;
        for (var i = 0; i < _this.checkUserList.length; i++) {
            if (_this.checkUserList[i].tenantOrgId) {
                results.push(_this.checkUserList[i].tenantOrgId.replace("u", ""));
            } else {
                results.push(_this.checkUserList[i].userId);
            }

        }
        return results.join(",");
    },
    cancelSelectUser: function($this) {
        var _this = this;
        _this._removeUserByNode({
            tenantOrgId: $this.attr("data-id"),
            type: "role-user"
        });
        _this._checkUserNode($this.attr("data-id"));
    },
    addUserSubmit: function() {
        var _this = sliderAction,
            userIds = _this._getUserIds();
        var data = {
            userIds: userIds,
            tenantLabId: orgMemberManagerAction.currentNewNode.tenantLabId
        };
        if (userIds) {
            SWXHR.POST("/management-center/tenant/label/user/by-users", data, 'json')
                .done(function(data) {
                    if (data.code == "success") {
                        _this.sliderLabel.close();
                        SWTOOL.layer.success("新增成功");
                        orgMemberManagerAction.dataTable.refresh({
                            tenantLabId: orgMemberManagerAction.currentNewNode.tenantLabId
                        });
                    }
                });
        } else {
            SWTOOL.layer.msg("没有选择用户");
        }
    },
    open: function() {
        var that = this;
        that.slider = SweetSlider.open({
            title: "新增人员",
            exclude: [".sweetSelect-box"],
            btns: ['确定', '取消'],
            btnsClass: ['btn-primary', 'btn-default sw-close'],
            btnFn: [that.events.btnFn1, that.events.btnFn2],
            onOpen: that.onOpen,
            onClose: function() {
                that.isOpen = false;
            },
            events: {
                'click .inside-btn': that.events.insideBtnEvt,
                'click #changeBody': that.changeBody
            }
        });
    },
    events: {
        btnFn1: function(slider) {
            $('#addUserForm').submit();
        },
        btnFn2: function(slider) {

        },
        insideBtnEvt: function() {

        }
    },
    addUser: function() {
        var that = this;
        var data = SWTOOL.formartFormData('.addUserTpl');
        data.domainAccountJson = JSON.stringify(domainEdit.getData());

        SWXHR.POST('/management-center/tenant/user/', data).done(function(res) {
            if (res.code == 'success') {
                $('#data-table').bootstrapTable("refresh");
                SWTOOL.layer.success('添加成功');
                that.slider.close();
            } else {
                SWTOOL.layer.msg(res.message);
            }
        });
    },
    onOpen: function(slider) {
        var that = this;
        var bodyHtml = template('addUserTpl', {});
        slider.sliderBody.html(bodyHtml);
        $('#addUserForm').Validform({
            ajaxPost: true,
            tiptype: function(msg, o, cssctl) {
                if (o.type === 3) {
                    o.obj.parent().addClass('has-error');
                    o.obj.next('.form-inline-error-msg').remove();
                    o.obj.after('<span class="form-inline-error-msg">' + msg + '</span>');
                } else {
                    o.obj.parent().removeClass('has-error');
                    o.obj.next('.form-inline-error-msg').remove();
                }
            },
            beforeSubmit: function(curform) {
                sliderAction.addUser();
                return false;
            }
        });
        var obj = {
            tenantOrgId: sliderAction.data.tenantOrgId,
            orgName: sliderAction.data.orgName
        };
        new SweetSelect("#addMo", {
            multiSelect: true,
            search: {
                url: "/management-center/tenant/org/{keyword}/tenantOrgList",
                data: {},
                type: "GET",
                responseHandler: function(res) {
                    return res.data;
                }
            },
            st: {
                data: {
                    key: {
                        name: "orgName",
                    },
                    simpleData: {
                        enable: true,
                        idKey: "tenantOrgId",
                        pIdKey: "parentId"
                    }
                }
            },
            ss: {
                selectId: "tenantOrgId",
                selectName: "orgName"
            }
        }, orgMemberManagerAction.orgData);
        // 暂时不用,后期会加上
        domainEdit.init("#domainEdit", {});
    },
    changeBody: function() {
        var bodyHtml = template('sliderTpl', data);
        sliderAction.slider.loadContent(bodyHtml);
        new SweetSelect("#addMo", {
            search: {
                url: "/management-center/tenant/org/{keyword}/tenantOrgList",
                data: {},
                type: "GET",
                responseHandler: function(res) {
                    return res.data;
                }
            },
            st: {
                data: {
                    key: {
                        name: "orgName",
                    },
                    simpleData: {
                        enable: true,
                        idKey: "tenantOrgId",
                        pIdKey: "parentId"
                    }
                }
            },
            ss: {
                selectId: "tenantOrgId",
                selectName: "orgName"
            }
        }, orgMemberManagerAction.orgData);
    }
};



// 选中单个用户
var sliderInfor = {
    open: function(data) {

        var that = this;
        that.data = data;
        that.initOpts = {
            data: data,
            title: "详细资料",
            btns: ['禁用', '激活', '分配角色', '修改人员信息'],
            btnsClass: ['btn-default infor-btn changeStatus', 'btn-default infor-btn activate', 'btn-default infor-btn', 'btn-default infor-btn'],
            btnFn: that.btnEvents,
            onOpen: that.onOpen,
            onClose: function() {},
            events: {}
        };
        that.slider = SweetSlider.open(that.initOpts);
    },
    btnEvents: [
        function(slider) {
            var that = sliderInfor,
                data = that.data,
                tenantUserIds = data.userId,
                status;
            if (data.status === 0) {
                status = {
                    status: 'ENABLE'
                };
            } else {
                status = {
                    status: 'DISABLE'
                };
            }
            SWXHR.PUT('/management-center/tenant/user/' + tenantUserIds + '/status', status, 'json').done(function(res) {

                if (res.code == 'success') {
                    if (data.status === 0) {
                        data.status = 1;
                        $('.status').text('有效');
                        $('.changeStatus').text('禁用');
                        $('#data-table').bootstrapTable('refresh');
                    } else {
                        data.status = 0;
                        $('.changeStatus').text('启用');
                        $('.status').text('无效');
                        $('#data-table').bootstrapTable('refresh');
                    }

                }
            });
        },
        function(slider) {

        },
        function(slider) {
            selectRoleAction.init(slider, sliderInfor.data);
        },
        function(slider) {
            sliderInfor.changeBody();
        }
    ],
    onOpen: function(slider) {

        var that = sliderInfor;
        // 获取用户是否激活
        that.activated(that.data.activated);

        var data = that.data;
        console.log(data);
        if (data.roleList instanceof Array) {
            data.roleNameList = data.roleList.map(function(index, ele, arr) {
                return index.roleName;
            });
        }
        if (data.tenantOrgs instanceof Array) {
            data.tenantOrgsName = data.tenantOrgs.map(function(index, ele, arr) {
                return index.orgName;
            });
        }

        if (data.status === 0) {
            $('.changeStatus').text('启用');
        } else {
            $('.changeStatus').text('禁用');
        }


        bodyHtml = template('informationTpl', data);
        sliderInfor.slider.sliderBody.html(bodyHtml);

    },
    activated: function(activate) {
        /*激活功能暂时不做 先隐藏*/

        // if (activate === 1) {
        //     $('.activate').css('display', 'none')
        // }
        $('.activate').css('display', 'none');
    },
    renderBody: function(data) {
        var that = sliderInfor,
            opts = that.initOpts;
        opts.data = data;
        sliderInfor.data = data;
        sliderInfor.slider.reload(opts);
    },

    changeBody: function() {
        var that = this;
        var bodyHtml = template('editInforTpl', that.data);

        var infor = {
            title: "详细资料",
            content: bodyHtml,
            btns: ['确定', '取消'],
            btnsClass: ['btn-primary infor-btn', 'btn-default sw-close infor-btn'],
            btnFn: [
                function btn1() {
                    $('#editInforForm').submit();

                },
                function btn2() {

                }
            ]
        };
        sliderInfor.slider.reload(infor);
        // 暂时不用,后期会加上
        domainEdit.init("#domainEdit", that.data.domainAccountList);

        $('#editInforForm').Validform({
            ajaxPost: true,
            tiptype: function(msg, o, cssctl) {
                if (o.type === 3) {
                    o.obj.parent().addClass('has-error');
                    o.obj.next('.form-inline-error-msg').remove();
                    o.obj.after('<span class="form-inline-error-msg">' + msg + '</span>');
                } else {
                    o.obj.parent().removeClass('has-error');
                    o.obj.next('.form-inline-error-msg').remove();
                }
            },
            beforeSubmit: function(curform) {
                // if (!$('.addUserName').val()) {
                //     SWTOOL.layer.msg('请填写姓名');
                //     return
                // }
                var tenantUserId = that.data.userId;
                var domainIsRepeat = false;
                var domaiData = domainEdit.getData();
                var data = SWTOOL.formartFormData('.addUserTpl');
                if(domainEdit.getData()){
                     data.domainAccountJson = JSON.stringify(domainEdit.getData());
                }
                for (var i = 0; i < domaiData.length; i++) {
                    for (var j = 0; j < i; j++) {
                        if (domaiData[i].domainAccount == domaiData[j].domainAccount && domaiData[i].domainId == domaiData[j].domainId) {
                            domainIsRepeat = true;
                        }
                    }
                }
                if (domainIsRepeat) {
                    SWTOOL.layer.msg('域账号信息不允许相同！');
                    return false
                } else {
                    SWXHR.PUT('/management-center/tenant/user/' + tenantUserId + '/userinfo', data, 'json').done(function(res) {
                        if (res.code == 'success') {
                            SWTOOL.layer.success('修改成功');
                            $('#data-table').bootstrapTable("refresh");
                            that.slider.close();
                        } else if (res.code == 'gap.service.tenant.ad.DomainAccountAlreadyExists') {
                            SWTOOL.layer.msg(res.message);
                        } else {
                            SWTOOL.layer.msg('修改失败');
                        }
                    });
                    return false;
                }

            }
        });



        var obj = {
            tenantOrgId: that.data.tenantOrgId,
            orgName: that.data.orgName ? that.data.orgName : frameAction.session_info.currentTenant.tenantName
        };
        new SweetSelect("#addMo", {
            multiSelect: true,
            search: {
                url: "/management-center/tenant/org/{keyword}/tenantOrgList",
                data: {},
                type: "GET",
                responseHandler: function(res) {
                    return res.data;
                }
            },
            st: {
                data: {
                    key: {
                        name: "orgName",
                    },
                    simpleData: {
                        enable: true,
                        idKey: "tenantOrgId",
                        pIdKey: "parentId"
                    }
                }
            },
            ss: {
                selectId: "tenantOrgId",
                selectName: "orgName"
            }
        }, orgMemberManagerAction.orgData, that.data.tenantOrgs);
    }
};
// 批量选择
var sliderCheckMore = {
    open: function(data) {
        var that = this;
        that.data = data;
        that.slider = SweetSlider.open({
            data: data,
            exclude: [".layer-sw-ui", ".layui-layer-move", ".layui-layer-shade"],
            title: "批量选择",
            btns: ['调整部门', '删除人员'],
            btnsClass: ['btn-default amend-btn infor-btn', 'btn-default infor-btn'],
            btnFn: that.btnEvents,
            onOpen: that.onOpen,
            onClose: that.onClose,
            events: {}
        });
    },
    btnEvents: [
        function(slider) {
            sliderCheckMore.changeMain();
        },
        function(slider) {
            SWTOOL.layer.delete({
                title: "删除人员",
                content: "是否删除所选人员？"
            }, function() {
                var tenantUserIds = users.map(function(index, ele) {
                    return index.userId;
                });
                var data = SWTOOL.formartFormData('.changeTenant-form');
                if (!orgMemberManagerAction.label) {
                    SWXHR.DELETE('/management-center/tenant/user/' + tenantUserIds + '/').done(function(res) {
                        if (res.code == 'success') {
                            SWTOOL.layer.success('删除成功');
                            sliderCheckMore.slider.close();
                            $('#data-table').bootstrapTable("refresh");

                        } else {
                            SWTOOL.layer.msg('删除失败');
                            return;
                        }
                    });
                } else {
                    data = {
                        userIds: tenantUserIds

                    };
                    SWXHR.DELETE('/management-center/tenant/label/user/' + orgMemberManagerAction.currentNewNode.tenantLabId + '/by-users?userIds=' + tenantUserIds, {}, 'json').done(function(res) {
                        if (res.code == 'success') {
                            SWTOOL.layer.success('删除成功');
                            sliderCheckMore.slider.close();
                            $('#data-table').bootstrapTable("refresh", {
                                query: {
                                    tenantLabId: orgMemberManagerAction.currentNewNode.tenantLabId
                                },
                            });
                        } else {
                            SWTOOL.layer.msg('删除失败');
                            return;
                        }
                    });
                }
            });


        },
        function(slider) {

        },
        function(slider) {

        }
    ],
    onOpen: function(slider) {
        var that = sliderCheckMore,
            data = that.data;
        data.forEach(function(e) {
            if (e.roleList instanceof Array) {
                e.roleNameList = e.roleList.map(function(index, ele, arr) {
                    return index.roleName;
                });
            }
            if (e.tenantOrgs instanceof Array) {
                e.tenantOrgsName = e.tenantOrgs.map(function(index, ele, arr) {
                    return index.orgName;
                });
            }
        });
        var bodyHtml = template('checkMoreTpl', {
            users: data
        });
        slider.sliderBody.html(bodyHtml);
        sliderCheckMore.event();
        if (orgMemberManagerAction.label) {
            $('.amend-btn').addClass('amend-show');
        } else {
            $('.amend-btn').removeClass('amend-show');
        }
    },
    changeBody: function() {
        var that = sliderCheckMore,
            data = users;
        if (data.length === 0 && that.slider.getStatus()) {
            that.slider.close();
        } else {
            data.forEach(function(e) {
                if (e.roleList instanceof Array) {
                    e.roleNameList = e.roleList.map(function(index, ele, arr) {
                        return index.roleName;
                    });
                }
                if (e.tenantOrgs instanceof Array) {
                    e.tenantOrgsName = e.tenantOrgs.map(function(index, ele, arr) {
                        return index.orgName;
                    });
                }
            });
            var bodyHtml = template('checkMoreTpl', {
                users: data
            });
            var infor = {
                content: bodyHtml
            };
            sliderCheckMore.slider.reload(infor);
            that.event();
        }
        if (orgMemberManagerAction.label) {
            $('.amend-btn').addClass('amend-show');
        } else {
            $('.amend-btn').removeClass('amend-show');
        }
    },
    onClose: function() {
        var that = sliderCheckMore;
        $('#data-table').bootstrapTable("uncheckAll");
    },
    changeMain: function() {
        var that = this;
        var bodyHtml = template('changeTenantTpl', {
            users: that.data
        });
        var infor = {
            title: "调整部门",
            content: bodyHtml,
            btns: ['确定调整', '取消'],
            btnsClass: ['btn-primary infor-btn', 'btn-default sw-close infor-btn'],
            btnFn: [
                function btn1() {
                    var tenantUserIds = users.map(function(index, ele) {
                        return index.userId;
                    });
                    var data = SWTOOL.formartFormData('.changeTenant-form');
                    if (data.tenantOrgIds) {
                        SWXHR.PUT('/management-center/tenant/user/' + tenantUserIds + '/org', data, 'json').done(function(res) {
                            if (res.code == 'success') {
                                SWTOOL.layer.success('修改成功');
                                sliderCheckMore.slider.close()
                                $('#data-table').bootstrapTable("refresh");
                            } else {
                                SWTOOL.layer.msg('修改失败');
                                return;
                            }
                        });
                    }else{
                        SWTOOL.layer.msg('请选择部门!');
                        return
                    }

                },
                function btn2() {

                }
            ]
        };
        sliderCheckMore.slider.reload(infor);
        var obj = {
            tenantOrgId: orgMemberManagerAction.dataTable.currentNode.tenantOrgId,
            orgName: orgMemberManagerAction.dataTable.currentNode.orgName
        };
        new SweetSelect("#addMo", {
            multiSelect: true,
            search: {
                url: "/management-center/tenant/org/{keyword}/tenantOrgList",
                data: {},
                type: "GET",
                responseHandler: function(res) {
                    return res.data;
                }
            },
            st: {
                data: {
                    key: {
                        name: "orgName",
                    },
                    simpleData: {
                        enable: true,
                        idKey: "tenantOrgId",
                        pIdKey: "parentId"
                    }
                }
            },
            ss: {
                selectId: "tenantOrgId",
                selectName: "orgName"
            }
        }, orgMemberManagerAction.orgData);
    },
    event: function() {
        $('.checkMore').hover(function() {
            $(this).children('.checkMoreHover').show();
        }, function() {
            $(this).children('.checkMoreHover').hide();
        });
        $('.checkMoreHover-i').hover(function() {
            $(this).css('color', 'red');
        }, function() {
            $(this).css('color', 'rgba(0,0,0,0.50)');
        });
        $('.checkMoreHover-i').each(function(index, ele) {
            $(this).click(function() {
                var userId = $(this).attr('data-userid');
                userId = parseInt(userId);
                $('#data-table').bootstrapTable('uncheckBy', {
                    field: 'userId',
                    values: [userId]
                });
            });
        });


    }
};
var orgMemberManagerAction = {
    init: function() {
        var _this = this;
        _this.isFirst = true;
        // _this.label = false;

        // _this.events.init();
        _this.getOrgList();
        sliderAction.init();
        //_this.scrollSet();

    },
    // scrollSet: function(argument) {
    //     $("#app_auth_auth_tree").mCustomScrollbar({
    //         scrollInertia: 100,
    //         theme: "minimal-dark",
    //         autoHideScrollbar: true
    //     });
    //     $("#app_auth_package_tree").mCustomScrollbar({
    //         scrollInertia: 100,
    //         theme: "minimal-dark",
    //         autoHideScrollbar: true
    //     });
    // },
    getOrgList: function(keyword) {
        var _this = this;
        if (keyword) {
            SWXHR.GET("/management-center/tenant/org/" + keyword + "/tenantOrgList", {}, "JSON")
                .done(function(data) {
                    if (data.code == "success") {
                        _this.ztree(data.data);
                    }
                });
        } else {
            var data = {
                label: false
            };
            var html = template('searchOrg-tpl', data);
            $('#searchOrg').html(html);
            _this.orgList("/management-center/tenant/org/");

        }
    },
    orgList: function(url, label) {
        var _this = this;
        SWXHR.GET(url, {}, "JSON")
            .done(function(data) {
                if (data.code == "success") {
                    data.data.unshift({
                        orgName: frameAction.session_info.currentTenant.tenantName,
                        parentId: "-2",
                        tenantOrgId: "-1",
                        esoption_li: '<li><a class="addorg">添加子部门</a></li>'
                    });
                    _this.orgData = data.data;
                    _this.ztree(data.data, label);
                }
            });
    },
    ztree: function(data, label) {
        var _this = this;
        var nodeConfigData = {
            key: {
                name: "orgName"
            },
            simpleData: {
                enable: true,
                idKey: "tenantOrgId",
                pIdKey: "parentId"
            }
        };
        var optionLi = '<li><a class="addorg">添加子部门</a></li>' + '<li><a class="editorg">编辑部门</a></li>' + '<li><a class="preMoveTreeeNode">上移</a></li>' + '<li><a class="nextMoveTreeeNode">下移</a></li>' + '<li><a class="deleteorg">删除</a></li>';
        
        $('.rightmain').removeClass('sw-empty-container');
        var stree = swTree.init(data, "#app_auth_auth_tree", {
            swdata: {
                option_li: optionLi,
                callback: {
                    onClick: function(treeNode) {
                        sliderAction.data = treeNode;
                        sliderAction.activeParentNode = treeNode.getParentNode();
                        _this.getData(treeNode);
                        if (orgMemberManagerAction.isFirst) {
                            orgMemberManagerAction.dataTable.init(treeNode);
                            orgMemberManagerAction.isFirst = false;
                        } else {
                            orgMemberManagerAction.dataTable.refresh(treeNode);
                        }

                    }
                }
            },
            data: nodeConfigData,
            check: {
                enable: false,
                chkboxType: {
                    "Y": "",
                    "N": ""
                },
                chkStyle: "checkbox"
            },
            callback: {
                onExpand: function(event, treeId, treeNode) {
                    z_treeOpen.push(treeNode.tId);
                },
                onCollapse: function(event, treeId, treeNode) {
                    var index = z_treeOpen.indexOf(treeNode.tId);
                    z_treeOpen.splice(index, 1);
                }
            }
        });
        var nodes = stree.getNodes();
        var treeNodes = stree.transformToArray(nodes);
        for (var i = 0; i < z_treeOpen.length; i++) {
            for (var j = 0; j < treeNodes.length; j++) {
                if (z_treeOpen[i] === treeNodes[j].tId) {
                    treeNodes[j].open = true;
                }
            }

        }
        if (nodes.length !== 0) {
            var defaultNode = sliderAction.data ? sliderAction.data : treeNodes[0];
            parentNode = sliderAction.activeParentNode ? sliderAction.activeParentNode : nodes[0];
            parentNode = stree.getNodesByParam("tenantOrgId", parentNode.tenantOrgId)[0];

            if (parentNode) {
                stree.expandNode(parentNode, true);
                stree.expandNode(defaultNode, true);
            }
            if (data && data.length !== 0) {
                if (defaultNode.tenantOrgId) {
                    defaultNode = stree.getNodeByParam("tenantOrgId", defaultNode.tenantOrgId);
                    console.log(defaultNode);
                    defaultNode = defaultNode ? defaultNode : treeNodes[1];
                    $('#' + defaultNode.tId + "_a").trigger("click");
                } else {
                    defaultNode = stree.getNodeByParam("tenantLabId", defaultNode.tenantLabId);
                    defaultNode = defaultNode ? defaultNode : treeNodes[0];
                    $('#' + defaultNode.tId + "_a").trigger("click");
                }
            }
        }
        _this.stree = stree;
        return stree;
    },
    dataTable: {
        el: '#data-table',
        option: {
            toolbar: false,
            pagination: true,
            queryParams: function(queryParams) {
                if (!orgMemberManagerAction.dataTable.currentNode.tenantOrgId) {
                    if (tabRefresh) {
                        queryParams.pageNumber = 1;
                        queryParams.pageSize = 10;
                    }
                    return {
                        tenantLabId: orgMemberManagerAction.dataTable.currentNode.tenantLabId,
                        pageNum: queryParams.pageNumber,
                        pageSize: queryParams.pageSize
                    };


                } else {
                    if (tabRefresh) {
                        queryParams.pageNumber = 1;
                        queryParams.pageSize = 10;
                        orgMemberManagerAction.dataTable.searchKey = null;
                    }
                    if (orgMemberManagerAction.dataTable.searchKey) {
                        return {
                            key: orgMemberManagerAction.dataTable.searchKey,
                            pageNum: queryParams.pageNumber,
                            pageSize: queryParams.pageSize
                        };
                    } else {
                        return {
                            tenantOrgIds: orgMemberManagerAction.dataTable.currentNode.tenantOrgId,
                            key: orgMemberManagerAction.dataTable.searchKey,
                            pageNum: queryParams.pageNumber,
                            pageSize: queryParams.pageSize
                        };
                    }
                }

            },
            responseHandler: function(res) {
                var total = res.data ? res.data.total : 0,
                    items = res.data ? res.data.items : {};
                orgMemberManagerAction.dataTable.currentTotal = total;
                if (res.code == "NOT_LOGIN") {
                    window.location.href = "#/login";
                } else {

                    var newRes = {
                        "total": total,
                        "rows": items
                    };

                    $("#org-member-count").html("(" + total + "人)");
                    return newRes;
                }
            },
            onLoadSuccess: function() {
                tabRefresh = false;
            },
            columns: [{
                checkbox: true,
                width: "8%"
            }, {
                title: "姓名",
                field: "nickName",
                width: "20%",
                formatter: function(value, row, index) {
                    var avatar = row.avatar ? row.avatar : 'assets/images/head.png';
                    return "<img style='display:inline-block;border-radius:50%;margin-right:10px;' width=34 src='" + avatar + "'/><span>" + value + "</span>";
                }
            }, {
                field: 'phone',
                title: '手机号码',
                width: '15%'
            }, {
                field: 'status',
                title: '状态',
                width: '20%',
                formatter: function(value, row, index) {
                    var results1, results2;
                    if (value === 0) {
                        results1 = "<span>无效</span>";
                    } else {
                        results1 = "<span>有效</span>";
                    }
                    if (!row.activated) {
                        results2 = "<span class='m-l-5' style='font-size:14px;color:#EF7B39'>未激活<span>";
                    } else {
                        results2 = "";
                    }
                    return results1 + results2;
                }
            }],
            onCheck: function(data, ele) {
                var sliderOpen = function() {
                    users = $(orgMemberManagerAction.dataTable.el).bootstrapTable("getSelections");
                    var isOpen = sliderCheckMore.slider ? sliderCheckMore.slider.getStatus() : false;
                    if (isOpen) {
                        sliderCheckMore.data = users;
                        sliderCheckMore.changeBody();
                    } else {
                        sliderCheckMore.open(users);
                    }
                };

                if (sliderInfor.slider && sliderInfor.slider ? sliderInfor.slider.getStatus() : false) {
                    sliderInfor.slider.close(0, function() {
                        sliderOpen();
                    });
                } else if (sliderAction.slider && sliderAction.slider ? sliderAction.slider.getStatus() : false) {
                    sliderAction.slider.close(0, function() {
                        sliderOpen();
                    });
                } else if (sliderAction.sliderLabel && sliderAction.sliderLabel ? sliderAction.sliderLabel.getStatus() : false) {
                    sliderAction.sliderLabel.close(0, function() {
                        sliderOpen();
                    });
                } else {
                    sliderOpen();
                }
            },
            onUncheck: function(data, ele) {
                var sliderOpen = function() {
                    users = $(orgMemberManagerAction.dataTable.el).bootstrapTable("getSelections");
                    sliderCheckMore.data = users;
                    sliderCheckMore.changeBody();
                };
                if (sliderInfor.slider && sliderInfor.slider.getStatus()) {
                    sliderInfor.slider.close(0, function() {
                        sliderOpen();
                    });
                } else {
                    sliderOpen();
                }

            },
            onClickRow: function(data, ele, field) {
                if (!orgMemberManagerAction.label) {
                    var sliderOpen = function() {
                        var isOpen = sliderInfor.slider ? sliderInfor.slider.getStatus() : false;
                        console.log(isOpen);
                        if (isOpen) {
                            sliderInfor.renderBody(data);
                        } else {
                            sliderInfor.open(data);
                        }
                    };
                    if (sliderCheckMore.slider && sliderCheckMore.slider.getStatus()) {
                        sliderCheckMore.slider.close(0, function() {
                            sliderOpen();
                        });
                    } else if (sliderAction.isOpen) {
                        if (!sliderAction.sliderLabel && sliderAction.sliderLabel.getStatus()) {
                            sliderAction.slider.close(0, function() {
                                sliderOpen();
                            });
                        } else {
                            sliderAction.sliderLabel.close(0, function() {
                                sliderOpen();
                                console.log(sliderInfor.slider);
                            });
                        }
                    } else {
                        sliderOpen();
                    }
                } else {
                    return false;
                }

            },
            onCheckAll: function() {

                var sliderOpen = function() {
                    users = $(orgMemberManagerAction.dataTable.el).bootstrapTable("getSelections");
                    var isOpen = sliderCheckMore.slider ? sliderCheckMore.slider.getStatus() : false;
                    if (isOpen) {
                        sliderCheckMore.changeBody();
                    } else if (users.length !== 0) {
                        sliderCheckMore.open(users);
                    }
                };
                if (sliderInfor.slider && sliderInfor.slider ? sliderInfor.slider.getStatus() : false) {
                    sliderInfor.slider.close(0, function() {
                        sliderOpen();
                    });
                } else if (sliderAction.slider && sliderAction.slider ? sliderAction.slider.getStatus() : false) {
                    sliderAction.slider.close(0, function() {
                        sliderOpen();
                    });
                } else {
                    sliderOpen();
                }

            },
            onUncheckAll: function(rows) {
                var sliderOpen = function() {
                    users = $(orgMemberManagerAction.dataTable.el).bootstrapTable("getSelections");
                    sliderCheckMore.data = users;
                    sliderCheckMore.changeBody();
                };
                if (sliderInfor.slider && sliderInfor.slider.getStatus()) {
                    sliderInfor.slider.close(0, function() {
                        sliderOpen();
                    });
                } else {
                    sliderOpen();
                }

            }
        },
        init: function(treeNode) {
            var _this = this;
            if (treeNode.tenantOrgId) {
                this.option.url = 'management-center/tenant/user/';
            } else {
                this.option.url = '/management-center/tenant/label/user/page';
            }
            _this.currentNode = treeNode;
            orgMemberManagerAction.dataTable.searchKey = null
            var newOption = commonTbOption(this.option);
            $(this.el).bootstrapTable(newOption);
        },
        refresh: function(treeNode) {
            var _this = this;
            _this.currentNode = treeNode;
            tabRefresh = true;
            let key = $('#search-member').val();
            if (orgMemberManagerAction.dataTable.currentNode.tenantOrgId) {
                $(this.el).bootstrapTable("refresh", {
                    url: 'management-center/tenant/user/',
                });
            } else {
                $(this.el).bootstrapTable("refresh", {
                    url: '/management-center/tenant/label/user/page',
                });
            }
            $(this.el).bootstrapTable("selectPage", 1);
        },
        search: function(keyword) {
            orgMemberManagerAction.dataTable.searchKey = keyword
            $(this.el).bootstrapTable("refresh");
            $(this.el).bootstrapTable("selectPage", 1);

        }
    },
    getData: function(obj) {
        var _this = this;
        if (obj.orgName) {
            $("#orgName").html(obj.orgName);
        } else {
            $("#orgName").html(obj.labName);
        }
    },
    events: {
        init: function() {
            $('#search-member').on('input', function() {
                var keyword = $('#search-member').val();
                orgMemberManagerAction.dataTable.search(keyword);
            });
            var _this = this;
            $("body").unbind().on("click", function(e) {
                var $target = $(e.target),
                    data;
                if ($target.attr("id") == "search-member") {
                    $target.unbind("keyup");
                    $target.on("keyup", function(e) {
                        var keyword = $target.val();
                        if (e.keyCode == 13) {
                            e.preventDefault();
                            orgMemberManagerAction.dataTable.search(keyword);
                        } else if (e.keyCode == 8) {
                            if (!keyword) {
                                orgMemberManagerAction.dataTable.search();
                            }
                        }
                    });
                } else if ($target.attr("id") == "search-org") {
                    $target.unbind("keyup");
                    $target.on("keyup", function(e) {
                        var keyword = $target.val();
                        if (e.keyCode == 13) {
                            e.preventDefault();
                            orgMemberManagerAction.getOrgList(keyword);
                        } else if (e.keyCode == 8) {
                            if (!keyword) {
                                orgMemberManagerAction.getOrgList();
                            }
                        }
                    });

                    $target.on('input', function() {
                        var keyword = $target.val();
                        e.preventDefault();
                        orgMemberManagerAction.getOrgList(keyword);
                    });

                } else if ($target.hasClass("editorg")) {
                    data = $target.parents(".sw_ed_hover").data("treeNodeData");
                    _this.showEditOrg(data);
                } else if ($target.hasClass("addorg")) {
                    data = $target.parents(".sw_ed_hover").data("treeNodeData");
                    _this.addOrg(data);
                } else if ($target.hasClass("deleteorg")) {
                    data = $target.parents(".sw_ed_hover").data("treeNodeData");
                    _this.deleteOrg(data);
                } else if ($target.hasClass("preMoveTreeeNode")) {
                    data = $target.parents(".sw_ed_hover").data("treeNodeData");
                    _this.preMoveNode(data);
                } else if ($target.hasClass("nextMoveTreeeNode")) {
                    data = $target.parents(".sw_ed_hover").data("treeNodeData");
                    _this.NextMoveNode(data);
                } else if ($target.hasClass('orgFrameworkLabel')) {
                    $target.addClass('active').siblings().removeClass('active');
                    orgMemberManagerAction.getOrgList();
                    orgMemberManagerAction.labelInit()
                } else if ($target.hasClass('orgMemberLabel')) {
                    $target.addClass('active').siblings().removeClass('active');
                    orgMemberManagerAction.getOrgList(null, 'label');
                    orgMemberManagerAction.labelInit(true)
                } else if ($target.hasClass('addLabel')) {
                    data = $target.parents(".sw_ed_hover").data("treeNodeData");
                    _this.addLabel();
                } else if ($target.hasClass('editLabel')) {
                    data = $target.parents(".sw_ed_hover").data("treeNodeData");
                    _this.addLabel(data);
                } else if ($target.hasClass('deleteLabel')) {
                    data = $target.parents(".sw_ed_hover").data("treeNodeData");
                    _this.deleteLabel(data);
                } else if ($target.hasClass("tag-item")) {
                    sliderAction.cancelSelectUser($target);
                    return false;
                } else if ($target.parents(".tag-item").length > 0) {
                    sliderAction.cancelSelectUser($target.parents(".tag-item"));
                    return false;
                } else if ($target.hasClass("removeAllUserbtn")) {
                    sliderAction._removeAllUser();
                }
                _this.valid();
            });
        },
        showEditOrg: function(obj) {
            var _this = this;
            obj.formType = "edit";
            var html = template("editOrg-tpl", obj);
            orgMemberManagerAction.showEditOrgLayer = layer.open({
                type: 1,
                title: "编辑部门",
                skin: "layer_sw_ui",
                content: html,
                btn: ['提交', '关闭'], //按钮
                yes: function() {
                    $('#orgForm').submit();
                },
                no: function() {

                }
            });

            new SweetSelect("#selectorg", {
                search: {
                    url: "/management-center/tenant/org/{keyword}/tenantOrgList",
                    data: {},
                    type: "GET",
                    responseHandler: function(res) {
                        return res.data;
                    }
                },
                st: {
                    data: {
                        key: {
                            name: "orgName",
                        },
                        simpleData: {
                            enable: true,
                            idKey: "tenantOrgId",
                            pIdKey: "parentId"
                        }
                    }
                },
                ss: {
                    selectId: "tenantOrgId",
                    selectName: "orgName",
                    callback: {
                        onClick: function(trees, treeNode) {},
                        beforeShow: function(trees) {
                            trees.expandAll(true);
                            //阻止默认事件
                            return false;
                        }
                    }
                }
            }, orgMemberManagerAction.orgData, obj.getParentNode());
        },
        addOrg: function(obj) {
            var _this = this;
            obj.formType = "add";
            var html = template("editOrg-tpl", obj);
            orgMemberManagerAction.addOrgLayer = layer.open({
                type: 1,
                title: "新增部门",
                skin: "layer_sw_ui",
                content: html,
                btn: ['提交', '关闭'], //按钮
                yes: function() {
                    $('#orgForm').submit();
                },
                no: function() {

                }
            });
            new SweetSelect("#selectorg", {
                search: {
                    url: "/management-center/tenant/org/{keyword}/tenantOrgList",
                    data: {},
                    type: "GET",
                    responseHandler: function(res) {
                        return res.data;
                    }
                },
                st: {
                    data: {
                        key: {
                            name: "orgName",
                        },
                        simpleData: {
                            enable: true,
                            idKey: "tenantOrgId",
                            pIdKey: "parentId"
                        }
                    }
                },
                ss: {
                    selectId: "tenantOrgId",
                    selectName: "orgName",
                    callback: {
                        onClick: function(trees, treeNode) {},
                        beforeShow: function(trees) {
                            trees.expandAll(true);
                            //阻止默认事件
                            return false;
                        }
                    }
                }
            }, orgMemberManagerAction.orgData, obj);
        },
        addLabel: function(obj) {
            if (obj) {
                var title = "编辑标签";
                obj.formType = "edit";
            } else {
                var obj = {};
                var title = "新增标签";
                obj.formType = "add";
            }
            var html = template("addLabel_tmp", obj);
            var that = this;
            layer.open({
                type: 1,
                title: title,
                skin: "layer_sw_ui",
                content: html,
                btn: ['提交', '关闭'], //按钮
                yes: function() {
                    $("#addLabelForm").submit();
                    return false;
                },
                no: function() {

                }
            });
            $('#addLabelForm').keydown(function(e) {
                if (e.keyCode === 13) {
                    return false;
                }
            });
            $('#addLabelForm').Validform({
                ajaxPost: true,
                tiptype: function(msg, o, cssctl) {
                    if (o.type === 3) {
                        o.obj.parent().addClass('has-error');
                        o.obj.next('.form-inline-error-msg').remove();
                        o.obj.after('<span class="form-inline-error-msg">' + msg + '</span>');
                    } else {
                        o.obj.parent().removeClass('has-error');
                        o.obj.next('.form-inline-error-msg').remove();
                    }
                },
                beforeSubmit: function(curform) {
                    that.labelSubmit(curform.attr("data-type"));
                    return false;
                },
                datatype: {
                    "phone": function(gets, obj, curform, regxp) {
                        var reg1 = regxp.m,
                            reg2 = /^([0-9]{3,4}-)?[0-9]{7,8}$/;

                        if (reg1.test(gets)) {
                            return true;
                        }
                        if (reg2.test(gets)) {
                            return true;
                        }

                        return false;
                    }
                }
            });
        },
        deleteOrg: function(obj) {
            SWTOOL.layer.delete({
                title: "删除部门",
                content: "是否删除该部门？"
            }, function() {
                SWXHR.DELETE("/management-center/tenant/org/" + obj.tenantOrgId + "/", {}, "JSON")
                    .done(function(data) {
                        if (data.code == "success") {
                            SWTOOL.layer.success("删除成功");
                            orgMemberManagerAction.getOrgList();
                        } else if (data.code === 'gap.service.tenant.info.CannotRemoveOrgWhenUserExists') {
                            SWTOOL.layer.msg('不能删除存在用户的部门')
                        } else {
                            SWTOOL.layer.msg('删除失败')
                        }
                    });
            });
        },
        deleteLabel: function(obj) {
            SWTOOL.layer.delete({
                title: "删除标签",
                content: "是否删除该标签？"
            }, function() {
                SWXHR.DELETE("/management-center/tenant/label/" + obj.tenantLabId + "/", {}, "JSON")
                    .done(function(data) {
                        if (data.code == "success") {
                            SWTOOL.layer.success("删除成功");
                            orgMemberManagerAction.getOrgList(null, 'label');
                            $('#data-table').bootstrapTable('refresh');
                        } else if (data.code === 'gap.service.tenant.info.CannotRemoveOrgWhenUserExists') {
                            SWTOOL.layer.msg('不能删除存在用户的标签')
                        } else {
                            SWTOOL.layer.msg('删除失败')
                        }
                    });
            });
        },
        preMoveNode: function(data) {
            var zTreeNodes = orgMemberManagerAction.stree;
            var sNodes = data.getParentNode().children;
            console.log(sNodes)
            var index = data.getIndex();
            if (index === 0) {
                return
            } else {
                zTreeNodes.moveNode(sNodes[index - 1], sNodes[index], 'prev')
                var arr = [];
                for (var i = 0; i < sNodes.length; i++) {
                    arr.push(sNodes[i].tenantOrgId);
                }
                var data = {
                    orgIdByOrders: arr
                }
                SWXHR.PUT('/management-center/tenant/org/all/orders', data, 'JSON').done(function(res) {
                    if (res.code === 'success') {

                    } else {
                        SWTOOL.layer.msg('操作失败')
                        zTreeNodes.moveNode(sNodes[index - 1], sNodes[index], 'prev')
                    }
                })
            }
        },
        NextMoveNode: function(data) {
            var zTreeNodes = orgMemberManagerAction.stree;
            var sNodes = data.getParentNode().children;
            var index = data.getIndex();
            if (index === sNodes.length - 1) {
                return
            } else {
                zTreeNodes.moveNode(sNodes[index + 1], sNodes[index], 'next');
                var arr = [];
                for (var i = 0; i < sNodes.length; i++) {
                    arr.push(sNodes[i].tenantOrgId);
                }
                var data = {
                    orgIdByOrders: arr
                };
                SWXHR.PUT('/management-center/tenant/org/all/orders', data, 'JSON').done(function(res) {
                    if (res.code === 'success') {} else {
                        SWTOOL.layer.msg('操作失败')
                        zTreeNodes.moveNode(sNodes[index + 1], sNodes[index], 'next');
                    }
                });
            }

        },
        orgsubmit: function(type) {
            var data;
            if (type === "add") {
                data = $("#orgForm").serialize();
                SWXHR.POST("/management-center/tenant/org/?" + data, {}, "JSON")
                    .done(function(data) {
                        if (data.code == "success") {
                            layer.closeAll();
                            SWTOOL.layer.success("新增成功");
                            orgMemberManagerAction.getOrgList();
                        }
                    });
            } else if (type === "edit") {
                data = SWTOOL.formartFormData("#orgForm");
                SWXHR.PUT("/management-center/tenant/org/" + data.tenantOrgId + "/?orgName=" + data.orgName + "&parentId=" + data.parentId, {}, "JSON")
                    .done(function(data) {
                        if (data.code == "success") {
                            layer.closeAll();
                            SWTOOL.layer.success("编辑成功");
                            orgMemberManagerAction.getOrgList();
                        }
                    });
            }
        },
        labelSubmit: function(type) {
            console.log(type);
            var data;
            if (type === "add") {
                data = SWTOOL.formartFormData("#addLabelForm");
                SWXHR.POST("/management-center/tenant/label/", data, "JSON")
                    .done(function(data) {
                        if (data.code == "success") {
                            layer.closeAll();
                            orgMemberManagerAction.getOrgList(null, 'label');
                            SWTOOL.layer.success("新增成功", function() {}, 1000);
                        } else if (data.code === "gap.service.tenant.label.LabelAlreadyExists") {
                            SWTOOL.layer.msg('标签名称已存在')
                        }
                    });
            } else if (type === "edit") {
                data = SWTOOL.formartFormData("#addLabelForm");
                SWXHR.PUT("/management-center/tenant/label/" + data.tenantLabId + "/name", data, "JSON")
                    .done(function(data) {
                        if (data.code == "success") {
                            layer.closeAll();
                            SWTOOL.layer.success("编辑成功");
                            orgMemberManagerAction.getOrgList(null, 'label');
                        } else if (data.code === 'gap.service.tenant.label.LabelAlreadyExists') {
                            SWTOOL.layer.msg('标签名称已存在')
                        }
                    });
            }
        },
        valid: function() {
            var that = this;
            $('#orgForm').Validform({
                ajaxPost: true,
                tiptype: function(msg, o, cssctl) {
                    if (o.type === 3) {
                        o.obj.parent().addClass('has-error');
                        o.obj.next('.form-inline-error-msg').remove();
                        o.obj.after('<span class="form-inline-error-msg">' + msg + '</span>');
                    } else {
                        o.obj.parent().removeClass('has-error');
                        o.obj.next('.form-inline-error-msg').remove();
                    }
                },
                beforeSubmit: function(curform) {
                    that.orgsubmit(curform.attr("data-type"));
                    return false;
                },
                datatype: {
                    "phone": function(gets, obj, curform, regxp) {
                        var reg1 = regxp.m,
                            reg2 = /^([0-9]{3,4}-)?[0-9]{7,8}$/;

                        if (reg1.test(gets)) {
                            return true;
                        }
                        if (reg2.test(gets)) {
                            return true;
                        }

                        return false;
                    }
                }
            });
        }
    },
    labelInit: function(label) {
        sliderAction.data = null;
        sliderAction.activeParentNode = null;
        sliderAction.Labeldata = null;
        sliderAction.LabelactiveParentNode = null;
        if (label) {
            $('#addMember').html('<i class="ion-plus-round"></i> 添加人员')
            $('.contact-search').addClass('contact-search-show');
            orgMemberManagerAction.dataTable.option.url = "/management-center/tenant/label/user/page";
            orgMemberManagerAction.label = true;
            var data = {
                label: true
            };
            var html = template('searchOrg-tpl', data);
            $('#searchOrg').html(html);
        } else {
            $('#addMember').html('<i class="ion-plus-round"></i> 新增人员')
            $('.contact-search').removeClass('contact-search-show');
            $('#search-member').val('')
            orgMemberManagerAction.dataTable.option.url = "management-center/tenant/user/";
            orgMemberManagerAction.label = false;
            var data = {
                label: false
            };
            var html = template('searchOrg-tpl', data);
            $('#searchOrg').html(html);
        }

    },
    slider: function() {
        var slider = new SweetSlider('#addMember', {
            title: "选择角色",
            btns: ['确定', '取消'],
            btnsClass: ['btn-primary']
        });
    }

};
//分配角色
var selectRoleAction = {
    init: function(slider, data) {
        var _this = this;
        _this.results = [];
        _this.events.init();
        _this.reloadslider(slider, data);
    },
    reloadslider: function(slider, data) {
        var _this = this;
        _this.data = data;
        var html = template("selectRole-tpl", {});
        var infor = {
            title: "选择角色",
            content: html,
            btns: ['确定', '取消'],
            btnsClass: ['btn-primary sw-close infor-btn', 'btn-default sw-close infor-btn'],
            btnFn: _this.bindRole
        };
        sliderInfor.slider.reload(infor);
        $('#roleSearch').on('input', function() {
            var keyword = $('#roleSearch').val();
            _this.dataTable.search(keyword);
        });
        _this.dataTable.init(data);
    },
    dataTable: {
        el: '#selectRole-table',
        option: {
            uniqueId: "roleId",
            toolbar: false,
            pagination: false,
            showHeader: false,
            clickToSelect: true,
            height: 300,
            url: "/management-center/tenant/auth/roles",
            responseHandler: function(res) {
                res.data = selectRoleAction.dataTable.handler.checkdata(res.data);
                if (res.code == "NOT_LOGIN") {
                    window.location.href = "#/login";
                } else {
                    var newRes = {
                        "rows": res.data
                    };
                    return newRes;
                }
            },
            columns: [{
                checkbox: true,
                width: "5%",
            }, {
                title: "角色名称",
                field: "roleName",
                width: "95%"
            }],
            onCheck: function(row, element) {
                selectRoleAction.dataTable.showSelectedRole();
            },
            onUncheck: function(row) {
                selectRoleAction.dataTable.showSelectedRole(row);
            },
            onLoadSuccess: function(data) {
                var arr = new Array();
                var _this = selectRoleAction.dataTable;
                if (_this.saveRoles) {
                    for (var i = 0; i < _this.saveRoles.length; i++) {
                        var id = _this.saveRoles[i].roleId;
                        id = parseInt(id);
                        $(selectRoleAction.dataTable.el).bootstrapTable("checkBy", {
                            field: "roleId",
                            values: [id]
                        });
                    }
                }
            }
        },
        init: function(data) {
            // var users = []
            var _this = this;
            var newOption = commonTbOption(this.option);
            $(this.el).bootstrapTable(newOption);
            for (var i = 0; i < data.roleList.length; i++) {
                if (data.roleList[i].roleName === "管理员") {
                    data.roleList.splice(i, 1);
                }
            }
            if (data) _this.saveRoles = $.extend([], data.roleList);
            else
                _this.saveRoles = null;
        },
        handler: {
            checkdata: function(data) {
                var result = new Array();
                for (var i = 0; i < data.length; i++) {
                    if (data[i].status == 1 && data[i].roleName !== '管理员') {
                        result.push(data[i]);
                    }
                }
                return result;
            }
        },
        refresh: function() {
            var _this = this;
            _this.currentNode = treeNode;
            $(this.el).bootstrapTable("refresh");
        },
        search: function(keyword) {
            if (keyword)
                $(this.el).bootstrapTable("refresh", {
                    query: {
                        condition: keyword
                    }
                });

            else
                $(this.el).bootstrapTable("refresh");

            this.saveRole();

        },
        saveRole: function() {
            var _this = this;
            var a = $(selectRoleAction.dataTable.el).bootstrapTable("getSelections");
            if (!_this.saveRoles)
                _this.saveRoles = a;
            else {
                _this.saveRoles = SWTOOL.mergeArray(_this.saveRoles, a, "roleId");
            }

        },
        removeRoleByRoleId: function(id) {
            var _this = this;
            if (_this.saveRoles && _this.saveRoles.length !== 0)
                for (var i = 0; i < _this.saveRoles.length; i++) {
                    if (_this.saveRoles[i].roleId == id) {
                        _this.saveRoles.splice(i, 1);
                    }
                }
            return _this.saveRoles;
        },
        removeRow: function(roleId) {
            var _this = this;
            roleId = parseInt(roleId);
            _this.removeRoleByRoleId(roleId);
            $(selectRoleAction.dataTable.el).bootstrapTable("uncheckBy", {
                field: "roleId",
                values: [roleId]
            });
            selectRoleAction.dataTable.showSelectedRole();
        },
        removeAllRow: function() {
            var _this = this;
            _this.saveRoles = null;
            $(selectRoleAction.dataTable.el).bootstrapTable("uncheckAll");
            selectRoleAction.dataTable.showSelectedRole();
        },
        showSelectedRole: function(obj) {
            var _this = this;
            if (obj)
                _this.saveRoles = _this.removeRoleByRoleId(obj.roleId);

            var a = $(selectRoleAction.dataTable.el).bootstrapTable("getSelections");
            if (_this.saveRoles && _this.saveRoles.length !== 0)
                var arr = SWTOOL.mergeArray(_this.saveRoles, a, "roleId");
            else
                var arr = a;

            var html = template("IsselectRole-tpl", {
                data: arr
            });
            $("#IsselectRole-div").html(html);
        }
    },
    events: {
        init: function() {
            $("body").unbind().on("click", function(e) {
                var $target = $(e.target),
                    roleId;
                if ($target.hasClass("tag-item")) {
                    roleId = $target.attr("data-id");
                    selectRoleAction.dataTable.removeRow(roleId);
                    return false;
                } else if ($target.parents(".tag-item").length !== 0) {
                    roleId = $target.parents(".tag-item").attr("data-id");
                    selectRoleAction.dataTable.removeRow(roleId);
                    return false;
                } else if ($target.hasClass("removeAllUserbtn")) {
                    selectRoleAction.dataTable.removeAllRow();
                }
            });
        }
    },
    getRoleIds: function() {
        var results = [];
        $("#addUserByRoleLayer .tag-item").each(function() {
            var id = $(this).attr("data-id");
            results.push(id);
        })
        return results;
    },
    bindRole: [
        function(slider) {
            var roleIds = selectRoleAction.getRoleIds().join(",");
            SWXHR.POST("/management-center/tenant/auth/user/" + selectRoleAction.data.userId + "/roles?roleIds=" + roleIds)
                .done(function(data) {
                    if (data.code == "success") {
                        SWTOOL.layer.success("分配角色成功");
                        $('#data-table').bootstrapTable("refresh");

                    } else {
                        SWTOOL.layer.msg(data.message);
                    }
                });
        }
    ]
};
module.exports = orgMemberManagerAction;