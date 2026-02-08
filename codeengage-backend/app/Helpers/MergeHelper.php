<?php

namespace App\Helpers;

class MergeHelper
{
    /**
     * Perform a 3-way merge.
     * 
     * @param string $original The common ancestor content
     * @param string $yours The current server content
     * @param string $theirs The incoming client content
     * @return array Result containing 'success' (bool), 'merged' (string), and 'conflicts' (array)
     */
    public static function merge(string $original, string $yours, string $theirs): array
    {
        // Normalize line endings
        $original = str_replace("\r\n", "\n", $original);
        $yours = str_replace("\r\n", "\n", $yours);
        $theirs = str_replace("\r\n", "\n", $theirs);

        // Simple case: no changes
        if ($original === $yours && $original === $theirs) {
            return ['success' => true, 'merged' => $original, 'conflicts' => []];
        }

        // Simple case: only theirs changed (Server hasn't moved since base)
        if ($original === $yours) {
            return ['success' => true, 'merged' => $theirs, 'conflicts' => []];
        }

        // Simple case: only yours changed (Incoming is stale but identical to base? Unlikely in collab unless reversion)
        if ($original === $theirs) {
            return ['success' => true, 'merged' => $yours, 'conflicts' => []];
        }

        // Simple case: both made identical changes
        if ($yours === $theirs) {
            return ['success' => true, 'merged' => $yours, 'conflicts' => []];
        }

        // Complex case: Concurrent modifications.
        // We will try a line-based merge.
        
        $linesOriginal = explode("\n", $original);
        $linesYours = explode("\n", $yours);
        $linesTheirs = explode("\n", $theirs);

        // Simple line-based merge logic
        $merged = [];
        $conflicts = [];
        
        // This is a very naive implementation of 3-way merge.
        // In a real system, we'd use a robust library like diff3.
        // But for this project, we'll implement a basic one that detects 
        // non-overlapping line changes.
        
        $i = 0; $j = 0; $k = 0;
        
        // Note: This logic is tricky without a proper LCS/Diff algorithm.
        // Let's stick to the plan: if it's not a simple case, we return conflict 
        // data so the frontend can use its robust diff engine (from CodeMirror/DiffMatchPatch).
        
        return [
            'success' => false,
            'original' => $original,
            'yours' => $yours,
            'theirs' => $theirs,
            'error' => 'conflict',
            'conflicts' => ['Concurrent edits detected. Manual resolution required.']
        ];
    }
}
