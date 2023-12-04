import { world } from "@minecraft/server";
import { eventBuilder, scoreboardBuilder } from "patchy_api/modules";
eventBuilder.subscribe('worldLoad*EP', {
    worldLoad: (event) => {
        scoreboardBuilder.add('error');
        scoreboardBuilder.add('staff');
        scoreboardBuilder.add('rlzrxsd');
        try {
            world.scoreboard.getObjective('error')?.setScore('log', 0);
        }
        catch {
        }
    }
});
//# sourceMappingURL=world_load.js.map