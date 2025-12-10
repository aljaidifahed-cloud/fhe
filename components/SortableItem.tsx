import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
    id: string;
    children: React.ReactNode;
    className?: string; // Allow passing grid/layout classes
}

export const SortableItem: React.FC<SortableItemProps> = ({ id, children, className }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto', // Ensure dragging item is on top
        opacity: isDragging ? 0.8 : 1,
        position: 'relative' as 'relative',
        touchAction: 'none' // Prevent scrolling while dragging on touch devices if needed
    };

    // The 'className' prop allows the parent to define grid col spans (e.g. col-span-2)
    // We apply the 'attributes' and 'listeners' to the wrapper div so the whole item is a drag handle.
    // Alternatively, we could expose a handle, but for dashboard widgets, dragging the whole card is common.
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={className}>
            {children}
        </div>
    );
};
