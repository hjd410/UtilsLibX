var dataList = [];
var selectType;
//var requestUrl = 'http://192.168.21.216:18081/';
// var requestUrl = 'http://10.160.84.188:18081/';
var requestUrl = 'http://10.160.84.190:18080/wyyms/';
var index; // 窗口索引
var userName; // 登录人
var consNo; // 用户编码
var layerMsg = null;

$(document).ready(function() {
	// 选择的下拉框
	selectType = sessionStorage.getItem("address_select_changeSelectType");
	//获取窗口索引
	index = parent.layer.getFrameIndex(window.name)
	//登录人
	userName = sessionStorage.getItem("address_userName");
	// 用户编码
	consNo = sessionStorage.getItem("address_search_consNo");

	layerMsg = layer.load(2, {
		shade: [0.4, '#7e7e7e'] //0.1透明度的白色背景
	});

	// 初始化按钮事件
	initEvents();
	// 获取页面数据
	getBasicData();
});


// 初始化控件时间
function initEvents() {
	var _ = this;

	// 取消按钮
	$("#cancel").click(function() {
		parent.layer.close(index);
	});
	// 确认按钮
	$("#submit").click(function() {
		// 针对不同选择框 为不同输入框赋值
		var select;
		switch (selectType) {
			case 'areaSelect':
				select = parent.$("#areaSelect")
				break;
			case 'streetSelect':
				select = parent.$("#streetSelect")
				break;
			case 'roadSelect':
				select = parent.$("#roadSelect")
				break;
			case 'neighborhoodSelect':
				select = parent.$("#neighborhoodSelect")
				break;
			case 'smallSelect':
				select = parent.$("#smallSelect")
				break;
			default:
				break;
		}
		// 获取选中的数据
		var value = $("input[type='radio']:checked").parent().find("input[type='hidden']").val();
		var name = $("input[type='radio']:checked").parent().siblings().html();
		// 先清空下拉选择框
		select.empty();
		// 增加下拉数据
		var option = $("<option value='" + value + "'>" + name + "</option>");
		// 添加下拉数据
		select.append(option);
		// 设置选中
		select.val(value);

		// 选择完成关闭窗口
		parent.layer.close(index);
	});
}

// 接口调用分发
function getBasicData() {
	// 针对不同选择框 跳转不同方法
	var countyCode = parent.$('#areaSelect').val().trim();
	debugger
	if (countyCode == null || countyCode == null || countyCode == "") {
		alert("区县数据不能为空");
		parent.layer.close(index);
	} else {
		switch (selectType) {
			case 'areaSelect':
				getCountryAreaData();
				break;
			case 'streetSelect':
				getStreetData(countyCode);
				break;
			case 'roadSelect':
				getRoadData(countyCode)
				break;
			case 'neighborhoodSelect':
				// 父级编号
				var pCode = parent.$('#streetSelect').val().trim();
				getCommunityAndSmallData(countyCode, pCode, 'Community')
				break;
			case 'smallSelect':
				// 父级编号
				var pCode = parent.$('#neighborhoodSelect').val().trim();
				getCommunityAndSmallData(countyCode, pCode, 'Small');
				break;
			default:
				alert("查询错误！");
				break;
		}
	}
}

//获取区县数据
function getCountryAreaData() {
	var params = {
		consNo: consNo,
		userName: userName
	}

	var apiAddress = requestUrl + '/address/getUserCountryArea';

	mui.getJSON(apiAddress, params, function(data) {
		// debugger
		if (data.code != "1" || data.data.length == 0) {
			alert("未查到区县信息，请核对查询条件！");
			parent.layer.close(index);
			//$("#ScrollContent_RQF9yx").css("display", "none");
		} else {
			//alert(data.data);
			//将数据渲染到 区县标签中
			var countryData = data.data;

			var data = [];

			countryData.forEach(function(item, index) {

				var obj = {
					value: item.districtNo,
					text: item.districtName
				};
				data[index] = obj;

			})
			dataList = data;
			appendChild();
			// 选中之前的文本
		}
	});

}

//获取街道
function getStreetData(countryCode) {
	var params = {
		consNo: consNo,
		countyCode: countryCode,
		userName: userName
	}

	var apiAddress = requestUrl + '/address/getUserStreetAndRoad';

	mui.getJSON(apiAddress, params, function(data) {
		// debugger
		if (data.code != "1" || data.street.length == 0) {
			alert("未查到街道信息，请核对查询条件！");
			parent.layer.close(index);
		} else {
			//将数据渲染到 区县标签中
			var streetData = data.street;

			var data = [];
			// 街道数据绑定
			streetData.forEach(function(item, index) {

				var obj = {
					value: item.value,
					text: item.name
				};
				data[index] = obj;

			})
			dataList = data;
			appendChild();
		}
	});
}

//获取道路
function getRoadData(countryCode) {
	var params = {
		consNo: consNo,
		countyCode: countryCode,
		userName: userName
	}

	var apiAddress = requestUrl + '/address/getUserStreetAndRoad';

	mui.getJSON(apiAddress, params, function(data) {
		// debugger
		if (data.code != "1" || data.road.length == 0) {
			alert("未查到道路信息，请核对查询条件！");
			parent.layer.close(index);
		} else {
			var roadData = data.road;

			var data = [];

			// 道路数据绑定
			roadData.forEach(function(item, index) {

				var obj = {
					value: item.value,
					text: item.name
				};
				data[index] = obj;

			})
			dataList = data;
			appendChild();
			// 选中用户原有的文本`
		}
	});
}

//获取社区、小区
function getCommunityAndSmallData(countryCode, pCode, type) {
	var params = {
		consNo: consNo,
		userName: userName,
		countyCode: countryCode,
		pCode: pCode,
		type: type
	}

	var apiAddress = requestUrl + '/address/getUserCommunityAndSmall';

	mui.getJSON(apiAddress, params, function(data) {
		//debugger
		if (data.code != "1" || data.data.length == 0) {
			alert("未查到社区或小区信息，请核对查询条件！");
			parent.layer.close(index);
		} else {
			var CommunityData = data.data;

			var data = [];

			CommunityData.forEach(function(item, index) {

				var obj = {
					value: item.value,
					text: item.name
				};
				data[index] = obj;

			})
			dataList = data;
			appendChild();
			// 选中之前的文本
		}
	});
}

// 拼接标签
function appendChild() {
	var selectValue = sessionStorage.getItem("address_select_changeSelectValue");
	var ul = document.getElementById("list");
	for (var i = 0; i < dataList.length; i++) {
		// 获取单条数据
		var obj = dataList[i];
		var li = document.createElement("li");
		// 创建外层div

		var div_text = document.createElement("div");
		div_text.className = "text";

		div_text.innerHTML = obj.text;

		// 增加子元素
		li.appendChild(div_text);

		var div_value = document.createElement("div");
		div_value.className = "value radioSelec";

		var inp_hid = document.createElement("input");
		inp_hid.setAttribute("type", "hidden");
		inp_hid.setAttribute("value", obj.value);
		// 增加子元素
		div_value.appendChild(inp_hid);

		var inp_radio = document.createElement("input");
		if (obj.value.trim() == selectValue.trim()) {
			inp_radio.setAttribute("checked", "checked");
		}
		inp_radio.setAttribute("type", "radio");
		inp_radio.setAttribute("name", "select");
		inp_radio.setAttribute("style", "width: 30px");
		inp_radio.setAttribute("id", "radio" + i)
		var label = document.createElement("label");
		label.setAttribute("for", "radio" + i)

		// 增加子元素
		div_value.appendChild(inp_radio);
		div_value.appendChild(label);

		li.appendChild(div_value);
		ul.appendChild(li);

		// 所有东西加载结束后，关闭弹出层
		layer.close(layerMsg);

	}
}
