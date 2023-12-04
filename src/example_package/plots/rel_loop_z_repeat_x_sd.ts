import { BlockAreaSize } from "@minecraft/server";
import plotBuilder, { PlotsVector3 } from "../../patchy_api/libraries/classes/plot.js";
plotBuilder.create('rlzrxsd', {
	size: new BlockAreaSize(10, 10, 10),
	start: { x: 10, y: 113, z: 53 },
	loop: true,
	property: false,
	plotNumberIdentifier: 'rlzrxsd',
	loopDirection: 'z',
	ruleSets: [
		{
			count: 10,
			direction: 'x',
			start: new PlotsVector3(0, 0, 0),
		},
		{
			count: 5,
			direction: 'x',
			offset: { x: 10, y: 0, z: 0 },
			start: new PlotsVector3(0, 0, 10),
		}
	]
});