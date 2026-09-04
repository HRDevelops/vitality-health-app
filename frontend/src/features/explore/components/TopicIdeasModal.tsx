import BottomSheet from '../../../components/ui/BottomSheet';

interface IdeaItem {
  name: string;
  detail: string;
}

interface TopicIdeasModalProps {
  title: string;
  subtitle: string;
  items: IdeaItem[];
  onClose: () => void;
}

export default function TopicIdeasModal({ title, subtitle, items, onClose }: TopicIdeasModalProps) {
  return (
    <BottomSheet title={title} subtitle={subtitle} onClose={onClose} testId="topic-ideas-modal-overlay">
      <div className="space-y-3" data-testid="topic-ideas-modal">
        {items.map((item) => (
          <div
            key={item.name}
            data-testid={`topic-idea-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            className="rounded-2xl bg-surface-container-low p-4"
          >
            <p className="font-body-lg text-body-lg font-semibold text-on-surface">{item.name}</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{item.detail}</p>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}
