<?php

namespace App\Exceptions\Sport;

use App\Models\Sport;
use Exception;

class SportCapacityExceededException extends Exception
{
    /**
     * Create exception for sport capacity exceeded
     */
    public static function forSport(Sport $sport): self
    {
        return new self(
            "Sport '{$sport->name}' has reached maximum capacity of {$sport->capacity} members."
        );
    }

    /**
     * Create exception with current enrollment count
     */
    public static function withCount(Sport $sport, int $currentCount): self
    {
        return new self(
            "Sport '{$sport->name}' has reached maximum capacity. " .
            "Current enrollment: {$currentCount}/{$sport->capacity}"
        );
    }
}
