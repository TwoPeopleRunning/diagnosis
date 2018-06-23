function createGauge() {
    $("#gauge1").kendoRadialGauge({

        pointer: {
            value: $("#gauge-value1").val()
        },

        scale: {
            minorUnit: 5,
            startAngle: -30,
            endAngle: 210,
            max: 180
        }
    });

    $("#gauge2").kendoRadialGauge({

        pointer: {
            value: $("#gauge-value2").val()
        },

        scale: {
            minorUnit: 5,
            startAngle: -30,
            endAngle: 210,
            max: 180
        }
    });
}


$(document).ready(function () {
    var myWindow = $("#window"),
        undo = $("#undo");

    undo.click(function () {
        myWindow.data("kendoWindow").open();
        undo.fadeOut();
    });

    function onClose() {
        undo.fadeIn();
        window.history.back();
    }

    myWindow.kendoWindow({
        width: "60%",
        visible: false,
        position: {
            top: "2%",
            left: "20%"
        },
        actions: [
            "Pin",
            "Minimize",
            "Maximize",
            "Close"
        ],
        close: onClose
    }).data("kendoWindow").open();


    createGauge();

    function updateValue() {
        $("#gauge1").data("kendoRadialGauge").value($("#gauge-value1").val());
        $("#gauge2").data("kendoRadialGauge").value($("#gauge-value2").val());
    }

    if (kendo.ui.Slider) {
        $("#gauge-value1").kendoSlider({
            min: 0,
            max: 180,
            showButtons: false,
            change: updateValue
        });
    } else {
        $("#gauge-value1").change(updateValue);
    }

    if (kendo.ui.Slider) {
        $("#gauge-value2").kendoSlider({
            min: 0,
            max: 180,
            showButtons: false,
            change: updateValue
        });
    } else {
        $("#gauge-value2").change(updateValue);
    }

    $(document).bind("kendo:skinChange", function (e) {
        createGauge();
    });
});


