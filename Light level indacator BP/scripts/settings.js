export const defaultSettings={
    "light_level_indacator:scale":1,                                // Scale of particles
    "light_level_indacator:style":0,                                // Style of particles flat/facing
    "light_level_indacator:horizontal_scan_distance":16,            // xz distance to calulate light levels
    "light_level_indacator:vertical_scan_distance":6,               // y distance to calulate light levels                         
    "light_level_indacator:y_offset":0.1,                           // Particle offset from block
    "light_level_indacator:update_interval":10,                     // Period between scans inwhich to update blocks (ticks)
    "light_level_indacator:emitter_refresh_interval":40,            // Period between updates to the paricles (ticks)
    "light_level_indacator:emitter_lifetime":20,                    // Period between updates to the paricles (ticks)
    "light_level_indacator:color_dangrus":{red:1,green:0,blue:0},   // Color of spawnable blocks i.e. red (0-1 float)
    "light_level_indacator:color_unsafe":{red:1,green:1,blue:0},    // Color of partial spawnable blocks i.e. yellow (0-1 float)
    "light_level_indacator:color_safe":{red:0,green:1,blue:0},      // Color of non-spawnable blocks i.e. green (0-1 float)
    "light_level_indacator:emitter_calulations":0,                  // Should ~2x processing power be used to get the correct light level colors? Without it the game displays the wrong colors between green/yellow sometimes
    "light_level_indacator:emitter_update_interval":40,             // The rate to recalute emitter light producers
    "light_level_indacator:emitter_extended_length":15,             // To calulate the correct overworld lighting the game calulates light emitted from blocks, horizontal_scan_distance+emitter_extended_length is that distance
    "light_level_indacator:fade_with_distance": 1,                  // Fade particles with distance
    "light_level_indacator:render_safe_blocks":1,                   // Enable/Disable rendering of safe blocks
    "light_level_indacator:render_unsafe_blocks":1,                 // Enable/Disable rendering of unsafe blocks
    "light_level_indacator:render_dangrus_blocks":1,                // Enable/Disable rendering of dangrus blocks
}

export const lightEmittingBlocks = {
 "minecraft:furnace":13,
 "minecraft:blast_furnace":13,
 "minecraft:smoker":13,
 "minecraft:vault":12,

 "minecraft:candle": 12,
 "minecraft:black_candle": 12,
 "minecraft:blue_candle": 12,
 "minecraft:brown_candle": 12,
 "minecraft:cyan_candle": 12,
 "minecraft:gray_candle": 12,
 "minecraft:green_candle": 12,
 "minecraft:light_blue_candle": 12,
 "minecraft:light_gray_candle": 12,
 "minecraft:lime_candle": 12,
 "minecraft:magenta_candle": 12,
 "minecraft:orange_candle": 12,
 "minecraft:pink_candle": 12,
 "minecraft:purple_candle": 12,
 "minecraft:red_candle": 12,
 "minecraft:white_candle": 12,
 "minecraft:yellow_candle": 12,
 "minecraft:sculk_catalyst": 6,
 "minecraft:calibrated_sculk_sensor": 1,
 "minecraft:dragon_egg": 1,
 "minecraft:end_portal_frame": 1,


 "minecraft:candle_cake": 3,
 "minecraft:black_candle_cake": 3,
 "minecraft:blue_candle_cake": 3,
 "minecraft:brown_candle_cake": 3,
 "minecraft:cyan_candle_cake": 3,
 "minecraft:gray_candle_cake": 3,
 "minecraft:green_candle_cake": 3,
 "minecraft:light_blue_candle_cake": 3,
 "minecraft:light_gray_candle_cake": 3,
 "minecraft:lime_candle_cake": 3,
 "minecraft:magenta_candle_cake": 3,
 "minecraft:orange_candle_cake": 3,
 "minecraft:pink_candle_cake": 3,
 "minecraft:purple_candle_cake": 3,
 "minecraft:red_candle_cake": 3,
 "minecraft:white_candle_cake": 3,
 "minecraft:yellow_candle_cake": 3,

 "minecraft:magma": 3,

  "minecraft:beacon": 15,
  "minecraft:conduit": 15,
  "minecraft:sea_lantern": 15,
  "minecraft:sea_pickle": 15,
  "minecraft:ochre_froglight": 15,
  "minecraft:verdant_froglight": 15,
  "minecraft:pearlescent_froglight": 15,
  "minecraft:lit_pumpkin": 15,

  "minecraft:glowstone": 15,
  "minecraft:lantern": 15,
  "minecraft:redstone_lamp": 15,
  "minecraft:redstone_torch": 7,
  "minecraft:end_gateway": 15,

  "minecraft:copper_lantern": 15,
  "minecraft:exposed_copper_lantern": 15,
  "minecraft:weathered_copper_lantern": 15,
  "minecraft:oxidized_copper_lantern": 15,

  "minecraft:waxed_copper_lantern": 15,
  "minecraft:waxed_exposed_copper_lantern": 15,
  "minecraft:waxed_weathered_copper_lantern": 15,
  "minecraft:waxed_oxidized_copper_lantern": 15,

  "minecraft:firefly_bush": 2,

  "minecraft:campfire": 15,
  "minecraft:soul_campfire": 10,
  "minecraft:torch": 14,
  "minecraft:soul_torch": 10,
  "minecraft:copper_torch": 14,
  "minecraft:end_rod": 14,
  "minecraft:shroomlight": 15,
  "minecraft:respawn_anchor": 15,
  "minecraft:crying_obsidian": 10,
  "minecraft:soul_lantern": 10,
  "minecraft:lava": 15,
  "minecraft:flowing_lava": 15,
  "minecraft:lava_cauldron": 15,
  "minecraft:fire": 15,
  "minecraft:soul_fire": 10,
  "minecraft:deepslate_redstone_ore": 9,
  "minecraft:redstone_ore": 9,
  "minecraft:enchanting_table": 7,
  "minecraft:ender_chest": 7,
  "minecraft:glow_lichen": 7,
  "minecraft:amethyst_cluster": 5,
  "minecraft:large_amethyst_bud": 4,
  "minecraft:medium_amethyst_bud": 2,
  "minecraft:small_amethyst_bud": 1,
  "minecraft:brown_mushroom": 1,
  "minecraft:brewing_stand": 1,
  "minecraft:trial_spawner": 8,

  "minecraft:weathered_copper_bulb": 8,
  "minecraft:exposed_copper_bulb": 12,
  "minecraft:copper_bulb": 15,
  "minecraft:oxidized_copper_bulb": 4,

    "minecraft:waxed_weathered_copper_bulb": 8,
  "minecraft:waxed_exposed_copper_bulb": 12,
  "minecraft:waxed_copper_bulb": 15,
  "minecraft:waxed_oxidized_copper_bulb": 4,

  "minecraft:light_block_0": 0,
  "minecraft:light_block_1": 1,
  "minecraft:light_block_2": 2,
  "minecraft:light_block_3": 3,
  "minecraft:light_block_4": 4,
  "minecraft:light_block_5": 5,
  "minecraft:light_block_6": 6,
  "minecraft:light_block_7": 7,
  "minecraft:light_block_8": 8,
  "minecraft:light_block_9": 9,
  "minecraft:light_block_10":10,
  "minecraft:light_block_11":11,
  "minecraft:light_block_12":12,
  "minecraft:light_block_13":13,
  "minecraft:light_block_14":14,
  "minecraft:light_block_15":15,
  "minecraft:portal": 11,
  "minecraft:end_portal": 15,
  "minecraft:cave_vines_body_with_berries": 14,
  "minecraft:cave_vines_head_with_berries": 14
}

export const transparentBlocks = [
    "minecraft:air",
    "minecraft:water",
    "minecraft:short_grass",
    "minecraft:lava",
    "minecraft:tall_grass",
    "minecraft:moss_carpet"
]