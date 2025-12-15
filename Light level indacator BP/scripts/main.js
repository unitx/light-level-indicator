import * as Mc from "@minecraft/server";
import * as Ui from "@minecraft/server-ui";
import { defaultSettings, lightEmittingBlocks, transparentBlocks } from "./settings.js";
const settings = { ...defaultSettings };
let light_detector = 0;
let light_emitter = 0;
let light_render = 0;
let players=[];

// To incress preformence pre-calulate diamond shape arrays
const shape=generatePoints(settings["light_level_indacator:horizontal_scan_distance"],settings["light_level_indacator:vertical_scan_distance"]);
const light_flood_fill={};
for(let i=1;i<=15;i++) light_flood_fill[i]=generatePoints(i,i);
const lightBlockIds=Object.keys(lightEmittingBlocks);
const transparentBlocksSet = new Set(transparentBlocks);
// Pre-calulate parsing operations for single diamond and diamond sizes 1-15 for flood filling
const shapeOffsets = Array.from(shape, s => {
  const i1 = s.indexOf(",");
  const i2 = s.lastIndexOf(",");
  return [Number(s.slice(0, i1)),Number(s.slice(i1 + 1, i2)),Number(s.slice(i2 + 1))];
});
const lightFloodFillOffsets = {};
for (let i = 1; i <= 15; i++) {
  const set = generatePoints(i, i);
  lightFloodFillOffsets[i] = Array.from(set, s => {
    const i1 = s.indexOf(",");
    const i2 = s.lastIndexOf(",");
    return [Number(s.slice(0, i1)),Number(s.slice(i1 + 1, i2)),Number(s.slice(i2 + 1))];
  });
}

// Generates the points for the standard shape that light follows (diamond)
function generatePoints(horizontal, vertical, step=1){
  const points=[];
  for(let x=-horizontal;x<=horizontal;x+=step)
    for(let y=-vertical;y<=vertical;y+=step)
      for(let z=-horizontal;z<=horizontal;z+=step)
        if(Math.abs(x)+Math.abs(y)+Math.abs(z)<=horizontal)
          points.push(`${x},${y},${z}`);
  return new Set(points);
}
const playerStates=new Map();

// Commands to toggle between light modes and to change settings
Mc.system.beforeEvents.startup.subscribe((eventData) => {
    eventData.customCommandRegistry.registerCommand({
        name: "light_level_indacator:toggle",
        description: "Test.",
        permissionLevel: Mc.CommandPermissionLevel.Any,
        cheatsRequired: false,
        optionalParameters: [
            { type: Mc.CustomCommandParamType.Boolean, name: "sky light level" },
        ]
    },
    (data, parmas) => {
        Mc.system.run(() => {
            if(!data.sourceEntity||data.sourceEntity.typeId!=="minecraft:player") return;
            if(parmas!==undefined && parmas===true){
              if(data.sourceEntity.hasTag("light_level_indacator:show_sky_light_level")) data.sourceEntity.removeTag("light_level_indacator:show_sky_light_level");
              else data.sourceEntity.addTag("light_level_indacator:show_sky_light_level");
            }
            else{
              if(data.sourceEntity.hasTag("light_level_indacator:show_light_level")) data.sourceEntity.removeTag("light_level_indacator:show_light_level");
              else data.sourceEntity.addTag("light_level_indacator:show_light_level");
            }
              let state=playerStates.get(data.sourceEntity.id);
              if(!state){state=new LightLevelState(data.sourceEntity);playerStates.set(data.sourceEntity.id,state)};
              state.indicator=data.sourceEntity.hasTag("light_level_indacator:show_light_level") ? data.sourceEntity.hasTag("light_level_indacator:show_sky_light_level") ? 2 : 0 : data.sourceEntity.hasTag("light_level_indacator:show_sky_light_level") ? 1 : 0;
        })
    })

    eventData.customCommandRegistry.registerCommand({
        name: "light_level_indacator:settings",
        description: "Test.",
        permissionLevel: Mc.CommandPermissionLevel.Any,
        cheatsRequired: false,
        optionalParameters: [
            { type: Mc.CustomCommandParamType.Boolean, name: "advanced" },
        ]
    },
    (data,parmas) => {
        Mc.system.run(() => {
            if(!data.sourceEntity||data.sourceEntity.typeId!=="minecraft:player") return;
            const form = new Ui.ModalFormData();
            form.textField("scale","Recommended value: 0.1-3",{defaultValue:settings["light_level_indacator:scale"].toString(),tooltip:"This dertmines the sizes of particles which are displayed."});
            form.toggle("Flat style particle",{defaultValue:Boolean(settings["light_level_indacator:style"]),tooltip:"This swiches between a flat style particle and a particle which faces the player."});
            form.slider("Horizontal scan distance",3,50,{defaultValue:settings["light_level_indacator:horizontal_scan_distance"],tooltip:"This determines how far out to calulate block light levels."});
            form.slider("Vertical scan distance",1,20,{defaultValue:settings["light_level_indacator:vertical_scan_distance"],tooltip:"This determines how high/low to calulate block light levels."});
            form.slider("Update interval (ticks)",1,200,{defaultValue:settings["light_level_indacator:update_interval"],tooltip:"This determines how often scan for light levels."});
            form.slider("Refresh interval (ticks)",1,200,{defaultValue:settings["light_level_indacator:emitter_refresh_interval"],tooltip:"This determines how often the paricles last and are updated."});
            
           if(parmas!==undefined && parmas===true){
            form.divider();
            form.label("§lDanger color (rgb):");
            form.slider("red",0,255,{defaultValue:Math.round(settings["light_level_indacator:color_dangrus"].red*255),tooltip:"Sets the red color of the rbg danger color"});
            form.slider("green",0,255,{defaultValue:Math.round(settings["light_level_indacator:color_dangrus"].green*255),tooltip:"Sets the green color of the rbg danger color"});
            form.slider("blue",0,255,{defaultValue:Math.round(settings["light_level_indacator:color_dangrus"].blue*255),tooltip:"Sets the blue color of the rbg danger color"});
            form.divider();
            form.label("§lUnsafe color (rgb):");
            form.slider("red",0,255,{defaultValue:Math.round(settings["light_level_indacator:color_unsafe"].red*255),tooltip:"Sets the red color of the rbg unsafe color"});
            form.slider("green",0,255,{defaultValue:Math.round(settings["light_level_indacator:color_unsafe"].green*255),tooltip:"Sets the green color of the rbg unsafe color"});
            form.slider("blue",0,255,{defaultValue:Math.round(settings["light_level_indacator:color_unsafe"].blue*255),tooltip:"Sets the blue color of the rbg unsafe color"});
            form.divider();
            form.label("§lSafe color (rgb):");
            form.slider("red",0,255,{defaultValue:Math.round(settings["light_level_indacator:color_safe"].red*255),tooltip:"Sets the red color of the rbg safe color"});
            form.slider("green",0,255,{defaultValue:Math.round(settings["light_level_indacator:color_safe"].green*255),tooltip:"Sets the green color of the rbg safe color"});
            form.slider("blue",0,255,{defaultValue:Math.round(settings["light_level_indacator:color_safe"].blue*255),tooltip:"Sets the blue color of the rbg safe color"});
           }
            
            form.show(data.sourceEntity).then((response)=>{
                
            })
        })
    })
})

// Update settings object to include any changes made
function updateSettings(){
    for(const [key,value] of Object.entries(settings)){
        settings[key]=value;
    }
}

// Class which handles all light indacator operations
class LightLevelState {
  // Player constructor to hold each players light infomation if light level indacator is enabled
  constructor(player){
    this.player = player;
    this.location = player.location;
    this.dimension = player.dimension;
    this.sky_light=false;
    this.validBlocks = [];
    this.lightSources = new Map();
    this.artificialLight = new Map();
    this.indicator = this.player.hasTag("light_level_indacator:show_light_level") ? this.player.hasTag("light_level_indacator:show_sky_light_level") ? 2 : 0 : this.player.hasTag("light_level_indacator:show_sky_light_level") ? 1 : 0;
  }
  // Update block lighting infomation
  update(){
    this.dimension = this.player.dimension;
    this.validBlocks = this.findValidBlocks(shapeOffsets, this.dimension, this.location);
  }
  // Update emitter block lighting infomation
  updateEmitter(){
    if(this.dimension.id==="minecraft:overworld" && this.sky_light===true) this.updateLightSources(this.location);
    Mc.world.sendMessage(`${this.artificialLight.size} ${this.lightSources.size}`)
  }
  // Render particle on all blocks which are valid solid blocks
  render() {
    for (const block of this.validBlocks){
      const molang = new Mc.MolangVariableMap();
      const key = `${block.x},${block.y},${block.z}`;
      let color = 0
      // Apply color rules to particles to indacate if mobs can spawn on a block
      if (this.dimension.id === "minecraft:overworld" && settings["light_level_indacator:emitter_calulations"]===1 && this.sky_light===true) {
        if (block.light_level === 0) {molang.setColorRGB("variable.color", settings["light_level_indacator:color_dangrus"]);color=2}
        else if (this.artificialLight.has(key)) {molang.setColorRGB("variable.color", settings["light_level_indacator:color_safe"]);color=0}
        else if (block.light_level >= 1) {molang.setColorRGB("variable.color", settings["light_level_indacator:color_unsafe"]);color=1}
      }
      else if (this.dimension.id === "minecraft:overworld"){
        if (block.light_level === 0) {molang.setColorRGB("variable.color", settings["light_level_indacator:color_dangrus"]);color=2}
        else if (block.light_level-block.sky_light_level>=1) {molang.setColorRGB("variable.color", settings["light_level_indacator:color_safe"]);color=0}
        else if (block.light_level >= 1 && block.sky_light_level<=7) {molang.setColorRGB("variable.color", settings["light_level_indacator:color_unsafe"]);color=1}
      }
      else if(this.dimension.id === "minecraft:nether"){
        if (block.light_level <= 11) {molang.setColorRGB("variable.color", settings["light_level_indacator:color_dangrus"]);color=2}
        else if (block.light_level > 11) {molang.setColorRGB("variable.color", settings["light_level_indacator:color_safe"]);color=0}
      }
      else if(this.dimension.id === "minecraft:the_end"){
        if (block.light_level === 0) {molang.setColorRGB("variable.color", settings["light_level_indacator:color_dangrus"]);color=2}
        else if (block.light_level >= 1) {molang.setColorRGB("variable.color", settings["light_level_indacator:color_safe"]);color=0}
      }
      // Disable certain colors from rendering
      if(color===0 && settings["light_level_indacator:render_safe_blocks"]===0) continue;
      if(color===1 && settings["light_level_indacator:render_unsafe_blocks"]===0) continue;
      if(color===2 && settings["light_level_indacator:render_dangrus_blocks"]===0) continue;

      // Apply additional particle adjustments and render particle to a specific player based on picked style
      molang.setFloat("variable.index", block.light_level);
      molang.setFloat("variable.scale", settings["light_level_indacator:scale"]);
      molang.setFloat("variable.life", settings["light_level_indacator:emitter_lifetime"]/20);
      const pos = {x: block.x + 0.5, y: block.y + settings["light_level_indacator:y_offset"], z: block.z + 0.5};
      if(this.indicator===0) this.player.spawnParticle(settings["light_level_indacator:style"] === 0 ? "light_light_indacator:light_level" : "light_light_indacator:light_level_flat",pos, molang);
      else if(this.indicator===1) this.player.spawnParticle(settings["light_level_indacator:style"] === 0 ? "light_light_indacator:sky_light_level" : "light_light_indacator:sky_light_level_flat",pos, molang);
      else if(this.indicator===2){
        pos.z-=0.2;
          this.player.spawnParticle(settings["light_level_indacator:style"] === 0 ? "light_light_indacator:light_level" : "light_light_indacator:light_level_flat",pos, molang);
          pos.z+=0.4;
          molang.setFloat("variable.index", block.sky_light_level);
          this.player.spawnParticle(settings["light_level_indacator:style"] === 0 ? "light_light_indacator:sky_light_level" : "light_light_indacator:sky_light_level_flat",pos, molang);
      }
    }
  }

  updateLightSources(center){
    const maxDistance = settings["light_level_indacator:horizontal_scan_distance"] + settings["light_level_indacator:emitter_extended_length"];
    const min = {x: center.x - maxDistance, y: center.y - maxDistance, z: center.z - maxDistance};
    const max = {x: center.x + maxDistance, y: center.y + maxDistance, z: center.z + maxDistance};
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
      const x = cx + dx;const y = cy + dy;const z = cz + dz;

      // Check block conditions
      const airBlock = getBlockCached(x, y, z);
      if (!airBlock || !transparentSet.has(airBlock.typeId)) continue;
      const belowBlock = getBlockCached(x, y - 1, z);
      if (!belowBlock || transparentSet.has(belowBlock.typeId)) continue;
      // If conditions passed find light levels and push data to array
      const sky = airBlock.getSkyLightLevel();
      if (!this.sky_light && sky > 0) this.sky_light = true;
      validBlocks.push({x, y, z,light_level:lightEmittingBlocks[belowBlock.typeId] ?? airBlock.getLightLevel(),sky_light_level: sky});
    }
    return validBlocks;
}


}

// During the specifiyed run interval update and render light levels specific players, at each specifyed interval
Mc.system.runInterval(()=>{
  light_detector+=1; 
    if(light_detector>=settings["light_level_indacator:update_interval"]) {
      light_detector=0;
        players = [
          ...Mc.world.getPlayers({ tags: ["light_level_indacator:show_light_level"] }),
          ...Mc.world.getPlayers({ tags: ["light_level_indacator:show_sky_light_level"] })
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
  if(light_detector>=settings["light_level_indacator:emitter_refresh_interval"]) {
    light_render=0;
      for(const player of players){
          let state=playerStates.get(player.id);
            if(!state){state=new LightLevelState(player);playerStates.set(player.id,state)};
            state.render();
      }
  }
  if(settings["light_level_indacator:emitter_calulations"]===1){
    light_emitter+=1; 
      if(light_emitter>=settings["light_level_indacator:emitter_update_interval"]) {
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