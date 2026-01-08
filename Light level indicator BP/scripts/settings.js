export const defaultSettings={
    "lightlevelindicator:scale":1,                                // Scale of particles
    "lightlevelindicator:style":0,                                // Style of particles flat/facing
    "lightlevelindicator:horizontal_scan_distance":12,            // xz distance to calulate light levels
    "lightlevelindicator:vertical_scan_distance":4,               // y distance to calulate light levels                         
    "lightlevelindicator:y_offset":0.1,                           // Particle offset from block
    
    "lightlevelindicator:update_interval":10,                     // Period between scans inwhich to update blocks (ticks)
    "lightlevelindicator:particle_interval":10,                   // Period between updates to the paricles (ticks)
    "lightlevelindicator:particle_lifetime":20,                   // Period between updates to the paricles (ticks)
    "lightlevelindicator:emitter_calulations":1,                  // Should ~2x processing power be used to get the correct light level colors? Without it the game displays the wrong colors between green/yellow sometimes
    "lightlevelindicator:emitter_update_interval":40,             // The rate to recalute emitter light producers
    "lightlevelindicator:emitter_extended_length":15,             // To calulate the correct overworld lighting the game calulates light emitted from blocks, horizontal_scan_distance+emitter_extended_length is that distance
    
    "lightlevelindicator:color_dangerous":{red:1,green:0,blue:0},   // Color of spawnable blocks i.e. red (0-1 float)
    "lightlevelindicator:color_unsafe":{red:1,green:1,blue:0},    // Color of partial spawnable blocks i.e. yellow (0-1 float)
    "lightlevelindicator:color_safe":{red:0,green:1,blue:0},      // Color of non-spawnable blocks i.e. green (0-1 float)
   
    "lightlevelindicator:render_safe_blocks":1,                   // Enable/Disable rendering of safe blocks
    "lightlevelindicator:render_unsafe_blocks":1,                 // Enable/Disable rendering of unsafe blocks
    "lightlevelindicator:render_dangerous_blocks":1,                // Enable/Disable rendering of dangerous blocks
}

export const lightEmittingBlocks = {
  "minecraft:beacon": 15,
  "minecraft:conduit": 15,
  "minecraft:copper_lantern": 15,
  "minecraft:exposed_copper_lantern": 15,
  "minecraft:weathered_copper_lantern": 15,
  "minecraft:oxidized_copper_lantern": 15,
  "minecraft:waxed_copper_lantern": 15,
  "minecraft:waxed_exposed_copper_lantern": 15,
  "minecraft:waxed_weathered_copper_lantern": 15,
  "minecraft:waxed_oxidized_copper_lantern": 15,
  "minecraft:end_gateway": 15,
  "minecraft:end_portal": 15,
  "minecraft:fire": 15,
  "minecraft:sea_pickle": {
    6: {"dead_bit": false, "cluster_count": 0},
    9: {"dead_bit": false, "cluster_count": 1},
    12: {"dead_bit": false, "cluster_count": 2},
    15: {"dead_bit": false, "cluster_count": 3}
  },
  "minecraft:ochre_froglight": 15,
  "minecraft:verdant_froglight": 15,
  "minecraft:pearlescent_froglight": 15,
  "minecraft:glowstone": 15,
  "minecraft:lit_pumpkin": 15,
  "minecraft:lantern": 15,
  "minecraft:lava": 15,
  "minecraft:flowing_lava": 15,
  "minecraft:lava_cauldron": 15,
  "minecraft:campfire": {"15": {"extinguished": false}},
  "minecraft:lit_redstone_lamp": 15,
  "minecraft:respawn_anchor": {
    3: {"respawn_anchor_charge": 1},
    7: {"respawn_anchor_charge": 2},
    11: {"respawn_anchor_charge": 3},
    15: {"respawn_anchor_charge": 4}
  },
  "minecraft:sea_lantern": 15,
  "minecraft:shroomlight": 15,
  "minecraft:copper_bulb": {"15": {"lit": true}},
  "minecraft:waxed_copper_bulb": {"15": {"lit": true}},
  "minecraft:cave_vines_body_with_berries": 14,
  "minecraft:cave_vines_head_with_berries": 14,
  "minecraft:copper_torch": 14,
  "minecraft:end_rod": 14,
  "minecraft:torch": 14,
  "minecraft:lit_furnace": 13,
  "minecraft:lit_blast_furnace": 13,
  "minecraft:lit_smoker": 13,
  "minecraft:vault": 12,
  "minecraft:candle": {
    3: {"lit": true, "candles": 0},
    6: {"lit": true, "candles": 1},
    9: {"lit": true, "candles": 2},
    12: {"lit": true, "candles": 3}
  },
  "minecraft:black_candle": {
    3: {"lit": true, "candles": 0},
    6: {"lit": true, "candles": 1},
    9: {"lit": true, "candles": 2},
    12: {"lit": true, "candles": 3}
  },
  "minecraft:blue_candle": {
    3: {"lit": true, "candles": 0},
    6: {"lit": true, "candles": 1},
    9: {"lit": true, "candles": 2},
    12: {"lit": true, "candles": 3}
  },
  "minecraft:brown_candle": {
    3: {"lit": true, "candles": 0},
    6: {"lit": true, "candles": 1},
    9: {"lit": true, "candles": 2},
    12: {"lit": true, "candles": 3}
  },
  "minecraft:cyan_candle": {
    3: {"lit": true, "candles": 0},
    6: {"lit": true, "candles": 1},
    9: {"lit": true, "candles": 2},
    12: {"lit": true, "candles": 3}
  },
  "minecraft:gray_candle": {
    3: {"lit": true, "candles": 0},
    6: {"lit": true, "candles": 1},
    9: {"lit": true, "candles": 2},
    12: {"lit": true, "candles": 3}
  },
  "minecraft:green_candle": {
    3: {"lit": true, "candles": 0},
    6: {"lit": true, "candles": 1},
    9: {"lit": true, "candles": 2},
    12: {"lit": true, "candles": 3}
  },
  "minecraft:light_blue_candle": {
    3: {"lit": true, "candles": 0},
    6: {"lit": true, "candles": 1},
    9: {"lit": true, "candles": 2},
    12: {"lit": true, "candles": 3}
  },
  "minecraft:light_gray_candle": {
    3: {"lit": true, "candles": 0},
    6: {"lit": true, "candles": 1},
    9: {"lit": true, "candles": 2},
    12: {"lit": true, "candles": 3}
  },
  "minecraft:lime_candle": {
    3: {"lit": true, "candles": 0},
    6: {"lit": true, "candles": 1},
    9: {"lit": true, "candles": 2},
    12: {"lit": true, "candles": 3}
  },
  "minecraft:magenta_candle": {
    3: {"lit": true, "candles": 0},
    6: {"lit": true, "candles": 1},
    9: {"lit": true, "candles": 2},
    12: {"lit": true, "candles": 3}
  },
  "minecraft:orange_candle": {
    3: {"lit": true, "candles": 0},
    6: {"lit": true, "candles": 1},
    9: {"lit": true, "candles": 2},
    12: {"lit": true, "candles": 3}
  },
  "minecraft:pink_candle": {
    3: {"lit": true, "candles": 0},
    6: {"lit": true, "candles": 1},
    9: {"lit": true, "candles": 2},
    12: {"lit": true, "candles": 3}
  },
  "minecraft:purple_candle": {
    3: {"lit": true, "candles": 0},
    6: {"lit": true, "candles": 1},
    9: {"lit": true, "candles": 2},
    12: {"lit": true, "candles": 3}
  },
  "minecraft:red_candle": {
    3: {"lit": true, "candles": 0},
    6: {"lit": true, "candles": 1},
    9: {"lit": true, "candles": 2},
    12: {"lit": true, "candles": 3}
  },
  "minecraft:white_candle": {
    3: {"lit": true, "candles": 0},
    6: {"lit": true, "candles": 1},
    9: {"lit": true, "candles": 2},
    12: {"lit": true, "candles": 3}
  },
  "minecraft:yellow_candle": {
    3: {"lit": true, "candles": 0},
    6: {"lit": true, "candles": 1},
    9: {"lit": true, "candles": 2},
    12: {"lit": true, "candles": 3}
  },
  "minecraft:exposed_copper_bulb": {12: {"lit": true}},
  "minecraft:waxed_exposed_copper_bulb": {12: {"lit": true}},
  "minecraft:portal": 11,
  "minecraft:crying_obsidian": 10,
  "minecraft:soul_campfire": {10: {"extinguished": false}},
  "minecraft:soul_fire": 10,
  "minecraft:soul_lantern": 10,
  "minecraft:soul_torch": 10,
  "minecraft:lit_deepslate_redstone_ore": 9,
  "minecraft:lit_redstone_ore": 9,
  "minecraft:trial_spawner": {
    4: {"trial_spawner_state": 1},
    8: {"trial_spawner_state": 2},
    "8a": {"trial_spawner_state": 3},
    "8b": {"trial_spawner_state": 4}
  },
  "minecraft:weathered_copper_bulb": {8: {"lit": true}},
  "minecraft:waxed_weathered_copper_bulb": {8: {"lit": true}},
  "minecraft:enchanting_table": 7,
  "minecraft:ender_chest": 7,
  "minecraft:glow_lichen": 7,
  "minecraft:redstone_torch": 7,
  "minecraft:sculk_catalyst": 6,
  "minecraft:amethyst_cluster": 5,
  "minecraft:large_amethyst_bud": 4,
  "minecraft:oxidized_copper_bulb": {4: {"lit": true}},
  "minecraft:waxed_oxidized_copper_bulb": {4: {"lit": true}},
  "minecraft:candle_cake": {3: {"lit": true}},
  "minecraft:black_candle_cake": {3: {"lit": true}},
  "minecraft:blue_candle_cake": {3: {"lit": true}},
  "minecraft:brown_candle_cake": {3: {"lit": true}},
  "minecraft:cyan_candle_cake": {3: {"lit": true}},
  "minecraft:gray_candle_cake": {3: {"lit": true}},
  "minecraft:green_candle_cake": {3: {"lit": true}},
  "minecraft:light_blue_candle_cake": {3: {"lit": true}},
  "minecraft:light_gray_candle_cake": {3: {"lit": true}},
  "minecraft:lime_candle_cake": {3: {"lit": true}},
  "minecraft:magenta_candle_cake": {3: {"lit": true}},
  "minecraft:orange_candle_cake": {3: {"lit": true}},
  "minecraft:pink_candle_cake": {3: {"lit": true}},
  "minecraft:purple_candle_cake": {3: {"lit": true}},
  "minecraft:red_candle_cake": {3: {"lit": true}},
  "minecraft:white_candle_cake": {3: {"lit": true}},
  "minecraft:yellow_candle_cake": {3: {"lit": true}},
  "minecraft:magma": 3,
  "minecraft:medium_amethyst_bud": 2,
  "minecraft:firefly_bush": 2,
  "minecraft:brewing_stand": 1,
  "minecraft:brown_mushroom": 1,
  "minecraft:calibrated_sculk_sensor": 1,
  "minecraft:dragon_egg": 1,
  "minecraft:end_portal_frame": 1,
  "minecraft:sculk_sensor": 1,
  "minecraft:small_amethyst_bud": 1,
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
  "minecraft:light_block_10": 10,
  "minecraft:light_block_11": 11,
  "minecraft:light_block_12": 12,
  "minecraft:light_block_13": 13,
  "minecraft:light_block_14": 14,
  "minecraft:light_block_15": 15
}

export const transparentBlocks = [
    "minecraft:air",
    "minecraft:water",
    "minecraft:bubble_column",
    "minecraft:flowing_water",
    "minecraft:flowing_lava",
    "minecraft:lava",
    "minecraft:barrier",
    "minecraft:vine",
    "minecraft:light_block_0",
    "minecraft:light_block_1",
    "minecraft:light_block_2",
    "minecraft:light_block_3",
    "minecraft:light_block_4",
    "minecraft:light_block_5",
    "minecraft:light_block_6",
    "minecraft:light_block_7",
    "minecraft:light_block_8",
    "minecraft:light_block_9",
    "minecraft:light_block_10",
    "minecraft:light_block_11",
    "minecraft:light_block_12",
    "minecraft:light_block_13",
    "minecraft:light_block_14",
    "minecraft:light_block_15",
]