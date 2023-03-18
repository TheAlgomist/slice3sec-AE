{
    function cutAndAddToRenderQueue() {
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }

        var preComp = comp.selectedLayers[0];
        if (!preComp) {
            alert("Please select a pre-comp layer.");
            return;
        }

        var sliceDuration = 3; // Duration in seconds

        app.beginUndoGroup("Cut Pre-Comp and Add to Render Queue");

        // Duplicate the original pre-comp and trim it
        function createSlicedLayer(start, end) {
            var newLayer = preComp.duplicate();
            newLayer.startTime = start;
            newLayer.outPoint = end;
            return newLayer;
        }

        var startTime = 0;
        var endTime = sliceDuration;
        var compDuration = comp.duration;

        while (startTime < compDuration) {
            var slicedLayer = createSlicedLayer(startTime, endTime);
            var slicedComp = createSlicedComp(slicedLayer);
            addToRenderQueue(slicedComp);

            startTime += sliceDuration;
            endTime += sliceDuration;
        }

        // Remove the original Pre-Comp layer
        preComp.remove();

        // Create a new composition containing the sliced layer
        function createSlicedComp(layer) {
            var compName = comp.name + "_sliced_" + (startTime + 1);
            var newComp = app.project.items.addComp(compName, comp.width, comp.height, comp.pixelAspect, comp.duration, comp.frameRate);
            newComp.layers.add(layer.source);
            return newComp;
        }

        // Add composition to the Render Queue
        function addToRenderQueue(slicedComp) {
            var renderQueue = app.project.renderQueue;
            var queueItem = renderQueue.items.add(slicedComp);
            var outputPath = Folder.myDocuments.absoluteURI + "/" + slicedComp.name + ".mov";
            var outputModule = queueItem.outputModule(1);
            outputModule.file = new File(outputPath);
        }

        app.endUndoGroup();
    }

    cutAndAddToRenderQueue();
}
