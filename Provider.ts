/**
 * This interface is extended by the provider classes that
 * must have an iterable (starting from the branches and ending at the root) tree-like structure
 */
export interface Provider{
    /**
     * gets the next item in the branch-to-root traversal
     */
    getHigherScope():Provider;
}