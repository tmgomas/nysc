# Display Sport References in Member Show Page

## Backend (Already Done ✅)

Sport references are already loaded via the `sports` relationship with pivot data.

```php
// MemberController.php - show() method
$member->load(['user', 'sports', ...]);
```

## Frontend Update Needed

### Location: `resources/js/Pages/Admin/Members/Show.tsx`

### Add Sport References Display

Find the section where member sports are displayed and add sport reference numbers:

```tsx
{member.sports.map((sport) => (
  <div key={sport.id} className="sport-card">
    <h3>{sport.name}</h3>
    
    {/* ADD THIS: Sport Reference Display */}
    {sport.pivot.sport_reference && (
      <div className="sport-reference">
        <span className="label">Sport Reference:</span>
        <span className="reference-number">{sport.pivot.sport_reference}</span>
      </div>
    )}
    
    {/* Existing sport details */}
    <div>Monthly Fee: Rs. {sport.monthly_fee}</div>
    <div>Status: {sport.pivot.status}</div>
  </div>
))}
```

### Example Display Format

```
┌─────────────────────────────────────┐
│ Swimming                            │
│ Sport Reference: 26-SW-0001         │
│ Monthly Fee: Rs. 2000               │
│ Status: Active                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Cricket                             │
│ Sport Reference: 26-CR-0001         │
│ Monthly Fee: Rs. 1500               │
│ Status: Active                      │
└─────────────────────────────────────┘
```

### Alternative: Add to Member Info Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Member Information</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Member Number</Label>
        <div className="font-mono text-lg">{member.member_number}</div>
      </div>
      
      <div>
        <Label>Primary Registration Reference</Label>
        <div className="font-mono text-lg">{member.registration_reference}</div>
      </div>
      
      {/* Sport-specific references */}
      <div className="col-span-2">
        <Label>Sport References</Label>
        <div className="space-y-2 mt-2">
          {member.sports.map((sport) => (
            <div key={sport.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>{sport.name}</span>
              <span className="font-mono text-sm">
                {sport.pivot.sport_reference || 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

## Data Structure

The `member.sports` array contains:

```typescript
{
  id: string;
  name: string;
  monthly_fee: number;
  admission_fee: number;
  pivot: {
    member_id: string;
    sport_id: string;
    sport_reference: string; // ⭐ This is what you need!
    enrolled_at: string;
    status: string;
  }
}
```

## Quick Implementation

1. Open `resources/js/Pages/Admin/Members/Show.tsx`
2. Find where sports are displayed (search for `member.sports`)
3. Add `sport.pivot.sport_reference` display
4. Style it to match your design

## Example Styled Component

```tsx
<div className="bg-white rounded-lg shadow p-4">
  <div className="flex items-center justify-between mb-2">
    <h4 className="font-semibold">{sport.name}</h4>
    <Badge variant={sport.pivot.status === 'active' ? 'success' : 'secondary'}>
      {sport.pivot.status}
    </Badge>
  </div>
  
  {sport.pivot.sport_reference && (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Hash className="h-4 w-4" />
      <span className="font-mono">{sport.pivot.sport_reference}</span>
    </div>
  )}
  
  <div className="mt-2 text-sm text-gray-500">
    Monthly Fee: Rs. {sport.monthly_fee.toLocaleString()}
  </div>
</div>
```

## Summary

✅ Backend already provides `sport_reference` via pivot data  
✅ Access it via `sport.pivot.sport_reference`  
✅ Display it wherever you show member sports  
✅ Show "Pending" if reference is null (member not yet approved)  

🎨 Style it to match your existing design!
