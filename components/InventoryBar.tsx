import React from 'react';
import { Item } from '../types';
import { FileText, Flame, Disc, Key, Map, Layers, Ghost } from 'lucide-react';

interface InventoryBarProps {
  inventory: Item[];
  selectedItem: Item | null;
  onSelectItem: (item: Item) => void;
}

const InventoryBar: React.FC<InventoryBarProps> = ({ inventory, selectedItem, onSelectItem }) => {
  const getItemIcon = (item: Item) => {
    switch (item) {
      case Item.BURNT_PAPER: return <FileText className="text-gray-400" />;
      case Item.LIGHTER: return <Flame className="text-orange-500" />;
      case Item.MIRROR_FRAGMENT: return <Disc className="text-yellow-200" />;
      case Item.CANDLE: return <div className="h-6 w-2 bg-red-700 mx-auto" />;
      case Item.KEY: return <Key className="text-yellow-600" />;
      case Item.SPIRIT_TABLET_CLOCK: 
      case Item.SPIRIT_TABLET_DRAWER:
          return <div className="h-8 w-4 bg-gray-800 border border-gray-500 mx-auto text-[8px] text-center text-white pt-1">灵</div>;
      case Item.DRAWING_MAP: return <Map className="text-amber-200" />;
      case Item.DRAWING_ARRANGEMENT: return <Layers className="text-amber-200" />;
      default: return <div className="w-4 h-4 bg-gray-500" />;
    }
  };

  const getItemName = (item: Item) => {
    switch (item) {
      case Item.BURNT_PAPER: return "烧残的纸";
      case Item.LIGHTER: return "打火机";
      case Item.MIRROR_FRAGMENT: return "铜镜碎片";
      case Item.CANDLE: return "蜡烛";
      case Item.KEY: return "钥匙";
      case Item.SPIRIT_TABLET_CLOCK: return "灵牌(钟)";
      case Item.SPIRIT_TABLET_DRAWER: return "灵牌(柜)";
      case Item.DRAWING_MAP: return "构造图";
      case Item.DRAWING_ARRANGEMENT: return "陈列图";
      default: return "未知";
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full h-24 bg-black/90 border-t-2 border-red-900 flex items-center justify-center gap-4 px-4 z-50">
      {inventory.length === 0 && <span className="text-gray-600 text-sm">暂无物品</span>}
      {inventory.map((item, index) => (
        <div 
          key={index}
          onClick={() => onSelectItem(item)}
          className={`
            relative w-16 h-16 border-2 flex flex-col items-center justify-center cursor-pointer transition-all
            ${selectedItem === item ? 'border-red-500 bg-red-900/30 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'border-gray-700 hover:border-gray-500 bg-gray-900'}
          `}
        >
          {getItemIcon(item)}
          <span className="text-[10px] text-gray-300 mt-1">{getItemName(item)}</span>
        </div>
      ))}
    </div>
  );
};

export default InventoryBar;