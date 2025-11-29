# Immediate Actions - This Week

## 🚀 Quick Wins (4 hours total)

### 1. Enable TypeScript Strict Unused Checks (30 min)

**File**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**Then run**:
```bash
npm run type-check
```

**Fix any errors** by:
- Removing unused code
- Prefixing intentionally unused params with `_`
- Using `// eslint-disable-next-line` only when necessary

---

### 2. Delete Dead Code (15 min)

**Files to delete**:
```bash
rm src/components/views/PlannerView.tsx
rm src/components/views/StoryBoardsView.tsx
rm src/components/views/AddStoriesView.tsx
```

**Verify no references**:
```bash
grep -r "PlannerView[^R]" src/
grep -r "StoryBoardsView[^R]" src/
grep -r "AddStoriesView[^R]" src/
```

---

### 3. Set Up Test Coverage Reporting (1 hour)

**File**: `vitest.config.ts`

Add coverage configuration:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
```

**Update package.json**:
```json
{
  "scripts": {
    "test:coverage": "vitest run --coverage",
    "test:coverage:watch": "vitest --coverage"
  }
}
```

---

### 4. Write First Critical Tests (2 hours)

**Priority order**:

1. **`usePlannerLogic.test.ts`** (30 min)
   - Test filter updates
   - Test filtered stories
   - Test stats calculation

2. **`plannerService.test.ts`** (30 min)
   - Test getFilteredStories
   - Test getPlannerStats
   - Test getRecommendations

3. **`StoryCard.test.tsx`** (1 hour)
   - Test rendering
   - Test interactions
   - Test accessibility

**Template**:
```typescript
// src/hooks/__tests__/usePlannerLogic.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlannerLogic } from '../usePlannerLogic';
import { createMockStory, createMockSettings } from '@/test/test-utils';

describe('usePlannerLogic', () => {
  it('should filter stories by brain level', () => {
    const stories = [
      createMockStory({ weight: 5 }), // moderate
      createMockStory({ weight: 1 }), // low
    ];
    const settings = createMockSettings();
    
    const { result } = renderHook(() => 
      usePlannerLogic(stories, settings)
    );
    
    act(() => {
      result.current.updateFilter('brainLevel', 'moderate');
    });
    
    expect(result.current.filteredStories).toHaveLength(1);
    expect(result.current.filteredStories[0].weight).toBe(5);
  });
});
```

---

## 📋 This Week's Checklist

- [ ] Enable TypeScript strict unused checks
- [ ] Fix all TypeScript errors
- [ ] Delete 3 old component files
- [ ] Verify no broken imports
- [ ] Set up coverage reporting
- [ ] Write tests for `usePlannerLogic`
- [ ] Write tests for `PlannerService`
- [ ] Write tests for `StoryCard`
- [ ] Run full test suite
- [ ] Check coverage report

---

## 🎯 Success Criteria

After this week:
- ✅ TypeScript compiles with strict unused checks
- ✅ No dead code in codebase
- ✅ Test coverage reporting works
- ✅ At least 3 new test files added
- ✅ Coverage > 20% (starting point)

---

## 📊 Next Week Preview

**Week 2 Focus**: 
- Continue test coverage (target: 50%)
- Extract sprint/board atoms from appStore
- Start breaking down large components

