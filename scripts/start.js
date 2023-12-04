import { system } from '@minecraft/server';
function startwodjopwpwdjwwpodjdwo() {
    console.warn(`-----------------------------------------------------------------------------------------------------------------------------------------------\n Start at ${(new Date().toString())}`);
}
startwodjopwpwdjwwpodjdwo();
system.beforeEvents.watchdogTerminate.subscribe((event) => {
    event.cancel = true;
});
//# sourceMappingURL=start.js.map