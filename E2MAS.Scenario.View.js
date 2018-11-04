$(document).ready(function () {
    var treeView;
    ScenarioView.BindScenarioYear(1990, 2050);
    ScenarioView.GetScenarioInputs();
    var syncTreeViewSelection = function (treeView, value) {
        if (!value) {
            treeView.unselectAll();
            return;
        }
        value.forEach(function (key) {
            treeView.selectItem(key);
        });
    };
    $("#btnSaveScenario").dxButton({
        text: "Scenario Created",
        useSubmitBehavior: true,
        onClick: function (params) {
            var getModelDatas = ScenarioView.GetModelDatas();
            if (getModelDatas != null && getModelDatas.length == 0) {
                $('#create_intergated_model').css("border", "1px solid red");
            } else {
                $('#create_intergated_model').css("border", "1px solid #dfe8f1");
            }
            var result = params.validationGroup.validate();
            if (result.isValid) {
                ScenarioView.UpdateScenarioInputs();
            }
        }
    });
    $(document).on("propertychange change click keyup input paste,blur", 'form :input,.text-suggestion,#create_integrated_yearrange,#intergatedcountry,#switch-on,#create_intergated_model', function () {
        if (!ScenarioView.IsOneModelCompleted) {
            $("#btnSaveScenario").removeClass('disabled');
            $("#btnSaveScenario span").text('Update');
        }
    });
    $("#btnSaveScenario").submit(function () { return false; });
});
ScenarioView = {
    BindScenarioYear: function (StartYear, EndYear) {
        $("#scenarioName").dxTextBox({ disabled: true, placeholder: "Enter the Sceanrio name..." }).dxValidator({
            validationRules: [{
                type: "required",
                message: "Scenario Name is required"
            }, {
                type: "stringLength",
                min: 10,
                message: "Scenario Name must have at least 2 Char"
            }]
        });
        $("#create_integrated_yearrange").dxRangeSelector({
            size: {
                height: 80
            },
            scale: {
                startValue: 1990,
                endValue: 2050,
                minorTickInterval: 1,
                tickInterval: 1,
                minorTick: {
                    visible: false,
                },
                label: {
                    format: "decimal"
                }
            },
            sliderMarker: {
                format: "decimal",
                color: 'lightskyblue'
            },
            value: [StartYear, EndYear],
            disabled: ScenarioView.IsOneModelCompleted,
            title: false,
            onValueChanged: function (data) {
                ScenarioView.startValue = data.value[0];
                ScenarioView.endValue = data.value[1];
            }
        });
        var $callbacks = $.Callbacks();
        $("#validator").dxValidator({
            adapter: {
                getValue: function () {
                    return $("#intergatedcountry").dxTreeView("instance").option("value");
                },
                applyValidationResults: function (result) {
                    if (result.isValid) {
                        $("#intergatedcountry").css("border", "0px");
                    } else {
                        $("#intergatedcountry").css("border", "1px solid red");
                    }
                },
                validationRequestsCallbacks: $callbacks
            },
            validationRules: [{
                type: "required",
                message: "Country Selection is required"
            }]
        });
    },
    startValue: 0,
    endValue: 0,
    GetScenarioInputs: function () {
        var scenarioID = $('#viewScenarioId').val();
        var queryScenarioID = Common.getQueryString()["scenarioid"];
        if (scenarioID == queryScenarioID && queryScenarioID > 0) {
            var data = { "scenarioid": scenarioID };
            var formId = $('#viewscenario');
            var url = "/Scenario/getScenarioViewInputs";
            Common.ajaxCall(formId, "GET", url, data, ScenarioView.InputSuccess, Common.g_onError, true);
        }
    },
    SelectedCountries: [],
    searchTextValueTimeOut: function () { },
    IsOneModelCompleted: false,
    scenarioListModels: [],
    InputSuccess: function (rData) {
        if (rData != null && rData.scenarioBase.length > 0 && rData.scenarioModels.length > 0) {
            if (rData.scenarioSelectedModels != null && rData.scenarioSelectedModels.length > 0) {
                $.each(rData.scenarioSelectedModels, function (iIndex, iValues) {
                    if (iValues.ModelStatus == "Completed") {
                        ScenarioView.IsOneModelCompleted = true;
                    }
                });
            }
            ScenarioView.baseScenarioID = rData.BaseScenarioId;
            if (rData.scenarioMode == "I") {
                $("#switch-on").dxSwitch({ value: rData.IsEnergyBalance == null ? false : rData.IsEnergyBalance, disabled: ScenarioView.IsOneModelCompleted });
                $('#layoutScenarioName').text('Integration Mode');
            } else {
                $('#layoutScenarioName').text('StandAlone Mode');
            }
            $('#ViewScenarioStatus').show();
            $("#scenarioName").dxTextBox({ value: rData.ScenarioName, disabled: true });
            var addClassDisable = ScenarioView.IsOneModelCompleted == true ? 'disabled' : '';
            $("#description").val(rData.ScenarioRemarks).addClass(addClassDisable);
            ScenarioView.BindScenarioYear(rData.InputYears.StartYear, rData.InputYears.EndYear);
            ScenarioView.BindScenarioBaseData(rData.BaseScenarioName, rData.scenarioBase);
            ScenarioView.BindScenarioModels(rData.scenarioSelectedModels, rData.scenarioModels);
            ScenarioView.BindScenarioCountries(rData.scenarioSelectedcountries, rData.scenarioCountries);
            ScenarioView.BindSelectedCountries();
            if (ScenarioView.IsOneModelCompleted) {
                $('#create_intergated_basedata,#scenarioName,#create_intergated_model,#create_integrated_yearrange,#btnSaveScenario,#description,#switch-on').addClass('disabled');
                $('#create_intergated_model').parent().addClass('disabled');
            } else {
                $('#btnSaveScenario').val('Proceed').addClass('disabled');
            }
        }
        $('#loading').hide();
        $('input[type="submit"]').remove();
    },
    baseScenarioID: 0,
    confirmScenarioId: 0,
    BindScenarioBaseData: function (ScenarioName, scenarioBases) {
        $("#create_intergated_basedata").dxDropDownBox({
            value: [ScenarioName],
            valueExpr: "ScenarioId",
            displayExpr: "ScenarioName",
            placeholder: "Select a Basedata...",
            showClearButton: true,
            disabled: ScenarioView.IsOneModelCompleted,
            dataSource: scenarioBases,
            contentTemplate: function (e) {
                var value = e.component.option("value"),
                    $treeView = $("<div>").dxTreeView({
                        dataSource: e.component.option("dataSource"),
                        dataStructure: "plain",
                        keyExpr: "ScenarioId",
                        searchEnabled: true,
                        //parentIdExpr: "categoryId",
                        selectionMode: "single",
                        displayExpr: "ScenarioName",
                        selectByClick: true,
                        disabled: false,
                        onContentReady: function (args) {
                            ScenarioView.syncTreeViewSelection(args.component, value);
                        },
                        selectNodesRecursive: false,
                        showCheckBoxesMode: "none",
                        onItemSelectionChanged: function (args) {
                            var value = args.component.getSelectedNodesKeys();
                            e.component.option("value", value);
                            if (args != null && args.itemData != null) {
                                ScenarioView.baseScenarioID = args.itemData.ScenarioId;
                            }
                        }
                    });
                basedata = $treeView.dxTreeView("instance");
                e.component.on("valueChanged", function (args) {
                    var value = args.value;
                    ScenarioView.syncTreeViewSelection(basedata, value);
                });
                return $treeView;
            },
            onValueChanged: function (e) {
                $("#create_intergated_basedata").dxDropDownBox("instance").close();
                if (e.value != null && e.value > 0) {
                    ScenarioView.baseScenarioID = e.value
                }
                //if (ScenarioView.typeofMode == "S" && e.value != null && e.value > 0) {
                //    ScenarioView.GetBaseScenarioValueById(e.value);
                //} else {
                //    var treeViews = $('#intergatedcountry').dxTreeView('instance');
                //    treeViews.unselectAll();
                //    treeViews.collapseAll()
                //    treeViews.expandItem(treeViews.element().find(".dx-treeview-item")[0]);
                //    $('#intergatedcountry,#create_integrated_yearrange').removeClass('disabled');
                //}
            }
        });
        if (ScenarioView.typeofMode == "S") {
            $("#create_intergated_basedata").addClass('disabled');
        }
    },
    typeofMode: $('#typeofMode').val(),
    BindScenarioModels: function (scenarioSelectedModels, scenarioModels) {
        //var modelLst = [];
        //$.each(scenarioSelectedModels, function (key, value) {
        //    if (value.ModelCode != "EB") {
        //        var seqNumber = $.grep(scenarioModels, function (remove) {
        //            return remove.ModelCode == value.ModelCode
        //        });
        //        modelLst.push(seqNumber[0].ModelId);
        //    }
        //});
        //$("#create_intergated_model").dxTagBox({
        //    values: modelLst,
        //    dataSource: new DevExpress.data.ArrayStore({
        //        data: scenarioModels,
        //        key: "ModelName"
        //    }),
        //    displayExpr: "ModelName",
        //    valueExpr: "ModelId",
        //    placeholder: "Select a Model",
        //    hideSelectedItems: false,
        //    searchEnabled: true,
        //    disabled: ScenarioView.IsOneModelCompleted,
        //    onValueChanged: function (e) {
        //        if (e.previousValue.length == 0 && ScenarioView.typeofMode == "S") {
        //            var selected = $("#create_intergated_model").dxTagBox("instance").option("selectedItems");
        //            if (selected.length > 0) {
        //                ScenarioView.GetBaseDataModel(selected[0].ModelCode);
        //            } else {
        //                ScenarioView.GetBaseDataModel(0);
        //                $("#create_intergated_basedata").dxDropDownBox('instance').option("value", null);
        //                $("#create_intergated_basedata").addClass('disabled');
        //            }
        //        }
        //        if (e.previousValue.length == 1 && ScenarioView.typeofMode == "S") {
        //            if (e.value.length == 0) {
        //                e.component.option('values', "");
        //                $("#intergatedcountry,#create_integrated_yearrange").removeClass('disabled');
        //                if (ScenarioView.typeofMode == "S") {
        //                    $("#create_intergated_basedata").addClass('disabled');
        //                }
        //            }
        //            else {
        //                e.component.option('values', e.previousValue);
        //                if (ScenarioView.typeofMode == "S") {
        //                    //$("#create_intergated_basedata").removeClass('disabled');
        //                }
        //            }
        //        }
        //    }
        //}).dxValidator({
        //    validationRules: [{
        //        type: "required",
        //        message: "Atleast One Model Selection is Required"
        //    }]
        //});
        //$('#create_intergated_model').dxTagBox('option', 'value', modelLst);
        ScenarioView.BindScenarioModelsArray = scenarioModels;
        var texttextValue = [];
        $.each(scenarioSelectedModels, function (iIndex, iValue) {
            if (iValue.ModelCode != "EB") {
                texttextValue.push(iValue.ModelName);
            }
        });
        if (ScenarioView.IsOneModelCompleted) {
            $('#create_intergated_model').textext({
                plugins: 'tags prompt focus autocomplete ajax arrow',
                tagsItems: texttextValue,
                prompt: ''
            });
        } else {
            var originalTextValue = [];
            $.each(scenarioModels, function (iIndex, iValue) {
                if (iValue.ModelCode != "EB") {
                    originalTextValue.push(iValue.ModelName);
                }
            });
            $('#create_intergated_model').textext({
                plugins: 'tags prompt focus autocomplete ajax arrow',
                tagsItems: texttextValue,
                prompt: ''
            }).bind('getSuggestions', function (e, data) {
                var list = originalTextValue, textext = $(e.target).textext()[0], query = (data ? data.query : '') || '';
                var formData = $(e.target).textext()[0].tags()._formData;
                $(this).trigger('setSuggestions', {
                    result: textext.itemManager().filter(list, query)
                });
            });
        }
    },
    BindScenarioModelsArray: [],
    GetBaseDataModel: function (modelCode) {
        var data = { "modelCode": modelCode };
        var formId = $('#viewscenario');
        var url = "/Scenario/getScenarioBasesByModelId";
        Common.ajaxCall(formId, "GET", url, data, ScenarioView.BindScenarioBaseDataModel, Common.g_onError);
    },
    BindScenarioBaseDataModel: function (rData) {
        $('#loading').hide();
        if (rData != null && rData.outputDetails != null) {
            ScenarioView.BindScenarioBaseData(rData.outputDetails);
            $("#create_intergated_basedata").removeClass('disabled');
        }
    },
    BindScenarioCountries: function (scenarioSelectedcountries, scenarioCountries) {
        var countryValue = [];
        $.each(scenarioSelectedcountries, function (index, value) {
            if (!value.expanded) {
                countryValue.push(value.CountryName);
            }
        });
        var countryLst = [];
        var nodeExpand = [];
        $.each(countryValue, function (key, value) {
            var seqNumber = $.grep(scenarioCountries, function (remove) {
                return (remove.Name == value);
            });
            if (seqNumber.length > 0) {
                nodeExpand.push(seqNumber[0].CategoryID);
            }
        });
        var uniqueItems = Common.GetUnique(nodeExpand);
        $.each(scenarioCountries, function (index, value) {
            if (value.Name == "World") {
                value.expanded = true;
            }
            $.each(uniqueItems, function (iIndex, iValue) {
                if (iValue == value.Name) {
                    value.expanded = true
                }
            });
        });
        ScenarioView.SelectedCountries = countryValue;
        $("#intergatedcountry").dxTreeView({
            //value: countryValue,
            dataSource: scenarioCountries,
            width: 320,
            dataStructure: "plain",
            keyExpr: "ID",
            parentIdExpr: "CategoryID",
            selectionMode: "multiple",
            searchEnabled: true,
            displayExpr: "Name",
            selectByClick: true,
            //disabled: true,
            selectNodesRecursive: true,
            showCheckBoxesMode: "normal",
            activeStateEnabled: true,
            onItemSelectionChanged: function (args) {
                var countryvalue = args.component.getSelectedNodesKeys();
                args.component.option("value", countryvalue);
                if (args != null && args.itemData.selected) {
                    $("#intergatedcountry").css("border", "1px solid #fff");
                    if (args.itemData.IsRegion) {
                        ScenarioView.RegionSelected.push(args.itemData.Name);
                    }
                }
                if (countryvalue.length == 0) {
                    $("#intergatedcountry").css("border", "1px solid red");
                }
            },
            disabled: false
        });
    },
    syncTreeViewSelection: function (treeView, value) {
        if (!value) {
            treeView.unselectAll();
            return;
        }
        value.forEach(function (key) {
            treeView.selectItem(key);
        });
    },
    BindSelectedCountries: function () {
        var treeViews = $('#intergatedcountry').dxTreeView('instance');
        $.each(ScenarioView.SelectedCountries, function (index, value) {
            treeViews.selectItem(value);
        });
        if (ScenarioView.IsOneModelCompleted) {
            $('#intergatedcountry ul').addClass("dx-state-disabled");
        }
    },
    IsScenarioExist: false,
    UpdateScenarioInputs: function () {
        var viewScenarioId = $('#viewScenarioId').val();
        var scenarioName = $("#scenarioName").dxTextBox("instance").option('value');
        var getModelDatas = ScenarioView.GetModelDatas();
        var getCountries = ScenarioView.GetScenarioCountries();
        if (scenarioName != null && scenarioName != "" && getModelDatas != null && getModelDatas.length > 0 && getCountries != null && getCountries.length > 0 && viewScenarioId > 0) {
            var SaveScenario = {
                "scenarioDetails": "",
                "scenarioSequence": "",
                "scenarioInputDetail": "",
                "scenarioCountryMapping": ""
            };
            var typeofMode = $('#typeofMode').val();
            var valueswitch = false;
            if (typeofMode == "I") {
                var wSwitch = $("#switch-on").dxSwitch("instance");
                valueswitch = wSwitch.option("value");
            }
            var scenarioDetails = {
                "ScenarioId": viewScenarioId,
                "ScenarioName": scenarioName,
                "ScenarioStatus": "In-Progress",
                "IsActive": true,
                "CreatedBy": 1,
                "CreatedDate": "",
                "ModifiedBy": null,
                "ModifiedDate": null,
                "ApprovedBy": "",
                "ApprovedDate": "",
                "Remarks": $("#description").val(),
                "ScenarioMode": typeofMode,
                "BaseScenarioId": ScenarioView.baseScenarioID,
                "IsEnergyBalance": valueswitch
            };
            SaveScenario.scenarioDetails = scenarioDetails;
            var scenarioInputDetail = {
                "ScenarioId": 0,
                "StartYear": (ScenarioView.startValue == null || ScenarioView.startValue == 0) ? Common.CurrentYear : ScenarioView.startValue,
                "EndYear": (ScenarioView.endValue == null || ScenarioView.endValue == 0) ? (2050) : ScenarioView.endValue,
                "IsPricing": false,
                "Remarks": $("#description").val()
            };
            SaveScenario.scenarioInputDetail = scenarioInputDetail;
            SaveScenario.scenarioSequence = getModelDatas;
            SaveScenario.scenarioCountryMapping = getCountries;
            var data = { "ScenarioId": parseInt(viewScenarioId), "scenarioUpdates": JSON.stringify(SaveScenario) };
            var formId = $('#viewscenario');
            var url = "/Scenario/UpdateScenarioInputs";
            Common.ajaxCall(formId, "POST", url, data, ScenarioView.UpdateScenarioSuccess, Common.g_onError, true);
        }
    },
    UpdateScenarioSuccess: function (rData) {
        if (rData != null && rData.outputDetails.Status) {
            $('#btnSaveScenario span').text('Scenario Updated');
            $("#btnSaveScenario").removeClass('disabled');
            var scenarioName = $("#scenarioName").dxTextBox("instance").option('value');
            ScenarioView.confirmScenarioId = rData.outputDetails.scenarioId;
            Common.E2MASNotification(scenarioName + " Scenario Updated Successfully.", Common.Success);
            var viewScenarioId = $('#viewScenarioId').val();
            Common.CommonModel.CommonHeaderBinding('viewscenario', viewScenarioId, 'DM', 1);
        } else {
            Common.E2MASNotification(rData.outputDetails.StatusMessage, Common.Error);
        }
        if (rData != null && rData.outputDetails.dxiStatusMessage.trim() != "DXI Inputs Ready") {
            Common.E2MASNotification(rData.outputDetails.dxiStatusMessage, Common.Error);
        }
        //if (rData != null && rData.outputDetails.dxiStatusMessage.trim() == "") {
        //    Common.E2MASNotification("DXI is not ready for " + ScenarioView.scenarioSequenceArrays[0].ModelCode, Common.Warning);
        //}
        $('#loading').hide();
    },
    BindStaticHeader: function (confirmScenarioId) {
        $('#staticComheader').html('');
        var staticHTMLContent = "<ul>";
        var staticClass = "", staticHTML = "";
        var staticSCNHTML = '<li id="SCN" class=""><a data-toggle="tab" aria-expanded="false"><label class="wizard-step completed">1</label><span class="wizard-description">Create Scenario<small>Status: <span class="green"> Completed </span></small></span></a></li>';
        var locindex = 0, locModelstatus = '';
        $.each(ScenarioView.scenarioSequenceArrays, function (index, value) {
            locindex = index + 2;
            if (index == 0) {
                staticHTML = "<li ScenarioValue='" + confirmScenarioId + "' id='" + value.ModelCode + "'><a data-toggle='tab'><label class='wizard-step current'><i class='input_bubble yellow_icon iconInProgress glyph-icon icon-sign-out' value='1'></i>";
                staticHTML = staticHTML + "<span class='isAvailable'>2</span><div class='output_bubble'><i class='yellow_icon iconInProgress glyph-icon icon-sign-in' value='1'></i></div></label>";
                staticHTML = staticHTML + "<span class='wizard-description'>" + value.ModelName + "<small>Status: <span class=''> In-Progress </span></small></span></a></li>";
            } else {
                staticHTML = '<li id="' + value.ModelCode + '" class="disabled"><a data-toggle="tab"><label class="wizard-step disabled"><i class="input_bubble gray_icon iconInProgress glyph-icon icon-sign-out" value="' + value.ModelCode + '"></i>';
                staticHTML = staticHTML + '<span>' + locindex + '</span><div class="output_bubble"><i class="gray_icon iconInProgress glyph-icon icon-sign-in" value="' + value.ModelCode + '"></i></div></label>';
                staticHTML = staticHTML + '<span class="wizard-description">' + value.ModelName + '<small>Status: <span class=""> In-Progress </span></small></span></a></li>';
            }
            staticSCNHTML = staticSCNHTML + staticHTML;
        });
        $('#staticComheader').append(staticSCNHTML.trim());
    },
    RegionSelected: [],
    GetScenarioCountries: function () {
        var scenarioCountryArrays = [];
        var allNodes = $("#intergatedcountry").dxTreeView("instance");
        if (allNodes != null && allNodes.getSelectedNodesKeys() != null) {
            var nodeArrays = allNodes.getSelectedNodesKeys();
            if (nodeArrays.length > 0) {
                $.each(nodeArrays, function (index, value) {
                    var isExist = ScenarioView.RegionSelected.some(function (exist) {
                        return exist.trim() == value.trim()
                    });
                    if (!isExist) {
                        scenarioCountryArrays.push(value);
                    }
                });
            }
        }
        return scenarioCountryArrays;
    },
    scenarioSequenceArrays: [],
    GetModelDatas: function () {
        //var scenarioSequenceArrays = [];
        //var allSeries = $("#create_intergated_model").dxTagBox("instance").option("selectedItems");
        //if (allSeries != null) {
        //    $.each(allSeries, function (index, value) {
        //        if (value.ModelCode != null && value.ModelCode.trim() != "") {
        //            var indexInc = index + 1;
        //            var scenarioSequence = {
        //                "ModelName": value.ModelCode,
        //                "ModelSequenceNumber": indexInc,
        //                "ModelStatus": "Not started",
        //                "ScenarioMode": $('#typeofMode').val()
        //            };
        //            scenarioSequenceArrays.push(scenarioSequence)
        //        }
        //    });
        //    ScenarioView.scenarioSequenceArrays = allSeries;
        //    var typeofMode = $('#typeofMode').val();
        //    if (typeofMode == "I") {
        //        var valueswitch = false;
        //        var wSwitch = $("#switch-on").dxSwitch("instance");
        //        valueswitch = wSwitch.option("value");
        //        if (valueswitch) {
        //            var scenarioArray = scenarioSequenceArrays.length;
        //            var EnergyBalanceSequence = {
        //                "ModelName": "EB",
        //                "ModelSequenceNumber": scenarioArray + 1,
        //                "ModelStatus": "Not started",
        //                "ScenarioMode": typeofMode
        //            };
        //            scenarioSequenceArrays.push(EnergyBalanceSequence);
        //            var EnergyBalance = {
        //                "ModelName": "Enery Balance",
        //                "ModelSequenceNumber": scenarioArray + 1,
        //                "ModelStatus": "Not started",
        //                "ScenarioMode": typeofMode
        //            };
        //            ScenarioView.scenarioSequenceArrays.push(EnergyBalance);
        //        }
        //    }
        //}
        //return scenarioSequenceArrays;
        var scenarioSequenceArrays = [];
        var allSeries = $('#create_intergated_model').textext()[0].tags()._formData;
        if (allSeries != null && allSeries != undefined && allSeries.length > 0) {
            $.each(allSeries, function (index, value) {
                if (value != null && value.trim() != "") {
                    var indexInc = index + 1;
                    var modelvalue = $.grep(ScenarioView.BindScenarioModelsArray, function (remove) {
                        return remove.ModelName.trim() == value.trim()
                    });
                    var scenarioSequence = {
                        "ModelName": modelvalue[0].ModelCode,
                        "ModelSequenceNumber": indexInc,
                        "ModelStatus": "Not started",
                        "ScenarioMode": $('#typeofMode').val()
                    };
                    scenarioSequenceArrays.push(scenarioSequence)
                }
            });
            ScenarioView.scenarioSequenceArrays = scenarioSequenceArrays;
            var typeofMode = $('#typeofMode').val();
            if (typeofMode == "I") {
                var valueswitch = false;
                var wSwitch = $("#switch-on").dxSwitch("instance");
                valueswitch = wSwitch.option("value");
                if (valueswitch) {
                    var scenarioArray = scenarioSequenceArrays.length;
                    var EnergyBalanceSequence = {
                        "ModelName": "EB",
                        "ModelSequenceNumber": scenarioArray + 1,
                        "ModelStatus": "Not started",
                        "ScenarioMode": typeofMode
                    };
                    scenarioSequenceArrays.push(EnergyBalanceSequence);
                }
            }
        }
        return scenarioSequenceArrays;
    }
}