import * as Mc from "@minecraft/server";
import * as Ui from "@minecraft/server-ui";
import { defaultSettings, lightEmittingBlocks, transparentBlocks } from "./settings.js";
// Define global variables
let settings = { ...defaultSettings };
let light_detector = 0; let light_emitter = 0; let light_render = 0; let players=[];
let shape, shapeOffsets;
const light_flood_fill = {};
const lightFloodFillOffsets = {};

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
        else if(key ==="light_level_indicator:color_dangrus" || key==="light_level_indicator:color_unsafe" || key==="light_level_indicator:color_safe"){
          const values = value.split(","); settings[key] = { red: Number(values[0])/255, green: Number(values[1])/255, blue: Number(values[2])/255 };
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
  shape = generatePoints(settings["light_level_indicator:horizontal_scan_distance"], settings["light_level_indicator:vertical_scan_distance"]);
	for (let i = 1; i <= 15; i++) light_flood_fill[i] = generatePoints(i, i);
	  shapeOffsets = Array.from(shape, s => {
		const i1 = s.indexOf(",");
		const i2 = s.lastIndexOf(",");
		return [Number(s.slice(0, i1)), Number(s.slice(i1 + 1, i2)), Number(s.slice(i2 + 1))];
	});
	for (let i = 1; i <= 15; i++) {
		const set = generatePoints(i, i);
		lightFloodFillOffsets[i] = Array.from(set, s => {
			const i1 = s.indexOf(",");
			const i2 = s.lastIndexOf(",");
			return [Number(s.slice(0, i1)), Number(s.slice(i1 + 1, i2)), Number(s.slice(i2 + 1))];
		});
	}
}



export const formConfig = [
    { type:"label", label: "light_level_indicator.scan_distance_label" },
    { type: "slider", label: "light_level_indicator.horizontal_scan_distance", key: "light_level_indicator:horizontal_scan_distance", tooltip: "light_level_indicator.horizontal_scan_distance.tooltip", min: 3, max: 50 },
    { type: "slider", label: "light_level_indicator.vertical_scan_distance", key: "light_level_indicator:vertical_scan_distance", tooltip: "light_level_indicator.vertical_scan_distance.tooltip", min: 1, max: 20 },
    { type: "toggle", label: "light_level_indicator.advanced.emitter_calulations", key: "light_level_indicator:emitter_calulations", tooltip: "light_level_indicator.advanced.emitter_calulations.tooltip", advanced: true },
    { type: "slider", label: "light_level_indicator.advanced.emitter_extended_length", key: "light_level_indicator:emitter_extended_length", tooltip: "light_level_indicator.advanced.emitter_extended_length.tooltip", min: 1, max: 15, advanced: true },
    { type:"divider"  },

    { type:"label", label: "light_level_indicator.interval_label" },
    { type: "slider", label: "light_level_indicator.update_interval", key: "light_level_indicator:update_interval", tooltip: "light_level_indicator.update_interval.tooltip", min: 1, max: 200 },
    { type: "slider", label: "light_level_indicator.particle_interval", key: "light_level_indicator:particle_interval", tooltip: "light_level_indicator.particle_interval.tooltip", min: 1, max: 200 },
    { type: "slider", label: "light_level_indicator.advanced.particle_lifetime", key: "light_level_indicator:particle_lifetime", tooltip: "light_level_indicator.advanced.particle_lifetime.tooltip", min: 1, max: 200, advanced: true },
    { type: "slider", label: "light_level_indicator.advanced.emitter_update_interval", key: "light_level_indicator:emitter_update_interval", tooltip: "light_level_indicator.advanced.emitter_update_interval.tooltip", min: 1, max: 200, advanced: true },
    { type:"divider"  },

    { type:"label", label: "light_level_indicator.style_label" },
    { type: "toggle", label: "light_level_indicator.style", key: "light_level_indicator:style", tooltip: "light_level_indicator.style.tooltip" },
    { type: "text", label: "light_level_indicator.scale", key: "light_level_indicator:scale", tooltip: "light_level_indicator.scale.tooltip", min: 0.1, max: 3 },
    { type: "text", label: "light_level_indicator.y_offset", key: "light_level_indicator:y_offset", tooltip: "light_level_indicator.y_offset.tooltip", min: -1, max: 1 },
    { type: "toggle", label: "light_level_indicator.render_safe_blocks", key: "light_level_indicator:render_safe_blocks", tooltip: "light_level_indicator.render_safe_blocks.tooltip" },
    { type: "toggle", label: "light_level_indicator.render_unsafe_blocks", key: "light_level_indicator:render_unsafe_blocks", tooltip: "light_level_indicator.render_unsafe_blocks.tooltip" },
    { type: "toggle", label: "light_level_indicator.render_dangrus_blocks", key: "light_level_indicator:render_dangrus_blocks", tooltip: "light_level_indicator.render_dangrus_blocks.tooltip" },
    { type: "color", label: "light_level_indicator.advanced.color_dangrus", key: "light_level_indicator:color_dangrus", tooltip: "light_level_indicator.advanced.color_dangrus.tooltip", advanced: true },
    { type: "color", label: "light_level_indicator.advanced.color_unsafe", key: "light_level_indicator:color_unsafe", tooltip: "light_level_indicator.advanced.color_unsafe.tooltip", advanced: true },
    { type: "color", label: "light_level_indicator.advanced.color_safe", key: "light_level_indicator:color_safe", tooltip: "light_level_indicator.advanced.color_safe.tooltip", advanced: true },
];


function showSettingsForm(player, advancedMode, reset) {
  let localSettings 
  if(reset) localSettings= { ...defaultSettings };
  else localSettings= { ...settings };
  const form = new Ui.ModalFormData();
  let visibleFields = [...formConfig.filter(f => !f.advanced || advancedMode)];
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
                form.slider({ translate: "light_level_indicator.red_label" },0, 255,{ defaultValue: Math.floor(color.red * 255), tooltip });
                form.slider({ translate: "light_level_indicator.green_label" },0, 255,{ defaultValue: Math.floor(color.green * 255) });
                form.slider({ translate: "light_level_indicator.blue_label" },0, 255,{ defaultValue: Math.floor(color.blue * 255) });
                break;
            case "divider":
                form.divider();
                break;
            case "label":
                form.label(label);
                break;
        }
    }
    form.show(player).then(response => {
        let idx = 0;
        for (const field of visibleFields) {
            switch (field.type) {
                case "text": {
                    const v = response.formValues[idx++];
                    const n = Number(v);
                    if (!isNaN(n)) settings[field.key] = n;
                    break;
                }
                case "color":
                    idx+=2;
                    settings[field.key].red = response.formValues[idx++] / 255;
                    settings[field.key].green = response.formValues[idx++] / 255;
                    settings[field.key].blue = response.formValues[idx++] / 255;
                  break;
                case "toggle":
                    settings[field.key] = response.formValues[idx++] ? 1 : 0;
                    break;
                case "slider":
                    settings[field.key] = response.formValues[idx++];
                    break;
                case "divider":
                  idx++;
                    break;
                case "label":
                  idx++;
                  break;
            }
        }
        for (const [key, value] of Object.entries(settings)) {
          if(key ==="light_level_indicator:color_dangrus" || key==="light_level_indicator:color_unsafe" || key==="light_level_indicator:color_safe"){
            const newValue = `${Math.floor(value.red*255)},${Math.floor(value.green*255)},${Math.floor(value.blue*255)}`;
            Mc.world.setDynamicProperty(key, newValue);
          }
          else Mc.world.setDynamicProperty(key, value);
        }
        preCalulations();
    });
}







// Commands to toggle between light modes and to change settings
Mc.system.beforeEvents.startup.subscribe((eventData) => {
    eventData.customCommandRegistry.registerCommand({
        name: "light_level_indicator:toggle",
        description: "Toggle the light level indicator to view light levels, sky light levels, and spawn spots.",
        permissionLevel: Mc.CommandPermissionLevel.Any,
        cheatsRequired: false,
        optionalParameters: [
            { type: Mc.CustomCommandParamType.Boolean, name: "Sky light level" },
        ]
    },
    (data, parmas) => {
        Mc.system.run(() => {
            if(!data.sourceEntity||data.sourceEntity.typeId!=="minecraft:player") return;
            if(parmas!==undefined && parmas===true){
              if(data.sourceEntity.hasTag("light_level_indicator:show_sky_light_level")) data.sourceEntity.removeTag("light_level_indicator:show_sky_light_level");
              else data.sourceEntity.addTag("light_level_indicator:show_sky_light_level");
            }
            else{
              if(data.sourceEntity.hasTag("light_level_indicator:show_light_level")) data.sourceEntity.removeTag("light_level_indicator:show_light_level");
              else data.sourceEntity.addTag("light_level_indicator:show_light_level");
            }
              let state=playerStates.get(data.sourceEntity.id);
              if(!state){state=new LightLevelState(data.sourceEntity);playerStates.set(data.sourceEntity.id,state)};
              state.indicator=data.sourceEntity.hasTag("light_level_indicator:show_light_level") ? data.sourceEntity.hasTag("light_level_indicator:show_sky_light_level") ? 2 : 0 : data.sourceEntity.hasTag("light_level_indicator:show_sky_light_level") ? 1 : 0;
        })
    })

    eventData.customCommandRegistry.registerCommand({
        name: "light_level_indicator:settings",
        description: "Adjust the settings of the light level indicator addon.",
        permissionLevel: Mc.CommandPermissionLevel.Admin,
        cheatsRequired: false,
        optionalParameters: [
            { type: Mc.CustomCommandParamType.Boolean, name: "Advanced settings" },
            { type: Mc.CustomCommandParamType.Boolean, name: "Reset settings" },
        ]
    },
    (data,advanced,reset) => {
        Mc.system.run(() => {
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
    this.indicator = this.player.hasTag("light_level_indicator:show_light_level") ? this.player.hasTag("light_level_indicator:show_sky_light_level") ? 2 : 0 : this.player.hasTag("light_level_indicator:show_sky_light_level") ? 1 : 0;
  }
  // Update block lighting infomation
  update(){
    this.dimension = this.player.dimension;
    this.hight_min=this.dimension.heightRange.min+1
    this.hight_max=this.dimension.heightRange.max-1
    this.validBlocks = this.findValidBlocks(shapeOffsets, this.dimension, this.location);
  }
  // Update emitter block lighting infomation
  updateEmitter(){
    if(this.dimension.id==="minecraft:overworld" && this.sky_light===true) this.updateLightSources(this.location);
    //Mc.world.sendMessage(`${this.artificialLight.size} ${this.lightSources.size}`)
  }
  // Render particle on all blocks which are valid solid blocks
  render() {
    for (const block of this.validBlocks){
      const molang = new Mc.MolangVariableMap();
      const key = `${block.x},${block.y},${block.z}`;
      let color = 0
      // Apply color rules to particles to indacate if mobs can spawn on a block
      if (this.dimension.id === "minecraft:overworld" && settings["light_level_indicator:emitter_calulations"]===1 && this.sky_light===true) {
        if (block.light_level === 0) {molang.setColorRGB("variable.color", settings["light_level_indicator:color_dangrus"]);color=2}
        else if (this.artificialLight.has(key)) {molang.setColorRGB("variable.color", settings["light_level_indicator:color_safe"]);color=0}
        else if (block.light_level >= 1) {molang.setColorRGB("variable.color", settings["light_level_indicator:color_unsafe"]);color=1}
      }
      else if (this.dimension.id === "minecraft:overworld"){
        if (block.light_level === 0) {molang.setColorRGB("variable.color", settings["light_level_indicator:color_dangrus"]);color=2}
        else if (block.light_level-block.sky_light_level>=1) {molang.setColorRGB("variable.color", settings["light_level_indicator:color_safe"]);color=0}
        else if (block.light_level >= 1 && block.sky_light_level<=7) {molang.setColorRGB("variable.color", settings["light_level_indicator:color_unsafe"]);color=1}
      }
      else if(this.dimension.id === "minecraft:nether"){
        if (block.light_level <= 11) {molang.setColorRGB("variable.color", settings["light_level_indicator:color_dangrus"]);color=2}
        else if (block.light_level > 11) {molang.setColorRGB("variable.color", settings["light_level_indicator:color_safe"]);color=0}
      }
      else if(this.dimension.id === "minecraft:the_end"){
        if (block.light_level === 0) {molang.setColorRGB("variable.color", settings["light_level_indicator:color_dangrus"]);color=2}
        else if (block.light_level >= 1) {molang.setColorRGB("variable.color", settings["light_level_indicator:color_safe"]);color=0}
      }
      // Disable certain colors from rendering
      if(color===0 && settings["light_level_indicator:render_safe_blocks"]===0) continue;
      if(color===1 && settings["light_level_indicator:render_unsafe_blocks"]===0) continue;
      if(color===2 && settings["light_level_indicator:render_dangrus_blocks"]===0) continue;

      // Apply additional particle adjustments and render particle to a specific player based on picked style
      if(this.indicator===0) molang.setFloat("variable.index", block.light_level);
      if(this.indicator===1) molang.setFloat("variable.index", block.sky_light_level);
      molang.setFloat("variable.scale", settings["light_level_indicator:scale"]);
      molang.setFloat("variable.life", settings["light_level_indicator:particle_lifetime"]/20);
      const pos = {x: block.x + 0.5, y: block.y + settings["light_level_indicator:y_offset"], z: block.z + 0.5};
      if(this.indicator===0) this.player.spawnParticle(settings["light_level_indicator:style"] === 0 ? "light_light_indicator:light_level" : "light_light_indicator:light_level_flat",pos, molang);
      else if(this.indicator===1) this.player.spawnParticle(settings["light_level_indicator:style"] === 0 ? "light_light_indicator:sky_light_level" : "light_light_indicator:sky_light_level_flat",pos, molang);
      else if(this.indicator===2){
        pos.z-=0.2;
          molang.setFloat("variable.index", block.light_level);
          this.player.spawnParticle(settings["light_level_indicator:style"] === 0 ? "light_light_indicator:light_level" : "light_light_indicator:light_level_flat",pos, molang);
          pos.z+=0.4;
          molang.setFloat("variable.index", block.sky_light_level);
          this.player.spawnParticle(settings["light_level_indicator:style"] === 0 ? "light_light_indicator:sky_light_level" : "light_light_indicator:sky_light_level_flat",pos, molang);
      }
    }
  }

  updateLightSources(center){
    const maxDistance = settings["light_level_indicator:horizontal_scan_distance"] + settings["light_level_indicator:emitter_extended_length"];
    const min = {x: center.x - maxDistance, y: center.y - maxDistance, z: center.z - maxDistance};
    const max = {x: center.x + maxDistance, y: center.y + maxDistance, z: center.z + maxDistance};
    if(min.y < this.hight_min) min.y = this.hight_min; if(max.y > this.hight_max) max.y = this.hight_max;
    const blocks = this.dimension.getBlocks(new Mc.BlockVolume(min,max), {includeTypes: lightBlockIds});

    const newSources = new Map();
    for(const loc of blocks.getBlockLocationIterator()){
      const key = `${loc.x},${loc.y},${loc.z}`;
      const block = this.dimension.getBlock(loc);
      if(!block) continue;
      const level = lightEmittingBlocks[block.typeId];
      if(!level || !light_flood_fill[level]) continue;
      newSources.set(key, {loc, level});
    }

    
    for(const [key, source] of this.lightSources){
      if(!newSources.has(key)){
        const block = source.loc;
        for(const offsetStr of light_flood_fill[source.level]){
          const [ox, oy, oz] = offsetStr.split(',').map(Number);
          const bkey = `${block.x+ox},${block.y+oy},${block.z+oz}`;
          const count = this.artificialLight.get(bkey);
          if(count <= 1) this.artificialLight.delete(bkey);
          else if(count > 1) this.artificialLight.set(bkey, count-1);
        }
      }
    }
    for(const [key, source] of newSources){
      if(!this.lightSources.has(key)){
        const block = source.loc;
        for(const offsetStr of light_flood_fill[source.level]){
          const [ox, oy, oz] = offsetStr.split(',').map(Number);
          const bkey = `${block.x+ox},${block.y+oy},${block.z+oz}`;
          const prev = this.artificialLight.get(bkey) ?? 0;
          this.artificialLight.set(bkey, prev+1);
        }
      }
    }
    this.lightSources = newSources;
  }

  
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
      validBlocks.push({x, y, z,light_level: Math.max(airBlock.getLightLevel(), lightEmittingBlocks[belowBlock.typeId] ?? 0),sky_light_level: sky});
    }
    return validBlocks;
}


}

// During the specifiyed run interval update and render light levels specific players, at each specifyed interval
Mc.system.runInterval(()=>{
  light_detector+=1; 
    if(light_detector>=settings["light_level_indicator:update_interval"]) {
      light_detector=0;
        players = [
          ...Mc.world.getPlayers({ tags: ["light_level_indicator:show_light_level"] }),
          ...Mc.world.getPlayers({ tags: ["light_level_indicator:show_sky_light_level"] })
        ];
        for(const player of players){
          let state=playerStates.get(player.id);
            if(!state){state=new LightLevelState(player);playerStates.set(player.id,state)};
            const loc=player.location;
            loc.x=Math.floor(loc.x);loc.y=Math.floor(loc.y);loc.z=Math.floor(loc.z);
            state.location=loc;
            state.update();
            state.render();
      }
    }
    light_render+=1; 
  if(light_detector>=settings["light_level_indicator:particle_interval"]) {
    light_render=0;
      for(const player of players){
          let state=playerStates.get(player.id);
            if(!state){state=new LightLevelState(player);playerStates.set(player.id,state)};
            state.render();
      }
  }
  if(settings["light_level_indicator:emitter_calulations"]===1){
    light_emitter+=1; 
      if(light_emitter>=settings["light_level_indicator:emitter_update_interval"]) {
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