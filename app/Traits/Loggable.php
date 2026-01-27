<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

trait Loggable
{
    /**
     * Boot the trait
     */
    protected static function bootLoggable()
    {
        static::created(function ($model) {
            $model->logActivity('created', 'Created new ' . class_basename($model));
        });

        static::updated(function ($model) {
            $model->logActivity('updated', 'Updated ' . class_basename($model), $model->getChanges());
        });

        static::deleted(function ($model) {
            $model->logActivity('deleted', 'Deleted ' . class_basename($model));
        });
    }

    /**
     * Get all activity logs for this model
     */
    public function activityLogs()
    {
        return ActivityLog::where('model_type', get_class($this))
            ->where('model_id', $this->id)
            ->latest();
    }

    /**
     * Log an activity
     */
    public function logActivity(string $action, string $description, array $changes = [])
    {
        return ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'model_type' => get_class($this),
            'model_id' => $this->id,
            'description' => $description,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'changes' => $changes,
        ]);
    }

    /**
     * Log a custom activity
     */
    public function log(string $action, string $description, array $changes = [])
    {
        return $this->logActivity($action, $description, $changes);
    }

    /**
     * Get recent activity logs
     */
    public function recentActivity($limit = 10)
    {
        return $this->activityLogs()->limit($limit)->get();
    }

    /**
     * Get activity logs by action
     */
    public function activityByAction(string $action)
    {
        return $this->activityLogs()->where('action', $action);
    }

    /**
     * Get activity logs by user
     */
    public function activityByUser($userId)
    {
        return $this->activityLogs()->where('user_id', $userId);
    }
}
