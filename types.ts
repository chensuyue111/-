export enum Scene {
  COURTYARD = 'COURTYARD',
  WALL_PUZZLE = 'WALL_PUZZLE',
  MAIN_HALL = 'MAIN_HALL',
  RIGHT_ROOM = 'RIGHT_ROOM',
  LEFT_ROOM = 'LEFT_ROOM',
  ANCESTRAL_HALL = 'ANCESTRAL_HALL',
  ENDING = 'ENDING'
}

export enum Item {
  BURNT_PAPER = 'burnt_paper', // 烧残的纸
  LIGHTER = 'lighter', // 打火机
  MIRROR_FRAGMENT = 'mirror_fragment', // 铜镜碎片
  CANDLE = 'candle', // 蜡烛
  KEY = 'key', // 钥匙
  SPIRIT_TABLET_CLOCK = 'spirit_tablet_clock', // 灵牌 (钟)
  SPIRIT_TABLET_DRAWER = 'spirit_tablet_drawer', // 灵牌 (柜)
  DRAWING_MAP = 'drawing_map', // 图画1
  DRAWING_ARRANGEMENT = 'drawing_arrangement', // 图画2
}

export interface GameState {
  currentScene: Scene;
  inventory: Item[];
  flags: {
    hasSeenBlackout: boolean;
    doorUnlocked: boolean; // Main hall door
    boxUnlocked: boolean;
    clockSolved: boolean;
    chairsSolved: boolean;
    secretDoorOpen: boolean;
    tabletsArranged: boolean;
    mirrorRepaired: boolean;
    candlesLit: boolean;
    jumpscareTriggered: boolean;
    hasFoundChairKey: boolean;
    hasPlacedTabletClock: boolean;
    hasPlacedTabletDrawer: boolean;
  };
  dialogue: string | null;
  activeView: string | null; // For modal views like 'clock', 'box', 'chairs'
}

// Updated with high-fidelity prompts matching the user's uploaded images style
export const SCENE_IMAGES = {
  [Scene.COURTYARD]: "https://image.pollinations.ai/prompt/gloomy%20ancient%20chinese%20courtyard%20night%20rain%20stone%20well%20millstone%20broken%20walls%20horror%20cinematic%208k?width=1920&height=1080&nologo=true",
  [Scene.MAIN_HALL]: "https://image.pollinations.ai/prompt/ancient%20chinese%20main%20hall%20interior%20night%20wooden%20chairs%20altar%20table%20old%20clock%20on%20wall%20green%20eerie%20lighting%20horror%208k?width=1920&height=1080&nologo=true",
  [Scene.RIGHT_ROOM]: "https://image.pollinations.ai/prompt/ancient%20chinese%20bedroom%20interior%20old%20canopy%20bed%20wooden%20wardrobe%20dark%20shadows%20spooky%20moonlight%208k?width=1920&height=1080&nologo=true",
  [Scene.LEFT_ROOM]: "https://image.pollinations.ai/prompt/ancient%20chinese%20room%20corner%20large%20vases%20shelves%20dusty%20cobwebs%20dark%20horror%20atmosphere%208k?width=1920&height=1080&nologo=true",
  [Scene.ANCESTRAL_HALL]: "https://image.pollinations.ai/prompt/close%20view%20ancient%20chinese%20ancestral%20hall%20altar%20spirit%20tablets%20rows%20candles%20incense%20burner%20scary%208k?width=1920&height=1080&nologo=true",
};

export const USER_ASSETS = {
  // Placeholders for where user would map their local files if we had access
};