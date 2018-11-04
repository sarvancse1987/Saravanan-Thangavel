$(document).ready(function () {
    Petchem.GetPetchemInputs();
    Petchem.BindBulkEditControls();
    Petchem.ShowHideControls("DXI");
    $("#p_setting").dxButton({
        icon: 'fa fa-filter',
        text: "Product Lists",
        onClick: function (e) {
            if (!Petchem.IsPetchemProductListLoad) {
                Petchem.GetPetchemProductList();
            } else {
                $("#product_popup").dxPopup("instance").show();
            }
        }
    });
    $("#btnPetchemSave").dxButton({
        text: "Submit",
        icon: "fa fa-check green_icon",
        onClick: function (e) {
            var result = DevExpress.ui.dialog.confirm("Are you sure want to Submit?", "Confimation Submit");
            result.done(function (dialogResult) {
                if (dialogResult == true) {
                    Petchem.SaveTrialOutput();
                }
            });
        }
    });
    $("#btnPetchemRun").dxButton({
        text: "Run",
        icon: "fa fa-play yellow_icon",
        onClick: function (e) {
            Petchem.PostTrailInput();
        }
    });
    $("#PetchemReset").dxButton({
        text: "Reset",
        onClick: function (e) {
        }
    });
    $("#btnPetchemStandAloneApply").dxButton({
        text: "Apply",
        onClick: function (e) {
            Petchem.GetStandAloneApplyInputs();
        }
    });
    $('#btnPetchemStandAloneApply').addClass('disabled');
    $('#petchemHeaderDXITab').on('click', function () {
        Petchem.ShowHideControls("DXI");
        //if (!Petchem.IsPectchemDXILoaded) {
        //    Petchem.GetPetchemDXIDetails();
        //}
    });
    $('#petchemInputHeaderTab').on('click', function () {
        Petchem.ShowHideControls("INPUT");
        if (!Petchem.IsPetchemInputLoaded) {
            Petchem.GetPetchemInputDetails(false);
        }
    });
    $('#petchemHeaderTab').on('click', function () {
        Petchem.ShowHideControls("OUTPUT");
        if (!Petchem.IsPetchemOutputLoaded) {
            Petchem.GetPetchemOutputDetails();
        }
    });
    $("#btnPetchemIntegrationFilter").dxButton({
        text: "Filter",
        icon: "fa fa-filter yellow_icon",
        onClick: function (e) {
            Petchem.IsFirstTimeLoaded = false;
            var activeTab = $("#petchemTabs li.active").find('a').attr('id');
            if (activeTab != null && activeTab != typeof (undefined)) {
                if (activeTab == "petchemHeaderDXITab") {
                    Petchem.IsPetchemInputLoaded = false;
                    Petchem.IsPetchemOutputLoaded = false;
                    Petchem.GetPetchemDXIDetails();
                }
                else if (activeTab == "petchemInputHeaderTab") {
                    Petchem.IsPectchemDXILoaded = false;
                    Petchem.IsPetchemOutputLoaded = false;
                    Petchem.GetPetchemInputDetails(true);
                }
                else if (activeTab == "petchemHeaderTab") {
                    Petchem.IsPetchemInputLoaded = false;
                    Petchem.IsPectchemDXILoaded = false;
                    Petchem.GetPetchemOutputDetails();
                }
            }
        }
    });
});
Petchem = {
    IsFirstTimeLoaded: true,
    IsModelCompleted: false,
    startValue: 0,
    endValue: 0,
    existCountry: [],
    isIncreased: -1,
    TrailStartYear: 0,
    TrailEndYear: 0,
    IsTrailChanged: false,
    PetchemTrailID: 0,
    syncTreeViewSelection: function (treeView, value) {
        if (!value) {
            treeView.unselectAll();
            return;
        }
        value.forEach(function (key) {
            treeView.selectItem(key);
        });
    },
    GetPetchemInputs: function () {
        var scenarioID = $('#petchemScenarioId').val();
        var queryScenarioID = Common.getQueryString()["scenarioid"];
        var petchemModelStatus = $('#petchemPageLoadModelStatus').val();
        if (!Boolean(parseInt(petchemModelStatus))) {
            Common.SetLoadStatusText(true);
        }
        if (scenarioID == queryScenarioID && queryScenarioID > 0) {
            var modelSeqNumber = $('#modelSeqNumber').val();
            var data = { "scenarioid": queryScenarioID, "sequence": modelSeqNumber };
            var formId = $('#frmPetchem');
            var url = "/Petrochemical/getPetchemInputs";
            Common.ajaxCall(formId, "GET", url, data, Petchem.PetchemInputsSuccess, Common.g_onError, true);
        }
    },
    InitCountry: "",
    PetchemInputsSuccess: function (rdata) {
        if (rdata != null) {
            var typeofMode = $('#petchemtypeofMode').val();
            Petchem.IsModelCompleted = rdata.isModelCompleted;
            Petchem.DisablePetchemControls();
            if (typeofMode == "I") {
                if (!rdata.dxiStatusFlag && rdata.dxiStatusMessage != null) {
                    Common.E2MASNotification(rdata.dxiStatusMessage, Common.Error);
                }
                Petchem.BindPetchemYear(rdata.years);
                Petchem.BindPetchemCountries(rdata.countries);
                Petchem.BindTrailDetails(rdata.trialId, rdata.dTrail);
                Petchem.BindPetchemDXIOutputDetails(rdata.toutputdetails);
            }
            else {
                if (rdata.dxiStatusFlag != null && !rdata.dxiStatusFlag) {
                    Common.E2MASNotification(rdata.dxiStatusMessage, Common.Error);
                }
                Petchem.BindPetchemYear(rdata.years);
                Petchem.BindStandAloneCountries(rdata.countryLst, rdata.countries);
                Petchem.BindPetchemDXIOutputDetails(rdata.toutputdetails);
                Petchem.BindTrailDetails(rdata.trialId, rdata.dTrail);
            }
            if (!rdata.apiStatusFlag && rdata.apiOriginalStatus != null && rdata.apiOriginalStatus != "") {
                Common.E2MASNotification(rdata.apiOriginalStatus, Common.Error);
            }
        }
        Petchem.IsLoaded = true;
        $('#loading').hide();
    },
    ShowHideControls: function (typeTab) {
        if (Petchem.IsModelCompleted) {
            $('#btnPetchemRun,#petchemTrails,#btnPetchemSave,#lblTrial,#divBatchEdit').hide();
            if (typeTab == "DXI") {
                $('#btnPetchemIntegrationFilter,#petchemCountry').hide();
            } else if (typeTab == "INPUT") {
                $('#btnPetchemIntegrationFilter,#petchemCountry').show();
            }
            else {
                $('#btnPetchemIntegrationFilter,#petchemCountry').show();
                $('#petchemCountry').css("border", "1px solid #dfe8f1");
            }
        } else {
            if (typeTab == "DXI") {
                $('#btnPetchemRun,#petchemTrails,#btnPetchemSave,#lblTrial,#btnPetchemIntegrationFilter,#petchemYear,#petchemCountry,#divBatchEdit').hide();
            } else if (typeTab == "INPUT") {
                $('#btnPetchemSave').hide();
                $('#btnPetchemRun,#petchemTrails,#lblTrial,#btnPetchemIntegrationFilter,#petchemYear,#petchemCountry,#divBatchEdit').show();
            }
            else if (typeTab == "OUTPUT") {
                $('#btnPetchemRun').hide();
                $('#btnPetchemSave,#petchemTrails,#lblTrial,#btnPetchemIntegrationFilter,#petchemYear,#petchemCountry,#divBatchEdit').show();
                $('#petchemCountry').css("border", "1px solid #dfe8f1");
            }
        }
    },
    DisablePetchemControls: function () {
        if (Petchem.IsModelCompleted) {
            $('#petchemYear,#btnPetchemStandAloneApply,#btnPetchemRun,#btnPetchemSave,#petchemTrails').addClass('disabled');
        }
        var typeofMode = $('#petchemtypeofMode').val();
        if (typeofMode == "I") {
            $('#layoutScenarioName').text('Integration Mode');
        } else {
            $('#layoutScenarioName').text('StandAlone Mode');
        }
        $('#ViewScenarioStatus').show();
    },
    IsPetchemProductListLoad: false,
    GetPetchemProductList: function () {
        var formId = $('#frmPetchem');
        var url = "/Petrochemical/getPetchemProducts";
        var data = {};
        Common.ajaxCall(formId, "GET", url, data, Petchem.BindPetchemProductList, Common.g_onError, true);
    },
    BindPetchemProductList: function (rData) {
        if (!Petchem.IsPetchemProductListLoad) {
            var product = $("#product_popup").dxPopup({
                title: 'Products List',
                dragEnabled: false,
                width: 600,
                height: 450,
                contentTemplate: function (e) {
                    var listWidget = $("#simpleList").dxList({
                        dataSource: rData,
                        height: 300,
                        searchEnabled: true,
                        searchExpr: "productName",
                        keyExpr: "productCode",
                        displayExpr: "productName",
                        showSelectionControls: true,
                        selectionMode: "multiple",
                        itemTemplate: function (data) {
                            return $("<div>").text(data.productName);
                        }
                    });
                    e.append(listWidget);
                    var saveButton = $("<div id='btnPetchemSaveProduct'>").dxButton({
                        text: 'Submit',
                        onClick: function (arg) {
                            Petchem.GetSelectedPetchemProduct();
                            $("#product_popup").dxPopup("instance").hide();
                        }
                    });
                    e.append(saveButton);
                    var cancelButton = $("<div id='btnCancel'>").dxButton({
                        text: 'Cancel',
                        onClick: function () {
                            $("#product_popup").dxPopup("instance").hide();
                            Petchem.PetchemSelectedProduct = [];
                            $('#simpleList').dxList('instance').unselectAll();
                        }
                    });
                    e.append(cancelButton);
                }
            });
            $("#product_popup").dxPopup("instance").show();
        } else {
            $("#product_popup").dxPopup("instance").show();
        }
        $('#loading').hide();
        Petchem.IsPetchemProductListLoad = true;
    },
    PetchemSelectedProduct: [],
    GetSelectedPetchemProduct: function () {
        Petchem.PetchemSelectedProduct = [];
        var scenarioID = $('#petchemScenarioId').val();
        var selectedProduct = $("#simpleList").dxList('instance');
        var selectedPetchemItem = selectedProduct.option().selectedItemKeys;
        if (selectedPetchemItem != null && selectedPetchemItem.length > 0) {
            $.each(selectedPetchemItem, function (IIndex, Ivalue) {
                var petchemproductCode = {
                    "trialId": Petchem.PetchemTrailID,
                    "scenarioId": scenarioID,
                    "productCode": Ivalue.trim()
                };
                Petchem.PetchemSelectedProduct.push(petchemproductCode);
            });
        }
    },
    BindPetchemCountries: function (countries) {
        if (countries != null) {
            var typeofMode = $('#petchemtypeofMode').val();
            $("#petchemCountry").dxDropDownBox({
                valueExpr: "CountryID",
                displayExpr: "CountryName",
                placeholder: "Select a Country...",
                dataSource: countries,
                showClearButton: true,
                contentTemplate: function (e) {
                    var treeView;
                    var value = e.component.option("value"),
                        $treeView = $("<div>").dxTreeView({
                            dataSource: e.component.option("dataSource"),
                            dataStructure: "plain",
                            keyExpr: "CountryID",
                            searchEnabled: true,
                            parentIdExpr: "CountryCode",
                            selectionMode: "multiple",
                            displayExpr: "CountryName",
                            selectByClick: true,
                            hoverStateEnabled: true,
                            onContentReady: function (args) {

                            },
                            selectNodesRecursive: true,
                            showCheckBoxesMode: "normal",
                            scrolling: { mode: "infinite" },
                            onItemSelectionChanged: function (args) {
                                if (args != null && typeofMode == "S") {
                                    if (args.itemData != null && args.itemData != undefined) {
                                        var isExist = Petchem.existCountry.some(function (exist) {
                                            return exist.CountryCode.trim() == args.itemData.CountryCode.trim()
                                        });
                                        if (!isExist) {
                                            var lcountry = {
                                                "CountryID": args.itemData.Name,
                                                "CountryName": args.itemData.Name.trim(),
                                                "CountryCode": args.itemData.CountryCode.trim()
                                            };
                                            Petchem.NewlyAddCountryLst.push(lcountry);
                                            Petchem.IsCountryNewlyAddedStandAlone = true;
                                            $('#btnPetchemStandAloneApply').removeClass('disabled');
                                        }
                                    }
                                } else {
                                    var value = args.component.getSelectedNodesKeys();
                                    e.component.option("value", value);
                                    $("#btnPetchemIntegrationFilter").removeClass('disabled');
                                    var length = value.length;
                                    if (length > 9) {
                                        var warningMessage = "Please select up to 10 countries";
                                        Common.E2MASNotification(warningMessage, Common.Warning);
                                        for (i = 0; i < $(".dx-treeview-node").length; i++) {
                                            var treeNode = $(".dx-treeview-node")[i].attributes["aria-selected"];
                                            if (treeNode != undefined && treeNode.value == "false") {
                                                if ($.inArray("dx-treeview-node-is-leaf", $(".dx-treeview-node")[i].classList) > -1) {
                                                    $(".dx-treeview-node")[i].className += " dx-state-disabled";
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        $(".dx-treeview-node").removeClass("dx-state-disabled");
                                    }
                                }
                            },
                            onItemRendered: function (e) {
                                if (e.node.internalFields.childrenKeys.length != 0) {
                                    e.itemElement.addClass("selection_hidden").addClass("dx-state-disabled");
                                    e.itemElement.parent().find(".dx-checkbox").addClass("dx-state-disabled");
                                }
                            }
                        });
                    treeView = $treeView.dxTreeView("instance");
                    e.component.on("valueChanged", function (args) {
                        var value = args.value;
                        Petchem.syncTreeViewSelection(treeView, value);
                        $('#petchemCountry').css("border", "1px solid #dfe8f1");
                    });
                    return $treeView;
                }
            });
        }
    },
    IsStandAloneCountryMod: false,
    BindStandAloneCountries: function (rcountryLst, countries) {
        if (rcountryLst != null) {
            var countryLst = [];
            var nodeExpand = [];
            if (countries != null) {
                var removeGlobal = $.grep(countries, function (grep) { return grep.CountryID != "GL" });
                $.each(removeGlobal, function (key, value) {
                    if (!value.expanded) {
                        countryLst.push(value.CountryName);
                        Petchem.existCountry.push(value.CountryID);
                    }
                    var seqNumber = $.grep(rcountryLst, function (remove) {
                        return (remove.Name == value.CountryName);
                    });
                    if (seqNumber.length > 0) {
                        nodeExpand.push(seqNumber[0].CategoryID);
                    }
                });
            }
            var uniqueItems = Common.GetUnique(nodeExpand);
            $.each(rcountryLst, function (index, value) {
                if (value.Name == "World") {
                    value.expanded = true;
                }
                $.each(uniqueItems, function (iIndex, iValue) {
                    if (iValue == value.Name) {
                        value.expanded = true
                    }
                });
            });
            $("#petchemCountry").dxDropDownBox({
                value: [countryLst],
                valueExpr: "ID",
                displayExpr: "Name",
                placeholder: "Select a Country...",
                showClearButton: true,
                dataSource: rcountryLst,
                contentTemplate: function (e) {
                    var value = e.component.option("value"),
                        $treeView = $("<div>").dxTreeView({
                            dataSource: e.component.option("dataSource"),
                            dataStructure: "plain",
                            keyExpr: "ID",
                            searchEnabled: true,
                            parentIdExpr: "CategoryID",
                            selectionMode: "multiple",
                            displayExpr: "Name",
                            selectByClick: true,
                            disabled: false,
                            onContentReady: function (args) {
                                $.each(countryLst, function (index, value) {
                                    args.component.selectItem(value);
                                });
                            },
                            selectNodesRecursive: true,
                            showCheckBoxesMode: "normal",
                            scrolling: { mode: "infinite" },
                            onItemSelectionChanged: function (args) {
                                var value = args.component.getSelectedNodesKeys();
                                e.component.option("value", value);
                                $('#btnDemandStandAloneApply').removeClass('disabled');
                            }
                        });
                    treeView = $treeView.dxTreeView("instance");
                    e.component.on("valueChanged", function (args) {
                        var value = args.value;
                        Petchem.IsStandAloneCountryMod = true;
                        Petchem.syncTreeViewSelection(treeView, value);
                    });
                    return $treeView;
                }
            });
        }
    },
    tabActiveChange: function () {
        var activeTabId = null;
        var activeTab = $("#petchemTabs li.active").find('a').attr('id');
        if (activeTab != null && activeTab != typeof (undefined)) {
            if (activeTab == "petchemHeaderDXITab") {
                Petchem.IsPetchemInputLoaded = false;
                Petchem.IsPetchemOutputLoaded = false;
                activeTabId = "DXI";
            }
            else if (activeTab == "petchemInputHeaderTab") {
                Petchem.IsPectchemDXILoaded = false;
                Petchem.IsPetchemOutputLoaded = false;
                activeTabId = "INPUT";
            }
            else if (activeTab == "petchemHeaderTab") {
                Petchem.IsPetchemInputLoaded = false;
                Petchem.IsPectchemDXILoaded = false;
                activeTabId = "OUTPUT";
            }
        }
        return activeTabId;
    },
    BindPetchemYear: function (dYears) {
        if (dYears != null) {
            var typeofMode = $('#petchemtypeofMode').val();
            Petchem.TrailStartYear = dYears.StartYear;
            Petchem.TrailEndYear = dYears.EndYear;

            startYearCal = dYears.StartYear;
            endYearCal = dYears.EndYear;

            $("#demandYearCal").dxRangeSelector({
                size: {
                    height: 80,
                    width: 296
                },
                scale: {
                    startValue: dYears.StartYear == 0 ? Common.CurrentYear : dYears.StartYear,
                    endValue: dYears.EndYear == 0 ? Common.CurrentYear : dYears.EndYear,
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
                    format: "decimal"
                },
                value: [dYears.StartYear, dYears.EndYear],
                disabled: false,
                title: false,
                onValueChanged: function (data) {
                    startYearCal = data.value[0];
                    endYearCal = data.value[1];

                }
            });

            $("#petchemYear").dxRangeSelector({
                size: {
                    height: 80
                },
                scale: {
                    startValue: dYears.StartYear == 0 ? Common.CurrentYear : dYears.StartYear,
                    endValue: 2050,//dYears.EndYear == 0 ? Common.CurrentYear : dYears.EndYear,
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
                    format: "decimal"
                },
                value: [dYears.StartYear, dYears.EndYear],
                disabled: typeofMode == "I" ? true : false,
                title: false,
                onValueChanged: function (data) {
                    Petchem.startValue = data.value[0];
                    Petchem.endValue = data.value[1];
                    Petchem.isIncreased++;
                    if (Petchem.isIncreased > 0) {
                        $('#btnPetchemStandAloneApply').removeClass('disabled');
                        Petchem.IsCountryNewlyAddedStandAlone = true;
                    }
                }
            });
        }
    },
    IsLoaded: false,
    BindTrailDetails: function (currentTrailID, dTrails) {
        Petchem.PetchemTrailID = currentTrailID;
        var dTrailsBinder = [];
        if (dTrails != null) {
            $.each(dTrails, function (index, value) {
                var trails = {};
                trails = {
                    "trailId": value.trailId,
                    "trailDateTime": "T" + value.trailId + " - " + value.trailDateTime
                };
                dTrailsBinder.push(trails);
            });
        }
        $("#petchemTrails").dxDropDownBox({
            value: [currentTrailID],
            valueExpr: "trailId",
            displayExpr: "trailDateTime",
            placeholder: "Select a trial mode...",
            showClearButton: false,
            dataSource: dTrailsBinder,
            contentTemplate: function (e) {
                var value = e.component.option("value"),
                    $treeView = $("<div>").dxTreeView({
                        dataSource: e.component.option("dataSource"),
                        dataStructure: "plain",
                        keyExpr: "trailId",
                        searchEnabled: true,
                        //parentIdExpr: "categoryId",
                        selectionMode: "single",
                        displayExpr: "trailDateTime",
                        selectByClick: true,
                        disabled: false,
                        onContentReady: function (args) {
                            Petchem.syncTreeViewSelection(args.component, value);
                        },
                        selectNodesRecursive: false,
                        showCheckBoxesMode: "none",
                        onItemSelectionChanged: function (args) {
                            var value = args.component.getSelectedNodesKeys();
                            e.component.option("value", value);
                        }
                    });
                treeView = $treeView.dxTreeView("instance");
                e.component.on("valueChanged", function (args) {
                    var value = args.value;
                    Petchem.syncTreeViewSelection(treeView, value);
                    $("#petchemTrails").dxDropDownBox("instance").close();
                    var trailIdChanged = args.value[0]
                    Petchem.PetchemTrailID = trailIdChanged;
                    if (trailIdChanged != null && trailIdChanged != "") {
                        Petchem.GetTrailChanges(trailIdChanged);
                    }
                    if (trailIdChanged == 0) {
                        Petchem.GetTrailChanges(trailIdChanged);
                    }
                });
                return $treeView;
            }
        });
    },
    IsCountryNewlyAddedStandAlone: false,
    NewlyAddCountryLst: [],
    PetchemcolumnsArray: [],
    GetTrailChanges: function (trailIdChanged) {
        var scenarioID = $('#petchemScenarioId').val();
        var queryScenarioID = Common.getQueryString()["scenarioid"];
        if (scenarioID == queryScenarioID && queryScenarioID > 0) {
            var modelSeqNumber = $('#modelSeqNumber').val();
            var activeTabId = Petchem.tabActiveChange();
            var CountryCodeLst = $("#petchemCountry").dxDropDownBox('instance').option('value');
            var petchemDetails = {
                "scenarioId": queryScenarioID,
                "trialId": trailIdChanged,
                "countryCode": CountryCodeLst,
                "typeInput": activeTabId.trim(),
                "Sequence": modelSeqNumber,
                "IsSaved": Petchem.IsModelCompleted
            };
            var data = { "details": JSON.stringify(petchemDetails) };
            var formId = $('#frmPetchem');
            var url = "/Petrochemical/getPetchemDetails";
            Common.ajaxCall(formId, "GET", url, data, Petchem.TrailChangesSuccess, Common.g_onError, true);
        }
    },
    TrailChangesSuccess: function (rData) {
        $('#loading').hide();
        if (rData != null && rData.toutputdetails != null) {
            Petchem.IsTrailChanged = true;
            if (rData.toutputdetails.length <= 2) {
                Common.E2MASNotification("No record found for this trails.", Common.Warning);
            }
            var activeTab = Petchem.tabActiveChange();
            if (activeTab != null && activeTab != typeof (undefined)) {
                if (activeTab == "DXI") {
                    Petchem.BindPetchemDXIOutputDetails(rData.toutputdetails);
                }
                else if (activeTab == "INPUT") {
                    Petchem.BindPetchemInputDetails(rData.toutputdetails);
                }
                else if (activeTab == "OUTPUT") {
                    Petchem.BindPetchemOutputDetails(rData.toutputdetails);
                }
            }
        }
    },
    BindPetchemOutputValues: function (dOutputvalues) {
        if (dOutputvalues != null) {
            var jsonDatas = dOutputvalues;
            Petchem.PetchemcolumnsArray = [];
            var arrayHeader = {};
            arrayHeader = {
                "dataField": "ProductCode",
                "visible": true,
                "allowEditing": false,
                "fixed": true,
                "showInColumnChooser": false
            };
            variableExists = Petchem.PetchemcolumnsArray.some(function (exist) {
                return exist.dataField.trim() == arrayHeader.dataField.trim()
            });
            if (!variableExists) {
                Petchem.PetchemcolumnsArray.push(arrayHeader);
            }
            arrayHeader = {
                "dataField": "VariableDescription",
                "caption": "Series Name",
                //"groupIndex": 0,
                "visible": true,
                "allowEditing": false,
                "fixed": true,
                "showInColumnChooser": false,
                "width": 300
            };
            var variableExists = Petchem.PetchemcolumnsArray.some(function (exist) {
                return exist.dataField.trim() == arrayHeader.dataField.trim()
            });
            if (!variableExists) {
                Petchem.PetchemcolumnsArray.push(arrayHeader);
            }
            arrayHeader = {
                "dataField": "VariableName",
                "visible": true,
                "allowEditing": false,
                "fixed": true,
                "showInColumnChooser": false
            };
            variableExists = Petchem.PetchemcolumnsArray.some(function (exist) {
                return exist.dataField.trim() == arrayHeader.dataField.trim()
            });
            if (!variableExists) {
                Petchem.PetchemcolumnsArray.push(arrayHeader);
            }
            arrayHeader = {
                "dataField": "UnitName",
                "visible": true,
                "allowEditing": false,
                "fixed": true,
                "showInColumnChooser": false
            };
            variableExists = Petchem.PetchemcolumnsArray.some(function (exist) {
                return exist.dataField.trim() == arrayHeader.dataField.trim()
            });
            if (!variableExists) {
                Petchem.PetchemcolumnsArray.push(arrayHeader);
            }
            arrayHeader = {
                "dataField": "CountryCode",
                "visible": false,
                "allowEditing": false,
                "fixed": true,
                "showInColumnChooser": false
            };
            variableExists = Petchem.PetchemcolumnsArray.some(function (exist) {
                return exist.dataField.trim() == arrayHeader.dataField.trim()
            });
            if (!variableExists) {
                Petchem.PetchemcolumnsArray.push(arrayHeader);
            }
            arrayHeader = {
                "dataField": "CountryName",
                "visible": true,
                "caption": "Country",

                "allowEditing": false,
                "fixed": true,
                "showInColumnChooser": false
            };
            variableExists = Petchem.PetchemcolumnsArray.some(function (exist) {
                return exist.dataField.trim() == arrayHeader.dataField.trim()
            });
            if (!variableExists) {
                Petchem.PetchemcolumnsArray.push(arrayHeader);
            }
            if (jsonDatas != null) {
                $.each(jsonDatas, function (key, value) {
                    if (key.toUpperCase() == "ROWNUMBER") {
                        arrayHeader = {
                            "dataField": key,
                            "visible": false,
                            "allowEditing": false,

                            "showInColumnChooser": false
                        };
                    } else {
                        if (key.toUpperCase() != "VARIABLENAME" && key.toUpperCase() != "COUNTRYCODE" && key.toUpperCase() != "COUNTRYNAME" && key.toUpperCase() != "VARIABLEDESCRIPTION") {
                            arrayHeader = {
                                "dataField": key,
                                "visible": true,
                                "allowEditing": true,
                                summaryType: "sum",
                                showInGroupFooter: false,
                                alignByColumn: true,
                                displayFormat: "Total: {0}",
                                "alignment": "left"
                            };
                            arrayHeaderGroup = {
                                "column": key,
                                summaryType: "sum",
                                showInGroupFooter: false,
                                alignByColumn: true,
                                displayFormat: "Total: {0}",
                                "alignment": "left"
                            };
                            /* arrayHeader = {
                                 "dataField": key,
                                 "visible": true,
                                 "allowEditing": true,
                                 
                                 "showInColumnChooser": true
                             };*/
                        }
                    }
                    variableExists = Petchem.PetchemcolumnsArray.some(function (exist) {
                        return exist.dataField.trim() == arrayHeader.dataField.trim()
                    });
                    if (!variableExists) {
                        Petchem.PetchemcolumnsArray.push(arrayHeader);
                        // Petchem.PetchemcolumnsSumArray.push(arrayHeaderGroup);
                    }
                });
                //Petchem.BindDynamicYear(jsonDatas);
            }
        }
    },
    IsPectchemDXILoaded: false,
    GetPetchemDXIDetails: function () {
        var scenarioID = $('#petchemScenarioId').val();
        var queryScenarioID = Common.getQueryString()["scenarioid"];
        if (scenarioID == queryScenarioID && queryScenarioID > 0) {
            var modelSeqNumber = $('#modelSeqNumber').val();
            var CountryCodeLst = $("#petchemCountry").dxDropDownBox('instance').option('value');
            var petchemDetails = {
                "scenarioId": queryScenarioID,
                "trialId": Petchem.PetchemTrailID,
                "countryCode": CountryCodeLst,
                "typeInput": "DXI",
                "Sequence": modelSeqNumber,
                "IsSaved": Petchem.IsModelCompleted
            };
            var data = { "details": JSON.stringify(petchemDetails) };
            var formId = $('#frmPetchem');
            var url = "/Petrochemical/getPetchemDetails";
            Common.ajaxCall(formId, "GET", url, data, Petchem.BindPetchemDXIOutputDetails, Common.g_onError, true);
        }
    },
    BindPetchemDXIOutputDetails: function (petchemDXIOutputDetails) {
        Petchem.IsPectchemDXILoaded = true;
        $('#loading').hide();
        var dxiJsonValues = null;
        if (petchemDXIOutputDetails != null && petchemDXIOutputDetails.hasOwnProperty('toutputdetails'))
            dxiJsonValues = JSON.parse(petchemDXIOutputDetails.toutputdetails);
        else
            dxiJsonValues = JSON.parse(petchemDXIOutputDetails);

        Petchem.IsPectchemDXILoaded = true;
        Petchem.BindPetchemOutputValues(dxiJsonValues[0]);
        var pcScenarioName = ($('#pcScenarioName').val() == null || $('#pcScenarioName').val() == "") ? "IHS" : $('#pcScenarioName').val();
        var exportName = pcScenarioName + "- Other Model Outputs- Trial" + Petchem.PetchemTrailID;
        var treeListDXI = $("#petchemDXIOutputDetails").dxDataGrid({
            dataSource: dxiJsonValues,
            keyExpr: "RowNumber",
            "export": {
                enabled: true,
                fileName: exportName,
                allowExportSelectedData: true
            },
            allowColumnResizing: true,
            searchPanel: {
                visible: true,
                width: 250
            },
            headerFilter: {
                visible: true
            },
            paging: {
                pageSize: 20
            },
            pager: {
                showNavigationButtons: true,
                allowedPageSizes: [10, 20, 30],
                showPageSizeSelector: true,
                showInfo: true
            },
            columnChooser: {
                enabled: true
            },
            selection: {
                mode: "multiple",
                allowSelectAll: true,
                showCheckBoxesMode: "always"
            },
            editing: {
                mode: "batch"
                , allowUpdating: true
            },
            loadPanel: {
                enabled: true
            },
            wordWrapEnabled: true,
            onCellPrepared: function (info) {
                if (info.rowType == 'data' && info.data.RowNumber == 1 && info.cellElement.hasClass("dx-treelist-cell-expandable"))
                    info.cellElement.find(".dx-select-checkbox").dxCheckBox("instance").option("visible", false);
                else if (info.rowType == 'data' && info.data.ID == 32 && info.cellElement.hasClass("dx-treelist-cell-expandable"))
                    info.cellElement.find(".dx-select-checkbox").dxCheckBox("instance").option("visible", false);
            },
            onEditingStart: function (info) {
                info.cancel = true;
            },
            onRowPrepared: function (info) {
                if (info.rowType == "data") {
                    if (info.rowType != "header" && info.data.IsModified === 0)
                        info.rowElement.addClass("whitebg");
                }
            },
            groupPanel: {
                visible: true
            },
            columns: Petchem.PetchemcolumnsArray,
            columnAutoWidth: true,
            columnFixing: {
                enabled: true
            },
            wordWrapEnabled: true,
            onToolbarPreparing: function (e) {
                var toolbarItems = e.toolbarOptions.items;
                toolbarItems.push(
                  {
                      location: "after",
                      widget: "dxButton",
                      options: {
                          icon: "refresh",
                          onClick: function () {
                              treeListDXI.refresh();
                          }
                      }
                  });
            }
        }).dxDataGrid("instance");
    },
    IsPetchemInputLoaded: false,
    GetPetchemInputDetails: function (isFilter) {
        var scenarioID = $('#petchemScenarioId').val();
        var queryScenarioID = Common.getQueryString()["scenarioid"];
        if (scenarioID == queryScenarioID && queryScenarioID > 0) {
            var modelSeqNumber = $('#modelSeqNumber').val();
            var CountryCodeLst = [];
            var typeofMode = $('#petchemtypeofMode').val();
            if (typeofMode == "I") {
                CountryCodeLst = $("#petchemCountry").dxDropDownBox('instance').option('value');
            } else {
                CountryCodeLst = Petchem.GetStandAloneCountries();
            }
            if (CountryCodeLst != null && CountryCodeLst.length > 0) {
                $('#petchemCountry').css("border", "1px solid #dfe8f1");
                var petchemDetails = {
                    "scenarioId": queryScenarioID,
                    "trialId": Petchem.PetchemTrailID,
                    "countryCode": CountryCodeLst,
                    "typeInput": "INPUT",
                    "Sequence": modelSeqNumber,
                    "IsSaved": Petchem.IsModelCompleted
                };
                var data = { "details": JSON.stringify(petchemDetails) };
                var formId = $('#frmPetchem');
                var url = "/Petrochemical/getPetchemDetails";
                Common.ajaxCall(formId, "GET", url, data, Petchem.BindPetchemInputDetails, Common.g_onError, true);
            } else {
                if (isFilter) {
                    $('#petchemCountry').css('border', '1px red solid');
                }
            }
        }
    },
    BindPetchemInputDetails: function (petchemInputDetails) {
        Petchem.IsPetchemInputLoaded = true;
        $('#loading').hide();
        var inputJsonDetails = null;
        if (petchemInputDetails != null && petchemInputDetails.hasOwnProperty('toutputdetails'))
            inputJsonDetails = JSON.parse(petchemInputDetails.toutputdetails);
        else
            inputJsonDetails = JSON.parse(petchemInputDetails);

        if (inputJsonDetails != null && inputJsonDetails.length > 0) {
            Petchem.BindPetchemOutputValues(inputJsonDetails[0]);
        }
        var dmScenarioName = ($('#pcScenarioName').val() == null || $('#pcScenarioName').val() == "") ? "IHS" : $('#pcScenarioName').val();
        var exportName = dmScenarioName + "- Petchem Inputs- Trial" + Petchem.PetchemTrailID;
        var treeListInput = $("#petchemInputDetails").dxDataGrid({
            dataSource: inputJsonDetails,
            keyExpr: "RowNumber",
            "export": {
                enabled: true,
                fileName: "IHS- Petchem Outputs - Trial0",
                allowExportSelectedData: true
            },
            allowColumnResizing: true,
            searchPanel: {
                visible: true,
                width: 250
            },
            headerFilter: {
                visible: true
            },
            paging: {
                pageSize: 20
            },
            pager: {
                showNavigationButtons: true,
                allowedPageSizes: [10, 20, 30],
                showPageSizeSelector: true,
                showInfo: true
            },
            columnChooser: {
                enabled: true
            },
            selection: {
                mode: "multiple",
                allowSelectAll: true,
                showCheckBoxesMode: "always"
            },
            editing: {
                mode: "batch"
                , allowUpdating: true
            },
            loadPanel: {
                enabled: true
            },
            wordWrapEnabled: true,
            onCellPrepared: function (info) {

            },
            onEditingStart: function (info) {
                if (Petchem.IsModelCompleted)
                    info.cancel = true;
            },
            onRowPrepared: function (info) {
                if (info.rowType == "data") {
                }
            },
            onEditorPrepared: function (e) {
            },
            groupPanel: {
                visible: true
            },
            columns: Petchem.PetchemcolumnsArray,
            onContentReady: function (e) {
                e.component.selectRows([1], true);
            },
            columnAutoWidth: true,
            columnFixing: {
                enabled: true
            },
            onToolbarPreparing: function (e) {
                var toolbarItems = e.toolbarOptions.items;
                toolbarItems.push(
                  {
                      location: "before",
                      locateInMenu: 'auto',
                      widget: "dxButton",
                      options: {
                          icon: 'faicon fa fa-line-chart',
                          elementAttr: { 'class': 'faicon' },
                          onClick: function () {
                              Petchem.BindInputChartData('line');
                          }
                      }
                  },
                  {
                      location: "after",
                      widget: "dxButton",
                      options: {
                          icon: "refresh",
                          onClick: function () {
                              treeListInput.refresh();
                          }
                      }
                  },
                  {
                      location: "before",
                      locateInMenu: 'auto',
                      widget: "dxButton",
                      options: {
                          icon: 'faicon fa fa-area-chart',
                          elementAttr: { 'class': 'faicon' },
                          onClick: function () {
                              Petchem.BindInputChartData('area');
                          }
                      }
                  },
                  {
                      location: "before",
                      locateInMenu: 'auto',
                      widget: "dxButton",
                      options: {
                          icon: "faicon fa fa-bar-chart",
                          elementAttr: { 'class': 'faicon' },
                          onClick: function () {
                              Petchem.BindInputChartData('bar');
                          }
                      }
                  });
            },
            onRowUpdating: function (e) {
                Petchem.IsPetchemInputModified = true;
                $('#btnPetchemRun').removeClass('disabled');
                var oldData = e.oldData;
                $.each(Object.keys(e.newData), function (iIndex, iValue) {
                    var isExist = Petchem.PostTrailInputValue.some(function (exist) {
                        return (exist.year == parseInt(iValue) && exist.variableName.trim() == oldData.VariableName.trim() && exist.countryCode.trim() == oldData.CountryCode.trim() && exist.productCode.trim() == oldData.ProductCode.trim())
                    });
                    if (!isExist) {
                        var trailOutputs = {
                            "variableName": oldData.VariableName,
                            "countryCode": oldData.CountryCode.trim(),
                            "productCode": oldData.ProductCode == null ? '' : oldData.ProductCode,
                            "year": parseInt(iValue),
                            "variablevalue": e.newData[iValue] == null ? 0 : e.newData[iValue]
                        };
                        Petchem.PostTrailInputValue.push(trailOutputs);
                    } else {
                        Petchem.PostTrailInputValue = $.grep(Petchem.PostTrailInputValue, function (grepvalue) {
                            if (grepvalue.year == parseInt(iValue) && grepvalue.variableName.trim() == oldData.VariableName.trim() && grepvalue.countryCode.trim() == oldData.CountryCode.trim() && grepvalue.productCode.trim() == oldData.ProductCode.trim()) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        });
                        var isExist = Petchem.PostTrailInputValue.some(function (exist) {
                            return (exist.year == parseInt(iValue) && exist.variableName.trim() == oldData.VariableName.trim() && exist.countryCode.trim() == oldData.CountryCode.trim() && exist.productCode.trim() == oldData.ProductCode.trim())
                        });
                        if (!isExist) {
                            var trailOutputs = {
                                "variableName": oldData.VariableName,
                                "countryCode": oldData.CountryCode.trim(),
                                "productCode": oldData.ProductCode == null ? '' : oldData.ProductCode,
                                "year": parseInt(iValue),
                                "variablevalue": e.newData[iValue] == null ? 0 : e.newData[iValue]
                            };
                            Petchem.PostTrailInputValue.push(trailOutputs);
                        }
                    }
                });
            }
        }).dxDataGrid("instance");
        treeListInput.on('selectionChanged', function () {
            Petchem.BindInputChartData('area');
        });
    },
    BindInputChartData: function (inputChart) {
        var inputOutputDatas = $("#petchemInputDetails").dxDataGrid('instance');
        var selectedData = inputOutputDatas.getSelectedRowsData();
        if (selectedData.length == 0 && selectedData[0] == undefined) {
            Petchem.BindInputChartValues([], "area");
        }
        else {
            var len = Object.keys(selectedData[0]).length - 5;
            var chartJson = new Array(len);
            for (i = 0; i < chartJson.length; i++) {
                chartJson[i] = {
                };
            }
            for (i = 0; i < selectedData.length; i++) {
                for (j = 0; j < (Object.keys(selectedData[0]).length) - 5; j++) {
                    if ((Object.keys(selectedData[i])[j] != "VARIABLENAME") && (Object.keys(selectedData[i])[j] != "RowNumber") && (Object.keys(selectedData[i])[j] != "ParentID") && (Object.keys(selectedData[i])[j] != "MappingId") && (Object.keys(selectedData[i])[j] != "SectorId")) {
                        chartJson[j]["year"] = Object.keys(selectedData[i])[j];
                        seriesName = selectedData[i].VariableDescription;
                        chartJson[j][seriesName] = selectedData[i][Object.keys(selectedData[i])[j]];
                    }
                }
            }
            Petchem.BindInputChartValues(chartJson, inputChart);
        }
    },
    BindInputChartValues: function (chartData, inputChart) {
        var serieseData = [];
        if (chartData != null && chartData.length > 0) {
            var len = Object.keys(chartData[0]).length - 1;
            var serieseData = new Array(len);
            for (i = 0, j = 0; i < serieseData.length; i++) {
                var valField = Object.keys(chartData[0])[i + 1];
                if (valField != "year") {
                    serieseData[j] = { valueField: valField, name: valField };
                    j++;
                }
            }
        }
        $("#petchemInputChart").dxChart({
            palette: ['#84BD00', '#00843D', '#00A3E0', '#0033A0', '#D22630', '#F68D2E', '#F0B323', '#E1D100'],
            dataSource: chartData,
            commonSeriesSettings:
            {
                argumentField: "year",
                hoverMode: "allArgumentPoints",
                selectionMode: "allArgumentPoints",
                label: {
                    visible: false,
                    format: {
                        type: "decimal",
                        precision: 1
                    }
                },
                type: inputChart
            },
            crosshair: {
                enabled: true,
                color: "#949494",
                width: 3,
                dashStyle: "dot",
                label: {
                    visible: true,
                    backgroundColor: "#949494",
                    format: {
                        type: "decimal",
                        precision: 1
                    },
                    font: {
                        color: "#fff",
                        size: 12,
                    }
                }
            },
            panes: {
                backgroundColor: 'white',
                border: {
                    visible: true,
                    width: 1
                }
            },
            margin: {
                bottom: 20
            },
            argumentAxis: {
                valueMarginsEnabled: true,
                discreteAxisDivisionMode: "crossLabels",
                grid: {
                    visible: true
                }
            },
            valueAxis:
                {
                    valueType: 'numeric',
                    autoBreaksEnabled: false,
                    maxAutoBreakCount: 3000
                },
            series: serieseData,
            legend: {
                verticalAlignment: "bottom",
                horizontalAlignment: "center",
                itemTextPosition: "bottom"
            },
            title: {
                //text: "(UNIT: Millions of Tons)"
            },
            "export": {
                enabled: true
            },
            onPointClick: function (e) {
                e.target.select();
            },
            onLegendClick: function (e) {
                var series = e.target;
                if (series.isVisible()) {
                    series.hide();
                } else {
                    series.show();
                }
            },
            tooltip: {
                enabled: true,
                customizeTooltip: function (info) {
                    //return {
                    //    text: arg.valueText
                    //};
                    return {
                        html: "<div><div class='tooltip-header'>" +
                        info.argumentText + "</div>" +
                        "<div class='tooltip-body'><div class='series-name'>" +
                        info.seriesName +
                        ": </div><div class='value-text'>" +
                        info.valueText +
                        "</div><div class='series-name'>" +
                        info.seriesName +
                        ": </div><div class='value-text'>" +
                        info.valueText +
                        "% </div></div></div>"
                    };
                }
            },
            scrollBar: {
                visible: true
            },
            scrollingMode: "all",
            zoomingMode: "all",
            autoBreaksEnabled: false
        }).dxChart("instance");
    },
    IsPetchemOutputLoaded: false,
    GetPetchemOutputDetails: function () {
        var scenarioID = $('#petchemScenarioId').val();
        var queryScenarioID = Common.getQueryString()["scenarioid"];
        if (scenarioID == queryScenarioID && queryScenarioID > 0) {
            var modelSeqNumber = $('#modelSeqNumber').val();
            var CountryCodeLst = [];
            var typeofMode = $('#petchemtypeofMode').val();
            if (typeofMode == "I") {
                CountryCodeLst = $("#petchemCountry").dxDropDownBox('instance').option('value');
            } else {
                CountryCodeLst = Petchem.GetStandAloneCountries();
            }
            var petchemDetails = {
                "scenarioId": queryScenarioID,
                "trialId": Petchem.PetchemTrailID,
                "countryCode": CountryCodeLst,
                "typeInput": "OUTPUT",
                "Sequence": modelSeqNumber,
                "IsSaved": Petchem.IsModelCompleted
            };
            var data = { "details": JSON.stringify(petchemDetails) };
            var formId = $('#frmPetchem');
            var url = "/Petrochemical/getPetchemDetails";
            Common.ajaxCall(formId, "GET", url, data, Petchem.BindPetchemOutputDetails, Common.g_onError, true);
        }
    },
    BindPetchemOutputDetails: function (petchemOutputDetails) {
        Petchem.IsPetchemOutputLoaded = true;
        $('#loading').hide();
        var outputJsonDetails = null;
        if (petchemOutputDetails != null && petchemOutputDetails.hasOwnProperty('toutputdetails'))
            outputJsonDetails = JSON.parse(petchemOutputDetails.toutputdetails);
        else
            outputJsonDetails = JSON.parse(petchemOutputDetails);
        if (outputJsonDetails != null && outputJsonDetails.length > 0) {
            Petchem.BindPetchemOutputValues(outputJsonDetails[0]);
        }
        var pcScenarioName = ($('#pcScenarioName').val() == null || $('#pcScenarioName').val() == "") ? "IHS" : $('#pcScenarioName').val();
        var exportName = pcScenarioName + "- Petchem Outputs - Trial-" + Petchem.PetchemTrailID;
        var treeList = $("#petchemOutputDetails").dxDataGrid({
            dataSource: outputJsonDetails,
            keyExpr: "RowNumber",
            "export": {
                enabled: true,
                fileName: exportName,
                allowExportSelectedData: true
            },
            allowColumnResizing: true,
            searchPanel: {
                visible: true,
                width: 250
            },
            headerFilter: {
                visible: true
            },
            paging: {
                pageSize: 20
            },
            pager: {
                showNavigationButtons: true,
                allowedPageSizes: [10, 20, 30],
                showPageSizeSelector: true,
                showInfo: true
            },
            columnChooser: {
                enabled: true
            },
            selection: {
                mode: "multiple",
                allowSelectAll: true,
                showCheckBoxesMode: "always"
            },
            editing: {
                mode: "batch"
                , allowUpdating: true
            },
            loadPanel: {
                enabled: true
            },
            onCellPrepared: function (info) {
                if (info.rowType == 'data' && info.data.RowNumber == 1 && info.cellElement.hasClass("dx-treelist-cell-expandable"))
                    info.cellElement.find(".dx-select-checkbox").dxCheckBox("instance").option("visible", false);
                else if (info.rowType == 'data' && info.data.ID == 32 && info.cellElement.hasClass("dx-treelist-cell-expandable"))
                    info.cellElement.find(".dx-select-checkbox").dxCheckBox("instance").option("visible", false);
            },
            onEditingStart: function (info) {
                if (Petchem.IsModelCompleted)
                    info.cancel = true;
            },
            onRowPrepared: function (info) {
                if (info.rowType == "data") {
                    //if (info.rowType != "header" && info.data.IsModified === 2)
                    //    info.rowElement.addClass("ihscomparsion");
                }
            },
            onEditorPrepared: function (e) {
            },
            groupPanel: {
                visible: true
            },
            columns: Petchem.PetchemcolumnsArray,
            summary: {
                groupItems: Petchem.PetchemcolumnsSumArray
            },
            onContentReady: function (e) {
                e.component.selectRows([1], true);
            },
            columnAutoWidth: true,
            columnFixing: {
                enabled: true
            },
            wordWrapEnabled: true,
            onToolbarPreparing: function (e) {
                var toolbarItems = e.toolbarOptions.items;
                toolbarItems.push(
                  {
                      location: "before",
                      locateInMenu: 'auto',
                      widget: "dxButton",
                      options: {
                          icon: 'faicon fa fa-line-chart',
                          elementAttr: { 'class': 'faicon' },
                          onClick: function () {
                              Petchem.BindOutputChartData('line');
                          }
                      }
                  },
                  {
                      location: "after",
                      widget: "dxButton",
                      options: {
                          icon: "refresh",
                          onClick: function () {
                              treeList.refresh();
                          }
                      }
                  },
                  {
                      location: "before",
                      locateInMenu: 'auto',
                      widget: "dxButton",
                      options: {
                          icon: 'faicon fa fa-area-chart',
                          elementAttr: { 'class': 'faicon' },
                          /* elementAttr: {'aria-hidden': 'false'},*/
                          onClick: function () {
                              Petchem.BindOutputChartData('area');
                          }
                      }
                  },
                  {
                      location: "before",
                      locateInMenu: 'auto',
                      widget: "dxButton",
                      options: {
                          icon: "faicon fa fa-bar-chart",
                          elementAttr: { 'class': 'faicon' },
                          /*elementAttr: {'class': 'command-with-badge'},*/
                          onClick: function () {
                              Petchem.BindOutputChartData('bar');
                          }
                      }
                  });
            },
            onRowUpdating: function (e) {
                var scenarioID = $('#petchemScenarioId').val();
                var oldData = e.oldData;
                $.each(Object.keys(e.newData), function (iIndex, iValue) {
                    var isExist = Petchem.SaveTrialOutputValue.some(function (exist) {
                        return (exist.year == parseInt(iValue) && exist.variableName.trim() == oldData.VariableName.trim() && exist.countryCode.trim() == oldData.CountryCode.trim() && exist.productCode.trim() == oldData.ProductCode.trim())
                    });
                    if (!isExist) {
                        var trailOutputs = {
                            "ScenarioId": scenarioID,
                            "variableName": oldData.VariableName,
                            "countryCode": oldData.CountryCode.trim(),
                            "year": parseInt(iValue),
                            "variablevalue": e.newData[iValue] == null ? 0 : e.newData[iValue],
                            "productCode": oldData.ProductCode == null ? '' : oldData.ProductCode
                        };
                        Petchem.SaveTrialOutputValue.push(trailOutputs);
                    } else {
                        Petchem.SaveTrialOutputValue = $.grep(Petchem.SaveTrialOutputValue, function (grepvalue) {
                            if (grepvalue.year == parseInt(iValue) && grepvalue.variableName.trim() == oldData.VariableName.trim() && grepvalue.countryCode.trim() == oldData.CountryCode.trim() && grepvalue.productCode.trim() == oldData.ProductCode.trim()) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        });
                        var isExist = Petchem.SaveTrialOutputValue.some(function (exist) {
                            return (exist.year == parseInt(iValue) && exist.variableName.trim() == oldData.VariableName.trim() && exist.countryCode.trim() == oldData.CountryCode.trim() && exist.productCode.trim() == oldData.ProductCode.trim())
                        });
                        if (!isExist) {
                            var trailOutputs = {
                                "ScenarioId": scenarioID,
                                "variableName": oldData.VariableName,
                                "countryCode": oldData.CountryCode.trim(),
                                "year": parseInt(iValue),
                                "variablevalue": e.newData[iValue] == null ? 0 : e.newData[iValue],
                                "productCode": oldData.ProductCode == null ? '' : oldData.ProductCode
                            };
                            Petchem.SaveTrialOutputValue.push(trailOutputs);
                        }
                    }
                });
            }
        }).dxDataGrid("instance");
        treeList.on('selectionChanged', function () {
            Petchem.BindOutputChartData('area');
        });
    },
    BindOutputChartData: function (outputChart) {
        var inputOutputDatas = $("#petchemOutputDetails").dxDataGrid('instance');
        var selectedData = inputOutputDatas.getSelectedRowsData();
        if (selectedData.length == 0 && selectedData[0] == undefined) {
            Petchem.BindOutputChartValues([], outputChart);
        }
        else {
            var len = Object.keys(selectedData[0]).length - 5;
            var chartJson = new Array(len);
            for (i = 0; i < chartJson.length; i++) {
                chartJson[i] = {
                };
            }
            for (i = 0; i < selectedData.length; i++) {
                for (j = 0; j < (Object.keys(selectedData[0]).length) - 5; j++) {
                    if ((Object.keys(selectedData[i])[j] != "VariableName") && (Object.keys(selectedData[i])[j] != "RowNumber")) {
                        chartJson[j]["year"] = Object.keys(selectedData[i])[j];
                        seriesName = selectedData[i].VariableDescription;
                        chartJson[j][seriesName] = selectedData[i][Object.keys(selectedData[i])[j]];
                    }
                }
            }
            Petchem.BindOutputChartValues(chartJson, outputChart);
        }
    },
    BindOutputChartValues: function (chartData, outputChart) {
        var serieseData = [];
        if (chartData != null && chartData.length > 0) {
            var len = Object.keys(chartData[0]).length - 1;
            var serieseData = new Array(len);
            for (i = 0, j = 0; i < serieseData.length; i++) {
                valField = Object.keys(chartData[0])[i + 1];
                if (valField != "year") {
                    serieseData[j] = { valueField: valField, name: valField };
                    j++;
                }
            }
        }
        chart = $("#petchemOutputChart").dxChart({
            palette: ['#84BD00', '#00843D', '#00A3E0', '#0033A0', '#D22630', '#F68D2E', '#F0B323', '#E1D100'],
            dataSource: chartData,
            commonSeriesSettings:
            {
                argumentField: "year",
                hoverMode: "allArgumentPoints",
                selectionMode: "allArgumentPoints",
                label: {
                    visible: false,
                    format: {
                        type: "decimal",
                        precision: 1
                    }
                },
                /*type: types[0] */
                type: outputChart
            },
            crosshair: {
                enabled: true,
                color: "#949494",
                width: 3,
                dashStyle: "dot",
                label: {
                    visible: true,
                    backgroundColor: "#949494",
                    format: {
                        type: "decimal",
                        precision: 1
                    },
                    font: {
                        color: "#fff",
                        size: 12,
                    }
                }
            },
            panes: {
                backgroundColor: 'white',
                border: {
                    visible: true,
                    width: 1
                }
            },
            margin: {
                bottom: 20
            },
            argumentAxis: {
                valueMarginsEnabled: true,
                discreteAxisDivisionMode: "crossLabels",
                grid: {
                    visible: true
                }
            },
            valueAxis:
            {
                valueType: 'numeric',
                autoBreaksEnabled: false,
                maxAutoBreakCount: 3000
            },
            series: serieseData,
            legend: {
                verticalAlignment: "bottom",
                horizontalAlignment: "center",
                itemTextPosition: "bottom"
            },
            title: {
                //text: "(UNIT: Millions of Tons)"
            },
            "export": {
                enabled: true
            },
            onPointClick: function (e) {
                e.target.select();
            },
            onLegendClick: function (e) {
                var series = e.target;
                if (series.isVisible()) {
                    series.hide();
                } else {
                    series.show();
                }
            },
            tooltip: {
                enabled: true,
                customizeTooltip: function (info) {
                    //return {
                    //    text: arg.valueText
                    //};
                    return {
                        html: "<div><div class='tooltip-header'>" +
                        info.argumentText + "</div>" +
                        "<div class='tooltip-body'><div class='series-name'>" +
                        info.seriesName +
                        ": </div><div class='value-text'>" +
                        info.valueText +
                        "</div><div class='series-name'>" +
                        info.seriesName +
                        ": </div><div class='value-text'>" +
                        info.valueText +
                        "% </div></div></div>"
                    };
                }
            },
            scrollBar: {
                visible: true
            },
            scrollingMode: "all",
            zoomingMode: "all",

        }).dxChart("instance");
    },
    ChangeOutputCellValues: function (ddlValue) {
        var txtValue = parseFloat($('#txtModifiedValue').val());
        if (txtValue != "" && txtValue != null && parseFloat(txtValue) != "NaN") {
            var outputCell = $("#petchemOutputDetails").dxDataGrid('instance');
            var selectedRow = outputCell.getSelectedRowsData();
            var rowColumnCell = [];
            var keys = $("#ddlColumnValues").dxDropDownBox('instance').option('value');
            if (keys == 0) {
                keys = Object.keys(selectedRow[0]);
            } else {
                keys = $("#ddlColumnValues").dxDropDownBox('instance').option('value');
            }
            $.each(keys, function (sIndex, sValue) {
                if (parseInt(sValue) > 0) {
                    rowColumnCell.push(sValue);
                }
            });
            var selectedRowIndex = outputCell.getSelectedRowKeys();
            $.each(selectedRowIndex, function (index, value) {
                $.each(rowColumnCell, function (sIndex, sValue) {
                    var rowIndexMinus = value - 1;
                    var cellVal = parseFloat(outputCell.cellValue(rowIndexMinus, sValue));
                    var txtValueLoc = 0;
                    switch (ddlValue) {
                        case 1:
                            {
                                txtValueLoc = cellVal + txtValue;
                                break;
                            }
                        case 2:
                            {
                                txtValueLoc = cellVal - txtValue;
                                break;
                            }
                        case 3:
                            {
                                txtValueLoc = cellVal * txtValue;
                                break;
                            }
                        case 4:
                            {
                                txtValueLoc = cellVal / txtValue;
                                break;
                            }
                        case 5:
                            {
                                var ans = 0;
                                ans = txtValue / 100;
                                txtValueLoc = (cellVal * ans);
                                break;
                            }
                        case 6:
                            {
                                txtValueLoc = txtValue;
                                break;
                            }
                        default:
                            break;
                    }
                    if (!isNaN(txtValueLoc)) {
                        outputCell.cellValue(rowIndexMinus, sValue, txtValueLoc);
                    } else {
                        outputCell.cellValue(rowIndexMinus, sValue, 0);
                    }
                });
            });
        }
    },
    IsPetchemInputModified: false,
    PostTrailInputValue: [],
    PostTrailInput: function () {
        var scenarioID = $('#petchemScenarioId').val();
        var queryScenarioID = Common.getQueryString()["scenarioid"];
        if (scenarioID == queryScenarioID && queryScenarioID > 0) {
            if (Petchem.IsPetchemInputModified && Petchem.PostTrailInputValue.length > 0) {
                var modelSeqNumber = $('#modelSeqNumber').val();
                var activeTabId = Petchem.tabActiveChange();
                var CountryCodeLst = $("#petchemCountry").dxDropDownBox('instance').option('value');
                var VmIHSTrialData = {
                    "trialId": Petchem.PetchemTrailID,
                    "startYear": Petchem.TrailStartYear,
                    "endYear": Petchem.TrailEndYear,
                    "scenarioId": parseInt(scenarioID),
                    "sequence": modelSeqNumber,
                    "user": 1,
                    "countryCode": CountryCodeLst,
                    "typeInput": activeTabId.trim(),
                    "productCode": [],
                    "trialInput": Petchem.PostTrailInputValue
                };
                var data = { "trailInputs": JSON.stringify(VmIHSTrialData) };
                var formId = $('#frmPetchem');
                var url = "/Petrochemical/postTrialInput";
                Common.ajaxCall(formId, "POST", url, data, Petchem.PostTrailInputSuccess, Common.g_onError, true);
            } else {
                Common.E2MASNotification("No record modified", Common.Warning);
            }
        }
    },
    PostTrailInputSuccess: function (rData) {
        $('#loading').hide();
        if (rData != null && rData.Status) {
            Petchem.PostTrailInputValue = [];
            Common.E2MASNotification("Trail Saved Successfully", Common.Success);
            Petchem.IsLoaded = false;
            Petchem.BindTrailDetails(rData.TriaId, rData.trailDetails);
            Petchem.IsLoaded = true;
            Petchem.BindPetchemInputDetails(rData.toutputdetails);
        } else {
            Common.E2MASNotification(rData.StatusMessage, Common.Error);
        }
        if (rData != null && !rData.apiStatus) {
            Common.E2MASNotification(rData.apiStatusMessage, Common.Error);
        }
    },
    SaveTrialOutput: function () {
        var confirmScenarioId = 0;
        var IsChanged = false;
        var trailOutputOrgArrays = [];
        var scenarioID = $('#petchemScenarioId').val();
        var queryScenarioID = Common.getQueryString()["scenarioid"];
        if (scenarioID == queryScenarioID) {
            confirmScenarioId = parseInt(scenarioID);
            if (Petchem.SaveTrialOutputValue.length > 0) {
                IsChanged = true;
            }
            var modelSeqNumber = $('#modelSeqNumber').val();
            var trailOutput = {
                "ScenarioId": confirmScenarioId,
                "ModelCode": "PC",
                "TrialId": Petchem.PetchemTrailID,
                "ScenarioMode": $('#petchemtypeofMode').val(),
                "User": 1,
                "Status": "",
                "IsChanged": IsChanged,
                "sequence": modelSeqNumber,
                "trailOutput": Petchem.SaveTrialOutputValue
            };
            var data = { "trailOutputs": JSON.stringify(trailOutput) };
            var formId = $('#frmPetchem');
            var url = "/Petrochemical/saveTrialOutput";
            Common.ajaxCall(formId, "POST", url, data, Petchem.SaveTrialOutputSuccess, Common.g_onError, true);
        }
    },
    SaveTrialOutputValue: [],
    SaveTrialOutputSuccess: function (rData) {
        $('#loading').hide();
        Petchem.SaveTrialOutputValue = [];
        Petchem.IsModelCompleted = true;
        if (rData != null && rData.outputDetails != null) {
            if (rData.outputDetails.Status) {
                Common.E2MASNotification("Petchem Output saved Successfully", Common.Success);
                Petchem.ShowHideControls("OUTPUT");
                var scenarioID = $('#petchemScenarioId').val();
                var modelSeqNumber = $('#modelSeqNumber').val();
                var nextModelStatus = rData.outputDetails.nextModelStatus;
                Common.CommonModel.CommonHeaderBinding('frmPetchem', scenarioID, nextModelStatus.ModelCode == null ? "PC" : nextModelStatus.ModelCode, nextModelStatus.ModelSequenceNumber);
            } else {
                Common.E2MASNotification(rData.outputDetails.outputStatusMessage, Common.Error);
            }
        }
    },
    newlySelectedCountry: [],
    GetStandAloneApplyInputs: function () {
        var trailStandAloneOrgArrays = [];
        var scenarioID = $('#petchemScenarioId').val();
        var queryScenarioID = Common.getQueryString()["scenarioid"];
        if (scenarioID == queryScenarioID && queryScenarioID > 0) {
            var isChangedValue = false;
            var existCountryLst = [];
            if ((Petchem.TrailStartYear != Petchem.startValue) || (Petchem.endValue != Petchem.TrailEndYear)) {
                isChangedValue = true;
            }
            //var newlySelectedCountry = [];
            //var selectedCountry = $("#demandCountry").dxDropDownBox("getDataSource");
            //if (selectedCountry != null && selectedCountry._store != null) {
            //    if (selectedCountry._store._array != null && selectedCountry._store._array.length > 0) {
            //        var countryArrayValue = selectedCountry._store._array;
            //        $.each(countryArrayValue, function (Cindex, CValue) {
            //            if (CValue.selected && CValue.CountryCode.trim() != "" && CValue.CountryCode.trim() != null) {
            //                newlySelectedCountry.push(CValue);
            //            }
            //        });
            //    }
            //}
            $.each(Petchem.existCountry, function (eIndex, eValue) {
                if (eValue.CountryCode.trim() != "" && eValue.CountryCode != null) {
                    existCountryLst.push(eValue.CountryCode.trim());
                }
            });
            var isSame = (Petchem.NewlyAddCountryLst.length == existCountryLst.length) && Petchem.NewlyAddCountryLst.every(function (element, index) {
                return element === existCountryLst[index];
            });
            if (isChangedValue) {
                if (Petchem.endValue > Petchem.TrailEndYear) {
                    var TrailEndYearPlus = Petchem.TrailEndYear + 1;
                    $.each(Petchem.existCountry, function (eIndex, eValue) {
                        for (var iEndValue = TrailEndYearPlus; iEndValue <= Petchem.endValue; iEndValue++) {
                            var trailOutputs = {
                                "variableName": "",
                                "countryCode": eValue.CountryCode.trim(),
                                "year": parseInt(iEndValue),
                                "variablevalue": 0
                            };
                            trailStandAloneOrgArrays.push(trailOutputs);
                        }
                    });
                }
            }
            if (!isSame && Petchem.IsCountryNewlyAddedStandAlone) {
                $.each(Petchem.NewlyAddCountryLst, function (Nindex, Nvalue) {
                    for (var iYear = Petchem.startValue; iYear <= Petchem.endValue; iYear++) {
                        var trailOutputs = {
                            "variableName": "",
                            "countryCode": Nvalue.CountryCode.trim(),
                            "year": parseInt(iYear),
                            "variablevalue": 0
                        };
                        trailStandAloneOrgArrays.push(trailOutputs);
                    }
                });
            }
            if (isChangedValue || (!isSame && Petchem.IsCountryNewlyAddedStandAlone)) {
                var NewlyAddCountryLst = [];
                $.each(Petchem.NewlyAddCountryLst, function (Nindex, Nvalue) {
                    NewlyAddCountryLst.push(Nvalue.CountryCode.trim());
                });
                var standAloneApply = {
                    "scenarioId": scenarioID,
                    "startYear": Petchem.startValue,
                    "endYear": Petchem.endValue,
                    "trailId": 0,
                    "countryList": NewlyAddCountryLst,
                    "standAloneApplyList": trailStandAloneOrgArrays
                };
                var data = { "standAloneApplyInputs": JSON.stringify(standAloneApply) };
                var formId = $('#frmPetchem');
                var url = "/Petrochemical/postStandAloneApply";
                Common.ajaxCall(formId, "POST", url, data, Petchem.StandAloneApplyInputsSuccess, Common.g_onError);
            }
        }
    },
    GetStandAloneCountries: function () {
        var newlySelectedCountry = [];
        if (!Petchem.IsStandAloneCountryMod) {
            newlySelectedCountry = Petchem.existCountry;
        } else {
            var selectedCountry = $("#petchemCountry").dxDropDownBox("getDataSource");
            if (selectedCountry != null && selectedCountry._store != null) {
                if (selectedCountry._store._array != null && selectedCountry._store._array.length > 0) {
                    var countryArrayValue = selectedCountry._store._array;
                    $.each(countryArrayValue, function (Cindex, CValue) {
                        if (CValue.selected && CValue.CountryCode.trim() != "" && CValue.CountryCode.trim() != null) {
                            newlySelectedCountry.push(CValue.CountryCode.trim());
                        }
                    });
                }
            }
        }
        return newlySelectedCountry;
    },
    StandAloneApplyInputsSuccess: function (rData) {
        $('#loading').hide();
        if (rData != null) {
            if (rData.outputDetails.apiStatus) {
                if (rData.outputDetails.Status) {
                    if (rData.outputDetails.toutputdetails != null && rData.outputDetails.toutputdetails.length > 0) {
                        Petchem.BindDemandOutputValues(rData.outputDetails.toutputdetails);
                    }
                    DevExpress.ui.notify('Apply filter saved successfully!');
                }
            } else {
                DevExpress.ui.notify("Api " + rData.outputDetails.apiStatusMessage);
            }
        }
    },
    GetDemandInputFilterValues: function () {
        var scenarioID = $('#petchemScenarioId').val();
        var queryScenarioID = Common.getQueryString()["scenarioid"];
        if (scenarioID == queryScenarioID && queryScenarioID > 0) {
            var modelSeqNumber = $('#modelSeqNumber').val();
            var filterInputs = {};
            filterInputs = {
                "scenarioId": scenarioID,
                "seqNumber": modelSeqNumber,
                "trialId": Petchem.PetchemTrailID,
                "startYear": Petchem.TrailStartYear,
                "endYear": Petchem.TrailEndYear,
                "pageNumber": 0,
                "pageSize": 0,
                "ByVariable": 0,
                "ByCountry": 0
            };
            var data = { "filterInputs": filterInputs };
            var formId = $('#frmPetchem');
            var url = "/Petrochemical/getDemandFilterValues";
            Common.ajaxCall(formId, "GET", url, data, Petchem.DemandInputsSuccess, Common.g_onError, true);
        }
    },
    BindBulkEditControls: function () {
        $("#txtCalInput").dxTextBox(
        {
            value: null,
            placeholder: "Type value here..."
        }).dxValidator({
            validationRules: [{
                type: "required",
                message: "Value is required"
            }, {
                type: "pattern",
                pattern: "^\\d+(\\.\\d+)*$",
                message: "The value should contain only Numbers"

            }],
            validationGroup: "batchEdit"
        });

        $('#btnBulkEdit').dxButton({
            type: "success",
            useSubmitBehavior: false,
            validationGroup: "batchEdit",
            onClick: function (e) {
                var result = e.validationGroup.validate();
                if (result.isValid) {
                    var activeTab = $("#petchemTabs li.active").find('a').attr('id');
                    var outputCell = null, selectedRowkey = null;
                    if (activeTab == "petchemInputHeaderTab" && Petchem.IsPetchemInputLoaded) {
                        outputCell = $("#petchemInputDetails").dxDataGrid('instance');
                        selectedRowkey = outputCell.getSelectedRowKeys();
                    } else if (activeTab == "petchemHeaderTab" && Petchem.IsPetchemOutputLoaded) {
                        outputCell = $('#petchemOutputDetails').dxDataGrid('instance');
                        selectedRowkey = outputCell.getSelectedRowKeys();
                    }
                    if (selectedRowkey != null && selectedRowkey.length > 0) {
                        Petchem.ChangeCellValues();
                    } else {
                        Common.E2MASNotification('Please bind and select the record', Common.Warning);
                    }
                }
                else {
                    Common.E2MASNotification('Enter Vaild Number', Common.Warning);
                }
            },
            text: 'Apply'
        });
        var ddlChangeValues = [];
        var dlValue = {};
        dlValue = {
            "ID": 1,
            "Name": "Addition"
        }
        ddlChangeValues.push(dlValue);
        dlValue = {
            "ID": 2,
            "Name": "Subtraction"
        }
        ddlChangeValues.push(dlValue);
        dlValue = {
            "ID": 3,
            "Name": "Multiplication"
        }
        ddlChangeValues.push(dlValue);
        dlValue = {
            "ID": 4,
            "Name": "Division"
        }
        ddlChangeValues.push(dlValue);
        dlValue = {
            "ID": 5,
            "Name": "Replace"
        }
        ddlChangeValues.push(dlValue);
        $("#dropDownOperations").dxSelectBox({
            value: 5,
            dataSource: ddlChangeValues,
            displayExpr: "Name",
            valueExpr: "ID"
        });
    },
    ChangeCellValues: function () {
        $('#loading').show();
        var ddlValue = $("#dropDownOperations").dxSelectBox('instance').option('value');
        if (ddlValue != null && ddlValue > 0) {
            var txtValue = parseFloat($("#txtCalInput").dxTextBox('instance').option('value'));
            if (txtValue != "" && txtValue != null && parseFloat(txtValue) != "NaN") {
                var activeTab = $("#petchemTabs li.active").find('a').attr('id');
                var outputCell = null, selectedRowkey = null;
                if (activeTab == "petchemInputHeaderTab") {
                    outputCell = $("#petchemInputDetails").dxDataGrid('instance');
                    selectedRowkey = outputCell.getSelectedRowKeys();
                } else {
                    outputCell = $('#petchemOutputDetails').dxDataGrid('instance');
                    selectedRowkey = outputCell.getSelectedRowKeys();
                }
                var rowColumnCell = [];
                var keys = $("#demandYearCal").dxRangeSelector('instance').option('value');
                if (keys != null && keys[0] > 0 && keys[1] > 0) {
                    for (var iValue = keys[0]; iValue <= keys[1]; iValue++) {
                        rowColumnCell.push(iValue.toString());
                    }
                }
                if (selectedRowkey != null && selectedRowkey.length > 0) {
                    var selectedRowIndex = [];
                    $.each(selectedRowkey, function (sIndex, sValue) {
                        selectedRowIndex.push(outputCell.getRowIndexByKey(sValue));
                    });
                    $.each(selectedRowIndex, function (index, value) {
                        $.each(rowColumnCell, function (sIndex, sValue) {
                            var cellVal = parseFloat(outputCell.cellValue(value, sValue));
                            var txtValueLoc = 0;
                            switch (ddlValue) {
                                case 1:
                                    {
                                        txtValueLoc = cellVal + txtValue;
                                        break;
                                    }
                                case 2:
                                    {
                                        txtValueLoc = cellVal - txtValue;
                                        break;
                                    }
                                case 3:
                                    {
                                        txtValueLoc = cellVal * txtValue;
                                        break;
                                    }
                                case 4:
                                    {
                                        txtValueLoc = cellVal / txtValue;
                                        break;
                                    }
                                case 5:
                                    {
                                        txtValueLoc = txtValue;
                                        break;
                                    }
                                default:
                                    break;
                            }
                            if (!isNaN(txtValueLoc)) {
                                outputCell.cellValue(value, sValue, txtValueLoc);
                            } else {
                                outputCell.cellValue(value, sValue, 0);
                            }
                        });
                    });
                }
            }
        }
        $('#loading').hide();
    }
}

