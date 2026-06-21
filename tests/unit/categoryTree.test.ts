import { describe, expect, it } from "vitest";

import { buildCategoryTree } from "@/services/categoryService";

import type { CategoryFlatItem } from "@/types/categories";

const flatFixture: CategoryFlatItem[] = [
  {
    id: "root-1",
    parentId: null,
    sortOrder: 0,
    status: "published",
    name: "Electronics",
    slug: "electronics",
    description: null,
    productCount: 1,
    childrenCount: 1,
    seoScore: 80,
    coverThumbnailUrl: null,
    coverAlt: null,
    updatedAt: new Date(),
  },
  {
    id: "child-1",
    parentId: "root-1",
    sortOrder: 0,
    status: "published",
    name: "Phones",
    slug: "phones",
    description: null,
    productCount: 0,
    childrenCount: 0,
    seoScore: null,
    coverThumbnailUrl: "https://example.com/cover.jpg",
    coverAlt: "Phones cover",
    updatedAt: new Date(),
  },
];

describe("buildCategoryTree", () => {
  it("nests children under parents", () => {
    const tree = buildCategoryTree(flatFixture);

    expect(tree).toHaveLength(1);
    expect(tree[0]?.id).toBe("root-1");
    expect(tree[0]?.children).toHaveLength(1);
    expect(tree[0]?.children[0]?.id).toBe("child-1");
  });

  it("sorts siblings by sort order then name", () => {
    const tree = buildCategoryTree([
      ...flatFixture,
      {
        id: "root-2",
        parentId: null,
        sortOrder: 1,
        status: "draft",
        name: "Home",
        slug: "home",
        description: null,
        productCount: 0,
        childrenCount: 0,
        seoScore: null,
        coverThumbnailUrl: null,
        coverAlt: null,
        updatedAt: new Date(),
      },
    ]);

    expect(tree.map((node) => node.id)).toEqual(["root-1", "root-2"]);
  });
});
