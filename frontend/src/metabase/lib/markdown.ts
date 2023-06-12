import type { Options } from "react-markdown/lib/rehype-filter";
import rehypeFilter from "react-markdown/lib/rehype-filter";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const REMARK_PLUGINS = [remarkGfm];

export type Root = ReturnType<typeof parseMarkdown>;

export type Content = Root["children"];

export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type Node = ArrayElement<Content>;

export const getLeadingText = (value: string): string => {
  const root = parseMarkdown(value);

  for (const child of root.children) {
    const text = renderText(child);

    if (text) {
      return text;
    }
  }

  return "";
};

const renderText = (node: Node): string => {
  if (node.type === "text") {
    return node.value;
  }

  if (node.type === "element") {
    return node.children.map(renderText).join("");
  }

  return "";
};

export const parseMarkdown = (value: string, options: Options = {}) => {
  const processor = unified()
    .use(remarkParse)
    .use(REMARK_PLUGINS)
    .use(remarkRehype)
    .use(rehypeFilter, options);
  const file = { value };
  const root = processor.runSync(processor.parse(file), file);

  return root;
};
