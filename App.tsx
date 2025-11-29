
import React, { useState, useEffect, useRef } from 'react';
import { Scene, Item, GameState, SCENE_IMAGES } from './types';
import InventoryBar from './components/InventoryBar';
import PuzzleOverlay from './components/PuzzleOverlay';
import { ArrowLeft, ArrowRight, ArrowDown, ArrowUp, Eye, Search, AlertTriangle, DoorOpen } from 'lucide-react';

const INITIAL_STATE: GameState = {
  currentScene: Scene.COURTYARD,
  inventory: [],
  flags: {
    hasSeenBlackout: false,
    doorUnlocked: false,
    boxUnlocked: false,
    clockSolved: false,
    chairsSolved: false,
    secretDoorOpen: false,
    tabletsArranged: false,
    mirrorRepaired: false,
    candlesLit: false,
    jumpscareTriggered: false,
    hasFoundChairKey: false,
    hasPlacedTabletClock: false,
    hasPlacedTabletDrawer: false,
  },
  dialogue: "头好痛... 我这是在哪里？",
  activeView: null
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  const updateInventory = (item: Item) => {
    if (!gameState.inventory.includes(item)) {
      setGameState(prev => ({
        ...prev,
        inventory: [...prev.inventory, item],
        dialogue: `获得了 [${item === Item.BURNT_PAPER ? '烧残的纸' : 
                        item === Item.LIGHTER ? '打火机' : 
                        item === Item.KEY ? '钥匙' :
                        item === Item.CANDLE ? '蜡烛' :
                        item === Item.MIRROR_FRAGMENT ? '铜镜碎片' : 
                        item === Item.SPIRIT_TABLET_CLOCK ? '灵牌(钟)' : 
                        item === Item.SPIRIT_TABLET_DRAWER ? '灵牌(柜)' :
                        item === Item.DRAWING_MAP ? '构造图' :
                        item === Item.DRAWING_ARRANGEMENT ? '陈列图' : '物品'}]`
      }));
    }
  };

  const showDialogue = (text: string) => {
    setGameState(prev => ({ ...prev, dialogue: text }));
  };

  const changeScene = (scene: Scene) => {
    setGameState(prev => ({ ...prev, currentScene: scene, dialogue: null, activeView: null }));
  };

  // --- Interaction Handlers ---

  const handleCourtyardInteraction = (target: string) => {
    if (target === 'gate') {
      showDialogue("大门从外面锁上了，推不开。");
    } else if (target === 'wall') {
      if (!gameState.flags.hasSeenBlackout) {
        setGameState(prev => ({ ...prev, activeView: 'stones' }));
      } else {
        showDialogue("墙太高了，翻不过去。");
      }
    } else if (target === 'door') {
      changeScene(Scene.MAIN_HALL);
    }
  };

  const handleMainHallInteraction = (target: string) => {
    if (target === 'firepit') {
      if (!gameState.inventory.includes(Item.BURNT_PAPER)) {
        updateInventory(Item.BURNT_PAPER);
        updateInventory(Item.LIGHTER);
        setGameState(prev => ({ ...prev, activeView: 'paper_clue' }));
      } else {
        showDialogue("火盆里只剩下灰烬。");
      }
    } else if (target === 'desk') {
      setGameState(prev => ({ ...prev, activeView: 'desk' }));
    } else if (target === 'clock') {
       if (!gameState.flags.clockSolved) {
           if (gameState.flags.chairsSolved) {
                setGameState(prev => ({...prev, activeView: 'clock'}));
           } else {
                showDialogue("钟表的玻璃罩锁住了，似乎和旁边的太师椅机关有关。");
           }
       } else {
           showDialogue("钟停在了两点。");
       }
    } else if (target === 'chairs') {
        if (!gameState.flags.hasFoundChairKey) {
            updateInventory(Item.KEY);
            setGameState(prev => ({
                ...prev,
                flags: { ...prev.flags, hasFoundChairKey: true }
            }));
            showDialogue("在椅垫缝隙里摸索... 竟然找到了一把钥匙！");
            return;
        }

        if (!gameState.flags.chairsSolved) {
            if (gameState.inventory.includes(Item.DRAWING_ARRANGEMENT)) {
                setGameState(prev => ({...prev, activeView: 'chairs'}));
            } else {
                showDialogue("这些椅子的刻纹似乎对应着某种方位... 但我现在没有参照图。也许该去别的房间找找。");
            }
        } else {
            showDialogue("椅子已经按陈列图摆放整齐了，机关已解开。");
        }
    } else if (target === 'back') {
        changeScene(Scene.COURTYARD);
    }
  };

  const handleRightRoomInteraction = (target: string) => {
      if (target === 'wardrobe') {
          setGameState(prev => ({...prev, activeView: 'box'}));
      } else if (target === 'bedside') {
          showDialogue("床头柜锁死了，打不开。");
      }
  };

  const handleLeftRoomInteraction = (target: string) => {
      if (target === 'vase') {
          if (!gameState.inventory.includes(Item.CANDLE)) {
              updateInventory(Item.CANDLE);
              showDialogue("花瓶里藏着两根蜡烛。");
          } else {
              showDialogue("花瓶空了。");
          }
      } else if (target === 'secret_door') {
          if (gameState.flags.secretDoorOpen) {
              changeScene(Scene.ANCESTRAL_HALL);
          } else {
             if (gameState.inventory.includes(Item.DRAWING_MAP)) {
                 setGameState(prev => ({
                     ...prev, 
                     flags: {...prev.flags, secretDoorOpen: true},
                     dialogue: "根据构造图，这里应该有道暗门... 找到了！"
                 }));
             } else {
                 showDialogue("这里衣柜看起来很沉重。");
             }
          }
      }
  };

  const handleAncestralHallInteraction = (target: string) => {
      if (target === 'drawer') {
          if (gameState.inventory.includes(Item.SPIRIT_TABLET_DRAWER) || gameState.flags.hasPlacedTabletDrawer) {
              showDialogue("抽屉已经空了。");
          } else {
              setGameState(prev => ({...prev, activeView: 'altar_drawer'}));
          }
      } else if (target === 'table') {
          if (gameState.flags.tabletsArranged && !gameState.flags.mirrorRepaired) {
              if (selectedItem === Item.MIRROR_FRAGMENT) {
                  setGameState(prev => ({...prev, flags: {...prev.flags, mirrorRepaired: true}}));
                  showDialogue("铜镜补全了。");
              } else {
                  showDialogue("桌面升起了一面残缺的铜镜...需要补全它。");
              }
          } else if (gameState.flags.mirrorRepaired && !gameState.flags.candlesLit) {
               if (selectedItem === Item.CANDLE) {
                   showDialogue("蜡烛放好了，需要点火。");
               } else if (selectedItem === Item.LIGHTER) {
                    setGameState(prev => ({...prev, flags: {...prev.flags, candlesLit: true}}));
                    setTimeout(() => {
                        setGameState(prev => ({...prev, currentScene: Scene.ENDING, flags: {...prev.flags, jumpscareTriggered: true}}));
                    }, 2000);
               } else {
                   showDialogue("镜前有两个烛台。");
               }
          } else {
              // Open tablets view to place items or solve puzzle
              setGameState(prev => ({...prev, activeView: 'tablets'})); 
          }
      }
  };

  // --- Puzzle Solvers ---

  const handlePuzzleSolved = (type: string, data?: any) => {
      // Handle tablet placement inside puzzle view
      if (type === 'tablets' && data?.action === 'place_tablet') {
          const { index } = data;
          if (gameState.inventory.includes(Item.SPIRIT_TABLET_CLOCK)) {
              setGameState(prev => ({
                  ...prev,
                  inventory: prev.inventory.filter(i => i !== Item.SPIRIT_TABLET_CLOCK),
                  flags: {...prev.flags, hasPlacedTabletClock: true}
              }));
              showDialogue("放上了灵牌(钱氏)。");
          } else if (gameState.inventory.includes(Item.SPIRIT_TABLET_DRAWER)) {
              setGameState(prev => ({
                  ...prev,
                  inventory: prev.inventory.filter(i => i !== Item.SPIRIT_TABLET_DRAWER),
                  flags: {...prev.flags, hasPlacedTabletDrawer: true}
              }));
              showDialogue("放上了灵牌(李氏)。");
          } else {
              showDialogue("我还需要找到缺失的灵牌。");
          }
          return;
      }
      
      // Standard solve logic
      if (type === 'desk') {
          if (!gameState.inventory.includes(Item.MIRROR_FRAGMENT)) {
              updateInventory(Item.MIRROR_FRAGMENT);
              showDialogue("获得 [铜镜碎片]。这好像是供桌上那面镜子的。");
          }
          return; 
      }
      
      if (type === 'altar_drawer') {
           if (!gameState.inventory.includes(Item.SPIRIT_TABLET_DRAWER)) {
               updateInventory(Item.SPIRIT_TABLET_DRAWER);
               showDialogue("在抽屉里发现了一块灵牌。");
           }
           return;
      }

      setGameState(prev => ({ ...prev, activeView: null })); 

      if (type === 'stones') {
          showDialogue("这石头排列好奇怪... (突然眼前一黑)");
          setTimeout(() => {
              setGameState(prev => ({
                  ...prev,
                  currentScene: Scene.COURTYARD,
                  flags: {...prev.flags, hasSeenBlackout: true},
                  dialogue: "我又回到了井边？井水里好像有东西..."
              }));
          }, 2000);
      } else if (type === 'box') {
          if (selectedItem === Item.KEY) {
              setGameState(prev => ({
                  ...prev, 
                  flags: {...prev.flags, boxUnlocked: true}
              }));
              updateInventory(Item.DRAWING_MAP);
              updateInventory(Item.DRAWING_ARRANGEMENT);
          } else {
              showDialogue("需要钥匙才能打开。");
          }
      } else if (type === 'clock') {
          setGameState(prev => ({...prev, flags: {...prev.flags, clockSolved: true}}));
          updateInventory(Item.SPIRIT_TABLET_CLOCK);
          showDialogue("钟表后面掉出了一块灵牌。");
      } else if (type === 'chairs') {
          setGameState(prev => ({...prev, flags: {...prev.flags, chairsSolved: true}}));
          showDialogue("咔嚓一声，西洋钟的玻璃罩解锁了。");
      } else if (type === 'tablets') {
          setGameState(prev => ({...prev, flags: {...prev.flags, tabletsArranged: true}}));
          showDialogue("机关启动的声音... 供桌中间升起了一面镜子。");
      }
  };

  // --- Render Helpers ---

  const NavArrow = ({ direction, onClick, label }: { direction: 'left' | 'right' | 'down' | 'up', onClick: () => void, label?: string }) => {
    const Icon = direction === 'left' ? ArrowLeft : direction === 'right' ? ArrowRight : direction === 'up' ? ArrowUp : ArrowDown;
    const positionClass = 
      direction === 'left' ? 'left-4 top-1/2 -translate-y-1/2' :
      direction === 'right' ? 'right-4 top-1/2 -translate-y-1/2' :
      direction === 'up' ? 'top-4 left-1/2 -translate-x-1/2' :
      'bottom-24 left-1/2 -translate-x-1/2'; 

    return (
      <div 
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`absolute ${positionClass} p-3 rounded-full bg-black/50 border border-gray-600 hover:bg-red-900/50 hover:border-red-500 cursor-pointer transition-all z-20 group`}
      >
        <Icon className="text-gray-300 group-hover:text-white w-8 h-8" />
        {label && (
          <span className="absolute whitespace-nowrap bg-black/80 text-white text-xs px-2 py-1 rounded -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            {label}
          </span>
        )}
      </div>
    );
  };

  const renderSceneContent = () => {
    switch (gameState.currentScene) {
      case Scene.COURTYARD:
        return (
          <>
             <div onClick={() => handleCourtyardInteraction('gate')} className="absolute top-[25%] left-[65%] w-[25%] h-[40%] cursor-pointer hover:bg-white/5 z-10 group border border-transparent hover:border-red-900/30">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100"><Eye className="text-white/50 w-8 h-8"/></div>
             </div>
             <div onClick={() => handleCourtyardInteraction('wall')} className="absolute top-[40%] left-[5%] w-[25%] h-[30%] cursor-pointer hover:bg-white/5 z-10 group border border-transparent hover:border-red-900/30">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100"><Search className="text-white/50 w-8 h-8"/></div>
             </div>
             <div onClick={() => handleCourtyardInteraction('door')} className="absolute top-[45%] left-[42%] w-[12%] h-[20%] cursor-pointer hover:bg-yellow-900/20 z-10 animate-pulse border border-transparent hover:border-yellow-500/50" />
          </>
        );
      case Scene.MAIN_HALL:
        return (
            <>
                <NavArrow direction="left" onClick={() => changeScene(Scene.LEFT_ROOM)} label="左室" />
                <NavArrow direction="right" onClick={() => changeScene(Scene.RIGHT_ROOM)} label="右室" />
                <NavArrow direction="down" onClick={() => handleMainHallInteraction('back')} label="庭院" />
                
                <div onClick={() => handleMainHallInteraction('firepit')} className="absolute bottom-[10%] left-[35%] w-[30%] h-[20%] cursor-pointer hover:bg-red-500/10 z-10" />
                <div onClick={() => handleMainHallInteraction('desk')} className="absolute top-[35%] left-[45%] w-[15%] h-[15%] cursor-pointer hover:bg-yellow-500/10 z-10 border border-transparent hover:border-yellow-500/30">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 hover:opacity-100"><Search className="text-white/50"/></div>
                </div>
                <div onClick={() => handleMainHallInteraction('clock')} className="absolute top-[15%] left-[48%] w-[8%] h-[12%] cursor-pointer hover:bg-yellow-500/10 z-10" />
                <div onClick={() => handleMainHallInteraction('chairs')} className="absolute bottom-[35%] left-[10%] w-[80%] h-[20%] cursor-pointer hover:bg-blue-500/10 z-10" />
            </>
        );
      case Scene.RIGHT_ROOM:
          return (
              <>
                 <NavArrow direction="down" onClick={() => changeScene(Scene.MAIN_HALL)} label="返回正厅" />
                 <div onClick={() => handleRightRoomInteraction('wardrobe')} className="absolute top-[15%] right-[15%] w-[30%] h-[65%] cursor-pointer hover:bg-white/10 z-10 border border-transparent hover:border-yellow-500/30">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 hover:opacity-100"><Search className="text-white/50"/></div>
                 </div>
                 <div onClick={() => handleRightRoomInteraction('bedside')} className="absolute top-[50%] left-[5%] w-[25%] h-[35%] cursor-pointer hover:bg-white/10 z-10" />
              </>
          );
      case Scene.LEFT_ROOM:
          return (
              <>
                 <NavArrow direction="down" onClick={() => changeScene(Scene.MAIN_HALL)} label="返回正厅" />
                 <div onClick={() => handleLeftRoomInteraction('vase')} className="absolute top-[45%] left-[5%] w-[15%] h-[30%] cursor-pointer hover:bg-white/10 z-10 border border-transparent hover:border-white/30" />
                 <div onClick={() => handleLeftRoomInteraction('secret_door')} className="absolute top-[15%] right-[15%] w-[35%] h-[65%] cursor-pointer hover:bg-white/5 z-10 border border-transparent hover:border-red-900/30">
                    {gameState.flags.secretDoorOpen && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><DoorOpen className="text-white w-16 h-16 opacity-50"/></div>}
                 </div>
              </>
          );
      case Scene.ANCESTRAL_HALL:
          return (
              <>
                 <NavArrow direction="down" onClick={() => changeScene(Scene.LEFT_ROOM)} label="离开" />
                 {/* Altar Table (Tablets) */}
                 <div onClick={() => handleAncestralHallInteraction('table')} className="absolute top-[30%] left-[20%] w-[60%] h-[25%] cursor-pointer hover:bg-red-500/10 z-10 border border-transparent hover:border-red-500/30">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 text-white/50 text-xs">灵位</div>
                 </div>
                 {/* Altar Drawer (Bottom) */}
                 <div onClick={() => handleAncestralHallInteraction('drawer')} className="absolute top-[55%] left-[30%] w-[40%] h-[20%] cursor-pointer hover:bg-yellow-500/10 z-10 border border-transparent hover:border-yellow-500/30">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 text-white/50 text-xs">抽屉</div>
                 </div>
              </>
          );
      case Scene.ENDING:
          return (
              <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
                  <div className={`relative w-full h-full ${gameState.flags.jumpscareTriggered ? 'jumpscare-anim' : ''}`}>
                      <img src="https://image.pollinations.ai/prompt/scary%20pale%20ghost%20woman%20face%20close%20up%20horror%20bloody%20cinematic?width=1920&height=1080&nologo=true" className="w-full h-full object-cover" alt="Ghost" />
                  </div>
                  <div className="absolute bottom-20 text-red-600 text-4xl font-bold tracking-[1em] animate-pulse">第一章 完</div>
              </div>
          );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center select-none">
      
      {gameState.currentScene !== Scene.ENDING && (
        <div 
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
            style={{ backgroundImage: `url(${SCENE_IMAGES[gameState.currentScene]})` }}
        >
            <div className="absolute inset-0 bg-black/30 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50 pointer-events-none" />
        </div>
      )}

      <div className="relative w-full h-full max-w-[1920px] max-h-[1080px] aspect-video">
        {renderSceneContent()}
      </div>

      {gameState.dialogue && (
          <div 
            className="fixed top-10 left-1/2 -translate-x-1/2 w-[80%] md:w-[60%] bg-black/85 text-gray-200 p-6 border-l-4 border-red-800 text-lg md:text-xl font-serif tracking-wide shadow-[0_0_20px_rgba(0,0,0,0.8)] z-40 cursor-pointer backdrop-blur-sm"
            onClick={() => setGameState(prev => ({ ...prev, dialogue: null }))}
          >
              <p className="animate-[fadeIn_0.5s] leading-loose">{gameState.dialogue}</p>
              <span className="absolute bottom-2 right-4 text-xs text-gray-500 animate-pulse">点击关闭</span>
          </div>
      )}

      <InventoryBar 
        inventory={gameState.inventory} 
        selectedItem={selectedItem} 
        onSelectItem={(item) => setSelectedItem(item === selectedItem ? null : item)} 
      />

      {gameState.activeView && (
          <PuzzleOverlay 
            type={gameState.activeView as any}
            onClose={() => setGameState(prev => ({...prev, activeView: null}))}
            onSolve={(data) => handlePuzzleSolved(gameState.activeView || '', data)}
            isSolved={
                gameState.activeView === 'clock' ? gameState.flags.clockSolved :
                gameState.activeView === 'stones' ? false :
                gameState.activeView === 'chairs' ? gameState.flags.chairsSolved :
                gameState.activeView === 'box' ? gameState.flags.boxUnlocked :
                gameState.activeView === 'tablets' ? gameState.flags.tabletsArranged :
                gameState.activeView === 'desk' ? gameState.inventory.includes(Item.MIRROR_FRAGMENT) :
                gameState.activeView === 'altar_drawer' ? (gameState.inventory.includes(Item.SPIRIT_TABLET_DRAWER) || gameState.flags.hasPlacedTabletDrawer) :
                false
            }
            extraData={{
                hasPlacedTabletClock: gameState.flags.hasPlacedTabletClock,
                hasPlacedTabletDrawer: gameState.flags.hasPlacedTabletDrawer
            }}
          />
      )}

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle,transparent_50%,black_100%)] z-30" />
    </div>
  );
}
