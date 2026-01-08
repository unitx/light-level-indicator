import * as Mc from "@minecraft/server";
import * as Ui from "@minecraft/server-ui";
import { defaultSettings, lightEmittingBlocks, transparentBlocks } from "./settings.js";
// Define global variables
let settings = JSON.parse(JSON.stringify(defaultSettings));
let light_detector = 0; let light_emitter = 0; let light_render = 0; let players=[];
let shape;
let shapeOffsets = [];
let light_flood_fill = {};
let lightFloodFillOffsets = {};

// Created variable lookups for quick access
const lightBlockIds = Object.keys(lightEmittingBlocks);
const transparentBlocksSet = new Set(transparentBlocks);
const playerStates=new Map();

// Update settings and pre-calulate shape points on load
Mc.system.run(() => {
  updateSettings();
  preCalulations();
});

// Update settings array to match saved dynamic property data
function updateSettings() {
    for (const key of Object.keys(settings)) {
        let value = Mc.world.getDynamicProperty(key);
        if(value===undefined) settings[key]=defaultSettings[key];
        else if((key ==="lightlevelindicator:color_dangerous" || key==="lightlevelindicator:color_unsafe" || key==="lightlevelindicator:color_safe") && typeof value === "string"){
          const values = value.split(","); 
          settings[key] = { red: Number(values[0])/255, green: Number(values[1])/255, blue: Number(values[2])/255 };
        }
        else settings[key] = value;
    }
}
// Generates the points for the standard shape that light follows (diamond)
function generatePoints(horizontal, vertical, step = 1) {
	const points = [];
	for (let x = -horizontal; x <= horizontal; x += step)
		for (let y = -vertical; y <= vertical; y += step)
			for (let z = -horizontal; z <= horizontal; z += step)
				if (Math.abs(x) + Math.abs(y) + Math.abs(z) <= horizontal) points.push(`${x},${y},${z}`);
	return new Set(points);
}
// Run pre-calulators to speed up phrasing and area calulations
function preCalulations() {
  shape = generatePoints(
    settings["lightlevelindicator:horizontal_scan_distance"],
    settings["lightlevelindicator:vertical_scan_distance"]
  );

  for (let i = 1; i <= 15; i++) {
    light_flood_fill[i] = generatePoints(i, i);
  }

  shapeOffsets = Array.from(shape, s => {
    const i1 = s.indexOf(",");
    const i2 = s.lastIndexOf(",");
    return [
      +s.slice(0, i1),
      +s.slice(i1 + 1, i2),
      +s.slice(i2 + 1)
    ];
  });

  for (let i = 1; i <= 15; i++) {
    const set = light_flood_fill[i];
    lightFloodFillOffsets[i] = Array.from(set, s => {
      const i1 = s.indexOf(",");
      const i2 = s.lastIndexOf(",");
      return [
        +s.slice(0, i1),
        +s.slice(i1 + 1, i2),
        +s.slice(i2 + 1)
      ];
    });
  }
}

// Settings menu config for the addon
export const formConfig = [
    { type:"label", label: "lightlevelindicator.scan_distance_label" },
    { type: "slider", label: "lightlevelindicator.horizontal_scan_distance", key: "lightlevelindicator:horizontal_scan_distance", tooltip: "lightlevelindicator.horizontal_scan_distance.tooltip", min: 3, max: 50 },
    { type: "slider", label: "lightlevelindicator.vertical_scan_distance", key: "lightlevelindicator:vertical_scan_distance", tooltip: "lightlevelindicator.vertical_scan_distance.tooltip", min: 1, max: 20 },
    { type: "toggle", label: "lightlevelindicator.advanced.emitter_calulations", key: "lightlevelindicator:emitter_calulations", tooltip: "lightlevelindicator.advanced.emitter_calulations.tooltip", advanced: true },
    { type: "slider", label: "lightlevelindicator.advanced.emitter_extended_length", key: "lightlevelindicator:emitter_extended_length", tooltip: "lightlevelindicator.advanced.emitter_extended_length.tooltip", min: 1, max: 15, advanced: true },
    { type:"divider"  },

    { type:"label", label: "lightlevelindicator.interval_label" },
    { type: "slider", label: "lightlevelindicator.update_interval", key: "lightlevelindicator:update_interval", tooltip: "lightlevelindicator.update_interval.tooltip", min: 1, max: 200 },
    { type: "slider", label: "lightlevelindicator.particle_interval", key: "lightlevelindicator:particle_interval", tooltip: "lightlevelindicator.particle_interval.tooltip", min: 1, max: 200 },
    { type: "slider", label: "lightlevelindicator.advanced.particle_lifetime", key: "lightlevelindicator:particle_lifetime", tooltip: "lightlevelindicator.advanced.particle_lifetime.tooltip", min: 1, max: 200, advanced: true },
    { type: "slider", label: "lightlevelindicator.advanced.emitter_update_interval", key: "lightlevelindicator:emitter_update_interval", tooltip: "lightlevelindicator.advanced.emitter_update_interval.tooltip", min: 1, max: 200, advanced: true },
    { type:"divider"  },

    { type:"label", label: "lightlevelindicator.style_label" },
    { type: "toggle", label: "lightlevelindicator.style", key: "lightlevelindicator:style", tooltip: "lightlevelindicator.style.tooltip" },
    { type: "text", label: "lightlevelindicator.scale", key: "lightlevelindicator:scale", tooltip: "lightlevelindicator.scale.tooltip", min: 0.1, max: 3 },
    { type: "text", label: "lightlevelindicator.y_offset", key: "lightlevelindicator:y_offset", tooltip: "lightlevelindicator.y_offset.tooltip", min: -1, max: 1 },
    { type: "toggle", label: "lightlevelindicator.render_safe_blocks", key: "lightlevelindicator:render_safe_blocks", tooltip: "lightlevelindicator.render_safe_blocks.tooltip" },
    { type: "toggle", label: "lightlevelindicator.render_unsafe_blocks", key: "lightlevelindicator:render_unsafe_blocks", tooltip: "lightlevelindicator.render_unsafe_blocks.tooltip" },
    { type: "toggle", label: "lightlevelindicator.render_dangerous_blocks", key: "lightlevelindicator:render_dangerous_blocks", tooltip: "lightlevelindicator.render_dangerous_blocks.tooltip" },
    { type: "color", label: "lightlevelindicator.advanced.color_dangerous", key: "lightlevelindicator:color_dangerous", tooltip: "lightlevelindicator.advanced.color_dangerous.tooltip", advanced: true },
    { type: "color", label: "lightlevelindicator.advanced.color_unsafe", key: "lightlevelindicator:color_unsafe", tooltip: "lightlevelindicator.advanced.color_unsafe.tooltip", advanced: true },
    { type: "color", label: "lightlevelindicator.advanced.color_safe", key: "lightlevelindicator:color_safe", tooltip: "lightlevelindicator.advanced.color_safe.tooltip", advanced: true },
];

// Show setting to player, and using returned reset store saved settings
function showSettingsForm(player, advancedMode, reset) {
  // Setup variables and copy needed variables
  const form = new Ui.ModalFormData();
  let localSettings 
  if(reset) localSettings = JSON.parse(JSON.stringify(defaultSettings));
  else localSettings = settings;
  let visibleFields = JSON.parse(JSON.stringify(formConfig));
  if(!advancedMode) visibleFields=visibleFields.filter(f => !f.advanced)
  // Loop through settings array and setup form menu
  for (const field of visibleFields) {
    const label = { translate: field.label };
    const tooltip = field.tooltip ? { translate: field.tooltip } : undefined;
    switch (field.type) {
        case "text":
            form.textField(label,"",{ defaultValue: localSettings[field.key].toString(), tooltip });
            break;
        case "toggle":
            form.toggle(label,{ defaultValue: Boolean(localSettings[field.key]), tooltip });
            break;
        case "slider":
            form.slider(label,field.min,field.max,{ defaultValue: localSettings[field.key], tooltip, valueStep: 1 });
            break;
        case "color":
            const color = localSettings[field.key] ?? { red: 1, green: 1, blue: 1 };
            form.divider();
            form.label(label);
            form.slider({ translate: "lightlevelindicator.red_label" },0, 255,{ defaultValue: Math.floor(color.red * 255), tooltip });
            form.slider({ translate: "lightlevelindicator.green_label" },0, 255,{ defaultValue: Math.floor(color.green * 255) });
            form.slider({ translate: "lightlevelindicator.blue_label" },0, 255,{ defaultValue: Math.floor(color.blue * 255) });
            break;
        case "divider":
            form.divider();
            break;
        case "label":
            form.label(label);
            break;
    }
  }
  // Show form to player then save respone to settings object
  form.show(player).then(response => {
    if(response.canceled) return;
    let formIdx = 0;
    for (const field of visibleFields) {
        switch (field.type) {
            case "text":
            case "slider":
                const val = Number(response.formValues[formIdx++]);
                if (!isNaN(val)) settings[field.key] = val;
                break;
            case "toggle":
                settings[field.key] = response.formValues[formIdx++] ? 1 : 0;
                break;
            case "color":
                formIdx+=2;
                settings[field.key].red = Number(response.formValues[formIdx++] / 255);
                settings[field.key].green = Number(response.formValues[formIdx++] / 255);
                settings[field.key].blue = Number(response.formValues[formIdx++] / 255);
                break;
            case "divider":
            case "label":
              formIdx++;
              break;
        }
    }
    // Save settings to local settings object and to dynamic propertys for global save
    settings=localSettings;
    for (const [key, value] of Object.entries(settings)) {
      if(key ==="lightlevelindicator:color_dangerous" || key==="lightlevelindicator:color_unsafe" || key==="lightlevelindicator:color_safe"){
        const newValue = `${Math.floor(value.red*255)},${Math.floor(value.green*255)},${Math.floor(value.blue*255)}`;
        Mc.world.setDynamicProperty(key, newValue);
      }
      else Mc.world.setDynamicProperty(key, value);
    }
    // Redo inital calulations with new settings
    preCalulations();
  });
}

// Commands to toggle between light modes and to change settings
Mc.system.beforeEvents.startup.subscribe((eventData) => {
    // Toggle command
    eventData.customCommandRegistry.registerCommand({
        name: "lightlevelindicator:toggle",
        description: "Toggle the light level indicator to view light levels, sky light levels, and spawn spots.",
        permissionLevel: Mc.CommandPermissionLevel.Any,
        cheatsRequired: false,
        optionalParameters: [
            { type: Mc.CustomCommandParamType.Boolean, name: "skyLightLevel" },
        ]
    },
    (data, parmas) => {
        Mc.system.run(() => {
            // Toggle players tags depending on command and arguments
            if(!data.sourceEntity||data.sourceEntity.typeId!=="minecraft:player") return;
            if(parmas!==undefined && parmas===true){
              if(data.sourceEntity.hasTag("lightlevelindicator:show_sky_light_level")) data.sourceEntity.removeTag("lightlevelindicator:show_sky_light_level");
              else data.sourceEntity.addTag("lightlevelindicator:show_sky_light_level");
            }
            else{
              if(data.sourceEntity.hasTag("lightlevelindicator:show_light_level")) data.sourceEntity.removeTag("lightlevelindicator:show_light_level");
              else data.sourceEntity.addTag("lightlevelindicator:show_light_level");
            }
            // Add player to LightLevelState class if they are not already
            let state=playerStates.get(data.sourceEntity.id);
            if(!state){state=new LightLevelState(data.sourceEntity);playerStates.set(data.sourceEntity.id,state)};
            state.indicator=data.sourceEntity.hasTag("lightlevelindicator:show_light_level") ? data.sourceEntity.hasTag("lightlevelindicator:show_sky_light_level") ? 2 : 0 : data.sourceEntity.hasTag("lightlevelindicator:show_sky_light_level") ? 1 : 0;
        })
    })
    // Settings command
    eventData.customCommandRegistry.registerCommand({
        name: "lightlevelindicator:settings",
        description: "Adjust the settings of the light level indicator addon.",
        permissionLevel: Mc.CommandPermissionLevel.Admin,
        cheatsRequired: false,
        optionalParameters: [
            { type: Mc.CustomCommandParamType.Boolean, name: "advancedSettings" },
            { type: Mc.CustomCommandParamType.Boolean, name: "resetSettings" },
        ]
    },
    (data,advanced,reset) => {
        Mc.system.run(() => {
            // Show settings to player with additional options
            if(!data.sourceEntity||data.sourceEntity.typeId!=="minecraft:player") return;
            if(advanced===undefined) advanced=false; if(reset===undefined) reset=false;
            showSettingsForm(data.sourceEntity, advanced, reset);
        })
    })
})


// Class which handles all light indicator operations
class LightLevelState {
  // Player constructor to hold each players light infomation if light level indicator is enabled
  constructor(player){
    this.player = player;
    this.location = player.location;
    this.dimension = player.dimension;
    this.hight_min=this.dimension.heightRange.min+1
    this.hight_max=this.dimension.heightRange.max-1
    this.sky_light=false;
    this.validBlocks = [];
    this.lightSources = new Map();
    this.artificialLight = new Map();
    this.indicator = this.player.hasTag("lightlevelindicator:show_light_level") ? this.player.hasTag("lightlevelindicator:show_sky_light_level") ? 2 : 0 : this.player.hasTag("lightlevelindicator:show_sky_light_level") ? 1 : 0;
  }
  // Update block lighting infomation
  update(){
    this.validBlocks = this.findValidBlocks(shapeOffsets, this.dimension, this.location);
  }
  // Update emitter block lighting infomation
  updateEmitter(){
    if(this.dimension.id==="minecraft:overworld" && this.sky_light===true && settings["lightlevelindicator:emitter_calulations"]===1) this.updateLightSources(this.location);
    //Mc.world.sendMessage(`${this.artificialLight.size} ${this.lightSources.size}`)
  }
  // Render particle on all blocks which are valid solid blocks
  render() {
    for (const block of this.validBlocks){
      const molang = new Mc.MolangVariableMap();
      const key = `${block.x},${block.y},${block.z}`;
      let color = 0
      // Apply color rules to particles to indacate if mobs can spawn on a block
      if (this.dimension.id === "minecraft:overworld" && settings["lightlevelindicator:emitter_calulations"]===1 && this.sky_light===true) {
        if (block.light_level === 0) {molang.setColorRGB("variable.color", settings["lightlevelindicator:color_dangerous"]);color=2;}
        else if (this.artificialLight.has(key)) {molang.setColorRGB("variable.color", settings["lightlevelindicator:color_safe"]);color=0;}
        else if (block.light_level >= 1) {molang.setColorRGB("variable.color", settings["lightlevelindicator:color_unsafe"]);color=1;}
      }
      else if (this.dimension.id === "minecraft:overworld"){
        if (block.light_level === 0) {molang.setColorRGB("variable.color", settings["lightlevelindicator:color_dangerous"]);color=2;}
        else if (block.light_level-block.sky_light_level>=1) {molang.setColorRGB("variable.color", settings["lightlevelindicator:color_safe"]);color=0;}
        else if (block.light_level >= 1 && block.sky_light_level<=7) {molang.setColorRGB("variable.color", settings["lightlevelindicator:color_unsafe"]);color=1;}
        else {molang.setColorRGB("variable.color", settings["lightlevelindicator:color_unsafe"]);color=1;}
      }
      else if(this.dimension.id === "minecraft:nether"){
        if (block.light_level <= 11) {molang.setColorRGB("variable.color", settings["lightlevelindicator:color_dangerous"]);color=2;}
        else if (block.light_level > 11) {molang.setColorRGB("variable.color", settings["lightlevelindicator:color_safe"]);color=0;}
      }
      else if(this.dimension.id === "minecraft:the_end"){
        if (block.light_level === 0) {molang.setColorRGB("variable.color", settings["lightlevelindicator:color_dangerous"]);color=2;}
        else if (block.light_level >= 1) {molang.setColorRGB("variable.color", settings["lightlevelindicator:color_safe"]);color=0;}
      }
      // Disable certain colors from rendering
      if(color===0 && settings["lightlevelindicator:render_safe_blocks"]===0) continue;
      if(color===1 && settings["lightlevelindicator:render_unsafe_blocks"]===0) continue;
      if(color===2 && settings["lightlevelindicator:render_dangerous_blocks"]===0) continue;

      // Apply additional particle adjustments and render particle to a specific player based on picked style
      if(this.indicator===0) molang.setFloat("variable.index", block.light_level);
      if(this.indicator===1) molang.setFloat("variable.index", block.sky_light_level);
      molang.setFloat("variable.scale", settings["lightlevelindicator:scale"]);
      molang.setFloat("variable.life", settings["lightlevelindicator:particle_lifetime"]/20);
      const pos = {x: block.x + 0.5, y: block.y + settings["lightlevelindicator:y_offset"], z: block.z + 0.5};
      if(this.indicator===0) this.player.spawnParticle(settings["lightlevelindicator:style"] === 0 ? "light_light_indicator:light_level" : "light_light_indicator:light_level_flat",pos, molang);
      else if(this.indicator===1) this.player.spawnParticle(settings["lightlevelindicator:style"] === 0 ? "light_light_indicator:sky_light_level" : "light_light_indicator:sky_light_level_flat",pos, molang);
      else if(this.indicator===2){
        pos.z-=0.2;
          molang.setFloat("variable.index", block.light_level);
          this.player.spawnParticle(settings["lightlevelindicator:style"] === 0 ? "light_light_indicator:light_level" : "light_light_indicator:light_level_flat",pos, molang);
          pos.z+=0.4;
          molang.setFloat("variable.index", block.sky_light_level);
          this.player.spawnParticle(settings["lightlevelindicator:style"] === 0 ? "light_light_indicator:sky_light_level" : "light_light_indicator:sky_light_level_flat",pos, molang);
      }
    }
  }
  // Creates a list of light source that are used to correctly detect if a block is safe
getEmission(block){
  this._emissionCache ??= new WeakMap();
  const perm = block.permutation;
  let level = this._emissionCache.get(perm);
  if(level !== undefined) return level;

  level = 0;
  const data = lightEmittingBlocks[block.typeId];
  if(data !== undefined){
    if(typeof data !== "object") level = data;
    else{
      const states = perm.getAllStates();
      for(const k in data){
        const v = data[k];
        let ok = true;
        for(const s in v){
          if(states[s] !== v[s]){ ok = false; break; }
        }
        if(ok){ level = +k; break; }
      }
    }
  }
  this._emissionCache.set(perm, level);
  return level;
}

updateLightSources(center){
  let blocks;
  const maxDistance =
    settings["lightlevelindicator:horizontal_scan_distance"] +
    settings["lightlevelindicator:emitter_extended_length"];

  const min = {x:center.x-maxDistance,y:center.y-maxDistance,z:center.z-maxDistance};
  const max = {x:center.x+maxDistance,y:center.y+maxDistance,z:center.z+maxDistance};

  if(min.y < this.hight_min) min.y = this.hight_min;
  if(max.y > this.hight_max) max.y = this.hight_max;

  try{
    blocks = this.dimension.getBlocks(
      new Mc.BlockVolume(min,max),
      {includeTypes: lightBlockIds},
      true
    );
  }catch{ return; }

  this._nextSources ??= new Map();
  const newSources = this._nextSources;
  newSources.clear();

  for(const loc of blocks.getBlockLocationIterator()){
    const block = this.dimension.getBlock(loc);
    if(!block) continue;

    const level = this.getEmission(block);
    if(!level || !lightFloodFillOffsets[level]) continue;

    newSources.set(this.pack(loc.x,loc.y,loc.z), { loc, level });
  }

  const oldSources = this.lightSources;

  for(const [key, source] of oldSources){
    if(!newSources.has(key)){
      const b = source.loc;
      for(const [ox,oy,oz] of lightFloodFillOffsets[source.level]){
        const k = this.pack(b.x+ox,b.y+oy,b.z+oz);
        const c = this.artificialLight.get(k);
        if(c <= 1) this.artificialLight.delete(k);
        else this.artificialLight.set(k, c-1);
      }
    }
  }

  for(const [key, source] of newSources){
    if(!oldSources.has(key)){
      const b = source.loc;
      for(const [ox,oy,oz] of lightFloodFillOffsets[source.level]){
        const k = this.pack(b.x+ox,b.y+oy,b.z+oz);
        this.artificialLight.set(k, (this.artificialLight.get(k) ?? 0) + 1);
      }
    }
  }

  this.lightSources = newSources;
  this._nextSources = oldSources;
}



  // Packs locations into more efficent format
  pack(x,y,z){return (x & 0x3FFFFFF) << 38 | (y & 0xFFF) << 26 | (z & 0x3FFFFFF);}

  // Calulate light levels of blocks within players range
  findValidBlocks(points, dimension, center) {
    this.sky_light = false;
    const validBlocks = [];
    const transparentSet = transparentBlocksSet;
    const blockCache = new Map();

    // Make bit key to incress speed
    function getBlockCached(x, y, z) {
      const key = (x << 20) ^ (y << 10) ^ z;
      let block = blockCache.get(key);
      if (block === undefined) {
        block = dimension.getBlock({ x, y, z }) ?? null;
        blockCache.set(key, block);
      }
      return block;
    }
    const cx = center.x;const cy = center.y;const cz = center.z;

    // Iterate numeric offsets (NO string parsing)
    for (let i = 0; i < points.length; i++) {
      const dx = points[i][0];const dy = points[i][1];const dz = points[i][2];
      const x = cx + dx;let y = cy + dy;const z = cz + dz;
      if(y < this.hight_min) y = this.hight_min; if(y > this.hight_max) y = this.hight_max;
      // Check block conditions
      const airBlock = getBlockCached(x, y, z);
      if (!airBlock || !transparentSet.has(airBlock.typeId)) continue;
      const belowBlock = getBlockCached(x, y - 1, z);
      if (!belowBlock || transparentSet.has(belowBlock.typeId)) continue;
      // If conditions passed find light levels and push data to array
      const sky = airBlock.getSkyLightLevel();
      if (!this.sky_light && sky > 0) this.sky_light = true;
      let level = 0;
      const data = lightEmittingBlocks[belowBlock.typeId];
      if (data !== undefined) {
        if (typeof data !== "object") level = data;
        else {
          const blockStates = belowBlock.permutation.getAllStates();
          for(const [key,value] of Object.entries(data)){
            let match = true;
            for(let k in value) if(!(k in blockStates) || value[k] !== blockStates[k]) { match = false; break; }
            if(match) { level = parseInt(key); break; }
          }
        }
      }
      validBlocks.push({x, y, z,light_level: Math.max(airBlock.getLightLevel(), level),sky_light_level: sky});
    }
    return validBlocks;
}
}

// During the specifiyed run interval update and render light levels specific players, at each specifyed interval
Mc.system.runInterval(()=>{
  light_detector++; 
  // Update light levels, timer
  if(light_detector>=settings["lightlevelindicator:update_interval"]) {
    light_detector=0;
      // Every new scan get all players who light levels will be showed to
      players = [
        ...Mc.world.getPlayers({ tags: ["lightlevelindicator:show_light_level"] }),
        ...Mc.world.getPlayers({ tags: ["lightlevelindicator:show_sky_light_level"] })
      ];
      // For every player add them to the LightLevelState class if they are not already and update light levels
      for(const player of players){
        let state=playerStates.get(player.id);
          if(!state){state=new LightLevelState(player);playerStates.set(player.id,state)};
          const loc=player.location;
          loc.x=Math.floor(loc.x);loc.y=Math.floor(loc.y);loc.z=Math.floor(loc.z);
          state.location=loc;
          state.update();
          //state.render();
    }
  }
  light_render++; 
  // Render particles, timer
  if(light_render>=settings["lightlevelindicator:particle_interval"]) {
    light_render=0;
    for(const player of players){
        let state=playerStates.get(player.id);
          if(!state){state=new LightLevelState(player);playerStates.set(player.id,state)};
          state.render();
    }
  }
  // Update emitter blocks, timer
  if(settings["lightlevelindicator:emitter_calulations"]===1){
    light_emitter++; 
      if(light_emitter>=settings["lightlevelindicator:emitter_update_interval"]) {
        light_emitter=0;
        for(const player of players){
          let state=playerStates.get(player.id);
          if(!state){state=new LightLevelState(player);playerStates.set(player.id,state)};
          state.updateEmitter();
        }
      }
    }
},1)

// For quick updates update lightSources whenever a light source is placed or broken
Mc.world.afterEvents.playerPlaceBlock.subscribe((eventData)=>{
  let state=playerStates.get(eventData.player.id);
  if(!state){state=new LightLevelState(eventData.player);playerStates.set(eventData.player.id,state)};
  state.updateEmitter();
  state.update();
},{blockTypes:lightBlockIds})
Mc.world.afterEvents.playerBreakBlock.subscribe((eventData)=>{
  let state=playerStates.get(eventData.player.id);
  if(!state){state=new LightLevelState(eventData.player);playerStates.set(eventData.player.id,state)};
  state.updateEmitter();
  state.update();
},{blockTypes:lightBlockIds})

// For dimension changes track dimension changes and dimension hight changes using playerDimensionChange event
Mc.world.afterEvents.playerDimensionChange.subscribe((eventData)=>{
  let state=playerStates.get(eventData.player.id);
  if(!state) return;
  state.dimension=eventData.player.dimension;
  state.hight_min=state.dimension.heightRange.min+1;
  state.hight_max=state.dimension.heightRange.max-1;
})