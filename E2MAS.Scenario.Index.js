$(document).ready(function () {
    ScenarioHome.GetScenarioList(true);
    ScenarioHome.GetScenarioDrpList();
});
ScenarioHome = {
    IsPageLoad: true,
    GetScenarioDrpList: function () {
        var data = {};
        var formId = $('#frmScenarioList');
        var url = "/Home/getScenarioDahsboardList";
        Common.ajaxCall(formId, "GET", url, data, ScenarioHome.ScenarioDahsboardSuccess, Common.g_onError, true);
    },
    ScenarioDahsboardSuccess: function (rData) {
        if (rData != null && rData.outputDetails != null && rData.outputDetails.length > 0) {
            var lastScenarioId = rData.outputDetails[0].ScenarioId;
            $("#latest_scenario").dxSelectBox({
                dataSource: new DevExpress.data.ArrayStore({
                    data: rData.outputDetails,
                    key: "ScenarioId"
                }),
                displayExpr: "ScenarioName",
                valueExpr: "ScenarioId",
                value: lastScenarioId,
                onSelectionChanged: function (args) {
                    if (args != null & args.selectedItem != null) {
                        ScenarioHome.GetScenarioIdHtml(args.selectedItem.ScenarioId);
                    }
                }
            });
        }
    },
    GetScenarioIdHtml: function (scenarioId) {
        var data = { "scenarioId": scenarioId };
        var formId = $('#frmScenarioList');
        var url = "/Home/getE2MASModelSummary";
        Common.ajaxCallHTML(formId, "GET", url, data, ScenarioHome.GetScenarioIdHtmlSuccess, Common.g_onError);
    },
    GetScenarioIdHtmlSuccess: function (rData) {
        if (rData != null) {
            var scenarioHTML = $.parseHTML(rData);
            $('.scenarioDynamicHTML').html('');
            $('.scenarioDynamicHTML').html(scenarioHTML);
        }
    },
    GetScenarioList: function (flag) {
        var data = {};
        var formId = $('#frmScenarioList');
        var url = "/Scenario/getScenarioList";
        if (flag)
            Common.ajaxCall(formId, "GET", url, data, ScenarioHome.BindScenarioListSuccess, Common.g_onError);
        else
            Common.ajaxCall(formId, "GET", url, data, ScenarioHome.BindEmptyScenarioList, Common.g_onError);
    },
    BindScenarioListSuccess: function (rData) {
        $('#loading').hide();
        if (rData != null && rData.outputDetails != null && rData.outputDetails.length > 0) {
            ScenarioHome.BindScenarioList(rData.outputDetails);
        }
    },
    BindEmptyScenarioList: function (rData) {
        $('#loading').hide();
        if (rData != null && rData.outputDetails != null && rData.outputDetails.length > 0) {
            var updatedList = $("#scenarioListHome").dxDataGrid("instance");
            updatedList.option('dataSource', []);
            updatedList.option('dataSource', rData.outputDetails);
        }
    },
    BindScenarioList: function (scenariolist) {
        var standAloneText = "Standalone";
        var approvedText = "Approved";
        var notApplicableText = "Not Applicable";
        var completedText = "Completed";
        var pendingText = "Pending";
        var notSelectedText = "Not Selected";
        var dataGrid = $("#scenarioListHome").dxDataGrid({
            dataSource: scenariolist,
            keyExpr: "ScenarioId",
            selection: {
                mode: "multiple",
                showCheckBoxesMode: "none"
            },
            allowColumnResizing: true,
            "export": {
                enabled: true,
                fileName: "Scenario List",
                allowExportSelectedData: true
            },
            editing: {
                mode: "cell",
                allowUpdating: true
            },
            paging: {
                pageSize: 7
            },
            onCellPrepared: function (e) {
                if (e.rowType == "data" && e.data.SCENARIOSTATUS === "Reiterate")
                    e.cellElement.addClass("red");
                else if (e.rowType == "data" && e.data.SCENARIOSTATUS === "Revert")
                    e.cellElement.addClass("yellow");
                else if (e.rowType == "data" && e.data.SCENARIOSTATUS === "Approved")
                    e.cellElement.addClass("green");
            },
            pager: {
                showPageSizeSelector: true,
                allowedPageSizes: [5, 10, 15],
                showInfo: true
            },
            columnAutoWidth: true,
            wordWrapEnabled: true,
            searchPanel: {
                visible: true,
                width: 250
            },
            headerFilter: {
                visible: false
            },
            loadPanel: {
                enabled: true
            },
            onSelectionChanged: function (data) {
                deleteButton.option("disabled", !data.selectedRowsData.length);
            },
            columns: [
                 {
                     dataField: "ScenarioId",
                     caption: "Scenario Id",
                     allowEditing: false,
                     width: 75,
                     fixed: true,
                     visible: true
                 },
                {
                    dataField: "ScenarioName",
                    caption: "Scenario Name",
                    allowEditing: false,
                    width: 200,
                    fixed: true,
                    visible: true
                }
                , {
                    dataField: "ModelNameSequence",
                    caption: "Model Name",
                    width: 200,
                    fixed: true,
                    allowEditing: false
                }
                , {
                    caption: "Year",
                    fixed: true,
                    width: 100,
                    columns: [{
                        caption: "From",
                        dataField: "StartYear",
                        width: 50,
                        allowEditing: false
                    }, {
                        caption: "To",
                        dataField: "EndYear",
                        width: 50,
                        allowEditing: false
                    }]
                }
                , {
                    caption: "Scenario Mode",
                    fixed: true,
                    width: 100,
                    dataField: "ScenarioMode"
                }
                , {
                    dataField: "MReport",
                    caption: "Scenario View | Modify",
                    allowFiltering: false,
                    width: 150,
                    allowEditing: false,
                    cellTemplate: function (container, options) {
                        $('<div scenarioId=' + options.row.data.ScenarioId + '/>').dxButton(
                            {
                                icon: '',
                                dataSource: scenariolist,
                                text: 'GoTo Scenario',
                                type: 'default',
                                disabled: false,
                                onClick: function (info) {
                                    if ($(this._$element[0]) != null && $(this._$element[0]) != undefined) {
                                        if ($(this._$element[0]).attr('scenarioid') != null && $(this._$element[0]).attr('scenarioid') != undefined) {
                                            var scenarioId = $(this._$element[0]).attr('scenarioid');
                                            if (parseInt(scenarioId) > 0) {
                                                var viewURL = "/Scenario/View?scenarioid=" + scenarioId;
                                                window.open(viewURL);
                                                //window.location.href = viewURL;
                                            }
                                        }
                                    }
                                }
                            }).appendTo(container);
                    }
                }
                , {
                    dataField: "ScenarioStatus",
                    caption: "Status",
                    allowFiltering: false,
                    allowEditing: false,
                    cellTemplate: function (container, options) {
                        $('<div />').dxButton(
                            {
                                icon: options.data.ScenarioMode == standAloneText ? '' : 'fa fa-comments-o',
                                text: options.data.ScenarioMode == standAloneText ? notApplicableText : options.data.ScenarioStatus,
                                disabled: (options.data.ScenarioStatus == approvedText) ? false : true,
                                onClick: function () {
                                }
                            }).appendTo(container);
                    }
                }
                , {
                    dataField: "Report",
                    caption: "Energy Balance Report",
                    width: 160,
                    allowFiltering: false,
                    allowEditing: false,
                    cellTemplate: function (container, options) {
                        $('<div scenarioId=' + options.row.data.ScenarioId + '/>').dxButton(
                            {
                                width: 140,
                                icon: options.data.IsEnergyBalance ? 'fa fa-eye' : '',
                                text: options.data.ScenarioMode == standAloneText ? notApplicableText : options.data.IsEnergyBalance ? 'View' : notSelectedText,
                                type: 'success',
                                disabled: ((options.data.ScenarioStatus == completedText || options.data.ScenarioStatus == approvedText || options.data.ScenarioStatus == pendingText) && options.data.IsEnergyBalance == true) ? false : true,
                                onClick: function (args) {
                                    if ($(this._$element[0]) != null && $(this._$element[0]) != undefined) {
                                        if ($(this._$element[0]).attr('scenarioid') != null && $(this._$element[0]).attr('scenarioid') != undefined && $(this._$element[0]).attr('scenarioid') > 0) {
                                            var scenarioId = $(this._$element[0]).attr('scenarioid');
                                            if (parseInt(scenarioId) > 0) {
                                                ScenarioHome.GetEnergyBalanceReport(scenarioId);
                                                document.getElementById('divCountry').style.display = 'inline-block';
                                                document.getElementById('divYear').style.display = 'inline-block';
                                            }
                                        }
                                    }
                                }
                            }).appendTo(container);
                    }
                }
                , {
                    dataField: "FReport",
                    caption: "Scenario Tracking Report",
                    allowFiltering: false,
                    width: 160,
                    allowEditing: false,
                    cellTemplate: function (container, options) {
                        $('<div scenarioId=' + options.row.data.ScenarioId + '/>').dxButton(
                            {
                                width: 160,
                                icon: options.data.ScenarioMode == standAloneText ? "" : 'fa fa-eye',
                                text: options.data.ScenarioMode == standAloneText ? notApplicableText : 'View',
                                type: 'warning',
                                disabled: options.data.ScenarioMode == standAloneText ? true : options.row.data.IsAnyOneModelCompleted ? false : true,
                                onClick: function (args) {
                                    if ($(this._$element[0]) != null && $(this._$element[0]) != undefined) {
                                        if ($(this._$element[0]).attr('scenarioid') != null && $(this._$element[0]).attr('scenarioid') != undefined) {
                                            var scenarioId = $(this._$element[0]).attr('scenarioid');
                                            if (parseInt(scenarioId) > 0) {
                                                ScenarioHome.getScenarioTrackingResponse(parseInt(scenarioId));
                                            }
                                        }
                                    }
                                }
                            }).appendTo(container);
                    }
                }
                , {
                    caption: "Comments",
                    allowFiltering: false,
                    allowEditing: false,
                    width: 160,
                    cellTemplate: function (container, options) {
                        $("<div />").dxButton({
                            icon: options.data.ScenarioMode == standAloneText ? "" : 'fa fa-comments-o',
                            text: options.data.ScenarioMode == standAloneText ? notApplicableText : 'Details',
                            type: 'warning',
                            width: 160,
                            disabled: options.data.ScenarioMode == standAloneText ? true : options.row.data.ScenarioStatus == approvedText ? false : true,
                            onClick: function () {
                                $("#popups").dxPopup("instance").show();
                            }
                        }).appendTo(container);
                    }
                }
                , {
                    dataField: "Modify",
                    caption: "Action List",
                    allowFiltering: false,
                    allowEditing: false,
                    cellTemplate: function (container, options) {
                        $('<div scenarioId=' + options.row.data.ScenarioId + '/>').dxButton(
                            {
                                text: options.data.ScenarioMode == standAloneText ? notApplicableText : 'Action',
                                icon: options.data.ScenarioMode == standAloneText ? '' : 'fa fa-reply-all',
                                type: 'warning',
                                disabled: options.data.ScenarioMode == standAloneText ? true : (options.row.data.ScenarioStatus == approvedText) ? true : ((options.row.data.ScenarioStatus == pendingText || options.row.data.IsAnyOneModelCompleted) ? false : true),
                                onClick: function () {
                                    if ($(this._$element[0]) != null && $(this._$element[0]) != undefined) {
                                        if ($(this._$element[0]).attr('scenarioid') != null && $(this._$element[0]).attr('scenarioid') != undefined) {
                                            var scenarioId = $(this._$element[0]).attr('scenarioid');
                                            if (parseInt(scenarioId) > 0) {
                                                var scenarioId = $(this._$element[0]).attr('scenarioid');
                                                if (parseInt(scenarioId) > 0) {
                                                    ScenarioHome.ScenarioAction(parseInt(scenarioId));
                                                }
                                            }
                                        }
                                    }
                                }
                            }).appendTo(container);
                    }
                }
                , {
                    dataField: "CreatedDate",
                    caption: "Created Date",
                    dataType: "date",
                    allowEditing: false
                }],
            onToolbarPreparing: function (e) {
                var scenariolistsrefresh = e.toolbarOptions.items;
                scenariolistsrefresh.push(
                {
                    location: "after",
                    widget: "dxButton",
                    options: {
                        icon: "refresh",
                        onClick: function () {
                            //dataGrid.refresh();
                            ScenarioHome.GetScenarioList(false);
                        }
                    }
                });
            }
        }).dxDataGrid("instance");
        var deleteButton = $("#scenarioDelete").dxButton({
            text: "Delete Selected Records",
            height: 34,
            width: 195,
            disabled: true,
            onClick: function () {
                var result = DevExpress.ui.dialog.confirm("Are you sure want to delete?", "Confirmation Delete");
                result.done(function (dialogResult) {
                    if (dialogResult == true) {
                        ScenarioHome.deleteScenario();
                    }
                });
            }
        }).dxButton("instance");
    },
    ScenarioAction: function (scenarioId) {
        //var scenarioIndividuals = $("#scenarioListHome").dxDataGrid('instance');
        var data = { "scenarioId": scenarioId };
        var formId = $('#frmScenarioList');
        var url = "/Scenario/getScenarioModelStatus";
        $('#hidScenarioId').val(scenarioId);
        Common.ajaxCall(formId, "GET", url, data, ScenarioHome.ScenarioActionSuccess, Common.g_onError, true);
    },
    ClearExceptRevertSelection: function () {
        $('#dxTabAction .dx-radiogroup div').removeClass('dx-radiobutton-icon-dot');
        $('#dxTabAction').find('.dx-radiogroup').find('input').val('');
        $('#dxTabAction .dx-checkbox-has-text').removeClass('dx-checkbox-checked');
        $('#dxTabAction .dx-checkbox-has-text').find('input').val(false);
    },
    ClearExceptApprovalSelection: function () {
        $('#dxTabAction .dx-checkbox-has-text').removeClass('dx-checkbox-checked');
        $('#dxTabAction .dx-checkbox-has-text').find('input').val(false);
        $('#dxTabAction .dx-radiogroup div').addClass('dx-radiobutton-icon-dot');
    },
    ClearExceptNotSatisfiedSelection: function () {
        $('#dxTabAction .dx-radiogroup div').addClass('dx-radiobutton-icon-dot');
    },
    ScenarioActionSuccess: function (rData) {
        $('#loading').hide();
        var isScenarioCompleted = false;
        if (rData != null && rData.outputDetails != null) {
            if (rData.outputDetails.Models.length > 0) {
                var modelCompleted = [];
                var modelCount = 0, modelCompletedCount = 0;
                modelCount = rData.outputDetails.Models.length;
                $.each(rData.outputDetails.Models, function (iIndex, iValue) {
                    if (iValue.ModelStatus == "Completed") {
                        var modelStatus = {
                            "ModelName": iValue.ModelName,
                            "ModelCode": iValue.ModelCode,
                            "ModelSequenceNumber": iValue.ModelSequenceNumber,
                            "ModelStatus": iValue.ModelStatus,
                            "ScenarioMode": iValue.ScenarioMode
                        };
                        modelCompleted.push(modelStatus);
                        modelCompletedCount++;
                    }
                });
                var revertComments = "", approvedComments = "", rejectedComments = "", commentsHistory = [], commentsHistoryArray = [];
                if (rData.outputDetails.Comments != null && rData.outputDetails.Comments.length > 0) {
                    $.each(rData.outputDetails.Comments, function (iIndex, iValue) {
                        //if (iValue.ActionName == "Revert")
                        //    revertComments = iValue.Comments;
                        //if (iValue.ActionName == "Approved")
                        //    approvedComments = iValue.Comments;
                        //if (iValue.ActionName == "Not Satisfied")
                        //    rejectedComments = iValue.Comments;
                        if (iValue.Comments != null && iValue.Comments != "") {
                            var comments = {
                                "ActionType": iValue.ActionName,
                                "Comments": iValue.Comments,
                                "CommentsDate": iValue.CreatedDate
                            };
                            commentsHistoryArray.push(comments);
                        }
                    });
                }
                var tabGeneralDetails = [
                {
                    editorType: "dxSelectBox",
                    colSpan: 3,
                    editorOptions: {
                        dataSource: modelCompleted,
                        displayExpr: "ModelName",
                        valueExpr: "ModelSequenceNumber",
                        placeholder: "Select a Model",
                        showClearButton: true,
                        onSelectionChanged: function (args) {
                            ScenarioHome.ClearExceptRevertSelection();
                        }
                    }
                },
                {
                    colSpan: 3,
                    dataField: "Comments",
                    editorType: "dxTextArea",
                    editorOptions: {
                        height: 150,
                        value: revertComments
                    }
                }];
                var tabContactDetails = [];
                var scenarioTabColumns = [];
                if (modelCount == modelCompletedCount) {
                    isScenarioCompleted = true;
                }
                var priorities = ["APPROVE", "REJECT"];
                tabContactDetails = [
                    {
                        editorType: "dxRadioGroup",
                        colSpan: 3,
                        editorOptions: {
                            items: priorities,
                            //value: priorities[0],
                            layout: "horizontal",
                            itemTemplate: function (itemData, _, itemElement) {
                                itemElement
                                    .parent().addClass(itemData.toLowerCase())
                                    .text(itemData);
                            },
                            onValueChanged: function (e) {
                                ScenarioHome.ClearExceptApprovalSelection();
                            }
                        }
                    },
                   {
                       colSpan: 3,
                       dataField: "Comments *",
                       editorType: "dxTextArea",
                       editorOptions: {
                           height: 150,
                           value: approvedComments
                       }
                   }];
                commentsHistory = [
                    {
                        editorType: "dxList",
                        colSpan: 3,
                        paginate: true,
                        pageSize: 2,
                        editorOptions: {
                            dataSource: commentsHistoryArray,
                            itemTemplate: function (itemData, itemIndex, itemElement) {
                                itemElement.append("<p style=\"font-size:larger;\"><b>" + itemData.ActionType + "</b></p>");
                                itemElement.append("<p>Comments: <i>" + itemData.Comments + "</i></p>");
                                itemElement.append("<p>Comments Date: <i>" + itemData.CommentsDate + "</i></p>");
                            }
                        }
                    }
                ];
                var reiterate = [
                {
                    colSpan: 3,
                    editorType: "dxCheckBox",
                    editorOptions: {
                        value: false,
                        text: "Not Satisfied"
                    },
                    onValueChanged: function (e) {
                        ScenarioHome.ClearExceptNotSatisfiedSelection();
                    }
                },
                {
                    colSpan: 3,
                    dataField: "Comments",
                    editorType: "dxTextArea",
                    editorOptions: {
                        height: 150,
                        value: rejectedComments
                    }
                }];
                var scenarioTabColumns = [
                {
                    title: "Revert",
                    colSpan: 3,
                    colCount: 3,
                    items: tabGeneralDetails
                },
                {
                    title: "Approval",
                    colSpan: 3,
                    colCount: 3,
                    items: tabContactDetails,
                    disabled: isScenarioCompleted == true ? false : true
                },
                {
                    title: "Reiterate",
                    colSpan: 3,
                    colCount: 3,
                    items: reiterate,
                    disabled: isScenarioCompleted == true ? false : true
                },
                {
                    title: "Comments History",
                    colSpan: 3,
                    colCount: 3,
                    items: commentsHistory,
                    disabled: false
                }];
                var scenarioAction = $("#scenarioAction").dxPopup({
                    title: 'Action',
                    width: 400,
                    height: 'auto',
                    contentTemplate: function (e) {
                        var formContainer = $("<div id='dxTabAction' dx-form='formOptions'>");
                        formContainer.dxForm({
                            colCount: 2,
                            readOnly: false,
                            showColonAfterLabel: false,
                            labelLocation: "top",
                            showValidationSummary: true,
                            items: [
                                {
                                    itemType: "tabbed",
                                    colSpan: 2,
                                    colCount: 2,
                                    caption: "Information",
                                    tabs: scenarioTabColumns
                                }]
                        }).dxForm("instance");
                        e.append(formContainer);
                        var saveButton = $("<div id='btnSave'>").dxButton({
                            text: 'Submit',
                            onClick: function (e) {
                                ScenarioHome.saveActions(isScenarioCompleted);
                            }
                        });
                        e.append(saveButton);
                        var cancelButton = $("<div id='btnCancel'>").dxButton({
                            text: 'Cancel',
                            onClick: function () {
                                $("#scenarioAction").dxPopup("instance").hide();
                            }
                        });
                        e.append(cancelButton);
                        // formContainer.append(saveButton);
                        // formContainer.append(cancelButton);
                    },
                    onShowing: function () {
                    }
                }).dxPopup("instance");
                scenarioAction.show();
            }
        }
        if (!isScenarioCompleted) {
            $($('#dxTabAction .dx-tab')[1]).addClass('disabled');
            $($('#dxTabAction .dx-tab')[2]).addClass('disabled');
        }
    },
    saveActions: function (isScenarioCompleted) {
        var hidScenarioId = $('#hidScenarioId').val();
        if (parseInt(hidScenarioId) != null && parseInt(hidScenarioId) > 0) {
            var actionInputs = {
                "ScenarioId": parseInt(hidScenarioId),
                "ModelSeqNumber": 0,
                "IsRevert": false,
                "IsApproved": false,
                "IsRejected": false,
                "ReIterateIsNotSatisfied": false,
                "Comments": ""
            };
            var modelCode = $('#dxTabAction').find('.dx-dropdowneditor-input-wrapper').find('input').val();
            var isValidModelCode = false, isValidApproval = false, isValidReiterate = false;
            if (parseInt(modelCode) != null && parseInt(modelCode) > 0) {
                isValidModelCode = true;
                actionInputs.ModelSeqNumber = parseInt(modelCode);
                var revertComment = $($('#dxTabAction').find('.dx-item .dx-multiview-item')[0]).find('textarea').val();
                actionInputs.Comments = revertComment;
                actionInputs.IsRevert = true;
            }
            if (isScenarioCompleted) {
                var radiogroup = $('#dxTabAction').find('.dx-radiogroup').find('input').val();
                var chkGroup = $('#dxTabAction').find('.dx-checkbox-has-text').find('input').val();
                if (radiogroup != null && radiogroup != "" && radiogroup != undefined) {
                    isValidApproval = true;
                    if (radiogroup == "APPROVE") {
                        actionInputs.IsApproved = true;
                    } else if (radiogroup == "REJECT") {
                        actionInputs.IsRejected = true;
                    }
                    var approvalComment = $($('#dxTabAction').find('.dx-item .dx-multiview-item')[1]).find('textarea').val();
                    if (approvalComment != undefined && approvalComment != null && approvalComment != "") {
                        actionInputs.Comments = approvalComment;
                    }
                }
                else if (chkGroup != null && chkGroup != "" && chkGroup != undefined && chkGroup) {
                    actionInputs.ReIterateIsNotSatisfied = true;
                    isValidReiterate = true;
                    var reIterateComment = $($('#dxTabAction').find('.dx-item .dx-multiview-item')[2]).find('textarea').val();
                    if (reIterateComment != undefined && reIterateComment != null && reIterateComment != "") {
                        actionInputs.Comments = reIterateComment;
                    }
                }
            }
            var isValidData = true;
            if (isValidModelCode && isValidApproval && isValidReiterate) {
                isValidData = false;
                Common.E2MASNotification("Please update any one status", Common.Warning);
                return false;
            }
            else if (isValidModelCode && isValidApproval) {
                isValidData = false;
                Common.E2MASNotification("Please update any one status", Common.Warning);
                return false;
            }
            else if (isValidModelCode && isValidReiterate) {
                isValidData = false;
                Common.E2MASNotification("Please update any one status", Common.Warning);
                return false;
            }
            else if (isValidApproval && isValidReiterate) {
                isValidData = false;
                Common.E2MASNotification("Please update any one status", Common.Warning);
                return false;
            }
            if (isValidData && (isValidModelCode || isValidApproval || isValidReiterate)) {
                var data = { "actionInputs": JSON.stringify(actionInputs) };
                var formId = $('#frmScenarioList');
                var url = "/Scenario/scenarioStatusChange";
                Common.ajaxCall(formId, "POST", url, data, ScenarioHome.scenarioStatusChangeSuccess, Common.g_onError, true);
            } else {
                Common.E2MASNotification("Select any one status", Common.Warning);
            }
        }
    },
    scenarioStatusChangeSuccess: function (rData) {
        $('#loading').hide();
        if (rData != null && rData.outputDetails != null) {
            if (rData.outputDetails.Status) {
                Common.E2MASNotification("Scenario updated Successfully", Common.Success);
                ScenarioHome.GetScenarioList();
                $("#scenarioAction").dxPopup("instance").hide();
            } else {
                Common.E2MASNotification(rData.outputDetails.StatusMessage, Common.Error);
            }
        }
    },
    deleteScenario: function () {
        var scenarioIdArray = [];
        var selectedDatas = $("#scenarioListHome").dxDataGrid('instance').getSelectedRowsData();
        $.each(selectedDatas, function (iIndex, iValue) {
            if (iValue != null && iValue.ScenarioId > 0) {
                scenarioIdArray.push(iValue.ScenarioId);
            }
        });
        var data = { "scenarioids": JSON.stringify(scenarioIdArray) };
        var formId = $('#frmScenarioList');
        var url = "/Scenario/deleteScenario";
        Common.ajaxCall(formId, "GET", url, data, ScenarioHome.deleteScenarioSuccess, Common.g_onError, true);
    },
    deleteScenarioSuccess: function (rData) {
        $('#loading').hide();
        if (rData != null && rData.outputDetails != null) {
            if (rData.outputDetails.Status) {
                Common.E2MASNotification("Scenario deleted Successfully", Common.Success);
                ScenarioHome.GetScenarioList();
            }
        }
    },
    getScenarioTrackingResponse: function (scenarioId) {
        var data = { "scenarioId": scenarioId };
        var formId = $('#frmScenarioList');
        var url = "/Scenario/getScenarioTrackingResponse";
        Common.ajaxCall(formId, "GET", url, data, ScenarioHome.TrackingResponseSuccess, Common.g_onError, true);
    },
    TrackingResponseSuccess: function (rData) {
        $('#loading').hide();
        if (rData != null && rData.outputDetails != null) {
            if (rData.outputDetails.Status) {
                ScenarioHome.BindTrackingResponse(rData.outputDetails.trackingResponse);
            }
        }
    },
    BindTrackingResponse: function (outputDetails) {
        var scenariotracking = $("#Dstracking").dxPopup({
            title: 'Scenario Tracking',
            fullScreen: true,
            onShown: function () {
                $("#DSLtracking").dxDataGrid({
                    dataSource: outputDetails,
                    columnAutoWidth: true,
                    allowColumnReordering: true,
                    showBorders: true,
                    hoverStateEnabled: true,
                    selection: {
                        mode: "multiple",
                        showCheckBoxesMode: "none"
                    },
                    "export": {
                        enabled: true,
                        fileName: "Energy Balance",
                        allowExportSelectedData: true
                    },
                    allowColumnResizing: true,
                    searchPanel: {
                        visible: true,
                        width: 250
                    },
                    headerFilter: {
                        visible: false
                    },
                    loadPanel: {
                        enabled: true
                    },

                    columnChooser: {
                        enabled: true
                    },
                    paging: {
                        pageSize: 15
                    },
                    pager: {
                        showPageSizeSelector: true,
                        allowedPageSizes: [5, 10, 20, 30, 40],
                        showInfo: true
                    },
                    columns: [
                    {
                        caption: "From",
                        cssClass: 'from_to_model_header',
                        columns:
                            [
                            {
                                caption: "Model",
                                dataField: "FromModel",
                                cssClass: 'from_to_model',
                                allowSorting: false
                            }, {
                                caption: "Source Variable Name",
                                dataField: "SourceVariableName",
                                allowSorting: false

                            },
                            {
                                caption: "Source Variable Description",
                                dataField: "SourceVariableName",
                                allowSorting: false

                            }, {
                                caption: "Source Country Code",
                                dataField: "SourceCountryCode",
                                allowSorting: false

                            }, {
                                caption: "Year",
                                dataField: "SourceModelYear",
                                allowSorting: false

                            }, {
                                caption: "Variable Value",
                                dataField: "Variablevalue",
                                allowSorting: false
                            },
                            {
                                caption: "UnitConversion",
                                dataField: "UnitConversion",
                                allowSorting: false

                            }, {
                                caption: "Currency Conversion",
                                dataField: "CurrencyConversion",
                                allowSorting: false

                            }, {
                                caption: "Aggregation",
                                dataField: "Aggregation_Disaggregation",
                                allowSorting: false
                            }
                            ]
                    },
                    {
                        caption: "To",
                        cssClass: 'from_to_model_header',
                        columns: [
                            {
                                caption: "ToModel",
                                dataField: "ToModel",
                                allowSorting: false,
                                cssClass: 'from_to_model_header'
                            }, {
                                caption: "Target VariableName",
                                dataField: "TargetVariableName",
                                allowSorting: false
                            },
                            {
                                caption: "Target Variable Description",
                                dataField: "TargetVariableName",
                                allowSorting: false
                            },
                            {
                                caption: "Target CountryCode",
                                dataField: "TargetCountryCode",
                                allowSorting: false

                            }, {
                                caption: "Target ModelYear",
                                dataField: "TargetModelYear",
                                allowSorting: false

                            }, {
                                caption: "Target VariableValue",
                                dataField: "TargetVariableValue",
                                allowSorting: false

                            }, {
                                caption: "CountryName",
                                dataField: "CountryName",
                                allowSorting: false
                            }
                        ]
                    },
                    {
                        caption: "Comment",
                        dataField: "tmodel",
                        cssClass: 'from_to_model',
                        allowSorting: false,
                        allowFiltering: false
                    }
                    ],

                    onToolbarPreparing: function (e) {
                        var trackingrefresh = e.toolbarOptions.items;


                        trackingrefresh.push(
                        {
                            location: "after",
                            widget: "dxButton",
                            options: {
                                icon: "refresh",
                                onClick: function () {

                                    scenariotracking.refresh();

                                }
                            }
                        }
                          );
                    }

                });
            }
        });
        $("#Dstracking").dxPopup("instance").show();
    },
    GetEnergyBalanceReport: function (scenarioId) {
        if (scenarioId != null && scenarioId > 0) {
            var data = { "scenarioId": scenarioId, "countryName": '', "year": 0, "IsChanged": false };
            var formId = $('#frmScenarioList');
            var url = "/Home/getEnergyBalanceReport";
            Common.ajaxCall(formId, "GET", url, data, ScenarioHome.BindEnergyBalanceReport, Common.g_onError, true);
        }
    },
    BindEnergyBalanceReport: function (rData) {
        $('#loading').hide();
        var energyBalanceReport = rData.report;
        var simplecountries = rData.country;
        var scenarioId = rData.report == null ? 0 : rData.report[0].Scenarioid;
        var countryName = "";
        var simplecountriesArray = [];
        var simpleYear = [];
        if (rData.country != null && rData.country.length > 0) {
            $.each(rData.country, function (iIndex, iValue) {
                simplecountriesArray.push(iValue.countryName);
            });
            for (var iYear = rData.startYear; iYear <= rData.endYear; iYear++) {
                simpleYear.push(iYear);
            }
        }
        var scenarioReport = $("#OuterEnergyBalanceReport").dxPopup({
            title: 'Energy Balance Report',
            fullScreen: true,
            onShown: function () {
                $("#countriesSearch").dxSelectBox({
                    dataSource: simplecountriesArray,
                    value: simplecountries == null ? '' : simplecountries[0].countryName,
                    searchEnabled: true,
                    onValueChanged: function (data) {
                        if (data.value != null) {
                            countryName = data.value;
                            var yearValue = $("#yearsSearch").dxSelectBox('instance').option('value');
                            ScenarioHome.GetEnergyBalanceByFilter(scenarioId, data.value, yearValue == null ? 0 : yearValue, true);
                        }
                    }
                });
                $("#yearsSearch").dxSelectBox({
                    dataSource: simpleYear,
                    columns: ["yearsName"],
                    value: simpleYear == null ? 0 : simpleYear[0],
                    searchEnabled: true,
                    onValueChanged: function (data) {
                        if (data.value != null) {
                            var countryNameValue = $("#countriesSearch").dxSelectBox('instance').option('value');
                            ScenarioHome.GetEnergyBalanceByFilter(scenarioId, countryNameValue == null ? '' : countryNameValue, data.value == null ? 0 : data.value, true);
                        }
                    }
                });
                $("#InnerEnergyBalanceReport").dxDataGrid({
                    dataSource: energyBalanceReport,
                    keyExpr: "ScenarioId",
                    selection: {
                        mode: "multiple"
                    },
                    allowColumnResizing: true,
                    "export": {
                        enabled: true,
                        fileName: "EnergyBalanceReport",
                        allowExportSelectedData: true
                    },
                    editing: {
                        mode: "cell",
                        allowUpdating: true
                    },
                    paging: {
                        pageSize: 7
                    },
                    onCellPrepared: function (e) {

                    },
                    pager: {
                        showPageSizeSelector: true,
                        allowedPageSizes: [5, 10, 15],
                        showInfo: true
                    },
                    columnAutoWidth: true,
                    wordWrapEnabled: true,
                    searchPanel: {
                        visible: true,
                        width: 250
                    },
                    headerFilter: {
                        visible: false
                    },
                    loadPanel: {
                        enabled: true
                    },
                    onSelectionChanged: function (data) {
                    },
                    onToolbarPreparing: function (e) {
                        var trackingrefresh = e.toolbarOptions.items;
                        trackingrefresh.push(
                        {
                            location: "after",
                            widget: "dxButton",
                            options: {
                                icon: "refresh",
                                onClick: function () {
                                    scenarioReport.refresh();
                                }
                            }
                        });
                    },
                    /*   columns: [
                       {
                           caption: "Country",
                           dataField: "Country",
                           allowEditing: false,
                           allowSorting: false,
                           fixed: true
                           cssClass: 'first_column'
                       },
                       {
                           caption: "Year",
                           dataField: "Year",
                           allowEditing: false,
                           allowSorting: false,
                           fixed: true
                           cssClass: 'second_column',
                       },
                       {
                           caption: "Flowcode",
                           dataField: "Flowcode",
                           allowEditing: false,
                           allowSorting: false,
                           fixed: true
                           cssClass: 'second_column',
                       }
                       , */
                    columns: [
                      {
                          caption: "Coal",
                          columns:
                          [
                              {
                                  caption: "Steam",
                                  dataField: "Antcoal_Subcoal"
                              },
                              {
                                  caption: "Coking coal",
                                  dataField: "Cokcoal"
                              },
                              {
                                  caption: "lignite",
                                  dataField: "Lignite"
                              },
                              {
                                  caption: "TOTAL COAL",
                                  dataField: "Tcoal"
                              }
                          ]
                      },
                    {
                        caption: "Coal Gases",
                        columns:
                        [
                            {
                                caption: "Peat",
                                dataField: "Peat"
                            },
                            {
                                caption: "Peat products",
                                dataField: "Peatprod"
                            },
                            {
                                caption: "Oil shale and oil sands",
                                dataField: "Oilshale"
                            }
                        ]
                    },
			        {
			            caption: "CRUDE, NGL, REFINERY FEEDSTOCKS",
			            columns: [
                            {
                                caption: "Crude/NGSL/feedstocks (if no detail)",
                                dataField: "Crngfeed"
                            },
                            {
                                caption: "Crude Oil",
                                dataField: "Crudeoil"
                            }, {
                                caption: "Natural gas liquids (NGL)",
                                dataField: "Ngl"
                            }, {
                                caption: "Refinery feedstocks",
                                dataField: "Reffeeds"
                            }, {
                                caption: "Additives/blending components",
                                dataField: "Additive"
                            }, {
                                caption: "Other hydro-carbons",
                                dataField: "Noncrude"
                            }
			            ]
			        },
                    {
                        caption: "OIL PRODUCTS",
                        columns: [
                        {
                            caption: "Refinery gas",
                            dataField: "Refingas"
                        }, {
                            caption: "Ethane",
                            dataField: "Ethanes"
                        }, {
                            caption: "Liquified petrodleum gases(LPG)",
                            dataField: "Lpg"
                        }, {
                            caption: "Moter gasoline excl.biofuels",
                            dataField: "Nonbiogaso"
                        }, {
                            caption: "Avaition gasoline",
                            dataField: "Avgas"
                        }, {
                            caption: "Gasoline type jet fuel",
                            dataField: "Jetgas"
                        },
                        {
                            caption: "Kerosene type jet fuel excl.biofuels",
                            dataField: "Nonbiojetk"
                        },
                        {
                            caption: "Other kerosene",
                            dataField: "Othkero"
                        },
                        {
                            caption: "Gas/diesel oil excluding biofuels",
                            dataField: "Nonbiodies"
                        },
                        {
                            caption: "Fuel oil",
                            dataField: "Resfuel"
                        },
                        {
                            caption: "Naptha",
                            dataField: "Naphtha"
                        },
                        {
                            caption: "White spirit & SBP",
                            dataField: "Whitesp"
                        },
                        {
                            caption: "Lubricants",
                            dataField: "Lubric"
                        },

                        {
                            caption: "Bitumen",
                            dataField: "Bitumen"
                        },
                         {
                             caption: "Paraffin waxes",
                             dataField: "Parwax"
                         },
                        {
                            caption: "Petroleum Coke",
                            dataField: "Petcoke"
                        },
                         {
                             caption: "Non-specified oil products",
                             dataField: "Ononspec"
                         }]
                    },
                    {
                        caption: "Natural Gas",
                        columns: [{
                            caption: "Natural gas",
                            dataField: "Natgas",
                            format: {
                                type: "percent",
                                precision: 1
                            }
                        }]
                    },
                    {
                        caption: "BIOFUELS AND WASTE",
                        columns: [
                        {
                            caption: "Industrial waste",
                            dataField: "Indwaste"
                        }, {
                            caption: "Municipal waste (renewable)",
                            dataField: "Munwaster"
                        }, {
                            caption: "Municipal waste (non-renewable)",
                            dataField: "Munwasten"
                        }, {
                            caption: "Primary solid biofuels",
                            dataField: "Primsbio"
                        }, {
                            caption: "Biogases",
                            dataField: "Biogases"
                        }, {
                            caption: "Biogasoline",
                            dataField: "Biogasol"
                        },
                        {
                            caption: "Bio jet kerosene",
                            dataField: "Biojetkero"
                        },
                        {
                            caption: "Biodiesels",
                            dataField: "Biodiesel"
                        },
                        {
                            caption: "Other liquid biofuels",
                            dataField: "Oblioliq"
                        },
                        {
                            caption: "Charcoal",
                            dataField: "Charcoal"
                        },
                        {
                            caption: "Non-specified primary biofuels/waste",
                            dataField: "Renewns"
                        }

                        ]
                    },
                    ,
                    {
                        caption: "Electricity and Heat",
                        columns: [
                            {
                                caption: "Nuclear",
                                dataField: "Nuclear"
                            },
                        {
                            caption: "Hydro",
                            dataField: "Hydro"
                        }, {
                            caption: "Geothermal",
                            dataField: "Geotherm"
                        }, {
                            caption: "Solar photovoltaic",
                            dataField: "Solarpv"
                        }, {
                            caption: "Solar Thermal",
                            dataField: "Solarth"
                        }, {
                            caption: "Tide/wave/ocean",
                            dataField: "Tide"
                        }, {
                            caption: "Non-Combustible Renewables",
                            dataField: "Wnd_Solarpv_Solarth_Tide_Geotherm"
                        },
                        {
                            caption: "Wind",
                            dataField: "Wind"
                        },
                        {
                            caption: "Heat pumps",
                            dataField: "Heatpump"
                        },
                        {
                            caption: "Electric obilers",
                            dataField: "Boiler"
                        },
                        {
                            caption: "Heat from chemical sources",
                            dataField: "Chemheat"
                        },
                        {
                            caption: "Other sources",
                            dataField: "Other"
                        },
                        {
                            caption: "Electricity",
                            dataField: "Electr"
                        },
                        {
                            caption: "Heat",
                            dataField: "Heat"
                        }

                        ]
                    },
                    {
                        caption: "TOTAL",
                        datafield: "Total"
                    }]
                });
            }
        });
        $("#OuterEnergyBalanceReport").dxPopup("instance").show();
    },
    GetEnergyBalanceByFilter: function (scenarioId, countryName, year, IsChanged) {
        if (scenarioId != null && scenarioId > 0) {
            var data = { "scenarioId": scenarioId, "countryName": countryName, "year": year, "IsChanged": IsChanged };
            var formId = $('#frmScenarioList');
            var url = "/Home/getEnergyBalanceReport";
            Common.ajaxCall(formId, "GET", url, data, ScenarioHome.BindEnergyBalanceByFilter, Common.g_onError, true);
        }
    },
    BindEnergyBalanceByFilter: function (rData) {
        if (rData != null && rData.report.length > 0) {
            var dataGridValue = $("#InnerEnergyBalanceReport").dxDataGrid('instance');
            dataGridValue.option('dataSource', []);
            dataGridValue.option('dataSource', rData.report);
        } else {
            Common.E2MASNotification('No record available for this.', Common.Warning);
            var dataGridValue = $("#InnerEnergyBalanceReport").dxDataGrid('instance');
            dataGridValue.option('dataSource', []);
        }
    }
};