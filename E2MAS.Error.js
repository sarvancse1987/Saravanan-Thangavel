$(document).ready(function () {
    errorLog.GetErrorLog();
});
errorLog = {
    GetErrorLog: function () {
        var data = {};
        var formId = $('#frmErrorLog');
        var url = "/ErrorLog/getLogErrorDetails";
        Common.ajaxCall(formId, "GET", url, data, errorLog.GetErrorLogSuccess, Common.g_onError);
    },
    GetErrorLogSuccess: function (rData) {
        $('#loading').hide();
        if (rData != null && rData.outputDetails != null && rData.outputDetails.length > 0) {
            errorLog.BindErrorLog(rData.outputDetails);
        }
    },
    BindErrorLog: function (errorlogs) {
        var errorlog = $("#errorlogs").dxDataGrid({
            dataSource: errorlogs,
            columnAutoWidth: true,
            allowColumnReordering: true,
            showBorders: true,
            hoverStateEnabled: true,
            selection: {
                mode: "multiple",
                showCheckBoxesMode: "onClick"

            },
            "export": {
                enabled: true,
                fileName: "Energy Balance",
                allowExportSelectedData: true

            },
            loadPanel: {
                enabled: true
            },
            searchPanel: {
                visible: true,
                width: 250
            },
            headerFilter: {
                visible: false
            },
            columnChooser: {
                enabled: false
            },
            paging: {
                pageSize: 8
            },
            pager: {
                showPageSizeSelector: true,
                allowedPageSizes: [8, 10, 20, 30, 40],
                showInfo: true
            },
            wordWrapEnabled: true,


            onCellPrepared: function (e) {
                if (e.rowType == "data" && e.data.prioritymessage === "High")
                    e.cellElement.addClass("red");
                else if (e.rowType == "data" && e.data.prioritymessage === "Medium")
                    e.cellElement.addClass("yellow");

            }
            ,
            columns: [
		
                    {
                        caption: "User",
                        dataField: "LoggedInUser",
                        cssClass: 'countrymodel',
                        width: 150,
                        allowSorting: false

                    }, {
                        caption: "Scenario Name",
                        dataField: "ScenarioName",
                        width: 150,
                        allowSorting: false

                    }, {
                        caption: "Application",
                        dataField: "ApplcaionName",
                        allowSorting: false

                    },
                    {
                        caption: "Model Sequence Number",
                        dataField: "ModelSequenceNumber",
                        allowSorting: false
				    

                        },
                        {
                        caption: "Stack Error",
                        dataField: "StackTrace",
                        width: 250,
                        allowSorting: false,
                        cellTemplate: function (container, options)
                        {
                            $('<a/>').addClass('dx-link')
                                .text('View Details')
                                .on('dxclick', function ()
                                {
                                    $("#StackTrace_PopUp").dxPopup("instance").show();
                                   
                                    $("#txtStackTrace").dxTextArea("instance").option("value", options.data.StackTrace);
                                }).appendTo(container);
                        }

                    }, {
                        caption: "Exception Error",
                        dataField: "InnerException",
                        width: 250,
                        allowSorting: false
                    }, {
                        caption: "Additional Info",
                        dataField: "AdditionalInfo",
                        width: 250,
                        allowSorting: false
                    }, {
                        caption: "Date & Time",
                        dataField: "LoggedOnDateFormatted",
                        width: 150,
                        allowSorting: false
                      }
            ]
            ,
            onToolbarPreparing: function (e) {
                var toolbar = e.toolbarOptions.items;


                toolbar.push(
                {
                    location: "after",
                    widget: "dxButton",
                    options: {
                        icon: "refresh",
                        onClick: function () {

                            errorlog.refresh();

                        }
                    }
                }
                  );
            }
        }).dxDataGrid('instance');

        $("#StackTrace_PopUp").dxPopup({
            showTitle: true,
            title: 'Stack Error Details',
            contentTemplate: function () {
                return $("<div />").append(
                 $("<div id='txtStackTrace' />")
                    .dxTextArea({
                        autoResizeEnabled: true,
                        minHeight: 780,
                        maxHeight: 780,                        
                        value: "No Data"
                    })
                );
            }
        });
    }
};

