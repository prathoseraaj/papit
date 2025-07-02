import { Extension } from "@tiptap/core";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Plugin } from "prosemirror-state";

export interface CollabCursorUser {
  id: string;
  name: string;
  color: string;
  cursor: { from: number; to: number };
}

export interface CollabCursorOptions {
  users: CollabCursorUser[];
  currentUserId: string;
}

export const CollaborativeCursor = Extension.create<CollabCursorOptions>({
  name: "collaborativeCursor",

  addOptions() {
    return {
      users: [],
      currentUserId: "",
    };
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          decorations: (state) => {
            const { doc } = state;
            const decorations: Decoration[] = [];
            this.options.users
              .filter((u) => u.cursor && u.id !== this.options.currentUserId)
              .forEach((user) => {
                const { from, to } = user.cursor;
                // Caret
                if (from === to) {
                  decorations.push(
                    Decoration.widget(from, () => {
                      const el = document.createElement("span");
                      el.className = "collab-cursor";
                      el.style.borderLeft = `2px solid ${user.color}`;
                      el.style.marginLeft = "-1px";
                      el.style.height = "1.2em";
                      el.style.position = "relative";
                      el.style.zIndex = "10";

                      const label = document.createElement("div");
                      label.className = "collab-cursor-label";
                      label.textContent = user.name;
                      label.style.position = "absolute";
                      label.style.top = "-1.5em";
                      label.style.left = "0";
                      label.style.background = user.color;
                      label.style.color = "#fff";
                      label.style.fontSize = "0.8em";
                      label.style.padding = "2px 6px";
                      label.style.borderRadius = "4px";
                      label.style.whiteSpace = "nowrap";
                      label.style.fontWeight = "bold";
                      label.style.pointerEvents = "none";

                      el.appendChild(label);
                      return el;
                    })
                  );
                } else {
                  // Selection highlight
                  decorations.push(
                    Decoration.inline(from, to, {
                      style: `background: ${user.color}55; border-radius: 2px;`,
                    })
                  );
                }
              });
            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});
