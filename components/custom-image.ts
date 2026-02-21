
import { Node, mergeAttributes } from "@tiptap/core";
export const CustomImage = Node.create({
    name: "image",
    group: "block",
    selectable: true,
    draggable: true,
    atom: true,

    addAttributes() {
        return {
            src: { default: null },
            alt: { default: null },
        };
    },

    parseHTML() {
        return [{ tag: "img[src]" }];
    },

    renderHTML({ HTMLAttributes }) {
        return ["img", mergeAttributes(HTMLAttributes)];
    },

    addNodeView() {
        return ({ node, getPos, editor }) => {
            const wrapper = document.createElement("div");
            wrapper.className = "relative group inline-block";

            const img = document.createElement("img");
            img.src = node.attrs.src;
            img.alt = node.attrs.alt || "";

            img.className = `
        max-w-[300px] 
        h-auto 
        border border-gray-300 
        rounded-lg 
        block mx-auto
    `;

            const btn = document.createElement("button");
            btn.innerText = "✕";
            btn.className = `
      absolute top-1 right-1 
      bg-gray-800 text-white 
      rounded-lg w-7 h-6 text-xs 
      flex items-center justify-center 
      opacity-0 group-hover:opacity-100 
      transition-opacity duration-200
    `;

            btn.onclick = () => {
                const pos = getPos?.();
                if (typeof pos === "number") {
                    editor.chain().focus().deleteRange({ from: pos, to: pos + 1 }).run();
                }
            };

            wrapper.appendChild(img);
            wrapper.appendChild(btn);

            return {
                dom: wrapper,
            };
        };
    }

});
