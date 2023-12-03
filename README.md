# patchy-example

apon cloning this repo you might need to manually run the games type definitions for listed in the package.json for server and server-ui for errors to disappear.

```npm run updatesrc```
takes from the cloned patchy-api and replaces its folder with the updated folder (basicly updates ./src/node/patchy-api). It also updates the Item ids for the chest ui made by https://github.com/Herobrine643928 
and counts your items to get close to the amount of experimental items in your pack. You can configure exemptions from the count and a offset in ./src/node/update_ts.js
_file: src/node/update_ts.js_

```npm run updatesrctsc```
does the above then runs tsc which compiles the type scripts
_file: src/node/update_ts.js_
 
```npm run updaterealm```
copys this packs compiled js from the com.mojang/development_behavior_packs to the com.mojang/behavior_packs folder (excludes copying mode_modules, git, .vs, .vscode, src,  etc)  
and updates the version in the manifest and auto generates uuids if the manifest in com.mojang/behavior_packs/<pack> didn't exist. 
if you need a certain uuid I would change the dev ones and save those certain uuids and put them in the realm pack.
_file: src/node/export_realm.mjs_


