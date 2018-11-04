$(document).ready(function () {
    var treeView;
    Scenario.BindScenarioControls();
    Scenario.GetScenarioInputs();
    var syncTreeViewSelection = function (treeView, value) {
        if (!value) {
            treeView.unselectAll();
            return;
        }
        value.forEach(function (key) {
            treeView.selectItem(key);
        });
    };
    $('#scenarioName').on('focusout', function () {
        var scenarioName = $('#scenarioName').val().trim();
        if (scenarioName != null && scenarioName != "" && scenarioName.length > 0) {
            clearTimeout(Scenario.ScenarioNameExists);
            Scenario.searchTextValueTimeOut = setTimeout(function () {
                Scenario.ScenarioNameExists(scenarioName);
            }, 200);
        }
    });
    $(document).on('click', '#DM,#MA,#PC,#GS,#OS,#RF', function () {
        var thisHtml = $.parseHTML($(this).html());
        if ($(thisHtml).hasClass('isAvailable')) {
            var thisId = $($.parseHTML(thisHtml[0].outerHTML)).attr('did');
            if (thisId == "DM") {
                location.href = "/IHS/demand?scenarioid=" + Scenario.confirmScenarioId;
            }
        }
    });
    $("#btnSaveScenario").dxButton({
        text: "Proceed",
        useSubmitBehavior: true,
        onClick: function (params) {
            var getModelDatas = Scenario.GetModelDatas();
            if (getModelDatas != null && getModelDatas.length == 0) {
                $('#create_intergated_model').css("border", "1px solid red");
            } else {
                $('#create_intergated_model').css("border", "1px solid #dfe8f1");
            }
            var result = params.validationGroup.validate();
            if (result.isValid) {
                Scenario.SaveScenarioInputs();
            }
        }
    });
    $("#createscenario").submit(function () { return false; });
    var typeofMode = $('#typeofMode').val();
    if (typeofMode == "I") {
        $('#layoutScenarioName').html('Integrated Mode');
    } else {
        $('#layoutScenarioName').html('StandAlone Mode');
    }
});
Scenario = {
    IsScenarioExist: false,
    CurrentYear: (new Date).getFullYear(),
    baseScenarioID: 0,
    startValue: 0,
    endValue: 0,
    confirmScenarioId: 0,
    typeofMode: $('#typeofMode').val(),
    scenarioModelClear: false,
    scenarioCountryClear: false,
    searchTextValueTimeOut: function () { },
    RegionSelected: [],
    BindScenarioControls: function () {
        $("#switch-on").dxSwitch({
            value: true
        });
        $("#create_intergated_basedata").dxDropDownBox({});
        $("#intergatedcountry").dxTreeView({});
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
            value: [Scenario.CurrentYear, 2050],
            disabled: false,
            title: false,
            onValueChanged: function (data) {
                Scenario.startValue = data.value[0];
                Scenario.endValue = data.value[1];
            }
        });
        $("#scenarioName").dxTextBox({
            placeholder: "Enter the scenario name...",
            onChange: function (value) {
                if (value.component.option().value.trim() != null && value.component.option().value.trim() != "") {
                    Scenario.ScenarioNameExists(value.component.option().value.trim());
                }
            }
        })
        .dxValidator({
            validationRules: [{
                type: "required",
                message: "Scenario Name is required"
            }]
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
    GetScenarioInputs: function () {
        var data = {};
        var formId = $('#createscenario');
        var url = "/Scenario/getCreateScenarioInputs";
        Common.ajaxCall(formId, "GET", url, data, Scenario.InputSuccess, Common.g_onError, true);
    },
    InputSuccess: function (rData) {
        if (rData != null) {//&& rData.outputDetails.scenarioCountries.length > 0 
            Scenario.scenarioBases = rData.outputDetails.scenarioBases;
            Scenario.BindScenarioBaseData(rData.outputDetails.scenarioBases);
            Scenario.BindScenarioModels(rData.outputDetails.scenarioModels);
            Scenario.BindScenarioCountries(rData.outputDetails.scenarioCountries);
        }
        $('#loading').hide();
    },
    BindScenarioBaseData: function (scenarioBases) {
        var scenarioBasesIntegrated = [];
        if (Scenario.typeofMode == "I") {
            scenarioBasesIntegrated = $.grep(scenarioBases, function (remove) {
                return remove.ScenarioMode == Scenario.typeofMode
            });
        }
        $("#create_intergated_basedata").dxDropDownBox({
            valueExpr: "ScenarioId",
            displayExpr: "ScenarioName",
            placeholder: "Select a Basedata...",
            showClearButton: true,
            disabled: false,
            dataSource: Scenario.typeofMode == "I" ? scenarioBasesIntegrated : scenarioBases,
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
                            Scenario.syncTreeViewSelection(args.component, value);
                        },
                        selectNodesRecursive: false,
                        showCheckBoxesMode: "none",
                        onItemSelectionChanged: function (args) {
                            var value = args.component.getSelectedNodesKeys();
                            e.component.option("value", value);
                            if (args != null && args.itemData != null) {
                                Scenario.baseScenarioID = args.itemData.ScenarioId;
                            }
                        }
                    });
                basedata = $treeView.dxTreeView("instance");
                e.component.on("valueChanged", function (args) {
                    var value = args.value;
                    Scenario.syncTreeViewSelection(basedata, value);
                });
                return $treeView;
            },
            onValueChanged: function (e) {
                $("#create_intergated_basedata").dxDropDownBox("instance").close();
                if (Scenario.typeofMode == "S" && e.value != null && e.value > 0) {
                    Scenario.GetBaseScenarioValueById(e.value);
                } else {
                    var treeViews = $('#intergatedcountry').dxTreeView('instance');
                    treeViews.unselectAll();
                    treeViews.collapseAll()
                    treeViews.expandItem(treeViews.element().find(".dx-treeview-item")[0]);
                    $('#intergatedcountry,#create_integrated_yearrange').removeClass('disabled');
                    var defaultRange = [Common.CurrentYear, 2050];
                    var rangeSelector = $('#create_integrated_yearrange').dxRangeSelector('instance');
                    rangeSelector.setValue(defaultRange);
                }
            }
        });
        if (Scenario.typeofMode == "S") {
            $("#create_intergated_basedata").addClass('disabled');
        }
    },
    BindScenarioModelsArray: [],
    BindScenarioModels: function (scenarioModels) {
        Scenario.BindScenarioModelsArray = scenarioModels;
        var scenarioModelsArray = [];
        $.each(scenarioModels, function (iIndex, iValue) {
            scenarioModelsArray.push(iValue.ModelName);
        });
        if (Scenario.typeofMode == "S") {
            $("#create_intergated_model").dxTagBox({
                dataSource: new DevExpress.data.ArrayStore({
                    data: scenarioModels,
                    key: "ModelName"
                }),
                displayExpr: "ModelName",
                valueExpr: "ModelId",
                placeholder: "Select a Model",
                hideSelectedItems: false,
                searchEnabled: true,
                multiline: true,
                onValueChanged: function (e) {
                    if (e.previousValue.length == 0 && Scenario.typeofMode == "S") {
                        var selected = $("#create_intergated_model").dxTagBox("instance").option("selectedItems");
                        if (selected.length > 0) {
                            Scenario.GetBaseDataModel(selected[0].ModelCode);
                        } else {
                            Scenario.GetBaseDataModel(0);
                            $("#create_intergated_basedata").dxDropDownBox('instance').option("value", null);
                            $("#create_intergated_basedata").addClass('disabled');
                        }
                    }
                    if (e.previousValue.length == 1 && Scenario.typeofMode == "S") {
                        if (e.value.length == 0) {
                            e.component.option('values', "");
                            $("#intergatedcountry,#create_integrated_yearrange").removeClass('disabled');
                            if (Scenario.typeofMode == "S") {
                                $("#create_intergated_basedata").addClass('disabled');
                            }
                        }
                        else {
                            e.component.option('values', e.previousValue);
                            if (Scenario.typeofMode == "S") {
                                //$("#create_intergated_basedata").removeClass('disabled');
                            }
                        }
                    }
                }
            }).dxValidator({
                validationRules: [{
                    type: "required",
                    message: Scenario.typeofMode == "S" ? "Only one model is required" : "Atleast One Model Selection is Required"
                }]
            });
        } else {
            $('#create_intergated_model').textext({
                plugins: 'arrow focus autocomplete tags filter'
            }).bind('getSuggestions', function (e, data) {
                var list = scenarioModelsArray, textext = $(e.target).textext()[0], query = (data ? data.query : '') || '';
                var formData = $(e.target).textext()[0].tags()._formData;
                $(this).trigger('setSuggestions', {
                    result: textext.itemManager().filter(list, query)
                });
            });
        }
    },
    GetBaseDataModel: function (modelCode) {
        var data = { "modelCode": modelCode };
        var formId = $('#createscenario');
        var url = "/Scenario/getScenarioBasesByModelId";
        Common.ajaxCall(formId, "GET", url, data, Scenario.BindScenarioBaseDataModel, Common.g_onError, true);
    },
    BindScenarioBaseDataModel: function (rData) {
        $('#loading').hide();
        if (rData != null && rData.outputDetails != null) {
            Scenario.BindScenarioBaseData(rData.outputDetails);
            $("#create_intergated_basedata").removeClass('disabled');
        }
    },
    GetBaseScenarioValueById: function (scenarioId) {
        var treeViews = $('#intergatedcountry').dxTreeView('instance');
        treeViews.unselectAll();
        //treeViews.collapseAll();
        treeViews.expandItem('World');
        if (scenarioId != null && scenarioId[0] > 0) {
            var data = { "scenarioid": scenarioId[0] };
            var formId = $('#createscenario');
            var url = "/Scenario/getBaseScenarioValueById";
            Common.ajaxCall(formId, "GET", url, data, Scenario.BaseScenarioValueByIdSuccess, Common.g_onError, true);
        }
    },
    BaseScenarioValueByIdSuccess: function (rData) {
        $('#loading').hide();
        if (rData != null && rData.outputDetails != null) {
            if (rData.outputDetails != null && rData.outputDetails.countries.length > 0) {
                var treeViews = $('#intergatedcountry').dxTreeView('instance');
                treeViewItems = treeViews._dataSource._items;
                $.each(rData.outputDetails.countries, function (index, value) {
                    treeViews.selectItem(value.CountryName);
                    var regionName = $.grep(treeViewItems, function (remove) {
                        return (remove.Name == value.CountryName);
                    });
                    treeViews.expandItem(regionName[0].CategoryID);
                });
                $('#intergatedcountry').addClass('disabled');
            }
            var defaultRange = [rData.outputDetails.startYear, rData.outputDetails.endtYear];
            var rangeSelector = $('#create_integrated_yearrange').dxRangeSelector('instance');
            rangeSelector.setValue(defaultRange);
            $('#create_integrated_yearrange').addClass('disabled');
        }
    },
    BindScenarioCountries: function (scenarioCountries) {
        $("#intergatedcountry").dxTreeView({
            dataSource: scenarioCountries,
            width: 320,
            dataStructure: "plain",
            keyExpr: "ID",
            parentIdExpr: "CategoryID",
            selectionMode: "multiple",
            searchEnabled: true,
            displayExpr: "Name",
            selectByClick: true,
            selectNodesRecursive: true,
            showCheckBoxesMode: "normal",
            onItemSelectionChanged: function (args) {
                var countryvalue = args.component.getSelectedNodesKeys();
                args.component.option("value", countryvalue);
                if (args != null && args.itemData.selected) {
                    $("#intergatedcountry").css("border", "1px solid #fff");
                    if (args.itemData.IsRegion) {
                        Scenario.RegionSelected.push(args.itemData.Name);
                    }
                }
                if (countryvalue.length == 0) {
                    $("#intergatedcountry").css("border", "1px solid red");
                }
            }
        });
        var treeView = $('#intergatedcountry').dxTreeView('instance');
        treeView.expandItem(treeView.element().find(".dx-treeview-item")[0]);
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
    ScenarioNameExists: function (scenarioName) {
        var data = { "scenarioName": scenarioName };
        var formId = $('#createscenario');
        var url = "/Scenario/checkScenarioName";
        Common.ajaxCall(formId, "GET", url, data, Scenario.ScenarioNameExistsSuccess, Common.g_onError);
    },
    ScenarioNameExistsSuccess: function (rData) {
        $('#loading').hide();
        if (rData != null && rData.outputDetails) {
            Scenario.IsScenarioExist = true;
            var scenarioName = $("#scenarioName").dxTextBox("instance").option('value');
            Common.E2MASNotification(scenarioName + " already exists.", Common.Warning);
        } else {
            Scenario.IsScenarioExist = false;
        }
    },
    SaveScenarioInputs: function () {
        var scenarioName = $("#scenarioName").dxTextBox("instance").option('value');
        var getModelDatas = Scenario.GetModelDatas();
        if (getModelDatas != null && getModelDatas.length == 0) {
            $('#create_intergated_model').addClass("border", "1px solid red");
        } else {
            $('#create_intergated_model').css("border", "1px solid #dfe8f1");
        }
        var getCountries = Scenario.GetScenarioCountries();
        if (scenarioName != null && scenarioName != "" && getModelDatas != null && getModelDatas.length > 0 && getCountries != null && getCountries.length > 0) {
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
                "ScenarioId": "0",
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
                "BaseScenarioId": Scenario.baseScenarioID,
                "IsEnergyBalance": valueswitch
            };
            SaveScenario.scenarioDetails = scenarioDetails;
            var scenarioInputDetail = {
                "ScenarioId": 0,
                "StartYear": (Scenario.startValue == null || Scenario.startValue == 0) ? Scenario.CurrentYear : Scenario.startValue,
                "EndYear": (Scenario.endValue == null || Scenario.endValue == 0) ? (2050) : Scenario.endValue,
                "IsPricing": false,
                "Remarks": $("#description").val()
            };
            SaveScenario.scenarioInputDetail = scenarioInputDetail;
            SaveScenario.scenarioSequence = getModelDatas;
            SaveScenario.scenarioCountryMapping = getCountries;
            var data = { "scenarioInputs": JSON.stringify(SaveScenario) };
            var formId = $('#createscenario');
            var url = "/Scenario/postCreateScenarioInputs";
            if (!Scenario.IsScenarioExist) {
                Common.ajaxCall(formId, "POST", url, data, Scenario.SaveScenarioSuccess, Common.g_onError, true);
            }
            else {
                var scenarioName = $("#scenarioName").dxTextBox("instance").option('value');
                Common.E2MASNotification(scenarioName + " already exist.", Common.Warning);
            }
        }
    },
    scenarioSequenceArrays: [],
    GetModelDatas: function () {
        var scenarioSequenceArrays = [];
        if (Scenario.typeofMode == "S") {
            var allSeries = $("#create_intergated_model").dxTagBox("instance").option("selectedItems");
            if (allSeries != null) {
                $.each(allSeries, function (index, value) {
                    var indexInc = index + 1;
                    var scenarioSequence = {
                        "ModelName": value.ModelCode,
                        "ModelSequenceNumber": indexInc,
                        "ModelStatus": "Not started",
                        "ScenarioMode": $('#typeofMode').val()
                    };
                    scenarioSequenceArrays.push(scenarioSequence)
                });
            }
            Scenario.scenarioSequenceArrays = allSeries;
        } else {
            var allSeries = $('#create_intergated_model').textext()[0].tags()._formData;
            if (allSeries != null && allSeries != undefined && allSeries.length > 0) {
                $.each(allSeries, function (index, value) {
                    if (value != null && value.trim() != "") {
                        var indexInc = index + 1;
                        var modelvalue = $.grep(Scenario.BindScenarioModelsArray, function (remove) {
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
                Scenario.scenarioSequenceArrays = scenarioSequenceArrays;
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
        }
        return scenarioSequenceArrays;
    },
    GetScenarioCountries: function () {
        var scenarioCountryArrays = [];
        var allNodes = $("#intergatedcountry").dxTreeView("instance");
        if (allNodes != null && allNodes.getSelectedNodesKeys() != null) {
            var nodeArrays = allNodes.getSelectedNodesKeys();
            if (nodeArrays.length > 0) {
                $.each(nodeArrays, function (index, value) {
                    var isExist = Scenario.RegionSelected.some(function (exist) {
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
    SaveScenarioSuccess: function (rData) {
        if (rData != null && rData.outputDetails.Status) {
            $('#btnSaveScenario span').text('Success');
            var scenarioName = $("#scenarioName").dxTextBox("instance").option('value');
            $('#createScenarioName').text(scenarioName);
            $('#iteratioId,#ViewScenarioStatus').show();
            $('#lbliteratioId').text(1);
            Scenario.confirmScenarioId = rData.outputDetails.scenarioId;
            DevExpress.ui.notify("Scenario Created Successfully");
            Common.E2MASNotification(scenarioName + " Scenario Created Successfully.", Common.Success);
            $('#create_intergated_basedata,#scenarioName,#create_intergated_model,#create_integrated_yearrange,#intergatedcountry,#btnSaveScenario,#description,#switch-on').addClass('disabled');
            $('#create_intergated_model').parent().addClass('disabled');
            //Scenario.BindStaticHeader(rData.outputDetails.scenarioId);
            Common.CommonModel.CommonHeaderBinding('createscenario', rData.outputDetails.scenarioId, 'DM', 1);
        } else {
            Common.E2MASNotification(rData.outputDetails.StatusMessage, Common.Error);
        }
        if (rData != null && rData.outputDetails.Status && rData.outputDetails.dxiStatusMessage.trim() != "DXI Inputs Ready") {
            Common.E2MASNotification(rData.outputDetails.dxiStatusMessage, Common.Error);
        }
        if (rData != null && rData.outputDetails.Status && rData.outputDetails.dxiStatusMessage.trim() == "") {
            Common.E2MASNotification("DXI is not ready for " + Scenario.scenarioSequenceArrays[0].ModelCode, Common.Warning);
        }
    },
    BindStaticHeader: function (confirmScenarioId) {
        $('#staticComheader').html('');
        var staticHTMLContent = "<ul>";
        var staticClass = "", staticHTML = "";
        var staticSCNHTML = '<li id="SCN" class=""><a data-toggle="tab" aria-expanded="false"><label class="wizard-step completed">1</label><span class="wizard-description">Create Scenario<small>Status: <span class="green"> Completed </span></small></span></a></li>';
        var locindex = 0, locModelstatus = '';
        $.each(Scenario.scenarioSequenceArrays, function (index, value) {
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
        var modelcode = Scenario.scenarioSequenceArrays[0].ModelCode;
        if (modelcode != null && modelcode != "") {
            //Common.CommonModel.callModel(confirmScenarioId, modelcode, 0);
        }
        setTimeout(function () {
            //Common.redirecttoSelectedUrl(Scenario.confirmScenarioId, Scenario.scenarioSequenceArrays[0].ModelCode);
        }, 4000);
    },
    CallDxiInputs: function () {
        $('#loading').hide();
        if (rData != null && rData.outputDetails.Status) {

        }
    }
};