<?php

namespace App\Exceptions\Program;

use App\Models\Program;
use Exception;

class ProgramCapacityExceededException extends Exception
{
    /**
     * Create exception for program capacity exceeded
     */
    public static function forProgram(Program $program): self
    {
        return new self(
            "Program '{$program->name}' has reached maximum capacity of {$program->capacity} members."
        );
    }

    /**
     * Create exception with current enrollment count
     */
    public static function withCount(Program $program, int $currentCount): self
    {
        return new self(
            "Program '{$program->name}' has reached maximum capacity. " .
            "Current enrollment: {$currentCount}/{$program->capacity}"
        );
    }
}
