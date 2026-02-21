
import { Node, mergeAttributes } from "@tiptap/core";

export const ReadOnlyImage = Node.create({
    name: "image",
    group: "block",
    selectable: true,
    draggable: false, // ✅ Read-only mode
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
        return ["img", mergeAttributes(HTMLAttributes, {
            class: "max-w-sm h-auto rounded-lg cursor-pointer"
        })];
    },

    addNodeView() {
        return ({ node }) => {
            const wrapper = document.createElement("div");
            wrapper.className = "relative inline-block";

            const img = document.createElement("img");
            img.src = node.attrs.src;
            img.alt = node.attrs.alt || "";
            img.className = "max-w-sm h-auto rounded-lg";

            // ✅ No delete button in read-only mode
            wrapper.appendChild(img);

            return {
                dom: wrapper,
            };
        };
    }
});