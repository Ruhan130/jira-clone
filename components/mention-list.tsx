// lib/extensions/MentionList.tsx
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MentionListProps {
  items: Array<{
    $id: string;
    name: string;
    email: string;
    profileImage?: string;
  }>;
  command: (item: any) => void;
}

export const MentionList = forwardRef<any, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({
        id: item.$id,
        label: item.name,
      });
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }
      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }
      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="bg-white border rounded-lg shadow-lg p-1 max-h-60 overflow-auto">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            key={item.$id}
            className={`flex items-center gap-2 w-full text-left p-2 rounded hover:bg-gray-100 ${
              index === selectedIndex ? 'bg-blue-50' : ''
            }`}
            onClick={() => selectItem(index)}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={item.profileImage} />
              <AvatarFallback className="text-xs">
                {item.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{item.name}</div>
              <div className="text-xs text-gray-500 truncate">{item.email}</div>
            </div>
          </button>
        ))
      ) : (
        <div className="p-2 text-sm text-gray-500">No users found</div>
      )}
    </div>
  );
});

MentionList.displayName = 'MentionList';