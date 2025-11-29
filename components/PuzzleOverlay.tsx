
import React, { useState, useEffect } from 'react';
import { X, ArrowUp, ArrowDown, Key } from 'lucide-react';

interface PuzzleOverlayProps {
  type: 'clock' | 'stones' | 'box' | 'chairs' | 'tablets' | 'paper_clue' | 'desk' | 'altar_drawer';
  onClose: () => void;
  onSolve: (data?: any) => void;
  isSolved: boolean;
  extraData?: any;
}

const PuzzleOverlay: React.FC<PuzzleOverlayProps> = ({ type, onClose, onSolve, isSolved, extraData }) => {
  // Clock State
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(30);

  // Stones State (Simple array sort)
  const [stones, setStones] = useState([3, 1, 4, 2, 5]);

  // Chairs State (Symbol Matching)
  const [chairSymbols, setChairSymbols] = useState([0, 0, 0, 0]);
  const SYMBOLS = [' ', '龙', '凤', '虎', '龟'];
  
  // Tablets State
  // Initial state: some slots are null (empty)
  // Goal: ['赵', '钱', '孙', '李', '周']
  // Current logic: Check placed status from props/local
  // Let's use local state for the positions. 
  // 0: 赵(Zhao), 1: Empty, 2: 孙(Sun), 3: Empty, 4: 周(Zhou) (Example starting state)
  const [tablets, setTablets] = useState<(string | null)[]>(['赵', null, '孙', null, '周']);

  // Desk/Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    // Check Clock
    if (type === 'clock' && !isSolved) {
      if (hour === 2 && minute === 0) {
        setTimeout(() => onSolve(), 500);
      }
    }
    // Check Stones
    if (type === 'stones' && !isSolved) {
        if (JSON.stringify(stones) === JSON.stringify([1, 2, 3, 4, 5])) {
            setTimeout(() => onSolve(), 500);
        }
    }
    // Check Chairs
    if (type === 'chairs' && !isSolved) {
        if (JSON.stringify(chairSymbols) === JSON.stringify([1, 2, 3, 4])) {
            setTimeout(() => onSolve(), 500);
        }
    }
    // Check Tablets
    if (type === 'tablets' && !isSolved) {
        // Only if all are filled
        if (!tablets.includes(null)) {
             // Goal Order: 赵, 钱, 孙, 李, 周
             if (JSON.stringify(tablets) === JSON.stringify(['赵', '钱', '孙', '李', '周'])) {
                setTimeout(() => onSolve(), 500);
             }
        }
    }
  }, [hour, minute, stones, chairSymbols, tablets, type, isSolved, onSolve]);

  const swapStones = (i1: number, i2: number) => {
    const newStones = [...stones];
    [newStones[i1], newStones[i2]] = [newStones[i2], newStones[i1]];
    setStones(newStones);
  };

  const swapTablets = (i1: number, i2: number) => {
    const newTablets = [...tablets];
    [newTablets[i1], newTablets[i2]] = [newTablets[i2], newTablets[i1]];
    setTablets(newTablets);
  };

  const handleTabletClick = (index: number) => {
      // If empty, try to place
      if (tablets[index] === null) {
          onSolve({ action: 'place_tablet', index }); // Callback to App to check inventory
          // We can't update local state here easily without knowing if user has item, 
          // but we can listen to extraData or handle it via a prop update if we were strict.
          // For now, let's assume if App confirms, it re-renders or we do optimistic update if we had the item passed in.
          // Simpler: Use a distinct interaction.
      } else {
          // Swap logic if all full? Or just swap with neighbor
          if (!tablets.includes(null)) {
             // Simple swap with next for puzzle
             if (index < tablets.length - 1) swapTablets(index, index + 1);
             else swapTablets(index, 0);
          }
      }
  };
  
  // Sync tablets state with placed flags if provided (optional refinement)
  useEffect(() => {
     if (type === 'tablets' && extraData) {
         setTablets(prev => {
             const next = [...prev];
             if (extraData.hasPlacedTabletClock && next[1] === null) next[1] = '钱'; // Use 'Qian' for clock tablet
             if (extraData.hasPlacedTabletDrawer && next[3] === null) next[3] = '李'; // Use 'Li' for drawer tablet
             return next;
         });
     }
  }, [type, extraData]);


  const toggleChairSymbol = (index: number) => {
    const newChairs = [...chairSymbols];
    newChairs[index] = (newChairs[index] + 1) % 5;
    if (newChairs[index] === 0) newChairs[index] = 1;
    setChairSymbols(newChairs);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="relative bg-[#1a1a1a] border border-amber-900/50 p-8 max-w-3xl w-full rounded shadow-[0_0_50px_rgba(0,0,0,1)] paper-texture min-h-[400px] flex flex-col items-center justify-center">
        <button onClick={onClose} className="absolute -top-10 right-0 text-white hover:text-red-500 transition-colors z-50">
          <X size={32} />
        </button>

        {/* CLOCK PUZZLE */}
        {type === 'clock' && (
          <div className="flex flex-col items-center">
            <h2 className="text-amber-100 text-3xl mb-8 font-serif tracking-widest border-b border-amber-900 pb-2">西洋钟</h2>
            <div className="w-72 h-72 rounded-full border-[12px] border-[#3e2723] bg-[#e0e0e0] relative flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
               <div className="absolute w-2 h-24 bg-black origin-bottom rounded-full shadow-lg" style={{ transform: `rotate(${hour * 30 + minute * 0.5}deg) translateY(-50%)` }} />
               <div className="absolute w-1 h-32 bg-red-900 origin-bottom rounded-full shadow-lg" style={{ transform: `rotate(${minute * 6}deg) translateY(-50%)` }} />
               <div className="absolute w-6 h-6 bg-[#3e2723] rounded-full z-10 border-2 border-amber-600" />
               {[...Array(12)].map((_, i) => (
                 <div key={i} className="absolute w-1 h-4 bg-black origin-center" style={{ transform: `rotate(${i * 30}deg) translateY(-130px)` }} />
               ))}
            </div>
            <div className="flex gap-12 mt-10">
              <div className="flex flex-col items-center gap-2">
                <button onClick={() => setHour(h => (h + 1) % 12 || 12)} className="p-2 bg-amber-900/50 text-white rounded"><ArrowUp/></button>
                <span className="text-amber-100 text-2xl font-serif w-12 text-center">{hour}</span>
                <button onClick={() => setHour(h => (h - 1 + 12) % 12 || 12)} className="p-2 bg-amber-900/50 text-white rounded"><ArrowDown/></button>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button onClick={() => setMinute(m => (m + 5) % 60)} className="p-2 bg-amber-900/50 text-white rounded"><ArrowUp/></button>
                <span className="text-amber-100 text-2xl font-serif w-12 text-center">{minute.toString().padStart(2, '0')}</span>
                <button onClick={() => setMinute(m => (m - 5 + 60) % 60)} className="p-2 bg-amber-900/50 text-white rounded"><ArrowDown/></button>
              </div>
            </div>
          </div>
        )}

        {/* STONES PUZZLE */}
        {type === 'stones' && (
          <div className="flex flex-col items-center">
             <h2 className="text-gray-300 text-2xl mb-8 font-serif">乱石阵</h2>
             <div className="flex gap-4 items-end h-48 bg-black/40 p-6 rounded border border-gray-800">
                {stones.map((size, index) => (
                  <div key={index} onClick={() => { if (index < stones.length - 1) swapStones(index, index + 1); else swapStones(index, 0); }}
                    className="w-16 bg-gray-600 rounded-t-lg cursor-pointer hover:bg-gray-500 transition-all border border-gray-400 shadow-[0_0_10px_rgba(0,0,0,0.5)] bg-[url('https://www.transparenttextures.com/patterns/stone.png')]"
                    style={{ height: `${size * 20}%` }}
                  ></div>
                ))}
             </div>
          </div>
        )}

        {/* CHAIRS PUZZLE */}
        {type === 'chairs' && (
          <div className="flex flex-col items-center w-full">
             <div className="flex justify-between w-full items-start px-12 mb-4">
                <h2 className="text-amber-100 text-3xl font-serif tracking-widest border-b border-amber-900/50 pb-2">太师椅</h2>
                <div className="w-32 h-40 bg-[#d7ccc8] border border-gray-600 rotate-3 p-2 shadow-lg relative cursor-help hover:scale-150 transition-transform origin-top-right z-20">
                     <div className="w-full h-full border border-black/20 flex flex-col items-center justify-around">
                        <span className="text-[10px] text-black font-serif opacity-50">陈列图</span>
                        <div className="grid grid-cols-2 gap-2 w-full px-2">
                             <div className="text-[10px] text-center border border-black/20">龙</div>
                             <div className="text-[10px] text-center border border-black/20">凤</div>
                             <div className="text-[10px] text-center border border-black/20">虎</div>
                             <div className="text-[10px] text-center border border-black/20">龟</div>
                        </div>
                     </div>
                </div>
             </div>
             <div className="grid grid-cols-4 gap-4 w-full px-4">
               {chairSymbols.map((symbolIndex, index) => (
                 <div key={index} onClick={() => toggleChairSymbol(index)}
                  className={`h-48 border-2 flex flex-col items-center justify-end pb-4 cursor-pointer transition-all duration-300 relative ${symbolIndex !== 0 ? 'border-amber-900 bg-amber-900/10' : 'border-gray-700 bg-black/20'} hover:bg-amber-900/20`}
                 >
                   <div className="w-full h-32 absolute top-0 border-b-8 border-amber-900/60 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full border border-amber-800/30 flex items-center justify-center bg-black/40">
                             <span className="text-3xl text-amber-500 font-serif font-bold drop-shadow-[0_0_5px_rgba(255,165,0,0.5)]">{SYMBOLS[symbolIndex]}</span>
                        </div>
                   </div>
                   <div className="w-full flex justify-between px-4 mt-auto">
                        <div className="w-2 h-12 bg-amber-900/40"></div>
                        <div className="w-2 h-12 bg-amber-900/40"></div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* BOX VIEW */}
        {type === 'box' && (
          <div className="flex flex-col items-center text-center">
             <div onClick={!isSolved ? () => onSolve() : undefined}
                className={`w-80 h-56 bg-[#3e2723] rounded-lg border-4 border-[#5d4037] flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative overflow-hidden transition-transform ${!isSolved ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}`}
             >
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
                {isSolved ? (
                  <div className="text-amber-200 z-10 animate-[fadeIn_1s]">
                    <p className="text-2xl mb-2 font-serif">开启</p>
                    <p className="text-sm opacity-70">获得了[构造图]与[陈列图]</p>
                  </div>
                ) : (
                  <div className="text-amber-700/50 z-10 flex flex-col items-center">
                     <Key size={64} className="mb-4"/>
                     <p className="font-serif tracking-widest mt-2">点击使用钥匙开启</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {/* DESK VIEW */}
        {type === 'desk' && (
          <div className="flex flex-col items-center relative w-full h-full min-h-[500px] overflow-hidden rounded border border-amber-900/40">
              <div className="absolute inset-0 bg-[#2d1b15] bg-[url('https://image.pollinations.ai/prompt/texture%20top%20down%20view%20old%20dark%20wood%20grain%20scratched%20ancient%20chinese%20furniture?width=1024&height=1024&nologo=true')] bg-cover opacity-80 z-0"></div>
              <h2 className="text-amber-100/80 text-xl font-serif z-10 mt-6 tracking-widest">红木书桌</h2>
              <div className="relative w-96 h-64 mt-12 z-10 perspective-[1000px]">
                  <div className="absolute inset-x-4 top-0 bottom-0 bg-black/60 shadow-[inset_0_0_30px_rgba(0,0,0,0.9)] rounded flex items-center justify-center border-x-8 border-b-8 border-[#1a0f0b]">
                      {!isSolved && (
                          <div onClick={() => onSolve()} className="w-24 h-24 cursor-pointer hover:scale-110 transition-transform relative group">
                             <img src="https://image.pollinations.ai/prompt/broken%20ancient%20bronze%20mirror%20shard%20piece%20green%20patina%20isolated%20on%20black?width=256&height=256&nologo=true" className="w-full h-full object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]" alt="Mirror Fragment" />
                             <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                      )}
                      {isSolved && <span className="text-gray-600 text-sm font-serif">空无一物</span>}
                  </div>
                  <div onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                      className={`absolute inset-0 bg-[#3e2723] rounded border-t border-white/10 shadow-[0_10px_20px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center cursor-pointer transition-all duration-700 ease-in-out ${isDrawerOpen ? 'translate-y-48 rotate-x-[10deg]' : 'translate-y-0'}`}
                      style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/wood-pattern.png')", backgroundBlendMode: "multiply" }}
                  >
                      <div className="w-32 h-6 bg-black/40 rounded-full border border-amber-900/50 shadow-sm mb-2 relative">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#5d4037] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"></div>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-10 h-10 border-4 border-[#8d6e63] rounded-full mt-1 border-t-transparent shadow-md"></div>
                      </div>
                  </div>
              </div>
          </div>
        )}

        {/* ALTAR DRAWER VIEW */}
        {type === 'altar_drawer' && (
          <div className="flex flex-col items-center relative w-full h-full min-h-[500px] overflow-hidden rounded border border-amber-900/40">
              <div className="absolute inset-0 bg-[#1e100e] bg-cover opacity-90 z-0"></div>
              <h2 className="text-amber-100/80 text-xl font-serif z-10 mt-6 tracking-widest">供桌抽屉</h2>
              <div className="relative w-96 h-64 mt-12 z-10">
                  <div className="absolute inset-x-4 top-0 bottom-0 bg-black/60 shadow-[inset_0_0_30px_rgba(0,0,0,0.9)] rounded flex items-center justify-center border-x-8 border-b-8 border-[#1a0f0b]">
                      {!isSolved && (
                          <div onClick={() => onSolve()} className="w-20 h-40 cursor-pointer hover:scale-110 transition-transform relative group bg-gray-800 border border-gray-600 flex items-center justify-center shadow-lg">
                             <div className="text-white text-xs writing-vertical font-serif opacity-70">李氏之位</div>
                             <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                      )}
                      {isSolved && <span className="text-gray-600 text-sm font-serif">空无一物</span>}
                  </div>
                  <div onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                      className={`absolute inset-0 bg-[#4e342e] rounded border-t border-white/10 shadow-[0_10px_20px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center cursor-pointer transition-all duration-700 ease-in-out ${isDrawerOpen ? 'translate-y-48' : 'translate-y-0'}`}
                  >
                      <div className="w-8 h-8 rounded-full bg-amber-800 shadow-md border border-amber-950"></div>
                      <span className="text-[#a1887f] text-xs font-serif opacity-50 mt-4">{isDrawerOpen ? "点击关闭" : "点击打开"}</span>
                  </div>
              </div>
          </div>
        )}

        {/* PAPER CLUE VIEW */}
        {type === 'paper_clue' && (
           <div className="flex flex-col items-center">
             <div className="bg-[#d4c5b0] text-black p-8 rounded shadow-lg max-w-sm rotate-1 font-serif relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-50"></div>
               <div className="relative z-10 border-2 border-black/80 p-6">
                 <h3 className="text-center text-2xl font-bold mb-6 border-b border-black/50 pb-2">庚帖</h3>
                 <div className="w-32 h-32 bg-gray-400 mx-auto mb-6 grayscale contrast-125 rounded-full overflow-hidden border-4 border-black/80">
                    <img src="https://picsum.photos/200/200?grayscale" alt="face" className="w-full h-full object-cover" />
                 </div>
                 <p className="text-xl text-center font-bold mb-4">姓名: [玩家]</p>
                 <div className="space-y-2 text-sm font-semibold opacity-80">
                   <p>忌：出行，动土，安床。</p>
                   <p>宜：祭祀，入殓，破土。</p>
                 </div>
                 <div className="mt-6 border-t border-black/50 pt-2 flex justify-end">
                    <div className="w-16 h-16 bg-red-900/20 rounded-full border-2 border-red-900/50 rotate-12 flex items-center justify-center text-red-900 font-bold text-xs">
                        命中缺水
                    </div>
                 </div>
               </div>
             </div>
           </div>
        )}

        {/* TABLETS PUZZLE */}
        {type === 'tablets' && (
          <div className="flex flex-col items-center">
             <h2 className="text-red-600 text-3xl mb-10 font-serif tracking-[0.5em] border-b border-red-900/50 pb-2">列祖列宗</h2>
             <div className="flex gap-6 p-10 bg-black/60 rounded-lg border border-red-900/30 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
               {tablets.map((name, index) => (
                 <div 
                   key={index}
                   onClick={() => handleTabletClick(index)}
                   className={`
                     w-20 h-48 border-2 flex flex-col items-center justify-start pt-6 cursor-pointer hover:-translate-y-2 transition-transform shadow-[0_5px_15px_rgba(0,0,0,0.8)] relative
                     ${name ? 'bg-[#212121] border-amber-800/50' : 'bg-black/80 border-gray-800 shadow-none'}
                   `}
                 >
                   {name ? (
                      <>
                        <span className="text-amber-500 font-serif text-3xl writing-vertical opacity-80 select-none">{name}氏</span>
                        <div className="absolute bottom-2 w-full h-1 bg-red-900/30"></div>
                      </>
                   ) : (
                      <span className="text-gray-700 text-xs mt-20">空缺</span>
                   )}
                 </div>
               ))}
             </div>
             <p className="text-gray-500 mt-6 text-sm font-serif">
                {!tablets.includes(null) ? "请按长幼尊卑(赵钱孙李周)排列" : "灵位缺失，需补全"}
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PuzzleOverlay;
