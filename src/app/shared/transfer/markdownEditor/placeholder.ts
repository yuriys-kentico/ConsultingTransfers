import { Node } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export const placeholder = () =>
  new Plugin({
    props: {
      decorations: state => {
        const decorations: Decoration[] = [];

        const decorate = (node: Node, pos: number) => {
          if (node.type.isBlock && node.childCount === 0 && state.doc.content.size < 3) {
            decorations.push(
              Decoration.node(pos, pos + node.nodeSize, {
                class: 'placeholder'
              })
            );
          }
        };

        state.doc.descendants(decorate);

        return DecorationSet.create(state.doc, decorations);
      }
    }
  });
