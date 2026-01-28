<?php

namespace App\Exceptions\Sport;

use Exception;

class SportNotFoundException extends Exception
{
    /**
     * Create exception for sport not found by ID
     */
    public static function withId(string $id): self
    {
        return new self("Sport with ID '{$id}' not found.");
    }

    /**
     * Create exception for sport not found by name
     */
    public static function withName(string $name): self
    {
        return new self("Sport '{$name}' not found.");
    }
}
