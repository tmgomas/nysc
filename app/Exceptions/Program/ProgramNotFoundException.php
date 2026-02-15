<?php

namespace App\Exceptions\Program;

use Exception;

class ProgramNotFoundException extends Exception
{
    /**
     * Create exception for program not found by ID
     */
    public static function withId(string $id): self
    {
        return new self("Program with ID '{$id}' not found.");
    }

    /**
     * Create exception for program not found by name
     */
    public static function withName(string $name): self
    {
        return new self("Program '{$name}' not found.");
    }
}
