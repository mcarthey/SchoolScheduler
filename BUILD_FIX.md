# ? BUILD FIX - Arrow Functions in Templates

## Issue
Angular build failed with error:
```
NG5002: Parser Error: Bindings cannot contain assignments
getDepartmentProgress().filter(d => d.complete).length
```

## Root Cause
**Arrow functions are not allowed in Angular templates** for production builds.

The template had:
```html
{{ getDepartmentProgress().filter(d => d.complete).length }}
```

This works in development but fails in production builds because:
- Angular's AOT compiler doesn't support arrow functions in templates
- Template expressions must be simple property access or method calls

## Solution
Created helper methods in the TypeScript component:

```typescript
getCompleteDepartmentCount(): number {
  return this.getDepartmentProgress().filter(d => d.complete).length;
}

getTotalDepartmentCount(): number {
  return this.getDepartmentProgress().length;
}
```

Updated template to use helper methods:
```html
{{ getCompleteDepartmentCount() }} / {{ getTotalDepartmentCount() }} depts ?
```

## Files Changed
- ? `scheduler-ui/src/app/course-planner.component.ts` - Added 2 helper methods
- ? `scheduler-ui/src/app/course-planner.component.html` - Replaced arrow function with method calls

## Build Status
? **Build successful** (312.19 kB total bundle size)
? **No TypeScript errors**
? **No template errors**

## Why This Matters
- **Development mode**: Arrow functions work (JIT compilation)
- **Production mode**: Arrow functions fail (AOT compilation)
- **Best practice**: Keep templates simple, move logic to TypeScript

## Testing
Run production build:
```powershell
cd scheduler-ui
npm run build
```

Expected output:
```
? Building...
Application bundle generation complete.
Output location: E:\Documents\dev\repos\SchoolScheduler\scheduler-ui\dist\scheduler-ui
```

## Lesson Learned
**Template Expressions Best Practices:**
- ? DO: Use simple property access (`user.name`)
- ? DO: Call methods without complex logic (`getTotal()`)
- ? DON'T: Use arrow functions (`items.filter(x => x.active)`)
- ? DON'T: Use assignments (`count = count + 1`)
- ? DON'T: Use complex expressions with operators

**Solution**: Move complex logic to TypeScript methods!
