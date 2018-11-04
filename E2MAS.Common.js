var globalScenarioId = 0;
var globalSequenceNumber = 0;

$(document).ready(function () {
    Common.SetLoadStatusText(false);
    var buttonIndicator;
    $("#small-indicator").dxLoadIndicator({
        indicatorSrc: "../Content/images/Loading.gif"
    });
    $('#VSN').on("click", function () {
        var queryScenarioID = Common.getQueryString()["scenarioid"];
        location.href = "/Scenario/View?scenarioid=" + queryScenarioID;
    });
    $(document).on('click', '.isAvailable', function () {
        var currentTargetId = $(this).closest('li').attr('id');
        if (currentTargetId != null && currentTargetId != undefined) {
            var queryScenarioID = Common.getQueryString()["scenarioid"];
            if (queryScenarioID == "undefined" || queryScenarioID == null || queryScenarioID == "") {
                queryScenarioID = $('#liScenarioId').val();
                if (queryScenarioID == "undefined" || queryScenarioID == null || queryScenarioID == "") {
                    queryScenarioID = $('#liScenarioId').attr('value');
                    queryScenarioID = parseInt(queryScenarioID);
                }
                queryScenarioID = parseInt(queryScenarioID);
            }
            var sequenceHtml = $(this).parent().html();
            var sequence = $(sequenceHtml).find('i').attr('value');
            if (currentTargetId != null && currentTargetId != "" && queryScenarioID != null && queryScenarioID > 0 && sequence != null && sequence != "" && sequence > 0 && sequence != 'undefined') {
                Common.redirecttoUrl(currentTargetId, queryScenarioID, sequence);
            }
        }
        //location.href = $(currentTarget).attr('href');
    });
    $(document).on('click', '.iconCompleted', function (event) {
        var targetUrl = $(this).attr('url');
        var isSessionAvailable = $(this).attr('is-session-available');

        if ($(this).hasClass('icon-sign-in')) {
            var queryScenarioID = Common.getQueryString()["scenarioid"];
            var currentTargetId = $(this).closest('li').attr('id');
            var currentTargetSeqNo = $(this).attr('value');
            if (currentTargetId != "undefined" && currentTargetId != null && currentTargetId != "" && currentTargetSeqNo > 0 && queryScenarioID > 0) {
                Common.CommonModel.GetModelSeqInputs(queryScenarioID, currentTargetId, currentTargetSeqNo, true, targetUrl, isSessionAvailable);
            }
        }
        if ($(this).hasClass('icon-sign-out')) {
            var queryScenarioID = Common.getQueryString()["scenarioid"];
            var currentTargetId = $(this).closest('li').attr('id');
            var currentTargetSeqNo = $(this).attr('value');
            if (currentTargetId != "undefined" && currentTargetId != null && currentTargetId != "" && currentTargetSeqNo > 0 && queryScenarioID > 0) {
                Common.CommonModel.GetModelSeqInputs(queryScenarioID, currentTargetId, currentTargetSeqNo, false, targetUrl, isSessionAvailable);
            }
        }
    });
    $(document).on('click', '.iconInProgress', function () {
        var targetUrl = $(this).attr('url');
        var isSessionAvailable = $(this).attr('is-session-available');
        if ($(this).hasClass('icon-sign-in')) {
            var queryScenarioID = Common.getQueryString()["scenarioid"];
            if (queryScenarioID == "undefined" || queryScenarioID == null || queryScenarioID == "") {
                queryScenarioID = $('#liScenarioId').val();
            }
            var currentTargetId = $(this).closest('li').attr('id');
            var currentTargetSeqNo = $(this).attr('value');
            if (currentTargetId != "undefined" && currentTargetId != null && currentTargetId != "" && currentTargetSeqNo > 0 && queryScenarioID > 0) {
                Common.CommonModel.GetModelSeqInputs(queryScenarioID, currentTargetId, currentTargetSeqNo, true, targetUrl, isSessionAvailable);
            }
        }
        //if ($(this).hasClass('icon-sign-out')) {
        //    var queryScenarioID = Common.getQueryString()["scenarioid"];
        //    var currentTargetId = $(this).closest('li').attr('id');
        //    var currentTargetSeqNo = $(this).attr('value');
        //    if (currentTargetId != "undefined" && currentTargetId != null && currentTargetId != "" && currentTargetSeqNo > 0 && queryScenarioID > 0) {
        //        Common.CommonModel.GetModelSeqInputs(queryScenarioID, currentTargetId, currentTargetSeqNo);
        //    }
        //}
    });

    // fullscreen for Demand MOdel
    $('#fullscreen .requestfullscreen').click(function () {
        $('#fullscreen').fullscreen();
        return false;
    });

    $('#fullscreen .exitfullscreen').click(function () {
        $.fullscreen.exit();
        return false;
    });

    $(document).bind('fscreenchange', function (e, state, elem) {
        if ($.fullscreen.isFullScreen()) {
            $('#fullscreen .requestfullscreen').hide();
            $('#fullscreen .exitfullscreen').show();
        } else {
            $('#fullscreen .requestfullscreen').show();
            $('#fullscreen .exitfullscreen').hide();
        }
        $('#state').text($.fullscreen.isFullScreen() ? '' : 'not');
    });

    // fullscreen for oil
    $('#oilfullscreen .requestoilfullscreen').click(function () {
        $('#oilfullscreen').fullscreen();
        return false;
    });

    $('#oilfullscreen .exitoilfullscreen').click(function () {
        $.fullscreen.exit();
        return false;
    });

    $(document).bind('fscreenchange', function (e, state, elem) {
        if ($.fullscreen.isFullScreen()) {
            $('#oilfullscreen .requestoilfullscreen').hide();
            $('#oilfullscreen .exitoilfullscreen').show();
        } else {
            $('#oilfullscreen .requestoilfullscreen').show();
            $('#oilfullscreen .exitoilfullscreen').hide();
        }
        $('#state').text($.fullscreen.isFullScreen() ? '' : 'not');
    });

    // fullscreen for OE MACRO
    $('#oefullscreen .requestoefullscreen').click(function () {
        $('#oefullscreen').fullscreen();
        return false;
    });

    $('#oefullscreen .exitoefullscreen').click(function () {
        $.fullscreen.exit();
        return false;
    });

    $(document).bind('fscreenchange', function (e, state, elem) {
        if ($.fullscreen.isFullScreen()) {
            $('#oefullscreen .requestoefullscreen').hide();
            $('#oefullscreen .exitoefullscreen').show();
        } else {
            $('#oefullscreen .requestoefullscreen').show();
            $('#oefullscreen .exitoefullscreen').hide();
        }
        $('#state').text($.fullscreen.isFullScreen() ? '' : 'not');
    });
    // fullscreen for Coal Model
    $('#coalfullscreen .requestcoalfullscreen').click(function () {
        $('#coalfullscreen').fullscreen();
        return false;
    });

    $('#coalfullscreen .exitcoalfullscreen').click(function () {
        $.fullscreen.exit();
        return false;
    });

    $(document).bind('fscreenchange', function (e, state, elem) {
        if ($.fullscreen.isFullScreen()) {
            $('#coalfullscreen .requestcoalfullscreen').hide();
            $('#coalfullscreen .exitcoalfullscreen').show();
        } else {
            $('#coalfullscreen .requestcoalfullscreen').show();
            $('#coalfullscreen .exitcoalfullscreen').hide();
        }
        $('#state').text($.fullscreen.isFullScreen() ? '' : 'not');
    });
    Common.Headertop();
});
Common = {
    SetLoadStatusText: function (isAPI) {
        if (isAPI)
            $('#LoadingStatus').text('Accessing API please wait...');
        else
            $('#LoadingStatus').text('Accessing server please wait...');
    },
    CurrentYear: (new Date).getFullYear(),
    ajaxCall: function (formId, type, url, data, onSuccess, onError, isPageLevel) {
        if (onError == undefined)
            onError = Common.g_onError;
        data.__RequestVerificationToken = Common.getToken(formId);
        var g_onSuccess = function (bool) {
            return function (data, textStatus, jqXHR) {
                onSuccess(data);
            }
        };
        if (isPageLevel) {
            $('#loading').show();
        } else {

        }
        $.ajax({
            type: type,
            //headers: { 'Content-Type': 'application/json' },
            dataType: 'json',
            url: url,
            data: data,
            success: g_onSuccess(true),
            error: onError
        });
    },
    ajaxCallHTML: function (formId, type, url, data, onSuccess, onError, isPageLevel) {
        if (onError == undefined)
            onError = Common.g_onError;
        data.__RequestVerificationToken = Common.getToken(formId);
        var g_onSuccess = function (bool) {
            return function (data, textStatus, jqXHR) {
                onSuccess(data);
            }
        };
        $.ajax({
            type: type,
            dataType: 'html',
            url: url,
            data: data,
            success: g_onSuccess(true),
            error: onError
        });
    },
    getToken: function (formId) {
        if (formId != "") {
            var form = $(formId);
            var token = $('input[name="__RequestVerificationToken"]', form).val();
            return token;
        } else {
            return $('input[name="__RequestVerificationToken"]').val();
        }
    },
    checkSession: function (data) {
        if (data.Session) {
            raiseError(data.Url);
            return false;
        } else {
            var jsonResponse = undefined;
            try {
                jsonResponse = JSON.parse(data);
            } catch (e) { }
            if (jsonResponse != undefined && jsonResponse.Session) {
                raiseError(jsonResponse.Url);
                return false;
            } else {
                return true;
            }
        }
    },
    Warning: "warning",
    Success: "success",
    Error: "error",
    E2MASNotification: function (message, msgType) {
        if (msgType == Common.Error) {
            //DevExpress.ui.notify({
            //    message: message,
            //    type: msgType,
            //    closeOnClick: true,
            //    position: { my: 'right', at: 'bottom' },
            //    width: function () { return $(window).width() * 0.4 }
            //});
            DevExpress.ui.dialog.alert(message, 'Error');
        } else {
            DevExpress.ui.notify(message, msgType, 3000);
        }
        $('#loading').hide();
    },
    raiseError: function (url) {
        if (typeof global == 'undefined')
            alert("Session expired. Please login again.");
        else if (!global.errorRaised) {
            alert("Session expired. Please login again.");
            global.errorRaised = true;
        }
        redirecttoUrl(url);
    },
    redirecttoUrl: function (currentTargetId, queryScenarioID, sequence) {
        var dynamicURL = "";
        switch (currentTargetId) {
            case "DM":
                {
                    dynamicURL = "/IHS/Demand?scenarioid=" + queryScenarioID + "&sequence=" + sequence;
                    break;
                }
            case "PC":
                {
                    dynamicURL = "/Petrochemical/Home?scenarioid=" + queryScenarioID + "&sequence=" + sequence;
                    break;
                }
            case "MA":
                {
                    dynamicURL = "/OE/Home?scenarioid=" + queryScenarioID + "&sequenceNumber=" + sequence;
                    break;
                }
            case "OS":
                {
                    dynamicURL = "/Oil/Home?scenarioid=" + queryScenarioID + "&sequenceNumber=" + sequence;
                    break;
                }
            case "CS":
                {
                    dynamicURL = "/Coal/Home?scenarioid=" + queryScenarioID + "&sequenceNumber=" + sequence;
                    break;
                }
            case "GS":
                {
                    dynamicURL = "/Gas/Home?scenarioid=" + queryScenarioID + "&sequenceNumber=" + sequence;
                    break;
                }
            case "RF":
                {
                    dynamicURL = "/Refinery/Home?scenarioid=" + queryScenarioID + "&sequenceNumber=" + sequence;
                    break;
                }
            default:
                break;
        }
        location.href = dynamicURL;
    },
    g_Error: function (response, val) {
        console.log(response.responseText);
        if (response.statusText == "abort")
            return;
        if (response.status == 502) {
            alert("Unable to contact the server. Please refresh your page and try again.");
        } else {
            alert(response.statusText + ". Some error occurred. You will be redirected to the login page.");
        }
    },
    g_onError: function (jqXHR, exception) {
        var message;
        if (jqXHR.status === 0) {
            message = 'Not connect.\n Verify Network.';
        } else if (jqXHR.status == 404) {
            message = 'Requested page not found. [404]';
        } else if (jqXHR.status == 500) {
            message = 'Internal Server Error [500].';
        } else if (exception === 'parsererror') {
            message = 'Requested JSON parse failed.';
        } else if (exception === 'timeout') {
            message = 'Time out error.';
        } else if (exception === 'abort') {
            message = 'Ajax request aborted.';
        } else {
            message = 'Uncaught Error.\n' + jqXHR.responseText;
        }
        console.log(message);
        Common.E2MASNotification(message, Common.Error);
        $('#loading').hide();
    },
    getQueryString: function () {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    },
    jsonFetch: function (arrayList, columnID, columnValue) {
        var locArray = []; var returnResult = [];
        if (arrayList.length > 0) {
            returnResult = $.grep(arrayList, function (grepvalue) {
                return grepvalue[columnID] === columnValue
            });
        }
        return returnResult;
    },
    jsonRemove: function (arrayList, columnID, columnValue) {
        var locArray = [];
        if (arrayList.length > 0) {
            $.grep(arrayList, function (grepvalue) {
                return grepvalue[columnID] != columnValue
            });
        }
    },
    ErrorLog: function () {
        var errorLogs = {
            "Message": "Test Message",
            "StackTrace": "Test StackTrace",
            "InnerException": "Test InnerException",
            "ApplicationId": 1
        };
        var data = { "errorLog": JSON.stringify(errorLogs) };
        var formId = $('#frmIHS');
        var url = "/IHS/saveErrorLog";
        Common.ajaxCall(formId, "POST", url, data, Common.errorLogSuccess, Common.g_onError)
    },
    errorLogSuccess: function (rData) {
        if (rData != null && rData.outputDetails.length > 0) {
            alert(rData.outputDetails);
        }
    },
    ModelPageShowHide: function (pageType, pageCallback) {
        switch (pageType) {
            case "SN":
                {
                    $('#logoCreateScenario').show();
                    $('#logoMacro,#logoDemand,#logoPetchem,#logoOilSupply,#logoCoalSupply,#logoGasSupply,#logoRefinery').hide();
                    break;
                }
            case "MA":
                {
                    $('#logoMacro').show();
                    $('#logoCreateScenario,#logoDemand,#logoPetchem,#logoOilSupply,#logoCoalSupply,#logoGasSupply,#logoRefinery').hide();
                    break;
                }
            case "DM":
                {
                    $('#logoDemand').show();
                    $('#logoCreateScenario,#logoMacro,#logoPetchem,#logoOilSupply,#logoCoalSupply,#logoGasSupply,#logoRefinery').hide();
                    break;
                }
            case "PC":
                {
                    $('#logoPetchem').show();
                    $('#logoCreateScenario,#logoMacro,#logoDemand,#logoOilSupply,#logoCoalSupply,#logoGasSupply,#logoRefinery').hide();
                    break;
                }
            case "OS":
                {
                    $('#logoOilSupply').show();
                    $('#logoCreateScenario,#logoMacro,#logoDemand,#logoPetchem,#logoCoalSupply,#logoGasSupply,#logoRefinery').hide();
                    break;
                }
            case "CS":
                {
                    $('#logoCoalSupply').show();
                    $('#logoCreateScenario,#logoMacro,#logoDemand,#logoPetchem,#logoOilSupply,#logoGasSupply,#logoRefinery').hide();
                    break;
                }
            case "GS":
                {
                    $('#logoGasSupply').show();
                    $('#logoCreateScenario,#logoMacro,#logoDemand,#logoPetchem,#logoOilSupply,#logoCoalSupply,#logoRefinery').hide();
                    break;
                }
            case "RF":
                {
                    $('#logoRefinery').show();
                    $('#logoCreateScenario,#logoMacro,#logoDemand,#logoPetchem,#logoOilSupply,#logoCoalSupply,#logoGasSupply').hide();
                    break;
                }
            default:
                break;
                pageCallback();
        }
    },
    GetUnique: function (list) {
        var result = [];
        $.each(list, function (i, e) {
            if ($.inArray(e, result) == -1)
                result.push(e);
        });
        return result;
    },
    isJSON: function (something) {
        if (typeof something != 'string')
            something = JSON.stringify(something);
        try {
            JSON.parse(something);
            return true;
        } catch (e) {
            return false;
        }
    },
    dynamicPageSize: function (arrayLength) {
        var dynamicPageSize = [];
        var initialSize = 10;
        for (var iIndex = 0; iIndex < arrayLength;) {
            var iIndexVal = initialSize + iIndex
            iIndex = iIndexVal;
            dynamicPageSize.push(iIndexVal);
        }
        return dynamicPageSize;
    },
    redirecttoSelectedUrl: function (scenarioId, modelName) {
        switch (modelName) {
            case "MA":
                {
                    location.href = "/IHS/demand?scenarioid=" + scenarioId;
                    break;
                }
            case "DM":
                {
                    location.href = "/IHS/demand?scenarioid=" + scenarioId;
                    break;
                }
            case "PC":
                {
                    location.href = "/IHS/demand?scenarioid=" + scenarioId;
                    break;
                }
            case "OS":
                {
                    location.href = "/IHS/demand?scenarioid=" + scenarioId;
                    break;
                }
            case "CS":
                {
                    location.href = "/IHS/demand?scenarioid=" + scenarioId;
                    break;
                }
            case "GS":
                {
                    location.href = "/IHS/demand?scenarioid=" + scenarioId;
                    break;
                }
            case "RF":
                {
                    location.href = "/IHS/demand?scenarioid=" + scenarioId;
                    break;
                }
            default:
                break;
                pageCallback();
        }
    },
    CommonModel: {
        CommonHeaderBinding: function (formId, scenarioId, modelcode, modelSequenceNo) {
            modelcode = modelcode == null ? "SC" : 1;
            modelSequenceNo = modelSequenceNo == null ? 1 : modelSequenceNo;
            var data = { "scenarioId": scenarioId, "modelCode": modelcode, "modelSequenceNo": modelSequenceNo };
            var formId = $('#' + formId);
            var url = "/Home/getE2MASModelHeaders";
            Common.ajaxCallHTML(formId, "GET", url, data, Common.CommonModel.HeaderBindingSuccess, Common.g_onError);
        },
        HeaderBindingSuccess: function (rData) {
            $('#loading').hide();
            if (rData != null) {
                var dynamicHeader = $($.parseHTML(rData)).filter('#dynamicHeader').html();
                if (dynamicHeader != null && dynamicHeader != "" && dynamicHeader != "undefined" && dynamicHeader.length > 100) {
                    $('#dynamicHeader').html('');
                    $('#dynamicHeader').html(dynamicHeader);
                }
            }
        },
        IsInput: true,
        GetModelSeqInputs: function (scenarioID, modelCode, modelSeqNo, IsInput, targetUrl, isSessionAvailable) {
            Common.CommonModel.IsInput = IsInput;

            switch (modelCode) {
                case "DM":
                    {
                        Common.CommonModel.GetDemandInputOutputs(scenarioID, modelSeqNo, IsInput);
                        break;
                    }
                case "PC":
                    {
                        Common.CommonModel.GetPetchemInputOutputs(scenarioID, modelSeqNo, IsInput);
                        break;
                    }
                case "MA":
                    {
                        Common.CommonModel.GetMacroInputOutputs(scenarioID, modelSeqNo, IsInput);
                        break;
                    }
                case "OS":
                case "GS":
                case "RF":
                case "CS":
                    {
                        if (isSessionAvailable == 1 || isSessionAvailable === '1') {
                            $("#wm-input-output-popup").dxPopup({
                                closeOnBackButton: true,
                                visible: true,
                                dragEnabled: false,
                                focusStateEnabled: false,
                                shading: true,
                                shadingColor: "rgba(200,200,200,0.8)",
                                showCloseButton: true,
                                contentTemplate: function (contentElement) {
                                    contentElement.append("<iframe style='border: 0; width: 100%; height: 100%' src=" + targetUrl + "></iframe>");
                                },
                                fullScreen: false,
                                height: function () {
                                    return $(window).height() * 0.95
                                },
                                width: function () {
                                    return $(window).width() * 0.95
                                },
                                position: {
                                    my: 'center',
                                    at: 'center',
                                    of: window
                                },
                            });

                        }
                        else {
                            alter("Session not yet initiated,no records available");
                        }
                        break;
                    }
                default:
                    break;
            }
        },
        GetDemandInputOutputs: function (scenarioID, modelSeqNo, IsInput) {
            globalScenarioId = scenarioID;
            globalSequenceNumber = modelSeqNo;
            var modelSeqNumber = $('#modelSeqNumber').val();
            var data = { "scenarioid": scenarioID, "sequence": modelSeqNo, "IsInput": IsInput };
            var url = "/IHS/getDemandModelInputOutputs";
            Common.ajaxCall('', "GET", url, data, Common.CommonModel.BindDemandInputOutputssSuccess, Common.g_onError, true);
        },
        BindDemandInputOutputssSuccess: function (rData) {
            $('#loading').hide();
            var scenarioName = $('#VSN label').attr('value');
            if (rData != null && rData.toutputdetails) {
                var jsonDatas = JSON.parse(rData.toutputdetails);
                if (jsonDatas != null) {
                    var DemandcolumnsArray = [];
                    var arrayHeader = {};
                    if (jsonDatas != null && jsonDatas.length > 0) {
                        $.each(jsonDatas[0], function (key, value) {
                            if (key.toUpperCase() == "ROWNUMBER") {
                                arrayHeader = {
                                    "dataField": key,
                                    "visible": false,
                                    "allowEditing": false,
                                    "fixed": true,
                                    "showInColumnChooser": false
                                };
                            } else {
                                arrayHeader = {
                                    "dataField": key,
                                    "visible": true,
                                    "allowEditing": true,
                                    "fixed": true,
                                    "showInColumnChooser": true
                                };

                            }
                            DemandcolumnsArray.push(arrayHeader);
                        });
                    }
                }
                var typeOfInputOutput = Common.CommonModel.IsInput == true ? scenarioName + ' - Demand Input' : scenarioName + ' - Demand Output';
                //var isInput = Common.CommonModel.IsInput === true;
                //var exportDemandUrl = "/IHS/ExportModelInputOutputs?scenarioId=" + globalScenarioId + "&sequence=" + globalSequenceNumber + "&isInput=" + isInput
                $("#input_output_popup").dxPopup({
                    title: typeOfInputOutput,
                    fullScreen: true,
                    onShown: function () {
                        $("#input_output").dxDataGrid({
                            onToolbarPreparing: function (e) {
                                var toolbarItems = e.toolbarOptions.items;
                                // Adds a new item
                                toolbarItems.push({
                                    widget: 'dxButton',
                                    options: {
                                        icon: 'fa fa-download', onClick:
                                            function () {
                                                //alert(exportDemandUrl);
                                                location.href = "/IHS/ExportModelInputOutputs?scenarioId=" + globalScenarioId + "&sequence=" + globalSequenceNumber + "&isInput=" + Common.CommonModel.IsInput;
                                            }
                                    },
                                    location: 'after'
                                })
                            },

                            dataSource: jsonDatas,
                            keyExpr: "RowNumber",
                            loadPanel: {
                                enabled: true
                            },
                            "export": {
                                enabled: true,
                                fileName: typeOfInputOutput,
                                allowExportSelectedData: true
                            },
                            allowColumnResizing: true,
                            pager: {
                                showInfo: true,
                                showNavigationButtons: true
                            },
                            searchPanel: {
                                visible: true,
                                width: 250
                            },
                            headerFilter: {
                                visible: true
                            },
                            columnChooser: {
                                enabled: true
                            },
                            selection: {
                                mode: "multiple",
                                allowSelectAll: true,
                                showCheckBoxesMode: "always"
                            },
                            onRowPrepared: function (info) {
                                //if (info.rowType != "header" && info.data.ID === 9)
                                //    info.rowElement.addClass("ihscomparsion");
                                //else if (info.rowType != "header" && info.data.ID === 1)
                                //    info.rowElement.addClass("ninegray");
                                //else if (info.rowType != "header" && info.data.ID === 32)
                                //    info.rowElement.addClass("ninegray");
                                //else if (info.rowType != "header" && info.data.ID === 10)
                                //    info.rowElement.addClass("ihsinput");
                            },
                            groupPanel: {
                                visible: true
                            },
                            wordWrapEnabled: false,
                            columns: DemandcolumnsArray,
                            columnAutoWidth: true,
                            showRowLines: true,
                            columnFixing: {
                                enabled: true
                            }
                        }).dxDataGrid('instance');
                    }
                });
                $("#input_output_popup").dxPopup("instance").show();
            }

        },
        GetPetchemInputOutputs: function (scenarioID, modelSeqNo, IsInput) {
            var modelSeqNumber = $('#modelSeqNumber').val();
            globalScenarioId = scenarioID;
            globalSequenceNumber = modelSeqNo;
            var data = { "scenarioid": scenarioID, "sequence": modelSeqNo, "IsInput": IsInput };
            var url = "/Petrochemical/getPetchemModelInputOutputs";
            Common.ajaxCall('', "GET", url, data, Common.CommonModel.BindPetchemInputOutputssSuccess, Common.g_onError, true);
        },
        BindPetchemInputOutputssSuccess: function (rData) {
            $('#loading').hide();
            if (rData != null && rData.toutputdetails) {
                var jsonDatas = JSON.parse(rData.toutputdetails);
                var scenarioName = $('#VSN label').attr('value');
                if (jsonDatas != null) {
                    var DemandcolumnsArray = [];
                    var arrayHeader = {};
                    if (jsonDatas != null && jsonDatas.length > 0) {
                        $.each(jsonDatas[0], function (key, value) {
                            if (key.toUpperCase() == "ROWNUMBER") {
                                arrayHeader = {
                                    "dataField": key,
                                    "visible": false,
                                    "allowEditing": false,
                                    "fixed": true,
                                    "showInColumnChooser": false
                                };
                            } else {
                                arrayHeader = {
                                    "dataField": key,
                                    "visible": true,
                                    "allowEditing": true,
                                    "fixed": true,
                                    "showInColumnChooser": true
                                };

                            }
                            DemandcolumnsArray.push(arrayHeader);
                        });
                    }
                }
                var typeOfInputOutput = Common.CommonModel.IsInput == true ? scenarioName + ' - Petchem Input' : scenarioName + ' - Petchem Output';

                $("#input_output_popup_petchem").dxPopup({
                    title: typeOfInputOutput,
                    fullScreen: true,
                    onShown: function () {
                        $("#input_output_petchem").dxDataGrid({
                            onToolbarPreparing: function (e) {
                                var toolbarItems = e.toolbarOptions.items;

                                toolbarItems.push({
                                    widget: 'dxButton',
                                    options: {
                                        icon: 'fa fa-download',
                                        onClick: function () {
                                            location.href = "/Petrochemical/ExportModelInputOutputs?scenarioId=" + globalScenarioId + "&sequence=" + globalSequenceNumber + "&isInput=" + Common.CommonModel.IsInput;
                                        }
                                    },
                                    location: 'after'
                                })
                            },
                            dataSource: jsonDatas,
                            keyExpr: "RowNumber",
                            loadPanel: {
                                enabled: true
                            },
                            "export": {
                                enabled: true,
                                fileName: typeOfInputOutput,
                                allowExportSelectedData: true
                            },
                            pager: {
                                showInfo: true,
                                showNavigationButtons: true
                            },
                            searchPanel: {
                                visible: true,
                                width: 250
                            },
                            headerFilter: {
                                visible: true
                            },
                            columnChooser: {
                                enabled: true
                            },
                            selection: {
                                mode: "multiple",
                                allowSelectAll: true,
                                showCheckBoxesMode: "always"
                            },
                            onRowPrepared: function (info) {
                                //if (info.rowType != "header" && info.data.ID === 9)
                                //    info.rowElement.addClass("ihscomparsion");
                                //else if (info.rowType != "header" && info.data.ID === 1)
                                //    info.rowElement.addClass("ninegray");
                                //else if (info.rowType != "header" && info.data.ID === 32)
                                //    info.rowElement.addClass("ninegray");
                                //else if (info.rowType != "header" && info.data.ID === 10)
                                //    info.rowElement.addClass("ihsinput");
                            },
                            groupPanel: {
                                visible: true
                            },
                            wordWrapEnabled: false,
                            columns: DemandcolumnsArray,
                            columnAutoWidth: true,
                            showRowLines: true,
                            columnFixing: {
                                enabled: true
                            }
                        }).dxDataGrid('instance');
                    }
                });
                $("#input_output_popup_petchem").dxPopup("instance").show();
            }
        },
        GetMacroInputOutputs: function (scenarioID, modelSeqNo, IsInput) {
            var modelSeqNumber = $('#modelSeqNumber').val();
            var data = { "scenarioid": scenarioID, "sequence": modelSeqNo, "IsInput": IsInput };
            var url = "/Oil/getMacroModelInputOutputs";
            Common.ajaxCall('', "GET", url, data, Common.CommonModel.BindMacroInputOutputs, Common.g_onError, true);
        },
        BindMacroInputOutputs: function (rData) {
            $('#loading').hide();
            var scenarioName = $('#VSN label').attr('value');
            if (rData != null && rData.toutputdetails) {
                var jsonDatas = JSON.parse(rData.toutputdetails);
                if (jsonDatas != null) {
                    var DemandcolumnsArray = [];
                    var arrayHeader = {};
                    if (jsonDatas != null && jsonDatas.length > 0) {
                        $.each(jsonDatas[0], function (key, value) {
                            if (key.toUpperCase() == "ROWNUMBER") {
                                arrayHeader = {
                                    "dataField": key,
                                    "visible": false,
                                    "allowEditing": false,
                                    "fixed": true,
                                    "showInColumnChooser": false
                                };
                            } else {
                                arrayHeader = {
                                    "dataField": key,
                                    "visible": true,
                                    "allowEditing": true,
                                    "fixed": true,
                                    "showInColumnChooser": true
                                };

                            }
                            DemandcolumnsArray.push(arrayHeader);
                        });
                    }
                }
                $("#input_output_popup").dxPopup({
                    title: Common.CommonModel.IsInput == true ? scenarioName + ' - Macro Input' : scenarioName + ' - Macro Output',
                    fullScreen: true,
                    onShown: function () {
                        $("#input_output").dxDataGrid({
                            dataSource: jsonDatas,
                            keyExpr: "RowNumber",
                            loadPanel: {
                                enabled: true
                            },
                            "export": {
                                enabled: true,
                                fileName: Common.CommonModel.IsInput == true ? scenarioName + ' - Macro Input' : scenarioName + ' - Macro Output',
                                allowExportSelectedData: true
                            },
                            allowColumnResizing: true,
                            pager: {
                                showInfo: true,
                                showNavigationButtons: true
                            },
                            searchPanel: {
                                visible: true,
                                width: 250
                            },
                            headerFilter: {
                                visible: true
                            },
                            columnChooser: {
                                enabled: true
                            },
                            selection: {
                                mode: "multiple",
                                allowSelectAll: true,
                                showCheckBoxesMode: "always"
                            },
                            onRowPrepared: function (info) {
                                //if (info.rowType != "header" && info.data.ID === 9)
                                //    info.rowElement.addClass("ihscomparsion");
                                //else if (info.rowType != "header" && info.data.ID === 1)
                                //    info.rowElement.addClass("ninegray");
                                //else if (info.rowType != "header" && info.data.ID === 32)
                                //    info.rowElement.addClass("ninegray");
                                //else if (info.rowType != "header" && info.data.ID === 10)
                                //    info.rowElement.addClass("ihsinput");
                            },
                            groupPanel: {
                                visible: true
                            },
                            wordWrapEnabled: false,
                            columns: DemandcolumnsArray,
                            columnAutoWidth: true,
                            showRowLines: true,
                            columnFixing: {
                                enabled: true
                            }
                        }).dxDataGrid('instance');
                    }
                });
                $("#input_output_popup").dxPopup("instance").show();
            }
        },
        GetModelSeqInputSuccess: function () {
            $("#input_output_popup").dxPopup({
                title: 'Demand Input',
                fullScreen: true,
                onShown: function () {
                    $("#input_output").dxDataGrid({
                        dataSource: null,
                        loadPanel: {
                            enabled: true
                        },
                        "export": {
                            enabled: true,
                            fileName: "Demand Output",
                            allowExportSelectedData: true
                        },
                        searchPanel: {
                            visible: true,
                            width: 250
                        },
                        headerFilter: {
                            visible: true
                        },
                        columnChooser: {
                            enabled: true
                        },
                        selection: {
                            mode: "multiple",
                            allowSelectAll: true,
                            showCheckBoxesMode: "always"
                        },

                        onRowPrepared: function (info) {
                            if (info.rowType != "header" && info.data.ID === 9)
                                info.rowElement.addClass("ihscomparsion");
                            else if (info.rowType != "header" && info.data.ID === 1)
                                info.rowElement.addClass("ninegray");
                            else if (info.rowType != "header" && info.data.ID === 32)
                                info.rowElement.addClass("ninegray");
                            else if (info.rowType != "header" && info.data.ID === 10)
                                info.rowElement.addClass("ihsinput");
                        },
                        groupPanel: {
                            visible: true
                        },
                        wordWrapEnabled: false,

                        columns: [
                            {
                                dataField: "SeriesName",
                                caption: "Series Name",
                                allowEditing: false,
                                width: 200,
                                fixed: true
                            },
                        {
                            dataField: "GenericSeriesMnemonic",
                            caption: "Generic Series Mnemonic",
                            allowEditing: false,
                            allowSorting: false,
                            width: 200,
                            fixed: true
                        },
                        {
                            dataField: "Unit",
                            caption: "Unit",
                            width: 80,
                            allowEditing: false,
                            allowSorting: false,
                            fixed: true
                        }],
                        columnAutoWidth: true,
                        showRowLines: true,
                        columnFixing: {
                            enabled: true
                        }
                    }).dxDataGrid('instance');
                }
            });
            $("#input_output_popup").dxPopup("instance").show();
        },
        CallNextModelProcess: function (formId, scenarioId, ModelCode, modelSequenceNo) {
            var data = { "scenarioId": scenarioId, "modelSequenceNo": modelSequenceNo };
            var formId = $('#' + formId);
            var url = "/Home/updateNextModelStatus";
            Common.ajaxCallHTML(formId, "GET", url, data, Common.CommonModel.CallNextModelDXILayerSuccess, Common.g_onError);
        },
        CallNextModelDXILayerSuccess: function () {

        }
    },
    formIsDirty: function (form) {
        for (var i = 0; i < form.elements.length; i++) {
            var element = form.elements[i];
            var type = element.type;
            if (type == "checkbox" || type == "radio") {
                if (element.checked != element.defaultChecked) {
                    return true;
                }
            }
            else if (type == "hidden" || type == "password" ||
                     type == "text" || type == "textarea") {
                if (element.value != element.defaultValue) {
                    return true;
                }
            }
            else if (type == "select-one" || type == "select-multiple") {
                for (var j = 0; j < element.options.length; j++) {
                    if (element.options[j].selected !=
                        element.options[j].defaultSelected) {
                        return true;
                    }
                }
            }
        }
        return false;
    },
    Headertop: function () {
        var ANIMATION_LENGTH = 300;
        var $panel = $("#RJHP");
        var $tab = $("#RJHT");
        $tab.click(function () {
            var isShown = ($panel.css("top") === "0px") ? true : false;
            var newTop = (isShown) ? "-89px" : "0px";
            $panel.animate({ "top": newTop }, ANIMATION_LENGTH);
        });

        $("#RJHP").click(function () {
            $(this).css("top: 23px");
        });
    },
    getFormattedDateUTC: function (date) {
        var dateString = "";
        dateString = date.getFullYear().toString();
        var month = (date.getMonth() + 1);
        dateString = dateString + "-" + (month.toString().length == 1 ? "0" + month.toString() : month.toString());
        dateString = dateString + "-" + (date.getDate().toString().length == 1 ? "0" + date.getDate().toString() : date.getDate().toString());
        return dateString;
    },
    getFormattedTime: function (date, secondsRequired) {
        var timeString = "";
        timeString = (date.getHours().toString().length == 1 ? "0" + date.getHours().toString() : date.getHours().toString());
        timeString = timeString + ":" + (date.getMinutes().toString().length == 1 ? "0" + date.getMinutes().toString() : date.getMinutes().toString());
        if (secondsRequired)
            timeString = timeString + ":" + (date.getSeconds().toString().length == 1 ? "0" + date.getSeconds().toString() : date.getSeconds().toString());
        return timeString;
    },
    extractDate: function (value) {
        try {
            if (value == undefined)
                return value;
            var arrDate = value.split("T")[0].split('-');
            var arrTime = value.split("T")[1].split("+")[0].split(":");
            return new Date(parseInt(arrDate[0]), (parseInt(arrDate[1]) - 1), parseInt(arrDate[2]), parseInt(arrTime[0]), parseInt(arrTime[1]), parseInt(arrTime[2]));
        } catch (e) {
            console.log(e);
            return new Date(value);
        }
    }
};


