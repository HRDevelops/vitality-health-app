import { LucideIcon } from 'lucide-react';
import BottomSheet from '../../../components/ui/BottomSheet';

export interface CategoryItem {
  id: string;
  label: string;
  icon: LucideIcon;
  bg: string;
  fg: string;
}

interface AllCategoriesModalProps {
  categories: CategoryItem[];
  onSelect: (id: string) => void;
  onClose: () => void;
}

export default function AllCategoriesModal({ categories, onSelect, onClose }: AllCategoriesModalProps) {
  return (
    <BottomSheet title="All Categories" subtitle="Explore everything Vitality has to offer" onClose={onClose} testId="all-categories-modal-overlay">
      <div className="grid grid-cols-3 gap-4" data-testid="all-categories-modal">
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              data-testid={`all-categories-item-${c.id}`}
              className="flex flex-col items-center gap-2"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-full shadow-sm ${c.bg} ${c.fg}`}>
                <Icon size={24} />
              </div>
              <span className="text-center font-label-bold text-[10px] text-on-surface-variant">{c.label}</span>
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
