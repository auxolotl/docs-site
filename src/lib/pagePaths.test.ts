import { it, expect, describe } from "vitest";
import { allPageAndDirectoryPaths, relativePagePaths, type PageLinkData } from "./pagePaths";
import type { CollectionEntry } from "astro:content";

describe("relativePagePaths", () => {
    it("returns the current page when it does not exist in the set", () => {
        // Act
        const result = relativePagePaths([], "current");

        // Assert
        const currentPage: PageLinkData = {
            id: "current",
            data: { title: "current" }
        };
        expect(result.currentPage).toMatchObject(currentPage);
    });

    it("returns the current page when it exists in the set", () => {
        // Arrange
        const currentPage: PageLinkData = {
            id: "current",
            data: { title: "Current Page" }
        };

        // Act
        const result = relativePagePaths([currentPage], "current");

        // Assert
        expect(result.currentPage).toMatchObject(currentPage);
    });

    it("returns the current page when it exists in the set and there are other pages in the set", () => {
        // Arrange
        const currentPage: PageLinkData = {
            id: "current",
            data: { title: "Current Page" }
        };
        const otherPage: PageLinkData = {
            id: "notcurrent",
            data: { title: "Should not be the current page" }
        };

        // Act
        const result = relativePagePaths([
            otherPage,
            currentPage,
            otherPage,
            otherPage
        ], "current");

        // Assert
        expect(result.currentPage).toMatchObject(currentPage);
    });

    it("returns the current page when it does not exist in the set but there are other pages in the set", () => {
        // Arrange
        const otherPage: PageLinkData = {
            id: "notcurrent",
            data: { title: "Should not be the current page" }
        };

        // Act
        const result = relativePagePaths([
            otherPage,
            otherPage,
            otherPage
        ], "current");

        // Assert
        const currentPage: PageLinkData = {
            id: "current",
            data: { title: "current" }
        };
        expect(result.currentPage).toMatchObject(currentPage);
    });

    it("returns pages in the same directory as siblingPages when the directory is /", () => {
        // Arrange
        const currentPage: PageLinkData = {
            id: "current",
            data: { title: "Current Page" }
        };
        const otherPages: PageLinkData[] = [
            {
                id: "notcurrent",
                data: { title: "Should not be the current page" }
            },
            {
                id: "alsonotcurrent",
                data: { title: "Should also not be the current page" }
            },
            {
                id: "notcurrent2",
                data: { title: "Should still not be the current page" }
            }
        ];

        // Act
        const result = relativePagePaths([
            currentPage,
            ...otherPages
        ], "current");

        // Assert
        expect(result.siblingPages).toEqual(expect.arrayContaining(otherPages));
        expect(result.siblingPages).toHaveLength(otherPages.length);
    });

    it("returns pages in the same directory as siblingPages when the directory is not /", () => {
        // Arrange
        const currentPage: PageLinkData = {
            id: "thisdir/current",
            data: { title: "Current Page" }
        };
        const otherPages: PageLinkData[] = [
            {
                id: "thisdir/notcurrent",
                data: { title: "Should not be the current page" }
            },
            {
                id: "thisdir/alsonotcurrent",
                data: { title: "Should also not be the current page" }
            },
            {
                id: "thisdir/notcurrent2",
                data: { title: "Should still not be the current page" }
            }
        ];

        // Act
        const result = relativePagePaths([
            currentPage,
            ...otherPages
        ], "thisdir/current");

        // Assert
        expect(result.siblingPages).toEqual(expect.arrayContaining(otherPages));
        expect(result.siblingPages).toHaveLength(otherPages.length);
    });

    it("does not return pages in different directories as siblingPages when the directory is /", () => {
        // Arrange
        const currentPage: PageLinkData = {
            id: "current",
            data: { title: "Current Page" }
        };
        const otherPages: PageLinkData[] = [
            {
                id: "otherdir/notcurrent",
                data: { title: "Should not be the current page" }
            },
            {
                id: "current/child",
                data: { title: "Not a sibling!" }
            },
            {
                id: "thisdir/lowerdown/notcurrent2",
                data: { title: "Should still not be the current page" }
            }
        ];

        // Act
        const result = relativePagePaths([
            currentPage,
            ...otherPages
        ], "current");

        // Assert
        expect(result.siblingPages).toEqual([]);
    });

    it("does not return pages in different directories as siblingPages when the directory is not /", () => {
        // Arrange
        const currentPage: PageLinkData = {
            id: "thisdir/current",
            data: { title: "Current Page" }
        };
        const otherPages: PageLinkData[] = [
            {
                id: "otherdir/notcurrent",
                data: { title: "Should not be the current page" }
            },
            {
                id: "alsonotcurrent",
                data: { title: "Should also not be the current page" }
            },
            {
                id: "thisdir/current/child",
                data: { title: "Not a sibling!" }
            },
            {
                id: "thisdir/lowerdown/notcurrent2",
                data: { title: "Should still not be the current page" }
            }
        ];

        // Act
        const result = relativePagePaths([
            currentPage,
            ...otherPages
        ], "thisdir/current");

        // Assert
        expect(result.siblingPages).toEqual([]);
    });

    it("returns exclusively pages which are direct children when dir is /", () => {
        // Arrange
        const currentPage: PageLinkData = {
            id: "current",
            data: { title: "Current Page" }
        };
        const otherPages: PageLinkData[] = [
            {
                id: "otherdir/notcurrent",
                data: { title: "Should not be the current page" }
            },
            {
                id: "alsonotcurrent",
                data: { title: "Should also not be the current page" }
            },
            {
                id: "somedir/lowerdown/notcurrent2",
                data: { title: "Should still not be the current page" }
            },
            {
                id: "current/child2/level2",
                data: { title: "A 2nd-level child!" }
            },
        ];
        const childPages: PageLinkData[] = [
            {
                id: "current/child",
                data: { title: "A child!" }
            },
        ];

        // Act
        const result = relativePagePaths([
            currentPage,
            ...otherPages,
            ...childPages
        ], "current");

        // Assert
        expect(result.childPages).toEqual(expect.arrayContaining(childPages));
        expect(result.childPages).toHaveLength(childPages.length);
    });

    it("returns exclusively pages which are direct children when dir is not /", () => {
        // Arrange
        const currentPage: PageLinkData = {
            id: "thisdir/current",
            data: { title: "Current Page" }
        };
        const otherPages: PageLinkData[] = [
            {
                id: "otherdir/notcurrent",
                data: { title: "Should not be the current page" }
            },
            {
                id: "alsonotcurrent",
                data: { title: "Should also not be the current page" }
            },
            {
                id: "thisdir/lowerdown/notcurrent2",
                data: { title: "Should still not be the current page" }
            },
            {
                id: "thisdir/current/child2/level2",
                data: { title: "A 2nd-level child!" }
            },
        ];
        const childPages: PageLinkData[] = [
            {
                id: "thisdir/current/child",
                data: { title: "A child!" }
            },
        ];

        // Act
        const result = relativePagePaths([
            currentPage,
            ...otherPages,
            ...childPages
        ], "thisdir/current");

        // Assert
        expect(result.childPages).toEqual(expect.arrayContaining(childPages));
        expect(result.childPages).toHaveLength(childPages.length);
    });

    it("returns nonempty directories which are direct children when dir is not /", () => {
        // Arrange
        const pages: PageLinkData[] = [
            {
                id: "thisdir/current/child/level2.1",
                data: { title: "level2.1" }
            },
            {
                id: "thisdir/current/child/level2.2",
                data: { title: "level2.2" }
            },
            {
                id: "thisdir/current/child/level2/level3",
                data: { title: "level3.1" }
            },
            {
                id: "thisdir/current/child2/level2/level3",
                data: { title: "level3.2" }
            },
            {
                id: "thisdir/current/child3",
                data: { title: "just a child 3 page" }
            },
            {
                id: "thisdir/current/child3/level2/level3",
                data: { title: "level3.3" }
            },
        ];

        // Act
        const result = relativePagePaths(pages, "thisdir/current");

        // Assert
        const childDirectories: PageLinkData[] = [
            {
                id: "thisdir/current/child",
                data: { title: "child" }
            },
            {
                id: "thisdir/current/child2",
                data: { title: "child2" }
            },
            {
                id: "thisdir/current/child3",
                data: { title: "just a child 3 page" }
            },
        ];
        expect(result.childDirectories).toEqual(expect.arrayContaining(childDirectories));
        expect(result.childDirectories).toHaveLength(childDirectories.length);
    });

    it("returns nonempty directories which are direct children when dir is /", () => {
        // Arrange
        const pages: PageLinkData[] = [
            {
                id: "current/child/level2.1",
                data: { title: "level2.1" }
            },
            {
                id: "current/child/level2.2",
                data: { title: "level2.2" }
            },
            {
                id: "current/child/level2/level3",
                data: { title: "level3.1" }
            },
            {
                id: "current/child2/level2/level3",
                data: { title: "level3.2" }
            },
            {
                id: "current/child3",
                data: { title: "just a child 3 page" }
            },
            {
                id: "current/child3/level2/level3",
                data: { title: "level3.3" }
            },
            {
                id: "sibling/dir",
                data: { title: "siblingdirpage" }
            },
        ];

        // Act
        const result = relativePagePaths(pages, "current");

        // Assert
        const childDirectories: PageLinkData[] = [
            {
                id: "current/child",
                data: { title: "child" }
            },
            {
                id: "current/child2",
                data: { title: "child2" }
            },
            {
                id: "current/child3",
                data: { title: "just a child 3 page" }
            },
        ];
        expect(result.childDirectories).toEqual(expect.arrayContaining(childDirectories));
        expect(result.childDirectories).toHaveLength(childDirectories.length);
    });

    it("returns sibling directories when dir is not /", () => {
        // Arrange
        const pages: PageLinkData[] = [
            {
                id: "dir/sibling/level2.1",
                data: { title: "level2.1" }
            },
            {
                id: "dir/sibling/level2.2",
                data: { title: "level2.2" }
            },
            {
                id: "dir/sibling/level2/level3",
                data: { title: "level3.1" }
            },
            {
                id: "dir/sibling2/level2/level3",
                data: { title: "level3.2" }
            },
            {
                id: "dir/sibling3",
                data: { title: "just a sibling 3 page" }
            },
            {
                id: "dir/sibling3/level2/level3",
                data: { title: "level3.3" }
            },
        ];

        // Act
        const result = relativePagePaths(pages, "dir/current");

        // Assert
        const siblingDirectories: PageLinkData[] = [
            {
                id: "dir/sibling",
                data: { title: "sibling" }
            },
            {
                id: "dir/sibling2",
                data: { title: "sibling2" }
            },
            {
                id: "dir/sibling3",
                data: { title: "just a sibling 3 page" }
            },
        ];
        expect(result.siblingDirectories).toEqual(expect.arrayContaining(siblingDirectories));
        expect(result.siblingDirectories).toHaveLength(siblingDirectories.length);
    });

    it("returns sibling directories when dir is /", () => {
        // Arrange
        const pages: PageLinkData[] = [
            {
                id: "sibling/level2.1",
                data: { title: "level2.1" }
            },
            {
                id: "sibling/level2.2",
                data: { title: "level2.2" }
            },
            {
                id: "sibling/level2/level3",
                data: { title: "level3.1" }
            },
            {
                id: "sibling2/level2/level3",
                data: { title: "level3.2" }
            },
            {
                id: "sibling3",
                data: { title: "just a sibling 3 page" }
            },
            {
                id: "sibling3/level2/level3",
                data: { title: "level3.3" }
            },
        ];

        // Act
        const result = relativePagePaths(pages, "current");

        // Assert
        const siblingDirectories: PageLinkData[] = [
            {
                id: "sibling",
                data: { title: "sibling" }
            },
            {
                id: "sibling2",
                data: { title: "sibling2" }
            },
            {
                id: "sibling3",
                data: { title: "just a sibling 3 page" }
            },
        ];
        expect(result.siblingDirectories).toEqual(expect.arrayContaining(siblingDirectories));
        expect(result.siblingDirectories).toHaveLength(siblingDirectories.length);
    });

    it("does not return siblingPages pages for directories on the same level", () => {
        // Arrange
        const pages: PageLinkData[] = [
            {
                id: "sibling/level2.1",
                data: { title: "level2.1" }
            },
            {
                id: "sibling/level2.2",
                data: { title: "level2.2" }
            },
            {
                id: "sibling/level2/level3",
                data: { title: "level3.1" }
            },
            {
                id: "sibling2/level2/level3",
                data: { title: "level3.2" }
            },
            {
                id: "sibling3",
                data: { title: "just a sibling 3 page" }
            },
            {
                id: "sibling3/level2/level3",
                data: { title: "level3.3" }
            },
        ];

        // Act
        const result = relativePagePaths(pages, "current");

        // Assert
        expect(result.siblingPages).toEqual([]);
    });

    it("does not return childPages pages for directories which are direct children", () => {
        // Arrange
        const pages: PageLinkData[] = [
            {
                id: "thisdir/current/child/level2.1",
                data: { title: "level2.1" }
            },
            {
                id: "thisdir/current/child/level2.2",
                data: { title: "level2.2" }
            },
            {
                id: "thisdir/current/child/level2/level3",
                data: { title: "level3.1" }
            },
            {
                id: "thisdir/current/child2/level2/level3",
                data: { title: "level3.2" }
            },
            {
                id: "thisdir/current/child3",
                data: { title: "just a child 3 page" }
            },
            {
                id: "thisdir/current/child3/level2/level3",
                data: { title: "level3.3" }
            },
        ];

        // Act
        const result = relativePagePaths(pages, "thisdir/current");

        // Assert
        expect(result.childPages).toEqual([]);
    });

    it("returns directories which are direct children but only have subdirectories", () => {
        // Arrange
        const pages: PageLinkData[] = [
            {
                id: "current/child/subdirectory/second_subdirectory/page",
                data: { title: "deeply nested page" }
            },
        ];

        // Act
        const result = relativePagePaths(pages, "current");

        // Assert
        const childDirectories: PageLinkData[] = [
            {
                id: "current/child",
                data: { title: "child" }
            },
        ];
        expect(result.childDirectories).toEqual(expect.arrayContaining(childDirectories));
        expect(result.childDirectories).toHaveLength(childDirectories.length);
    });

    it("returns directories which are siblings but only have subdirectories", () => {
        // Arrange
        const pages: PageLinkData[] = [
            {
                id: "sibling/subdirectory/second_subdirectory/page",
                data: { title: "deeply nested page" }
            },
        ];

        // Act
        const result = relativePagePaths(pages, "current");

        // Assert
        const siblingDirectories: PageLinkData[] = [
            {
                id: "sibling",
                data: { title: "sibling" }
            },
        ];
        expect(result.siblingDirectories).toEqual(expect.arrayContaining(siblingDirectories));
        expect(result.siblingDirectories).toHaveLength(siblingDirectories.length);
    });

    it("returns a generic parentDirectory if there is no page there", () => {
        // Act
        const result = relativePagePaths([], "some/dir/current");

        // Assert
        expect(result.parentDirectory).toEqual({
            id: "some/dir",
            data: { title: "dir" }
        });
    });

    it("returns a specific parent directory if there is a page there", () => {
        // Arrange
        const parentDirectory: PageLinkData = {
            id: "some/dir",
            data: { title: "A Parent Directory Page" }
        };

        // Act
        const result = relativePagePaths([parentDirectory], "some/dir/current");

        // Assert
        expect(result.parentDirectory).toEqual(parentDirectory);
    });

    it("returns parentDirectory null if we are at the top directory", () => {
        // Act
        const result = relativePagePaths([], "current");

        // Assert
        expect(result.parentDirectory).toEqual(null);
    });

    it("(.md extensions) returns the current page when it exists in the set", () => {
        // Arrange
        const currentPage: PageLinkData = {
            id: "current.md",
            data: { title: "Current Page" }
        };

        // Act
        const result = relativePagePaths([currentPage], "current");

        // Assert
        expect(result.currentPage).toMatchObject(currentPage);
    });

    it("(.md extensions, .md currentPage) returns the current page when it exists in the set", () => {
        // Arrange
        const currentPage: PageLinkData = {
            id: "current.md",
            data: { title: "Current Page" }
        };

        // Act
        const result = relativePagePaths([currentPage], "current.md");

        // Assert
        expect(result.currentPage).toMatchObject(currentPage);
    });

    it("(.md currentPage only) returns the current page when it exists in the set", () => {
        // Arrange
        const currentPage: PageLinkData = {
            id: "current",
            data: { title: "Current Page" }
        };

        // Act
        const result = relativePagePaths([currentPage], "current.md");

        // Assert
        expect(result.currentPage).toMatchObject(currentPage);
    });

    it("(.md extensions) returns the current page when it exists in the set and there are other pages in the set", () => {
        // Arrange
        const currentPage: PageLinkData = {
            id: "current.md",
            data: { title: "Current Page" }
        };
        const otherPage: PageLinkData = {
            id: "notcurrent.md",
            data: { title: "Should not be the current page" }
        };

        // Act
        const result = relativePagePaths([
            otherPage,
            currentPage,
            otherPage,
            otherPage
        ], "current");

        // Assert
        expect(result.currentPage).toMatchObject(currentPage);
    });

    it("(.md extensions) returns the current page when it does not exist in the set but there are other pages in the set", () => {
        // Arrange
        const otherPage: PageLinkData = {
            id: "notcurrent.md",
            data: { title: "Should not be the current page" }
        };

        // Act
        const result = relativePagePaths([
            otherPage,
            otherPage,
            otherPage
        ], "current");

        // Assert
        const currentPage: PageLinkData = {
            id: "current",
            data: { title: "current" }
        };
        expect(result.currentPage).toMatchObject(currentPage);
    });

    it("(.md extensions) returns pages in the same directory as siblingPages when the directory is /", () => {
        // Arrange
        const currentPage: PageLinkData = {
            id: "current.md",
            data: { title: "Current Page" }
        };
        const otherPages: PageLinkData[] = [
            {
                id: "notcurrent.md",
                data: { title: "Should not be the current page" }
            },
            {
                id: "alsonotcurrent.md",
                data: { title: "Should also not be the current page" }
            },
            {
                id: "notcurrent2.md",
                data: { title: "Should still not be the current page" }
            }
        ];

        // Act
        const result = relativePagePaths([
            currentPage,
            ...otherPages
        ], "current");

        // Assert
        expect(result.siblingPages).toEqual(expect.arrayContaining(otherPages));
        expect(result.siblingPages).toHaveLength(otherPages.length);
    });

    it("(.md extensions) returns pages in the same directory as siblingPages when the directory is not /", () => {
        // Arrange
        const currentPage: PageLinkData = {
            id: "thisdir/current.md",
            data: { title: "Current Page" }
        };
        const otherPages: PageLinkData[] = [
            {
                id: "thisdir/notcurrent.md",
                data: { title: "Should not be the current page" }
            },
            {
                id: "thisdir/alsonotcurrent.md",
                data: { title: "Should also not be the current page" }
            },
            {
                id: "thisdir/notcurrent2.md",
                data: { title: "Should still not be the current page" }
            }
        ];

        // Act
        const result = relativePagePaths([
            currentPage,
            ...otherPages
        ], "thisdir/current");

        // Assert
        expect(result.siblingPages).toEqual(expect.arrayContaining(otherPages));
        expect(result.siblingPages).toHaveLength(otherPages.length);
    });

    it("(.md extensions) does not return pages in different directories as siblingPages when the directory is /", () => {
        // Arrange
        const currentPage: PageLinkData = {
            id: "current.md",
            data: { title: "Current Page" }
        };
        const otherPages: PageLinkData[] = [
            {
                id: "otherdir/notcurrent.md",
                data: { title: "Should not be the current page" }
            },
            {
                id: "current/child.md",
                data: { title: "Not a sibling!" }
            },
            {
                id: "thisdir/lowerdown/notcurrent2.md",
                data: { title: "Should still not be the current page" }
            }
        ];

        // Act
        const result = relativePagePaths([
            currentPage,
            ...otherPages
        ], "current");

        // Assert
        expect(result.siblingPages).toEqual([]);
    });

    it("(.md extensions) does not return pages in different directories as siblingPages when the directory is not /", () => {
        // Arrange
        const currentPage: PageLinkData = {
            id: "thisdir/current.md",
            data: { title: "Current Page" }
        };
        const otherPages: PageLinkData[] = [
            {
                id: "otherdir/notcurrent.md",
                data: { title: "Should not be the current page" }
            },
            {
                id: "alsonotcurrent.md",
                data: { title: "Should also not be the current page" }
            },
            {
                id: "thisdir/current/child.md",
                data: { title: "Not a sibling!" }
            },
            {
                id: "thisdir/lowerdown/notcurrent2.md",
                data: { title: "Should still not be the current page" }
            }
        ];

        // Act
        const result = relativePagePaths([
            currentPage,
            ...otherPages
        ], "thisdir/current");

        // Assert
        expect(result.siblingPages).toEqual([]);
    });

    it("(.md extensions) returns exclusively pages which are direct children when dir is /", () => {
        // Arrange
        const currentPage: PageLinkData = {
            id: "current.md",
            data: { title: "Current Page" }
        };
        const otherPages: PageLinkData[] = [
            {
                id: "otherdir/notcurrent.md",
                data: { title: "Should not be the current page" }
            },
            {
                id: "alsonotcurrent.md",
                data: { title: "Should also not be the current page" }
            },
            {
                id: "somedir/lowerdown/notcurrent2.md",
                data: { title: "Should still not be the current page" }
            },
            {
                id: "current/child2/level2.md",
                data: { title: "A 2nd-level child!" }
            },
        ];
        const childPages: PageLinkData[] = [
            {
                id: "current/child.md",
                data: { title: "A child!" }
            },
        ];

        // Act
        const result = relativePagePaths([
            currentPage,
            ...otherPages,
            ...childPages
        ], "current");

        // Assert
        expect(result.childPages).toEqual(expect.arrayContaining(childPages));
        expect(result.childPages).toHaveLength(childPages.length);
    });

    it("(.md extensions) returns exclusively pages which are direct children when dir is not /", () => {
        // Arrange
        const currentPage: PageLinkData = {
            id: "thisdir/current.md",
            data: { title: "Current Page" }
        };
        const otherPages: PageLinkData[] = [
            {
                id: "otherdir/notcurrent.md",
                data: { title: "Should not be the current page" }
            },
            {
                id: "alsonotcurrent.md",
                data: { title: "Should also not be the current page" }
            },
            {
                id: "thisdir/lowerdown/notcurrent2.md",
                data: { title: "Should still not be the current page" }
            },
            {
                id: "thisdir/current/child2/level2.md",
                data: { title: "A 2nd-level child!" }
            },
        ];
        const childPages: PageLinkData[] = [
            {
                id: "thisdir/current/child.md",
                data: { title: "A child!" }
            },
        ];

        // Act
        const result = relativePagePaths([
            currentPage,
            ...otherPages,
            ...childPages
        ], "thisdir/current");

        // Assert
        expect(result.childPages).toEqual(expect.arrayContaining(childPages));
        expect(result.childPages).toHaveLength(childPages.length);
    });

    it("(.md extensions) returns nonempty directories which are direct children when dir is not /", () => {
        // Arrange
        const pages: PageLinkData[] = [
            {
                id: "thisdir/current/child/level2.1.md",
                data: { title: "level2.1" }
            },
            {
                id: "thisdir/current/child/level2.2.md",
                data: { title: "level2.2" }
            },
            {
                id: "thisdir/current/child/level2/level3.md",
                data: { title: "level3.1" }
            },
            {
                id: "thisdir/current/child2/level2/level3.md",
                data: { title: "level3.2" }
            },
            {
                id: "thisdir/current/child3.md",
                data: { title: "just a child 3 page" }
            },
            {
                id: "thisdir/current/child3/level2/level3.md",
                data: { title: "level3.3" }
            },
        ];

        // Act
        const result = relativePagePaths(pages, "thisdir/current");

        // Assert
        const childDirectories: PageLinkData[] = [
            {
                id: "thisdir/current/child",
                data: { title: "child" }
            },
            {
                id: "thisdir/current/child2",
                data: { title: "child2" }
            },
            {
                id: "thisdir/current/child3.md",
                data: { title: "just a child 3 page" }
            },
        ];
        expect(result.childDirectories).toEqual(expect.arrayContaining(childDirectories));
        expect(result.childDirectories).toHaveLength(childDirectories.length);
    });

    it("(.md extensions) returns nonempty directories which are direct children when dir is /", () => {
        // Arrange
        const pages: PageLinkData[] = [
            {
                id: "current/child/level2.1.md",
                data: { title: "level2.1" }
            },
            {
                id: "current/child/level2.2.md",
                data: { title: "level2.2" }
            },
            {
                id: "current/child/level2/level3.md",
                data: { title: "level3.1" }
            },
            {
                id: "current/child2/level2/level3.md",
                data: { title: "level3.2" }
            },
            {
                id: "current/child3.md",
                data: { title: "just a child 3 page" }
            },
            {
                id: "current/child3/level2/level3.md",
                data: { title: "level3.3" }
            },
            {
                id: "sibling/dir.md",
                data: { title: "siblingdirpage" }
            },
        ];

        // Act
        const result = relativePagePaths(pages, "current");

        // Assert
        const childDirectories: PageLinkData[] = [
            {
                id: "current/child",
                data: { title: "child" }
            },
            {
                id: "current/child2",
                data: { title: "child2" }
            },
            {
                id: "current/child3.md",
                data: { title: "just a child 3 page" }
            },
        ];
        expect(result.childDirectories).toEqual(expect.arrayContaining(childDirectories));
        expect(result.childDirectories).toHaveLength(childDirectories.length);
    });

    it("(.md extensions) returns sibling directories when dir is not /", () => {
        // Arrange
        const pages: PageLinkData[] = [
            {
                id: "dir/sibling/level2.1.md",
                data: { title: "level2.1" }
            },
            {
                id: "dir/sibling/level2.2.md",
                data: { title: "level2.2" }
            },
            {
                id: "dir/sibling/level2/level3.md",
                data: { title: "level3.1" }
            },
            {
                id: "dir/sibling2/level2/level3.md",
                data: { title: "level3.2" }
            },
            {
                id: "dir/sibling3.md",
                data: { title: "just a sibling 3 page" }
            },
            {
                id: "dir/sibling3/level2/level3.md",
                data: { title: "level3.3" }
            },
        ];

        // Act
        const result = relativePagePaths(pages, "dir/current");

        // Assert
        const siblingDirectories: PageLinkData[] = [
            {
                id: "dir/sibling",
                data: { title: "sibling" }
            },
            {
                id: "dir/sibling2",
                data: { title: "sibling2" }
            },
            {
                id: "dir/sibling3.md",
                data: { title: "just a sibling 3 page" }
            },
        ];
        expect(result.siblingDirectories).toEqual(expect.arrayContaining(siblingDirectories));
        expect(result.siblingDirectories).toHaveLength(siblingDirectories.length);
    });

    it("(.md extensions) returns sibling directories when dir is /", () => {
        // Arrange
        const pages: PageLinkData[] = [
            {
                id: "sibling/level2.1.md",
                data: { title: "level2.1" }
            },
            {
                id: "sibling/level2.2.md",
                data: { title: "level2.2" }
            },
            {
                id: "sibling/level2/level3.md",
                data: { title: "level3.1" }
            },
            {
                id: "sibling2/level2/level3.md",
                data: { title: "level3.2" }
            },
            {
                id: "sibling3.md",
                data: { title: "just a sibling 3 page" }
            },
            {
                id: "sibling3/level2/level3.md",
                data: { title: "level3.3" }
            },
        ];

        // Act
        const result = relativePagePaths(pages, "current");

        // Assert
        const siblingDirectories: PageLinkData[] = [
            {
                id: "sibling",
                data: { title: "sibling" }
            },
            {
                id: "sibling2",
                data: { title: "sibling2" }
            },
            {
                id: "sibling3.md",
                data: { title: "just a sibling 3 page" }
            },
        ];
        expect(result.siblingDirectories).toEqual(expect.arrayContaining(siblingDirectories));
        expect(result.siblingDirectories).toHaveLength(siblingDirectories.length);
    });

    it("(.md extensions) does not return siblingPages pages for directories on the same level", () => {
        // Arrange
        const pages: PageLinkData[] = [
            {
                id: "sibling/level2.1.md",
                data: { title: "level2.1" }
            },
            {
                id: "sibling/level2.2.md",
                data: { title: "level2.2" }
            },
            {
                id: "sibling/level2/level3.md",
                data: { title: "level3.1" }
            },
            {
                id: "sibling2/level2/level3.md",
                data: { title: "level3.2" }
            },
            {
                id: "sibling3.md",
                data: { title: "just a sibling 3 page" }
            },
            {
                id: "sibling3/level2/level3.md",
                data: { title: "level3.3" }
            },
        ];

        // Act
        const result = relativePagePaths(pages, "current");

        // Assert
        expect(result.siblingPages).toEqual([]);
    });

    it("(.md extensions) does not return childPages pages for directories which are direct children", () => {
        // Arrange
        const pages: PageLinkData[] = [
            {
                id: "thisdir/current/child/level2.1.md",
                data: { title: "level2.1" }
            },
            {
                id: "thisdir/current/child/level2.2.md",
                data: { title: "level2.2" }
            },
            {
                id: "thisdir/current/child/level2/level3.md",
                data: { title: "level3.1" }
            },
            {
                id: "thisdir/current/child2/level2/level3.md",
                data: { title: "level3.2" }
            },
            {
                id: "thisdir/current/child3.md",
                data: { title: "just a child 3 page" }
            },
            {
                id: "thisdir/current/child3/level2/level3.md",
                data: { title: "level3.3" }
            },
        ];

        // Act
        const result = relativePagePaths(pages, "thisdir/current");

        // Assert
        expect(result.childPages).toEqual([]);
    });

    it("(.md extensions) returns directories which are direct children but only have subdirectories", () => {
        // Arrange
        const pages: PageLinkData[] = [
            {
                id: "current/child/subdirectory/second_subdirectory/page.md",
                data: { title: "deeply nested page" }
            },
        ];

        // Act
        const result = relativePagePaths(pages, "current");

        // Assert
        const childDirectories: PageLinkData[] = [
            {
                id: "current/child",
                data: { title: "child" }
            },
        ];
        expect(result.childDirectories).toEqual(expect.arrayContaining(childDirectories));
        expect(result.childDirectories).toHaveLength(childDirectories.length);
    });

    it("(.md extensions) returns directories which are siblings but only have subdirectories", () => {
        // Arrange
        const pages: PageLinkData[] = [
            {
                id: "sibling/subdirectory/second_subdirectory/page.md",
                data: { title: "deeply nested page" }
            },
        ];

        // Act
        const result = relativePagePaths(pages, "current");

        // Assert
        const siblingDirectories: PageLinkData[] = [
            {
                id: "sibling",
                data: { title: "sibling" }
            },
        ];
        expect(result.siblingDirectories).toEqual(expect.arrayContaining(siblingDirectories));
        expect(result.siblingDirectories).toHaveLength(siblingDirectories.length);
    });

    it("(.md extensions) returns a generic parentDirectory if there is no page there", () => {
        // Act
        const result = relativePagePaths([], "some/dir/current.md");

        // Assert
        expect(result.parentDirectory).toEqual({
            id: "some/dir",
            data: { title: "dir" }
        });
    });

    it("(.md extensions) returns a specific parent directory if there is a page there", () => {
        // Arrange
        const parentDirectory: PageLinkData = {
            id: "some/dir",
            data: { title: "A Parent Directory Page.md" }
        };

        // Act
        const result = relativePagePaths([parentDirectory], "some/dir/current");

        // Assert
        expect(result.parentDirectory).toEqual(parentDirectory);
    });
});

describe("allPageAndDirectoryPaths", () => {
    it("returns a page when it exists", () => {
        // Arrange
        const pageObject = {
            ["current.md"]: {
                id: "current.md"
            }
        };
        const nonDirectoryPages = Object.values(pageObject).filter(page => page != null);
        const pages = Array.from(nonDirectoryPages) as unknown as CollectionEntry<"wiki">[];

        // Act
        const result = allPageAndDirectoryPaths(pages);

        // Assert
        expect(Object.fromEntries(result)).toMatchObject(pageObject);
    });
    it("returns parent directories when they exist", () => {
        // Arrange
        const pageObject = {
            ["directory/current.md"]: {
                id: "directory/current.md"
            },
            ["directory"]: null,
        };
        const nonDirectoryPages = Object.values(pageObject).filter(page => page != null);
        const pages = Array.from(nonDirectoryPages) as unknown as CollectionEntry<"wiki">[];

        // Act
        const result = allPageAndDirectoryPaths(pages);

        // Assert
        expect(Object.fromEntries(result)).toMatchObject(pageObject);
    });
    it("returns only a single directory instance when there are multiple pages", () => {
        // Arrange
        const pageObject = {
            ["directory/current.md"]: {
                id: "directory/current.md"
            },
            ["directory/current2.md"]: {
                id: "directory/current2.md"
            },
            ["directory"]: null,
        };
        const nonDirectoryPages = Object.values(pageObject).filter(page => page != null);
        const pages = Array.from(nonDirectoryPages) as unknown as CollectionEntry<"wiki">[];

        // Act
        const result = allPageAndDirectoryPaths(pages);

        // Assert
        expect(Object.fromEntries(result)).toMatchObject(pageObject);
    });
    it("returns nested subdirectories", () => {
        // Arrange
        const pageObject = {
            ["directory/subdirectory/subsubdirectory/current.md"]: {
                id: "directory/subdirectory/subsubdirectory/current.md"
            },
            ["directory/current2.md"]: {
                id: "directory/current2.md"
            },
            ["directory"]: null,
            ["directory/subdirectory"]: null,
            ["directory/subdirectory/subsubdirectory"]: null,
        };
        const nonDirectoryPages = Object.values(pageObject).filter(page => page != null);
        const pages = Array.from(nonDirectoryPages) as unknown as CollectionEntry<"wiki">[];

        // Act
        const result = allPageAndDirectoryPaths(pages);

        // Assert
        expect(Object.fromEntries(result)).toMatchObject(pageObject);
    });

});