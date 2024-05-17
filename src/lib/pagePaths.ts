import type { CollectionEntry } from "astro:content";
import { parse, join, sep } from "node:path";

export interface PageLinkData {
    id: string;
    data: { title: string; };
}

type AllPathInformation = Map<string, CollectionEntry<"wiki"> | null>;

export interface Paths {
    siblingPages: PageLinkData[];
    siblingDirectories: PageLinkData[];
    childPages: PageLinkData[];
    childDirectories: PageLinkData[];

    parentDirectory: PageLinkData | null;
    currentPage: PageLinkData;
};

export function relativePagePaths(wikiEntries: PageLinkData[], currentPath: string): Paths {
    let currentPage: PageLinkData | undefined;
    let parentDirectory: PageLinkData | undefined | null;
    const siblingPages: Map<string, PageLinkData> = new Map();
    const childPages: Map<string, PageLinkData> = new Map();

    const currentPathParsed = parse(currentPath);
    const currentPathExtensionless = join(currentPathParsed.dir, currentPathParsed.name);

    const childDirectoryPaths: Set<string> = new Set();
    const siblingDirectoryPaths: Set<string> = new Set();

    for (const entry of wikiEntries) {
        const pagePathParsed = parse(entry.id);
        const pagePathExtensionless = join(pagePathParsed.dir, pagePathParsed.name);

        if (pagePathExtensionless === currentPathExtensionless) {
            currentPage = entry
            continue;
        }

        const isInCurrentDirectory = pagePathParsed.dir === currentPathParsed.dir;
        if (isInCurrentDirectory) {
            siblingPages.set(pagePathExtensionless, entry);
            continue;
        }

        const isDirectChild = pagePathParsed.dir === currentPathExtensionless;
        if (isDirectChild) {
            childPages.set(pagePathExtensionless, entry);
            continue;
        }

        const isIndirectChild = pagePathParsed.dir.startsWith(currentPathExtensionless + sep);
        if (isIndirectChild) {
            const nextPathSeparator = pagePathParsed.dir.indexOf(sep, currentPathExtensionless.length + 1);

            if (nextPathSeparator === -1) {
                childDirectoryPaths.add(pagePathParsed.dir);
                continue;
            }

            childDirectoryPaths.add(pagePathParsed.dir.slice(0, nextPathSeparator));
            continue;
        }

        const isIndirectInCurrentDirectory = currentPathParsed.dir === "" || pagePathParsed.dir.startsWith(currentPathParsed.dir + sep);
        if (isIndirectInCurrentDirectory) {
            const nextPathSeparator = pagePathParsed.dir.indexOf(sep, currentPathParsed.dir.length + 1);

            if (nextPathSeparator === -1) {
                siblingDirectoryPaths.add(pagePathParsed.dir);
                continue;
            }

            siblingDirectoryPaths.add(pagePathParsed.dir.slice(0, nextPathSeparator));
            continue;
        }

        const isParentDirectory = pagePathExtensionless === currentPathParsed.dir;
        if (isParentDirectory) {
            parentDirectory = entry;
        }
    }

    const childDirectories: PageLinkData[] = [];
    for (const childDirectoryPath of childDirectoryPaths.values()) {
        const childDirectoryPage = childPages.get(childDirectoryPath);
        if (childDirectoryPage) {
            childDirectories.push(childDirectoryPage);
            childPages.delete(childDirectoryPath);
            continue;
        }

        const childDirectoryPathParsed = parse(childDirectoryPath);
        childDirectories.push({
            id: childDirectoryPath,
            data: { title: childDirectoryPathParsed.name }
        });
    }

    const siblingDirectories: PageLinkData[] = [];
    for (const siblingDirectoryPath of siblingDirectoryPaths.values()) {
        const siblingDirectoryPage = siblingPages.get(siblingDirectoryPath);
        if (siblingDirectoryPage) {
            siblingDirectories.push(siblingDirectoryPage);
            siblingPages.delete(siblingDirectoryPath);
            continue;
        }

        const siblingDirectoryPathParsed = parse(siblingDirectoryPath);
        siblingDirectories.push({
            id: siblingDirectoryPath,
            data: { title: siblingDirectoryPathParsed.name }
        });
    }

    if (currentPage === undefined) {
        currentPage = {
            id: currentPath,
            data: { title: currentPathParsed.name }
        };
    }

    if (parentDirectory === undefined) {
        if (currentPathParsed.dir) {
            const parentDirectoryPathParsed = parse(currentPathParsed.dir);
            parentDirectory = {
                id: currentPathParsed.dir,
                data: { title: parentDirectoryPathParsed.name }
            };
        } else {
            parentDirectory = null;
        }
    }

    return {
        siblingPages: Array.from(siblingPages.values()),
        childPages: Array.from(childPages.values()),

        siblingDirectories,
        childDirectories,

        currentPage,
        parentDirectory,
    }
}

export function allPageAndDirectoryPaths(wikiEntries: CollectionEntry<"wiki">[]): AllPathInformation {
    const pathInformation: Map<string, CollectionEntry<"wiki"> | null> = new Map();

    for (const entry of wikiEntries) {
        pathInformation.set(entry.id, entry);

        let parsedEntryPath = parse(entry.id);
        while (parsedEntryPath.dir) {
            pathInformation.set(parsedEntryPath.dir, null);
            parsedEntryPath = parse(parsedEntryPath.dir);
        }
    }

    return pathInformation;
}