$(document).ready(function () {
    IHS.ShowHideControls("DXI");
    IHS.GetDemandInputs();
    IHS.BindBulkEditControls();
    $("#btnDemandSave").dxButton({
        text: "Submit",
        icon: "fa fa-check green_icon",
        onClick: function (e) {
            var result = DevExpress.ui.dialog.confirm("Are you sure want to Submit?", "Confimation Submit");
            result.done(function (dialogResult) {
                if (dialogResult == true) {
                    IHS.SaveTrialOutput();
                }
            });
        }
    });
    $("#btnDemandRun").dxButton({
        text: "Run",
        icon: "fa fa-play yellow_icon",
        onClick: function (e) {
            var typeofMode = $('#demandtypeofMode').val();
            if (typeofMode == "I" || typeofMode == "S") {
                IHS.PostTrailInput();
            } else {
                IHS.PostStandAloneTrailInput()
            }
        }
    });
    $("#demandReset").dxButton({
        text: "Reset",
        onClick: function (e) {
        }
    });
    $("#btnDemandStandAloneApply").dxButton({
        text: "Apply",
        onClick: function (e) {
            IHS.GetStandAloneApplyInputs();
        }
    });
    $('#btnDemandStandAloneApply').addClass('disabled');
    $('#demandHeaderDXITab').on('click', function () {
        IHS.ShowHideControls("DXI");
    });
    $('#demandInputHeaderTab').on('click', function () {
        IHS.ShowHideControls("INPUT");
        if (!IHS.IsDemandInputLoaded) {
            IHS.GetDemandInputDetails(false);
        }
    });
    $('#demandHeaderTab').on('click', function () {
        IHS.ShowHideControls("OUTPUT");
        if (!IHS.IsDemandOutputLoaded) {
            IHS.GetDemandOutputDetails();
        }
    });
    $('#demandSummaryTab').on('click', function () {
        IHS.ShowHideControls("DXI");
        if (!IHS.IsDemandOutputSummaryLoaded) {
            IHS.GetDemandSummaryDetails();
        }
    });
    $("#btnDemandIntegrationFilter,#btnDemandRun").addClass('disabled');
    $("#btnDemandIntegrationFilter").dxButton({
        text: "Filter",
        icon: "fa fa-filter yellow_icon",
        onClick: function (e) {
            IHS.IsFirstTimeLoaded = false;
            document.getElementById('divBatchEdit').style.display = 'block';
            var activeTab = $("#demandTabs li.active").find('a').attr('id');
            if (activeTab != null && activeTab != typeof (undefined)) {
                if (activeTab == "demandHeaderDXITab") {
                    IHS.IsDemandInputLoaded = false;
                    IHS.IsDemandOutputLoaded = false;
                    IHS.GetDemandDXIDetails();
                }
                else if (activeTab == "demandInputHeaderTab") {
                    IHS.IsDemandDXILoaded = false;
                    IHS.IsDemandOutputLoaded = false;
                    IHS.GetDemandInputDetails(true);
                }
                else if (activeTab == "demandHeaderTab") {
                    IHS.IsDemandInputLoaded = false;
                    IHS.IsDemandDXILoaded = false;
                    IHS.GetDemandOutputDetails();
                }
            }
        }
    });
});
IHS = {
    IsFirstTimeLoaded: true,
    IsModelCompleted: false,
    startValue: 0,
    endValue: 0,
    existCountry: [],
    isIncreased: -1,
    TrailStartYear: 0,
    TrailEndYear: 0,
    IsTrailChanged: false,
    DemandTrailID: 0,
    syncTreeViewSelection: function (treeView, value) {
        if (!value) {
            treeView.unselectAll();
            return;
        }
        value.forEach(function (key) {
            treeView.selectItem(key);
        });
    },
    GetDemandInputs: function () {
        var scenarioID = $('#demandScenarioId').val();
        var queryScenarioID = Common.getQueryString()["scenarioid"];
        var demandModelStatus = $('#demandPageLoadModelStatus').val();
        if (!Boolean(parseInt(demandModelStatus))) {
            Common.SetLoadStatusText(true);
        }
        if (scenarioID == queryScenarioID && queryScenarioID > 0) {
            var modelSeqNumber = $('#modelSeqNumber').val();
            var data = { "scenarioid": queryScenarioID, "sequence": modelSeqNumber };
            var formId = $('#frmDemand');
            var url = "/IHS/getDemandInputs";
            Common.ajaxCall(formId, "GET", url, data, IHS.DemandInputsSuccess, Common.g_onError, true);
        }
    },
    DemandInputsSuccess: function (rdata) {
        if (rdata != null) {
            var typeofMode = $('#demandtypeofMode').val();
            IHS.IsModelCompleted = rdata.isModelCompleted;
            IHS.DisableDemandControls();
            if (typeofMode == "I") {
                if (rdata.dxiStatusFlag != null && !rdata.dxiStatusFlag) {
                    Common.E2MASNotification(rdata.dxiStatusMessage, Common.Error);
                }
                IHS.BindDemandYear(rdata.years);
                IHS.TrailStartYear = rdata.years.StartYear;
                IHS.TrailEndYear = rdata.years.EndYear;
                IHS.GlobalSector = rdata.sectorVariables;
                var globalGrep = $.grep(rdata.sectorVariables, function (grep) {
                    return grep.SectorId != 30;
                });
                IHS.BindDemandSectors(globalGrep);
                IHS.BindDemandCountries(rdata.countryLst, rdata.countries);
                IHS.BindTrailDetails(rdata.trialId, rdata.dTrail);
                IHS.BindDemandDXIOutputDetails(rdata.toutputdetails);
                IHS.IsLoaded = true;
            }
            else {
                if (rdata.dxiStatusFlag != null && !rdata.dxiStatusFlag) {
                    Common.E2MASNotification(rdata.dxiStatusMessage, Common.Error);
                }
                IHS.BindDemandYear(rdata.years);
                IHS.GlobalSector = rdata.sectorVariables;
                IHS.BindDemandSectors(rdata.sectorVariables);
                IHS.BindDemandCountries(rdata.countryLst, rdata.countries);
                IHS.BindDemandDXIOutputDetails(rdata.toutputdetails);
                IHS.BindTrailDetails(rdata.trialId, rdata.dTrail);
            }
            if (!rdata.apiStatusFlag && rdata.apiOriginalStatus != null && rdata.apiOriginalStatus != "") {
                Common.E2MASNotification(rdata.apiOriginalStatus, Common.Error);
            }
        }
        $('#loading').hide();
    },
    DisableDemandControls: function () {
        if (IHS.IsModelCompleted) {
            $('#btnDemandRun,#btnDemandSave,#lblTrial,#demandYear').hide();
        }
        var typeofMode = $('#demandtypeofMode').val();
        if (typeofMode == "I") {
            $('#layoutScenarioName').text('Integration Mode');
        } else {
            $('#layoutScenarioName').text('StandAlone Mode');
        }
        $('#ViewScenarioStatus').show();
    },
    ShowHideControls: function (typeTab) {
        if (IHS.IsModelCompleted) {
            $('#btnDemandRun,#demandTrails,#btnDemandSave,#lblTrial,#divBatchEdit').hide();
            if (typeTab == "DXI") {
                $('#btnDemandIntegrationFilter,#demandSector,#demandCountry').hide();
            }
            else if (typeTab == "INPUT") {
                $('#btnDemandIntegrationFilter,#demandSector,#demandCountry').show();
            }
            else if (typeTab == "OUTPUT") {
                $('#btnDemandIntegrationFilter,#demandSector,#demandCountry').show();
                $('#demandCountry').css("border", "1px solid #dfe8f1");
            }
        } else {
            if (typeTab == "DXI") {
                $('#btnDemandRun,#btnDemandSave,#demandTrails,#btnDemandIntegrationFilter,#demandSector,#demandCountry,#lblTrial,#demandYear,#divBatchEdit').hide();
            } else if (typeTab == "INPUT") {
                $('#btnDemandSave').hide();
                $('#btnDemandRun,#demandTrails,#btnDemandIntegrationFilter,#demandSector,#demandCountry,#lblTrial,#demandYear,#divBatchEdit').show();
            }
            else if (typeTab == "OUTPUT") {
                $('#btnDemandRun').hide();
                $('#btnDemandSave,#demandTrails,#btnDemandIntegrationFilter,#demandSector,#demandCountry,#lblTrial,#demandYear,#divBatchEdit').show();
                $('#demandCountry').css("border", "1px solid #dfe8f1");
            }
        }
    },
    GlobalSector: [],
    BindDemandSectors: function (dSectors) {
        $("#demandSector").dxSelectBox({
            dataSource: dSectors,
            valueExpr: 'SectorId',
            displayExpr: 'SectorName',
            placeholder: "Select a Sector...",
            onValueChanged: function (value) {
                $("#btnDemandIntegrationFilter").removeClass('disabled');
                $('#demandSector').css("border", "1px solid #dfe8f1");
            }
        }).dxSelectBox("instance");
    },
    BindDemandCountries: function (rcountryLst, countries) {
        if (countries != null) {
            $("#demandCountry").dxDropDownBox({
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
                            selectNodesRecursive: false,
                            showCheckBoxesMode: "normal",
                            scrolling: {
                                mode: "infinite"
                            },
                            onItemSelectionChanged: function (args) {
                                var value = args.component.getSelectedNodesKeys();
                                e.component.option("value", value);
                                $("#btnDemandIntegrationFilter").removeClass('disabled');
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
                        IHS.syncTreeViewSelection(treeView, value);
                        IHS.BindDemandSectorGlobal(value);
                        $('#demandCountry').css("border", "1px solid #dfe8f1");
                    });
                    return $treeView;
                }
            });
        }
    },
    IsGlobalSelected: false,
    BindDemandSectorGlobal: function (value) {
        if (value != null && value.length == 1 && value[0] == "GL") {
            IHS.IsGlobalSelected = true;
            var globalGrep = $.grep(IHS.GlobalSector, function (grep) {
                return grep.SectorId == 30;
            });
            IHS.BindDemandSectors(globalGrep);
        } else {
            var globalGrep = [];
            var isSameValue = null;
            if (value != null && value.length > 0) {
                isSameValue = IHS.BindCountryDemandSector(value);
            }
            if (isSameValue != null && isSameValue.RestAmericaOnly) {
                var removedSector = [26, 27, 28, 29, 31, 32, 33];
                var locremovedSector = [];
                $.each(removedSector, function (index, value) {
                    var locglobalGrep = $.grep(IHS.GlobalSector, function (grep) {
                        return grep.SectorId == value;
                    });
                    locremovedSector.push(locglobalGrep[0]);
                });
                globalGrep = locremovedSector;
            }
            else {
                if (isSameValue != null && isSameValue.RestAmericaAlso && isSameValue.RemainingAlso) {
                    var locglobalGrep = [];
                    locglobalGrep = $.grep(IHS.GlobalSector, function (grep) {
                        return grep.SectorId != 30;
                    });
                    globalGrep = locglobalGrep;
                } else {
                    var grepValue = [];
                    $.each(IHS.GlobalSector, function (sindex, svalue) {
                        if (sindex > 0 && sindex <= 25) {
                            var greps = $.grep(IHS.GlobalSector, function (grep) {
                                return grep.SectorId == sindex;
                            });
                            grepValue.push(greps[0]);
                        }
                    });
                    globalGrep = grepValue;
                }
            }
            IHS.BindDemandSectors(globalGrep);
            IHS.IsGlobalSelected = false;
        }
    },
    BindCountryDemandSector: function (value) {
        var realValue = value.length;
        var compareValue = 0;
        var isSameValue = {
            "RestAmericaOnly": false,
            "RestAmericaAlso": false,
            "RemainingAlso": false
        };
        var country = ['CN', 'CG', 'CI', 'CD', 'ET', 'GA', 'GH', 'KE', 'MZ', 'NM', 'SE', 'SU', 'TZ'];
        $.each(value, function (sindex, svalue) {
            var isAvailable = $.inArray(svalue, country);
            if (isAvailable > -1) {
                compareValue = compareValue + 1;
                isSameValue.RestAmericaAlso = true;
            } else {
                isSameValue.RemainingAlso = true;
            }
        });
        if (realValue == compareValue)
            isSameValue.RestAmericaOnly = true;
        return isSameValue;
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
                        IHS.existCountry.push(value.CountryID);
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
            $("#demandCountry").dxDropDownBox({
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
                            disabled: true,
                            onContentReady: function (args) {
                                $.each(countryLst, function (index, value) {
                                    args.component.selectItem(value);
                                });
                            },
                            selectNodesRecursive: true,
                            showCheckBoxesMode: "normal",
                            scrolling: {
                                mode: "infinite"
                            },
                            onItemSelectionChanged: function (args) {
                                var value = args.component.getSelectedNodesKeys();
                                e.component.option("value", value);
                            }
                        });
                    treeView = $treeView.dxTreeView("instance");
                    e.component.on("valueChanged", function (args) {
                        var value = args.value;
                        IHS.syncTreeViewSelection(treeView, value);
                        IHS.IsStandAloneCountryMod = true;
                        $('#btnDemandRun').removeClass('disabled');
                    });
                    return $treeView;
                }
            });
        }
    },
    tabActiveChange: function () {
        var activeTabId = null;
        var activeTab = $("#demandTabs li.active").find('a').attr('id');
        if (activeTab != null && activeTab != typeof (undefined)) {
            if (activeTab == "demandHeaderDXITab") {
                IHS.IsDemandInputLoaded = false;
                IHS.IsDemandOutputLoaded = false;
                activeTabId = "DXI";
            }
            else if (activeTab == "demandInputHeaderTab") {
                IHS.IsDemandDXILoaded = false;
                IHS.IsDemandOutputLoaded = false;
                activeTabId = "INPUT";
            }
            else if (activeTab == "demandHeaderTab") {
                IHS.IsDemandInputLoaded = false;
                IHS.IsDemandDXILoaded = false;
                activeTabId = "OUTPUT";
            }
        }
        return activeTabId;
    },
    BindDemandYear: function (dYears) {
        if (dYears != null) {
            var typeofMode = $('#demandtypeofMode').val();
            IHS.TrailStartYear = dYears.StartYear;
            IHS.TrailEndYear = dYears.EndYear;
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
                title: false
            });

            $("#demandYear").dxRangeSelector({
                size: {
                    height: 80
                },
                scale: {
                    startValue: dYears.StartYear == 0 ? Common.CurrentYear : dYears.StartYear,
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
                    format: "decimal"
                },
                value: [dYears.StartYear, dYears.EndYear],
                disabled: false,
                title: false,
                disabled: true,
                onValueChanged: function (data) {
                    IHS.startValue = data.value[0];
                    IHS.endValue = data.value[1];
                    $('#btnDemandRun').removeClass('disabled');
                    IHS.isIncreased++;
                    if (IHS.isIncreased > 0) {
                        IHS.IsCountryNewlyAddedStandAlone = true;
                    }
                }
            });
        }
    },
    IsLoaded: false,
    BindTrailDetails: function (currentTrailID, dTrails) {
        IHS.DemandTrailID = currentTrailID;
        var dTrailsBinder = [];
        if (dTrails != null) {
            $.each(dTrails, function (index, value) {
                var trails = {
                };
                trails = {
                    "trailId": value.trailId,
                    "trailDateTime": "T" + value.trailId + " - " + value.trailDateTime
                };
                dTrailsBinder.push(trails);
            });
        }
        $("#demandTrails").dxDropDownBox({
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
                    selectionMode: "single",
                    displayExpr: "trailDateTime",
                    selectByClick: true,
                    disabled: false,
                    onContentReady: function (args) {
                        IHS.syncTreeViewSelection(args.component, value);
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
                    IHS.syncTreeViewSelection(treeView, value);
                    $("#demandTrails").dxDropDownBox("instance").close();
                    var trailIdChanged = args.value[0]
                    IHS.DemandTrailID = trailIdChanged;
                    if (trailIdChanged != null && trailIdChanged != "") {
                        IHS.GetTrailChanges(trailIdChanged);
                    }
                    if (trailIdChanged == 0) {
                        IHS.GetTrailChanges(trailIdChanged);
                    }
                });
                return $treeView;
            }
        });
    },
    IsCountryNewlyAddedStandAlone: false,
    DemandcolumnsArray: [],
    DemandcolumnsSumArray: [],
    GetTrailChanges: function (trailIdChanged) {
        var scenarioID = $('#demandScenarioId').val();
        var queryScenarioID = Common.getQueryString()["scenarioid"];
        if (scenarioID == queryScenarioID && queryScenarioID > 0) {
            var modelSeqNumber = $('#modelSeqNumber').val();
            var activeTabId = IHS.tabActiveChange();
            var typeofMode = $('#demandtypeofMode').val();
            var CountryCodeLst = [];
            if (typeofMode == "I" || typeofMode == "S") {
                CountryCodeLst = $("#demandCountry").dxDropDownBox('instance').option('value');
            }
            else {
                CountryCodeLst = IHS.GetStandAloneCountries();
            }
            var sectorId = $("#demandSector").dxSelectBox('instance').option('value');
            if (activeTabId == "INPUT") {
                if (CountryCodeLst == null || CountryCodeLst.length == 0) {
                    $('#demandCountry').css('border', '1px red solid');
                    return false;
                } else {
                    $('#demandCountry').css("border", "1px solid #dfe8f1");
                }
            }
            var demandDetails = {
                "scenarioId": queryScenarioID,
                "trialId": trailIdChanged,
                "countryCode": CountryCodeLst,
                "typeInput": activeTabId.trim(),
                "Sequence": modelSeqNumber,
                "IsSaved": IHS.IsModelCompleted,
                "sectorId": sectorId == null ? 1 : sectorId
            };
            var data = {
                "details": JSON.stringify(demandDetails)
            };
            var formId = $('#frmDemand');
            var url = "/IHS/getDemandDetails";
            Common.ajaxCall(formId, "GET", url, data, IHS.TrailChangesSuccess, Common.g_onError, true);
        }
    },
    TrailChangesSuccess: function (rData) {
        $('#loading').hide();
        if (rData != null && rData.toutputdetails != null) {
            IHS.IsTrailChanged = true;
            if (rData.toutputdetails.length <= 2) {
                Common.E2MASNotification("No record found for this trails.", Common.Warning);
            }
            var activeTab = IHS.tabActiveChange();
            if (activeTab != null && activeTab != typeof (undefined)) {
                if (activeTab == "DXI") {
                    IHS.BindDemandDXIOutputDetails(rData.toutputdetails);
                }
                else if (activeTab == "INPUT") {
                    IHS.BindDemandInputDetails(rData.toutputdetails);
                }
                else if (activeTab == "OUTPUT") {
                    IHS.BindDemandOutputDetails(rData.toutputdetails);
                }
            }
        }
    },
    BindDemandOutputValues: function (dOutputvalues, typeOfValue) {
        var jsonDatas = dOutputvalues;
        IHS.DemandcolumnsArray = [];
        var arrayHeader = {
        };
        if (typeOfValue == "INPUT") {
            arrayHeader = {
                "dataField": "VariableDescription",
                "caption": "Series Name",
                "visible": true,
                "allowEditing": false,
                "fixed": true,
                "width": 300,
                "alignment": "left"
            };
        } else {
            arrayHeader = {
                "dataField": "VariableDescription",

                "caption": "Series Name",
                "visible": true,
                "allowEditing": false,
                "width": 300,
                "alignment": "left"
            };
        }
        var variableExists = IHS.DemandcolumnsArray.some(function (exist) {
            return exist.dataField.trim() == arrayHeader.dataField.trim()
        });
        if (!variableExists) {
            IHS.DemandcolumnsArray.push(arrayHeader);
        }
        arrayHeader = {
            "dataField": "VariableName",
            "visible": true,
            "allowEditing": false,
            "fixed": true
        };
        variableExists = IHS.DemandcolumnsArray.some(function (exist) {
            return exist.dataField.trim() == arrayHeader.dataField.trim()
        });
        if (!variableExists) {
            IHS.DemandcolumnsArray.push(arrayHeader);
        }
        arrayHeader = {
            "dataField": "UnitName",
            "visible": true,
            "allowEditing": false,
            "fixed": true
        };
        variableExists = IHS.DemandcolumnsArray.some(function (exist) {
            return exist.dataField.trim() == arrayHeader.dataField.trim()
        });
        if (!variableExists) {
            IHS.DemandcolumnsArray.push(arrayHeader);
        }
        arrayHeader = {
            "dataField": "CountryCode",
            "visible": false,
            "allowEditing": false,
            "fixed": true
        };
        variableExists = IHS.DemandcolumnsArray.some(function (exist) {
            return exist.dataField.trim() == arrayHeader.dataField.trim()
        });
        if (!variableExists) {
            IHS.DemandcolumnsArray.push(arrayHeader);
        }
        arrayHeader = {
            "dataField": "CountryName",
            "visible": true,
            "caption": "Country",
            "allowEditing": false,
            "fixed": true
        };
        variableExists = IHS.DemandcolumnsArray.some(function (exist) {
            return exist.dataField.trim() == arrayHeader.dataField.trim()
        });
        if (!variableExists) {
            IHS.DemandcolumnsArray.push(arrayHeader);
        }
        var arrayHeaderGroup = {
        };
        if (jsonDatas != null) {
            $.each(jsonDatas, function (key, value) {
                if (parseInt(key) > 0 && key.toUpperCase() != "ROWNUMBER") {
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
                    variableExists = IHS.DemandcolumnsArray.some(function (exist) {
                        return exist.dataField.trim() == arrayHeader.dataField.trim()
                    });
                    if (!variableExists) {
                        IHS.DemandcolumnsArray.push(arrayHeader);
                        if (typeOfValue == "OUTPUT") {
                            IHS.DemandcolumnsSumArray.push(arrayHeaderGroup);
                        }
                    }
                }
            });
        }
    },
    IsDemandDXILoaded: false,
    GetDemandDXIDetails: function () {
        var scenarioID = $('#demandScenarioId').val();
        var queryScenarioID = Common.getQueryString()["scenarioid"];
        if (scenarioID == queryScenarioID && queryScenarioID > 0) {
            var modelSeqNumber = $('#modelSeqNumber').val();
            var CountryCodeLst = $("#demandCountry").dxDropDownBox('instance').option('value');
            var demandDetails = {
                "scenarioId": queryScenarioID,
                "trialId": IHS.DemandTrailID,
                "countryCode": CountryCodeLst,
                "typeInput": "DXI",
                "Sequence": modelSeqNumber,
                "IsSaved": IHS.IsModelCompleted
            };
            var data = {
                "details": JSON.stringify(demandDetails)
            };
            var formId = $('#frmDemand');
            var url = "/IHS/getDemandDetails";
            Common.ajaxCall(formId, "GET", url, data, IHS.BindDemandDXIOutputDetails, Common.g_onError, true);
        }
    },
    BindDemandDXIOutputDetails: function (demandDXIOutputDetails) {
        IHS.IsDemandDXILoaded = true;
        $('#loading').hide();
        var dxiJsonValues = null;
        if (demandDXIOutputDetails != null && demandDXIOutputDetails.hasOwnProperty('toutputdetails'))
            dxiJsonValues = JSON.parse(demandDXIOutputDetails.toutputdetails);
        else
            dxiJsonValues = JSON.parse(demandDXIOutputDetails);
        if (dxiJsonValues != null && dxiJsonValues.length > 0) {
            IHS.BindDemandOutputValues(dxiJsonValues[0], "DXI");
        }
        var dmScenarioName = ($('#dmScenarioName').val() == null || $('#dmScenarioName').val() == "") ? "IHS" : $('#dmScenarioName').val();
        var exportName = dmScenarioName + "-Other Model Outputs-Trial-" + IHS.DemandTrailID;
        var treeListDXI = $("#demandDXIOutputDetails").dxDataGrid({
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

            },
            onEditingStart: function (info) {
                info.cancel = true;
            },
            onRowPrepared: function (info) {

            },
            groupPanel: {
                visible: true
            },
            columns: IHS.DemandcolumnsArray,
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
    IsDemandInputLoaded: false,
    GetDemandInputDetails: function (isFilter) {
        var scenarioID = $('#demandScenarioId').val();
        var queryScenarioID = Common.getQueryString()["scenarioid"];
        if (scenarioID == queryScenarioID && queryScenarioID > 0) {
            var modelSeqNumber = $('#modelSeqNumber').val();
            var CountryCodeLst = [];
            var typeofMode = $('#demandtypeofMode').val();
            if (typeofMode == "I" || typeofMode == "S") {
                CountryCodeLst = $("#demandCountry").dxDropDownBox('instance').option('value');
            } else {
                CountryCodeLst = IHS.GetStandAloneCountries();
            }
            var sectorId = $("#demandSector").dxSelectBox('instance').option('value');
            if (CountryCodeLst != null && CountryCodeLst.length > 0) {
                if (sectorId != null && sectorId > 0) {
                    $('#demandCountry,#demandSector').css("border", "1px solid #dfe8f1");
                    var demandDetails = {
                        "scenarioId": queryScenarioID,
                        "trialId": IHS.DemandTrailID,
                        "countryCode": CountryCodeLst,
                        "typeInput": "INPUT",
                        "Sequence": modelSeqNumber,
                        "IsSaved": IHS.IsModelCompleted,
                        "sectorId": sectorId
                    };
                    var data = {
                        "details": JSON.stringify(demandDetails)
                    };
                    var formId = $('#frmDemand');
                    var url = "/IHS/getDemandDetails";
                    Common.ajaxCall(formId, "GET", url, data, IHS.BindDemandInputDetails, Common.g_onError, true);
                } else {
                    if (isFilter)
                        $('#demandSector').css("border", "1px red solid");
                }
            } else {
                if (isFilter)
                    $('#demandCountry').css('border', '1px red solid');
            }
        }
    },
    BindDemandInputWithReplace: function (inputJsonDetails) {
        if (inputJsonDetails != null && inputJsonDetails.length > 0) {
            $.map(inputJsonDetails, function (grep) {
                if (grep.ParentID != null && grep.ParentID != "" && grep.ParentID.substr(0, 1) == "0" && grep.ParentID.indexOf("0_") > -1) {
                    return grep.ParentID = 0;
                }
            });
        }
        return inputJsonDetails;
    },
    BindDemandInputDetails: function (demandInputDetails) {
        IHS.IsDemandInputLoaded = true;
        $('#loading').hide();
        $('#legend').show();
        var inputJsonDetails = null;
        if (demandInputDetails != null && demandInputDetails.hasOwnProperty('toutputdetails'))
            inputJsonDetails = JSON.parse(demandInputDetails.toutputdetails);
        else
            inputJsonDetails = JSON.parse(demandInputDetails);

        if (inputJsonDetails != null && inputJsonDetails.length > 0) {
            IHS.BindDemandOutputValues(inputJsonDetails[0], "INPUT");
        }
        var dmScenarioName = ($('#dmScenarioName').val() == null || $('#dmScenarioName').val() == "") ? "IHS" : $('#dmScenarioName').val();
        var exportName = dmScenarioName + "-Demand Inputs-Trial-" + IHS.DemandTrailID;
        var filteredValue = IHS.BindDemandInputWithReplace(inputJsonDetails);
        var treeListInput = $("#demandInputDetails").dxTreeList({
            dataSource: filteredValue,
            keyExpr: "MappingId",
            parentIdExpr: "ParentID",
            "export": {
                enabled: true,
                fileName: "IHS- Demand Outputs - Trial0",
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
            columnChooser: {
                enabled: true
            },
            selection: {
                mode: "multiple",
                allowSelectAll: true,
                showCheckBoxesMode: "always"
            },
            editing: {
                mode: "batch",
                allowUpdating: true
            },
            loadPanel: {
                enabled: true
            },
            wordWrapEnabled: true,
            autoExpandAll: true,
            onEditingStart: function (info) {
                if (IHS.IsModelCompleted || info.data.IsInput === false)
                    info.cancel = true;
            },
            onRowPrepared: function (info) {
                if (info.rowType == "data" && info.data.IsInput === false) {
                    info.rowElement.addClass("ihsoutput");
                }
            },
            columns: IHS.DemandcolumnsArray,
            onContentReady: function (e) {
                IHS.BindInputDefaultSelection();
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
                        elementAttr: {
                            'class': 'faicon'
                        },
                        onClick: function () {
                            IHS.BindInputChartData('line');
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
                }
                , {
                    location: "before",
                    locateInMenu: 'auto',
                    widget: "dxButton",
                    options: {
                        icon: 'faicon fa fa-area-chart',
                        elementAttr: {
                            'class': 'faicon'
                        },
                        onClick: function () {
                            IHS.BindInputChartData('area');
                        }
                    }
                }
                , {
                    location: "before",
                    locateInMenu: 'auto',
                    widget: "dxButton",
                    options: {
                        icon: "faicon fa fa-bar-chart",
                        elementAttr: {
                            'class': 'faicon'
                        },
                        onClick: function () {
                            IHS.BindInputChartData('bar');
                        }
                    }
                });
            },
            onRowUpdating: function (e) {
                IHS.IsDemandInputModified = true;
                $('#btnDemandRun').removeClass('disabled');
                var oldData = e.oldData;
                $.each(Object.keys(e.newData), function (iIndex, iValue) {
                    var isExist = IHS.PostTrailInputValue.some(function (exist) {
                        return (exist.year == parseInt(iValue) && exist.variableName.trim() == oldData.VariableName.trim() && exist.countryCode.trim() == oldData.CountryCode.trim())
                    });
                    if (!isExist) {
                        var trailOutputs = {
                            "variableName": oldData.VariableName,
                            "countryCode": oldData.CountryCode,
                            "year": parseInt(iValue),
                            "variablevalue": e.newData[iValue] == null ? 0 : e.newData[iValue]
                        };
                        IHS.PostTrailInputValue.push(trailOutputs);
                    } else {
                        IHS.PostTrailInputValue = $.grep(IHS.PostTrailInputValue, function (grepvalue) {
                            if (grepvalue.year == parseInt(iValue) && grepvalue.variableName.trim() == oldData.VariableName.trim() && grepvalue.countryCode.trim() == oldData.CountryCode.trim()) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        });
                        var isExist = IHS.PostTrailInputValue.some(function (exist) {
                            return (exist.year == parseInt(iValue) && exist.variableName.trim() == oldData.VariableName.trim() && exist.countryCode.trim() == oldData.CountryCode.trim())
                        });
                        if (!isExist) {
                            var trailOutputs = {
                                "variableName": oldData.VariableName,
                                "countryCode": oldData.CountryCode,
                                "year": parseInt(iValue),
                                "variablevalue": e.newData[iValue] == null ? 0 : e.newData[iValue]
                            };
                            IHS.PostTrailInputValue.push(trailOutputs);
                        }
                    }
                });
            }
        }).dxTreeList("instance");
        treeListInput.on('selectionChanged', function () {
            IHS.BindInputChartData('area');
        });
    },
    BindInputDefaultSelection: function () {
        var inputOutputDatas = $("#demandInputDetails").dxTreeList('instance');
        var count = inputOutputDatas.totalCount();
        if (count != null && count > 0) {
            inputOutputDatas.selectRowsByIndexes(0);
        }
    },
    BindInputChartData: function (inputChart) {
        var inputOutputDatas = $("#demandInputDetails").dxTreeList('instance');
        var selectedData = inputOutputDatas.getSelectedRowsData();
        if (selectedData.length == 0 && selectedData[0] == undefined) {
            IHS.BindInputChartValues([], "area");
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
            IHS.BindInputChartValues(chartJson, inputChart);
        }
    },
    BindInputChartValues: function (chartData, inputChart) {
        var serieseData = [];
        if (chartData != null && chartData.length > 0) {
            var len = Object.keys(chartData[0]).length - 1;
            serieseData = new Array(len);
            for (i = 0, j = 0; i < serieseData.length; i++) {
                var valField = Object.keys(chartData[0])[i + 1];
                if (valField != "year") {
                    serieseData[j] = {
                        valueField: valField, name: valField
                    };
                    j++;
                }
            }
        }
        $("#demandInputChart").dxChart({
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
            /*  tooltip: {
                  enabled: true,
                  customizeTooltip: function (info) {
                      return {
                          text: arg.valueText
                      };
            
                  }
              },*/
            scrollBar: {
                visible: true
            },
            scrollingMode: "all",
            zoomingMode: "all",
            autoBreaksEnabled: false
        }).dxChart("instance");
    },
    IsDemandOutputLoaded: false,
    GetDemandOutputDetails: function () {
        var scenarioID = $('#demandScenarioId').val();
        var queryScenarioID = Common.getQueryString()["scenarioid"];
        if (scenarioID == queryScenarioID && queryScenarioID > 0) {
            var CountryCodeLst = null;
            var typeofMode = $('#demandtypeofMode').val();
            if (typeofMode == "I" || typeofMode == "S") {
                CountryCodeLst = $("#demandCountry").dxDropDownBox('instance').option('value');
            } else {
                CountryCodeLst = IHS.GetStandAloneCountries();
            }
            var modelSeqNumber = $('#modelSeqNumber').val();
            var demandDetails = {
                "scenarioId": queryScenarioID,
                "trialId": IHS.DemandTrailID,
                "countryCode": CountryCodeLst,
                "typeInput": "OUTPUT",
                "Sequence": modelSeqNumber,
                "IsSaved": IHS.IsModelCompleted
            };
            var data = {
                "details": JSON.stringify(demandDetails)
            };
            var formId = $('#frmDemand');
            var url = "/IHS/getDemandDetails";
            Common.ajaxCall(formId, "GET", url, data, IHS.BindDemandOutputDetails, Common.g_onError, true);
        }
    },
    BindDemandOutputDetails: function (demandOutputDetails) {
        IHS.IsDemandOutputLoaded = true;
        $('#loading').hide();
        var outputJsonDetails = null;
        if (demandOutputDetails != null && demandOutputDetails.hasOwnProperty('toutputdetails'))
            outputJsonDetails = JSON.parse(demandOutputDetails.toutputdetails);
        else
            outputJsonDetails = JSON.parse(demandOutputDetails);

        if (outputJsonDetails != null && outputJsonDetails.length > 0) {
            IHS.BindDemandOutputValues(outputJsonDetails[0], "OUTPUT");
        }
        var dmScenarioName = ($('#dmScenarioName').val() == null || $('#dmScenarioName').val() == "") ? "IHS" : $('#dmScenarioName').val();
        var exportName = dmScenarioName + "-Demand Outputs-Trial-" + IHS.DemandTrailID;
        var treeList = $("#demandOutputDetails").dxDataGrid({
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

            },
            onEditingStart: function (info) {
                if (IHS.IsModelCompleted)
                    info.cancel = true;
            },
            onRowPrepared: function (info) {
                if (info.rowType == "data") {
                    //if (info.rowType != "header" && info.data.IsModified === 2)
                    //    info.rowElement.addClass("ihscomparsion");
                }
            },
            groupPanel: {
                visible: true
            },
            columns: IHS.DemandcolumnsArray,
            summary: {
                groupItems: IHS.DemandcolumnsSumArray
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
                        elementAttr: {
                            'class': 'faicon'
                        },
                        onClick: function () {
                            IHS.BindOutputChartData('line');
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
                        elementAttr: {
                            'class': 'faicon'
                        },
                        onClick: function () {
                            IHS.BindOutputChartData('area');
                        }
                    }
                },
                {
                    location: "before",
                    locateInMenu: 'auto',
                    widget: "dxButton",
                    options: {
                        icon: "faicon fa fa-bar-chart",
                        elementAttr: {
                            'class': 'faicon'
                        },
                        onClick: function () {
                            IHS.BindOutputChartData('bar');
                        }
                    }
                });
            },
            onRowUpdating: function (e) {
                var oldData = e.oldData;
                var scenarioID = $('#demandScenarioId').val();
                $.each(Object.keys(e.newData), function (iIndex, iValue) {
                    var isExist = IHS.SaveTrialOutputValue.some(function (exist) {
                        return (exist.year == parseInt(iValue) && exist.variableName.trim() == oldData.VariableName.trim() && exist.countryCode.trim() == oldData.CountryCode.trim())
                    });
                    if (!isExist) {
                        var trailOutputs = {
                            "ScenarioId": scenarioID,
                            "variableName": oldData.VariableName,
                            "countryCode": oldData.CountryCode,
                            "year": parseInt(iValue),
                            "variablevalue": e.newData[iValue] == null ? 0 : e.newData[iValue]
                        };
                        IHS.SaveTrialOutputValue.push(trailOutputs);
                    } else {
                        IHS.SaveTrialOutputValue = $.grep(IHS.SaveTrialOutputValue, function (grepvalue) {
                            if (grepvalue.year == parseInt(iValue) && grepvalue.variableName.trim() == oldData.VariableName.trim() && grepvalue.countryCode.trim() == oldData.CountryCode.trim()) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        });
                        var isExist = IHS.SaveTrialOutputValue.some(function (exist) {
                            return (exist.year == parseInt(iValue) && exist.variableName.trim() == oldData.VariableName.trim() && exist.countryCode.trim() == oldData.CountryCode.trim())
                        });
                        if (!isExist) {
                            var trailOutputs = {
                                "ScenarioId": scenarioID,
                                "variableName": oldData.VariableName,
                                "countryCode": oldData.CountryCode,
                                "year": parseInt(iValue),
                                "variablevalue": e.newData[iValue] == null ? 0 : e.newData[iValue]
                            };
                            IHS.SaveTrialOutputValue.push(trailOutputs);
                        }
                    }
                });
            }
        }).dxDataGrid("instance");
        treeList.on('selectionChanged', function () {
            IHS.BindOutputChartData('area');
        });
    },
    BindOutputChartData: function (outputChart) {
        var inputOutputDatas = $("#demandOutputDetails").dxDataGrid('instance');
        var selectedData = inputOutputDatas.getSelectedRowsData();
        if (selectedData.length == 0 && selectedData[0] == undefined) {
            IHS.BindOutputChartValues([], outputChart);
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
            IHS.BindOutputChartValues(chartJson, outputChart);
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
                    serieseData[j] = {
                        valueField: valField, name: valField
                    };
                    j++;
                }
            }
        }

        chart = $("#demandOutputChart").dxChart({
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
            /* tooltip: {
                 enabled: true,
                 customizeTooltip: function (info) {
                    return {
                      text: arg.valueText
                    };
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
             },*/
            scrollBar: {
                visible: true
            },
            scrollingMode: "all",
            zoomingMode: "all",

        }).dxChart("instance");
    },
    IsDemandOutputSummaryLoaded: false,
    GetDemandSummaryDetails: function () {
        var scenarioID = $('#demandScenarioId').val();
        var queryScenarioID = Common.getQueryString()["scenarioid"];
        if (scenarioID == queryScenarioID && queryScenarioID > 0) {
            var modelSeqNumber = $('#modelSeqNumber').val();
            var demandDetails = {
                "scenarioId": queryScenarioID,
                "trialId": IHS.DemandTrailID,
                "countryCode": [],
                "typeInput": "OUTPUT",
                "Sequence": modelSeqNumber,
                "IsSaved": IHS.IsModelCompleted
            };
            var data = {
                "details": JSON.stringify(demandDetails)
            };
            var formId = $('#frmDemand');
            var url = "/IHS/getDemandDetails";
            Common.ajaxCall(formId, "GET", url, data, IHS.BindDemandSummaryDetails, Common.g_onError, true);
        }
    },
    BindDemandSummaryDetails: function (demandOutputDetails) {
        IHS.IsDemandOutputSummaryLoaded = true;
        $('#loading').hide();
        var outputJsonDetails = null;
        if (demandOutputDetails != null && demandOutputDetails.hasOwnProperty('toutputdetails'))
            outputJsonDetails = JSON.parse(demandOutputDetails.toutputdetails);
        else
            outputJsonDetails = JSON.parse(demandOutputDetails);

        if (outputJsonDetails != null && outputJsonDetails.length > 0) {
            IHS.BindDemandOutputValues(outputJsonDetails[0], "OUTPUT");
        }
        var dmScenarioName = ($('#dmScenarioName').val() == null || $('#dmScenarioName').val() == "") ? "IHS" : $('#dmScenarioName').val();
        var exportName = dmScenarioName + "-Demand Summary-Trial-" + IHS.DemandTrailID;
        var treeList = $("#demandSummaryDetails").dxDataGrid({
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

            },
            onEditingStart: function (info) {
                if (IHS.IsModelCompleted)
                    info.cancel = true;
            },
            onRowPrepared: function (info) {
                if (info.rowType == "data") {
                    //if (info.rowType != "header" && info.data.IsModified === 2)
                    //    info.rowElement.addClass("ihscomparsion");
                }
            },
            groupPanel: {
                visible: true
            },
            columns: IHS.DemandcolumnsArray,
            summary: {
                groupItems: IHS.DemandcolumnsSumArray
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
                        elementAttr: {
                            'class': 'faicon'
                        },
                        onClick: function () {
                            IHS.GetSummaryBindChartData("line");
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
                        elementAttr: {
                            'class': 'faicon'
                        },
                        onClick: function () {
                            IHS.GetSummaryBindChartData("area");
                        }
                    }
                },
                {
                    location: "before",
                    locateInMenu: 'auto',
                    widget: "dxButton",
                    options: {
                        icon: "faicon fa fa-bar-chart",
                        elementAttr: {
                            'class': 'faicon'
                        },
                        onClick: function () {
                            IHS.GetSummaryBindChartData("bar");
                        }
                    }
                });
            }
        }).dxDataGrid("instance");
        treeList.on('selectionChanged', function () {
            IHS.GetSummaryBindChartData("area");
        });
    },
    GetSummaryBindChartData: function (chartSummary) {
        var inputOutputDatas = $("#demandSummaryDetails").dxDataGrid('instance');
        var selectedData = inputOutputDatas.getSelectedRowsData();
        if (selectedData.length == 0 && selectedData[0] == undefined) {
            IHS.BindDemandSummaryChart([], chartSummary);
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
            IHS.BindDemandSummaryChart(chartJson, chartSummary);
        }
    },
    BindDemandSummaryChart: function (chartData, chartSummary) {
        var serieseData = [];
        var serieseData = [];
        if (chartData != null && chartData.length > 0) {
            var len = Object.keys(chartData[0]).length - 1;
            serieseData = new Array(len);
            for (i = 0, j = 0; i < serieseData.length; i++) {
                var valField = Object.keys(chartData[0])[i + 1];
                if (valField != "year") {
                    serieseData[j] = {
                        valueField: valField, name: valField
                    };
                    j++;
                }
            }
        }
        $("#demandSummaryChart").dxChart({
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
                type: chartSummary
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
                autoBreaksEnabled: true,
                maxAutoBreakCount: 3000
            },
            series: serieseData,
            legend: {
                verticalAlignment: "bottom",
                horizontalAlignment: "center",
                itemTextPosition: "bottom"
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
            /* tooltip: {
                 enabled: true,
                 customizeTooltip: function (info) {
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
             },*/
            scrollBar: {
                visible: true
            },
            scrollingMode: "all",
            zoomingMode: "all",

        }).dxChart("instance");
    },
    IsDemandInputModified: false,
    PostTrailInputValue: [],
    PostTrailInput: function () {
        var scenarioID = $('#demandScenarioId').val();
        var queryScenarioID = Common.getQueryString()["scenarioid"];
        if (scenarioID == queryScenarioID && queryScenarioID > 0) {
            if (IHS.IsDemandInputModified && IHS.PostTrailInputValue.length > 0) {
                var modelSeqNumber = $('#modelSeqNumber').val();
                var activeTabId = IHS.tabActiveChange();
                var CountryCodeLst = $("#demandCountry").dxDropDownBox('instance').option('value');
                var sectorId = $("#demandSector").dxSelectBox('instance').option('value');
                var VmIHSTrialData = {
                    "trialId": IHS.DemandTrailID,
                    "startYear": IHS.TrailStartYear,
                    "endYear": IHS.TrailEndYear,
                    "scenarioId": parseInt(scenarioID),
                    "sequence": modelSeqNumber,
                    "user": 1,
                    "countryCode": CountryCodeLst,
                    "sectorId": sectorId == null ? 1 : sectorId,
                    "typeInput": activeTabId.trim(),
                    "trialInput": IHS.PostTrailInputValue
                };
                var data = {
                    "trailInputs": JSON.stringify(VmIHSTrialData)
                };
                var formId = $('#frmDemand');
                var url = "/IHS/postTrialInput";
                Common.ajaxCall(formId, "POST", url, data, IHS.PostTrailInputSuccess, Common.g_onError, true);
            } else {
                Common.E2MASNotification("No record modified", Common.Warning);
            }
        }
    },
    PostTrailInputSuccess: function (rData) {
        $('#loading').hide();
        if (rData != null && rData.Status) {
            IHS.PostTrailInputValue = [];
            Common.E2MASNotification("Trail Saved Successfully", Common.Success);
            IHS.IsLoaded = false;
            IHS.BindTrailDetails(rData.TriaId, rData.trailDetails);
            IHS.IsLoaded = true;
            IHS.BindDemandInputDetails(rData.toutputdetails);
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
        var scenarioID = $('#demandScenarioId').val();
        var queryScenarioID = Common.getQueryString()["scenarioid"];
        if (scenarioID == queryScenarioID) {
            confirmScenarioId = parseInt(scenarioID);
            if (IHS.SaveTrialOutputValue.length > 0) {
                IsChanged = true;
            }
            var modelSeqNumber = $('#modelSeqNumber').val();
            var trailOutput = {
                "ScenarioId": confirmScenarioId,
                "ModelCode": "DM",
                "TrialId": IHS.DemandTrailID,
                "ScenarioMode": $('#demandtypeofMode').val(),
                "User": 1,
                "Status": "",
                "IsChanged": IsChanged,
                "sequence": modelSeqNumber,
                "trailOutput": IHS.SaveTrialOutputValue
            };
            var data = {
                "trailOutputs": JSON.stringify(trailOutput)
            };
            var formId = $('#frmDemand');
            var url = "/IHS/saveTrialOutput";
            Common.ajaxCall(formId, "POST", url, data, IHS.SaveTrialOutputSuccess, Common.g_onError, true);
        }
    },
    SaveTrialOutputValue: [],
    SaveTrialOutputSuccess: function (rData) {
        $('#loading').hide();
        IHS.SaveTrialOutputValue = [];
        IHS.IsModelCompleted = true;
        if (rData != null && rData.outputDetails != null) {
            if (rData.outputDetails.Status) {
                Common.E2MASNotification("Demand Output saved Successfully", Common.Success);
                IHS.ShowHideControls("OUTPUT");
                var scenarioID = $('#demandScenarioId').val();
                var modelSeqNumber = $('#modelSeqNumber').val();
                var nextModelStatus = rData.outputDetails.nextModelStatus;
                Common.CommonModel.CommonHeaderBinding('frmDemand', scenarioID, nextModelStatus.ModelCode == null ? "PC" : nextModelStatus.ModelCode, nextModelStatus.ModelSequenceNumber);
            } else {
                Common.E2MASNotification(rData.outputDetails.outputStatusMessage, Common.Error);
            }
        }
    },
    GetStandAloneCountries: function () {
        var newlySelectedCountry = [];
        if (!IHS.IsStandAloneCountryMod) {
            newlySelectedCountry = IHS.existCountry;
        } else {
            var selectedCountry = $("#demandCountry").dxDropDownBox("getDataSource");
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
    PostStandAloneTrailInput: function () {
        var trailStandAloneOrgArrays = [];
        var scenarioID = $('#demandScenarioId').val();
        var queryScenarioID = Common.getQueryString()["scenarioid"];
        if (scenarioID == queryScenarioID && queryScenarioID > 0) {
            var isChangedValue = false, isYearModified = false, isCountryAdded = false;
            if ((IHS.TrailStartYear != IHS.startValue) || (IHS.endValue != IHS.TrailEndYear)) {
                isChangedValue = true;
            }
            if (isChangedValue) {
                if (IHS.endValue > IHS.TrailEndYear) {
                    isYearModified = true;
                    //var TrailEndYearPlus = IHS.TrailEndYear + 1;
                    //$.each(IHS.existCountry, function (eIndex, eValue) {
                    //    for (var iEndValue = TrailEndYearPlus; iEndValue <= IHS.endValue; iEndValue++) {
                    //        var trailOutputs = {
                    //            "variableName": "",
                    //            "countryCode": eValue.trim(),
                    //            "year": parseInt(iEndValue),
                    //            "variablevalue": 0
                    //        };
                    //        trailStandAloneOrgArrays.push(trailOutputs);
                    //    }
                    //});
                }
            }
            var newlySelectedCountry = IHS.GetStandAloneCountries();
            var isSame = (newlySelectedCountry.length == IHS.existCountry.length) && newlySelectedCountry.every(function (element, index) {
                return element === IHS.existCountry[index];
            });
            var newlyAdded = [];
            if (!isSame) {
                if (newlySelectedCountry != null && newlySelectedCountry.length > 0) {
                    $.each(newlySelectedCountry, function (index, value) {
                        var isAvailable = $.inArray(value, IHS.existCountry);
                        if (isAvailable <= -1) {
                            newlyAdded.push(value);
                            isCountryAdded = true;
                        }
                    });
                }
            }
            //if (!isSame && newlyAdded.length > 0) {
            //    $.each(newlyAdded, function (Nindex, Nvalue) {
            //        for (var iYear = IHS.startValue; iYear <= IHS.endValue; iYear++) {
            //            var trailOutputs = {
            //                "variableName": "",
            //                "countryCode": Nvalue.trim(),
            //                "year": parseInt(iYear),
            //                "variablevalue": 0
            //            };
            //            trailStandAloneOrgArrays.push(trailOutputs);
            //        }
            //    });
            //}
            var sectorId = $("#demandSector").dxSelectBox('instance').option('value');
            var standAloneApply = {
                "scenarioId": scenarioID,
                "startYear": IHS.startValue,
                "endYear": IHS.endValue,
                "trailId": IHS.DemandTrailID,
                "typeInput": "INPUT",
                "sectorId": sectorId == null ? 1 : sectorId,
                "isYearModified": isYearModified,
                "isCountryAdded": isCountryAdded,
                "existCountry": IHS.existCountry,
                "newcountry": newlyAdded,
                "existnewcountry": IHS.existCountry,
                "standAloneApplyList": IHS.PostTrailInputValue
            };
            var data = {
                "standAloneApplyInputs": JSON.stringify(standAloneApply)
            };
            var formId = $('#frmDemand');
            var url = "/IHS/postStandAloneApply";
            Common.ajaxCall(formId, "POST", url, data, IHS.StandAloneApplyInputsSuccess, Common.g_onError, true);
        }
    },
    StandAloneApplyInputsSuccess: function (rData) {
        $('#loading').hide();
        if (rData != null && rData.outputDetails.Status) {
            IHS.PostTrailInputValue = [];
            Common.E2MASNotification("Trail Saved Successfully", Common.Success);
            IHS.IsLoaded = false;
            IHS.BindTrailDetails(rData.outputDetails.TriaId, rData.outputDetails.trailDetails);
            IHS.IsLoaded = true;
            IHS.BindDemandInputDetails(rData.outputDetails.toutputdetails);
        } else {
            Common.E2MASNotification(rData.outputDetails.StatusMessage, Common.Error);
        }
        //if (rData != null && !rData.outputDetails.apiStatus) {
        //    Common.E2MASNotification(rData.outputDetails.apiStatusMessage, Common.Error);
        //}
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
                    var activeTab = $("#demandTabs li.active").find('a').attr('id');
                    var outputCell = null, selectedRowkey = null;
                    if (activeTab == "demandInputHeaderTab" && IHS.IsDemandInputLoaded) {
                        outputCell = $("#demandInputDetails").dxTreeList('instance');
                        selectedRowkey = outputCell.getSelectedRowsData();
                    } else if (activeTab == "demandHeaderTab" && IHS.IsDemandOutputLoaded) {
                        outputCell = $('#demandOutputDetails').dxDataGrid('instance');
                        selectedRowkey = outputCell.getSelectedRowKeys();
                    }
                    if (selectedRowkey != null && selectedRowkey.length > 0) {
                        IHS.ChangeCellValues();
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
        var dlValue = {
        };
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
                var activeTab = $("#demandTabs li.active").find('a').attr('id');
                var outputCell = null, selectedRowkey = null;
                if (activeTab == "demandInputHeaderTab") {
                    outputCell = $("#demandInputDetails").dxTreeList('instance');
                    selectedRowkey = outputCell.getSelectedRowsData();
                } else {
                    outputCell = $('#demandOutputDetails').dxDataGrid('instance');
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
                    if (activeTab == "demandInputHeaderTab") {
                        $.each(selectedRowkey, function (sIndex, sValue) {
                            if (sValue.IsInput) {
                                selectedRowIndex.push(outputCell.getRowIndexByKey(sValue.MappingId));
                            }
                        });
                    } else {
                        $.each(selectedRowkey, function (sIndex, sValue) {
                            selectedRowIndex.push(outputCell.getRowIndexByKey(sValue));
                        });
                    }
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
    },
}
