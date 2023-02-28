var vm = new Vue({
	el: '#ScrollContent_dj4sYO',
	data: {
		//供电所
		dataList: [],
		pageNum: 1,
		deptNo: "",
		// requestUrl: 'http://192.168.21.216:18081/',
		// requestUrl: 'http://10.160.84.188:18081/',
		requestUrl: 'http://10.160.84.190:18080/wyyms/',
		userName: "",
		layerMsg: null
	},
	//watch: {},
	computed: {},
	mounted: function() {
		var _ = this;
		// 获取平台参数
		_.getUserBaseData();
		// 事件初始化
		_.initEvents();
		// 参数重载
		_.reloadSearchParam();
		//
		// _.getBasicData();

	},
	methods: {
		// 初始化控件时间
		initEvents: function() {

			var _ = this;

			$("#searchBtn").click(
				function() {
					if ($("#searchSelect").val() == "" ||
						$("#searchInput").val() == "") {
						alert("请填写查询条件！");
						return;
					}
					// 展开加载弹窗，灰色背景遮挡
					_.layerMsg = layer.load(2, {
						shade: [0.4, '#7e7e7e'] //0.1透明度的白色背景
					});
					_.getBasicData();
				}
			);


		},
		searchClick: function(consNo) {
			var _ = this;

			var type = document.getElementById("searchSelect").value;
			var param = document.getElementById("searchInput").value;


			sessionStorage.setItem("address_search_type", type);
			// 查询条件为户号
			sessionStorage.setItem("address_search_param", param);

			sessionStorage.setItem("address_userName", _.userName);

			// 第二页的查询条件为户号
			sessionStorage.setItem("address_search_consNo", consNo);

			window.location.href = "detail.html";
		},


		//用户明细列表
		getBasicData: function() {
			var _ = this;
			//获取数值
			var type = $("#searchSelect").val();
			var param = $("#searchInput").val();

			// 请求参数
			var params = {
				"type": type,
				"param": param,
				"index": "userInfo",
				"userName": _.userName,
				"deptNo": ''

			}
			// 服务地址
			var apiAddress = _.requestUrl + '/address/getUserAddressList';
			// 获取数据
			mui.getJSON(apiAddress, params, function(data) {
				if (data.code != "1" || data.data.length == 0) {
					alert("未查到用户地址信息，请核对查询条件！");
					$("#ScrollContent_dj4sYO").css("display", "none");
				} else {
					debugger
					_.dataList = data.data;
					$("#ScrollContent_dj4sYO").css("display", "");
				}
				// 所有东西加载结束后，关闭弹出层
				layer.close(_.layerMsg);
			});
			// }

		},
		getUserBaseData: function() {
			var _ = this;
			// 获取路径中参数
			var base_data = window.nativejs.getUserInfo();
			// var base_data = decodeURIComponent(location.search.split('&')[0].split('=')[1]);
			var obj = JSON.parse(base_data);
			// 获取平台用户名
			_.userName = obj.data.namecode;
			// _.userName = 'lmj2_cy';
			// 供电单位编号
			sessionStorage.setItem("address_userName", _.userName);
		},
		reloadSearchParam: function() {
			var _ = this;
			// 查询条件重载
			var search_type = sessionStorage.getItem('address_search_type');
			var search_param = sessionStorage.getItem('address_search_param');
			//alert(search_param)
			if (search_type != null && search_type != "" && search_param != null && search_param != "") {
				document.getElementById("searchSelect").value = search_type;
				document.getElementById("searchInput").value = search_param;
				//重新加载数据
				setTimeout(function() {
					_.getBasicData();
				}, 300);
			}

		},
		//获取上一个页面携带的参数
		getParams: function(key) {
			var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
			var r = window.location.search.substr(1).match(reg);
			if (r != null) {
				return decodeURI(r[2]);
			}
			return null;
		}
	}
});
