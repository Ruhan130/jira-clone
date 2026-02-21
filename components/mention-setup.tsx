
import Mention from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { MentionList } from './mention-list';


export const createMentionExtension = (users: any[]) => {
  return Mention.configure({
    HTMLAttributes: {
      class: 'mention bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-medium',
    },
    suggestion: {
      items: ({ query }: { query: string }) => {
        return users
          .filter(user => 
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5); // Limit to 5 suggestions
      },
      render: () => {
        let component: ReactRenderer;
        let popup: any;

        return {
          onStart: (props: any) => {
            component = new ReactRenderer(MentionList, {
              props,
              editor: props.editor,
            });

            popup = tippy('body', {
              getReferenceClientRect: props.clientRect,
              appendTo: () => document.body,
              content: component.element,
              showOnCreate: true,
              interactive: true,
              trigger: 'manual',
              placement: 'bottom-start',
            });
          },
          onUpdate(props: any) {
            component.updateProps(props);
            popup[0].setProps({
              getReferenceClientRect: props.clientRect,
            });
          },
          onKeyDown(props: any) {
            if (props.event.key === 'Escape') {
              popup[0].hide();
              return true;
            }
            // If MentionList does not expose onKeyDown, just return false or handle accordingly
            return false;
          },
          onExit() {
            popup[0].destroy();
            component.destroy();
          },
        };
      },
    },
  });
};