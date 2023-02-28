/**
 *  @author :   JiGuangJie
 *  @date   :   2020/6/17
 *  @time   :   16:55
 *  @Email  :   530904731@qq.com
 */
define("com/huayun/edit/components/ToolBarPanel", [], function () {
    this.buttonList = [
        '开始',
        '停止',
        '选择',
        '删除',
        '移动',
        '旋转'
    ];

    function ToolBarPanel(params) {
        this.container = params.container;
        this.buttonSelectedHook = params.buttonSelectedHook;
        this.container.addEventListener('click', function (evt) {
            // console.log(evt.target.innerText);
            this.buttonSelectedHook.call(this, evt.target.innerText);
            // debugger;
        }.bind(this));
        this.createButton();
    }

    ToolBarPanel.prototype.createButton = function () {
        for (var i = 0; i < buttonList.length; i++) {
            var aBtnName = buttonList[i];
            var aButton = document.createElement('button');
            aButton.className = 'tool-bar_btn';
            aButton.innerText = aBtnName;
            this.container.appendChild(aButton);
        }
    };

    return ToolBarPanel;
});
