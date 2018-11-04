$(document).ready(function () {

    OE = {
        OeTabload: function (event) {
            event.preventDefault();
            var formId = $('#oe-form');
            var url = $(this).attr('href');
            var data = {};
            Common.ajaxCall(formId, "POST", url, data, IHS.IHSPostSenarioDataSuccess, Common.g_onError);
        }
    };
});
