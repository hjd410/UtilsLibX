var vm = new Vue({
	el: '#ScrollContent_dj4sYO',
	data: {
		//供电所
		dataList: [],
		pageNum: 1,
		deptNo: "",
		oldElecAddr: "",
		// requestUrl: 'http://192.168.21.216:18081/',
		//requestUrl: 'http://10.160.84.188:18081/',
		requestUrl: 'http://10.160.84.190:18080/wyyms/',
		userName: "",
		layerObj: null

	},
	//watch: {},
	computed: {},
	mounted: function() {
		var _ = this;
		// 事件初始化
		_.initEvents();
		// // 获取数据
		_.getBasicData();
		//设置不可见
		_.setInvisiable();
		// 参数重载

	},
	methods: {
		// 初始化控件时间
		initEvents: function() {
			var _ = this;

			var provinceIndex;
			var province = $('#proviceSelect');
			// 门牌号数据变化
			$('#doorOrder').change(function() {

				// 先清空再放值
				$("#address").val("");
				//之前选择的文本值
				var address = "";
				$(".change option:selected").each(function() {
					var value = $(this).text();

					if (value.indexOf("请选择") == -1) {
						address += value;
					}

				});
				$("#address").val(address + $('#doorOrder').val());

			});
			// 修改按钮点击事件
			$("#btnchange").click(function() {

				if ($('#btnchange').val() === '保 存') {

					var arr = ['citySelect', 'areaSelect', 'streetSelect', 'neighborhoodSelect', 'roadSelect', 'smallSelect',
						'doorOrder', 'doorSign', 'address'
					];

					var arr_text = ['请选择地市数据！', '请选择区县数据！', '请选择街道数据！', '请选择社区数据！', '请选择道路数据！',
						'请选小区数据！', '请填写门牌号数据！', '请填写地标数据！', '地址信息不能为空！'
					];

					var index = -1;
					$('.change option:selected').each(function(i) {
						var text = $(this).text();
						if (text.indexOf("请选择") != -1) {
							index = i;
							alert(arr_text[i]);
							return false;
						}
					});

					// 数据验证通过
					if (index === -1) {
						// 弹出框
						_.layerObj = layer.load(1, {
							shade: [0.6, '#333'] //0.1透明度的白色背景
						});
						// 调用操作方法
						_.operateUpdate();
						// 设置不可选
						_.setInvisiable();
						//设置为修改
						$("#btnchange").val("修 改");
						// 修改标题
						$("#title_head").html("用电地址详情")
						// 刷新数据
						setTimeout(function() {
							_.getBasicData();
						}, 300);
					}

				} else if ($('#btnchange').val() === '修 改') {

					//设置文本可编辑
					_.setVisiable();
					//默认将区县全部取出
					// _.getCountryAreaData();
					//设置为保存
					$("#btnchange").val("保 存");
					// 修改标题
					$("#title_head").html("用电地址修改")
				}


			});
			/*
			 弹窗框
			 */
			$(".change").click(function() {
				var thisId = $(this).attr('id');

				if (thisId != "citySelect") {
					var width = parseInt(document.body.clientWidth * 0.8) + "px";
					var height = parseInt(document.body.clientHeight * 0.8) + "px";

					var text = $(this).text();
					var value = $(this).val();

					sessionStorage.setItem("address_select_changeSelectType", thisId);
					sessionStorage.setItem("address_select_changeSelectValue", value);


					layer.open({
						type: 2,
						closeBtn: 0,
						area: [width, height],
						title: ['地址信息选择', 'font-size:15px;background-color: #44af95;color: rgb(255, 255, 255);'],
						fixed: false, //不固定
						maxmin: false,
						content: 'select.html',
						end: function() {
							// 先清空再放值
							$("#address").val("");
							//之前选择的文本值
							var address = "";
							$(".change option:selected").each(function() {
								var value = $(this).text();

								if (value.indexOf("请选择") == -1) {
									address += value;
								}

							});
							$("#address").val(address + $('#doorOrder').val());
						}
					});
				}
			});
		},
		//获取数据
		getBasicData: function() {
			//debugger
			var _ = this;

			_.userName = sessionStorage.getItem("address_userName");

			var consNo = sessionStorage.getItem("address_search_consNo");

			params = {
				consNo: consNo,
				userName: _.userName
			}

			var apiAddress = _.requestUrl + '/address/getUserAddressDetail';
			//var apiAddress = 'http://10.160.84.188:18081/arrears/getUserArrearsList';

			mui.getJSON(apiAddress, params, function(data) {
				// debugger
				if (data.code != "1" || data.data.length == 0) {
					alert("未查到用户地址信息，请核对查询条件！");
					//$("#ScrollContent_RQF9yx").css("display", "none");
				} else {
					$("#Text_IHb9o9").html(data.data[0].consNo);
					$("#Text_KtueQw").html(data.data[0].consName);
					$("#addressSelect").html(data.data[0].addrType);
					//$("#citySelect").val(data.data[0].city);
					$("#proviceSelect").html("<option  value= \"" + data.data[0].provinceCode + " \">" + "辽宁省" + "</option>");
					$("#citySelect").html("<option value=\"" + data.data[0].cityCode + " \">" + data.data[0].city + "</option>");
					$("#areaSelect").html("<option value=\"" + data.data[0].countyCode + " \">" + data.data[0].county +
						"</option>");
					$("#streetSelect").html("<option value=\"" + data.data[0].streetCode + " \">" + data.data[0].streetName +
						"</option>");
					$("#neighborhoodSelect").html("<option value=\"" + data.data[0].villageCode + " \">" + data.data[0].villageName +
						"</option>");
					$("#roadSelect").html("<option value=\"" + data.data[0].roadCode + " \">" + data.data[0].roadName +
						"</option>");
					// alert(data.data[0].communityname);
					//小区
					$("#smallSelect").html(data.data[0].communityName === null ?
						"<option>" + "空" + "</option>" : "<option value=\"" + data.data[0].communityCode + " \">" + data.data[0].communityName +
						"</option>"
					);

					$("#doorOrder").val(data.data[0].plateNo);
					$("#doorSign").val(data.data[0].building);
					$("#address").val(data.data[0].elecAddr);

					//用户地址
					_.oldElecAddr = data.data[0].elecAddr;
					//alert(oldElecAddr);

				}
			});
		},
		//获取上一个页面携带的参数
		getParams: function(key) {
			var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
			var r = window.location.search.substr(1).match(reg);
			if (r != null) {
				return decodeURI(r[2]);
			}
			return null;
		},

		// 设置不可选
		setInvisiable: function() {

			//当页面加载时 即设置 页面属性 为可读不可写
			$("#addressSelect").attr("disabled", "disabled");
			$("#Select_NFJ3kA").css("background-color", "#cccccc");

			$("#proviceSelect").attr("disabled", "disabled");
			$("#Select_OVDYIX").css("background-color", "#cccccc");

			$("#citySelect").attr("disabled", "disabled");
			$("#Select_BRnsHw").css("background-color", "#cccccc");

			$("#areaSelect").attr("disabled", "disabled");
			$("#Select_T9p8Ba").css("background-color", "#cccccc");

			$("#streetSelect").attr("disabled", "disabled");
			$("#Select_MKCC83").css("background-color", "#cccccc");

			$("#neighborhoodSelect").attr("disabled", "disabled");
			$("#Select_tgVGlk").css("background-color", "#cccccc");

			$("#roadSelect").attr("disabled", "disabled");
			$("#Select_tLg4TP").css("background-color", "#cccccc");

			$("#smallSelect").attr("disabled", "disabled");
			$("#Select_ryObwX").css("background-color", "#cccccc");

			$("#doorOrder").attr("disabled", "disabled");
			$("#Input_XUDwH7").css("background-color", "#cccccc");

			$("#doorSign").attr("disabled", "disabled");
			$("#Input_qEMB6E").css("background-color", "#cccccc");

			$("#address").attr("disabled", "disabled");
			$("#Input_P7BbQb").css("background-color", "#cccccc");

		},

		// 设置可选
		setVisiable: function() {


			// $("#addressSelect").removeAttr("disabled");
			// $("#Select_NFJ3kA").css("background-color", "");

			$("#proviceSelect").removeAttr("disabled");
			$("#Select_OVDYIX").css("background-color", "");

			$("#citySelect").removeAttr("disabled");
			$("#Select_BRnsHw").css("background-color", "");

			$("#areaSelect").removeAttr("disabled");
			$("#Select_T9p8Ba").css("background-color", "");

			$("#streetSelect").removeAttr("disabled");
			$("#Select_MKCC83").css("background-color", "");

			$("#neighborhoodSelect").removeAttr("disabled");
			$("#Select_tgVGlk").css("background-color", "");

			$("#roadSelect").removeAttr("disabled");
			$("#Select_tLg4TP").css("background-color", "");

			$("#smallSelect").removeAttr("disabled");
			$("#Select_ryObwX").css("background-color", "");

			$("#doorOrder").removeAttr("disabled");
			$("#Input_XUDwH7").css("background-color", "");

			$("#doorSign").removeAttr("disabled");
			$("#Input_qEMB6E").css("background-color", "");

			$("#address").removeAttr("disabled");
			$("#Input_P7BbQb").css("background-color", "");


		},

		/*清空select方法：当当前select被选中的时候要清空之后的几个select的内容**/
		clearSelect: function(thisID) {
			var arr = ['areaSelect', 'streetSelect', 'roadSelect', 'neighborhoodSelect', 'smallSelect', 'doorOrder',
				'doorSign', 'address'
			];
			// 返回arr所用
			var index = arr.indexOf(thisID);
			//判断所有是否存在
			if (index >= 0) {
				//清除index之后的select
				for (var i = index + 1; i < arr.length; i++) {
					//首先获取类型 判断是什么类型
					//var type = $('#' + arr[i] + '').attr('type');
					if (arr[i] === "doorOrder" || arr[i] === "doorSign" || arr[i] === "address") {
						$('#' + arr[i] + '').val("");
					} else {
						$('#' + arr[i] + '').empty();
						$('#' + arr[i] + '').append("<option selected disabled>- - 请选择 - -</option>");
					}
				}
			}
		},

		/*清空select方法：社区 小区 **/
		clearSelectExpect: function(thisID) {
			// debugger
			var arr = ['streetSelect', 'roadSelect', 'neighborhoodSelect', 'smallSelect', 'roadSelect'];
			// 返回arr所用
			var index = arr.indexOf(thisID);
			//判断所有是否存在
			if (index >= 0) {
				//清除index之后的select
				for (var i = index + 1; i < arr.length; i++) {

					if (arr[i] === 'roadSelect') {
						$('#' + arr[i] + '').get(0).selectedIndex = 0;
					} else {

						$('#' + arr[i] + '').empty();
						$('#' + arr[i] + '').append("<option selected disabled>- - 请选择 - -</option>");

					}

				}
			}
		},

		//操作更新
		operateUpdate: function() {
			var _ = this;
			var consNo = $("#Text_IHb9o9").html();
			//省码
			var porvinceCode = $('#proviceSelect option:selected').val();
			//市码
			var cityCode = $('#citySelect option:selected').val();
			//县码
			var countyCode = $('#areaSelect option:selected').val();
			//街道码
			var streetCode = $('#streetSelect option:selected').val();
			//街道名称
			var streetName = $('#streetSelect option:selected').text();
			//居委会码
			var villageCode = $('#neighborhoodSelect option:selected').val();
			//居委会名称
			var villageName = $('#neighborhoodSelect option:selected').text();
			//道路码
			var roadCode = $('#roadSelect option:selected').val();
			//道路名称
			var roadName = $('#roadSelect option:selected').text();
			//小区码
			var communityCode = $('#smallSelect option:selected').val();
			//小区名称
			var communityName = $('#smallSelect option:selected').text();
			//门牌号
			var plateNo = $('#doorOrder').val();
			// 地标
			var building = $('#doorSign').val();
			//用户地址
			var elecAddr = $('#address').val();

			var params = {
				consNo: consNo,
				porvinceCode: porvinceCode,
				cityCode: cityCode,
				countyCode: countyCode,
				streetCode: streetCode,
				streetName: streetName,
				villageCode: villageCode,
				villageName: villageName,
				roadCode: roadCode,
				roadName: roadName,
				communityCode: communityCode,
				communityName: communityName,
				plateNo: plateNo,
				building: building,
				newAddress: elecAddr,
				oldAddress: vm.oldElecAddr,
				userName: vm.userName

			}

			$.ajax({
				url: _.requestUrl + "/address/updateAddress",
				type: "POST",
				data: JSON.stringify(params),
				dataType: "json",
				contentType: "application/json;charset=UTF-8",
				success: function(data) {
					alert(data.msg);
					// 关闭弹出层
					layer.close(_.layerObj);
				},
				error: function(e, err) {}
			});


		}
	}
});
