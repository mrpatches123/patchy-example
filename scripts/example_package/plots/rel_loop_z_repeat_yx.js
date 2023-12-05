import { BlockAreaSize } from "@minecraft/server";
import plotBuilder, { PlotsVector3 } from "../../patchy_api/libraries/classes/plot.js";
import { overworld } from "patchy_api/modules.js";
plotBuilder.create('rlzrxysdst', {
    size: new BlockAreaSize(10, 10, 10),
    start: { x: 10, y: 113, z: 53 },
    loop: true,
    property: false,
    plotNumberIdentifier: 'rlzrxysdst',
    loopDirection: 'z',
    structure: {
        name: 'vaultTest',
        dimension: overworld,
        location: { x: 0, y: 0, z: 0 }
    },
    ruleSets: [
        {
            count: { x: 10, y: 10, z: 0 },
            direction: { x: 1, y: 1, z: 0 },
            start: new PlotsVector3(0, 0, 0),
        }
    ]
});
//# sourceMappingURL=rel_loop_z_repeat_yx.js.map