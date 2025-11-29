# Code Quality Roadmap - Senior SWE Recommendations

## Executive Summary

Your codebase has undergone excellent refactoring work. The architecture is solid with custom hooks, service layers, and good separation of concerns. However, there are strategic improvements needed to achieve production-grade code quality.

**Current State**: Good foundation, needs testing, cleanup, and hardening  
**Target State**: Production-ready, maintainable, well-tested codebase

---

## 🎯 Priority Matrix

### **P0 - Critical (Do First)**
1. **Testing Infrastructure** - Zero test coverage is a critical risk
2. **Remove Dead Code** - Old components create confusion and maintenance burden
3. **TypeScript Strictness** - Enable unused variable checks

### **P1 - High Impact (Do Next)**
4. **Store Organization** - Extract sprint/board atoms from appStore
5. **Component Size Reduction** - Break down large components
6. **Error Handling Standardization** - Ensure consistent patterns

### **P2 - Quality Improvements (Do Soon)**
7. **Documentation** - API docs and component docs
8. **Performance Monitoring** - Add metrics and monitoring
9. **Accessibility Audit** - Verify WCAG compliance

### **P3 - Nice to Have (Do Later)**
10. **Code Splitting** - Optimize bundle sizes
11. **E2E Testing** - Add integration tests
12. **CI/CD Pipeline** - Automated quality gates

---

## 📋 Detailed Action Plan

### **Phase 1: Foundation & Safety (Weeks 1-2)**

#### 1.1 Testing Infrastructure ⚠️ **CRITICAL**

**Current State**: Only 2 test files exist (`storyService.test.ts`, `useStoryFilters.test.ts`)

**Actions**:
```bash
# Priority test targets:
1. Core hooks (usePlannerLogic, useReviewLogic, useSprintPlanningLogic)
2. Services (PlannerService, ReviewService, StoryService)
3. Critical utilities (storyUtils, validationUtils, recurrenceUtils)
4. Shared components (StoryCard, ErrorBoundary)
```

**Implementation**:
- [ ] Set up test coverage reporting (target: 70%+ for critical paths)
- [ ] Add tests for all custom hooks
- [ ] Add tests for all service classes
- [ ] Add tests for critical utility functions
- [ ] Add component tests for shared components
- [ ] Configure coverage thresholds in `vitest.config.ts`

**Files to Create**:
```
src/hooks/__tests__/
  - usePlannerLogic.test.ts
  - useReviewLogic.test.ts
  - useSprintPlanningLogic.test.ts
  - useStorySelection.test.ts
  - useStoryDragAndDrop.test.ts

src/services/__tests__/
  - plannerService.test.ts
  - reviewService.test.ts

src/utils/__tests__/
  - storyUtils.test.ts
  - validationUtils.test.ts
  - recurrenceUtils.test.ts

src/components/shared/__tests__/
  - StoryCard.test.tsx
  - ErrorBoundary.test.tsx
```

**Success Criteria**: 
- 70%+ coverage on hooks, services, and utilities
- All critical paths have tests
- CI fails if coverage drops below threshold

---

#### 1.2 Remove Dead Code 🧹

**Current State**: Old components exist alongside refactored versions

**Actions**:
- [ ] Delete `PlannerView.tsx` (replaced by `PlannerViewRefactored`)
- [ ] Delete `StoryBoardsView.tsx` (replaced by `StoryBoardsViewRefactored`)
- [ ] Delete `AddStoriesView.tsx` (replaced by `AddStoriesViewRefactored`)
- [ ] Verify no imports reference old components
- [ ] Update any documentation referencing old components

**Verification**:
```bash
# Search for any remaining references
grep -r "PlannerView[^R]" src/
grep -r "StoryBoardsView[^R]" src/
grep -r "AddStoriesView[^R]" src/
```

**Files to Delete**:
- `src/components/views/PlannerView.tsx`
- `src/components/views/StoryBoardsView.tsx`
- `src/components/views/AddStoriesView.tsx`

**Success Criteria**: 
- No old components exist
- No broken imports
- Build passes

---

#### 1.3 TypeScript Strictness 🔒

**Current State**: `noUnusedLocals` and `noUnusedParameters` are disabled

**Actions**:
- [ ] Enable `noUnusedLocals: true` in `tsconfig.json`
- [ ] Enable `noUnusedParameters: true` in `tsconfig.json`
- [ ] Fix all unused variable/parameter errors
- [ ] Use `_` prefix for intentionally unused parameters
- [ ] Remove truly unused code

**Implementation**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**Success Criteria**: 
- TypeScript compiles with strict unused checks
- All unused code removed or properly marked

---

### **Phase 2: Architecture Improvements (Weeks 3-4)**

#### 2.1 Store Organization 🏗️

**Current State**: `appStore.ts` is a 359-line re-export hub with mixed concerns

**Actions**:
- [ ] Extract sprint-related atoms to `sprintStore.ts`
- [ ] Extract board/column atoms to `boardStore.ts`
- [ ] Keep `appStore.ts` as a thin re-export layer for backward compatibility
- [ ] Update imports to use domain-specific stores directly

**New File Structure**:
```
src/stores/
  - sprintStore.ts      // sprintsAtom, currentSprintAtom, etc.
  - boardStore.ts       // columnsAtom, boardsAtom, etc.
  - appStore.ts         // Re-exports only (backward compat)
```

**Migration Strategy**:
1. Create new store files
2. Move atoms to appropriate stores
3. Update `appStore.ts` to re-export
4. Gradually update imports to use new stores
5. Eventually deprecate `appStore.ts` imports

**Success Criteria**: 
- Clear domain separation
- Backward compatibility maintained
- No circular dependencies

---

#### 2.2 Component Size Reduction 📦

**Current State**: Several large components exist:
- `BucketlistView.tsx` - 1339 lines
- `TodayView.tsx` - Likely 1000+ lines
- `ClassView.tsx` - 941 lines
- `SprintPlanningView.tsx` - 661 lines

**Actions**:
- [ ] Extract sub-components from large views
- [ ] Extract custom hooks for complex logic
- [ ] Use composition over large monolithic components
- [ ] Target: Components should be < 300 lines

**Priority Targets**:
1. `BucketlistView.tsx` → Extract:
   - `BucketlistFilters.tsx`
   - `BucketlistList.tsx`
   - `BucketlistStats.tsx`
   - `useBucketlistLogic.ts` hook

2. `TodayView.tsx` → Extract:
   - `TodayGoalsSection.tsx`
   - `TodayStoriesSection.tsx`
   - `TodayProgressSection.tsx`
   - `useTodayLogic.ts` hook

3. `ClassView.tsx` → Extract:
   - `ClassList.tsx`
   - `ClassAssignments.tsx`
   - `useClassLogic.ts` hook

**Success Criteria**: 
- All components < 300 lines
- Logic extracted to hooks
- Better testability

---

#### 2.3 Error Handling Standardization 🛡️

**Current State**: Error handling patterns may be inconsistent

**Actions**:
- [ ] Audit all error handling patterns
- [ ] Standardize on `useErrorHandler` hook
- [ ] Ensure all async operations have error boundaries
- [ ] Add error logging/monitoring
- [ ] Create error recovery patterns

**Implementation**:
```typescript
// Standard pattern
const { handleError, clearError } = useErrorHandler();

try {
  await operation();
} catch (error) {
  handleError(error, 'OperationContext');
}
```

**Success Criteria**: 
- Consistent error handling everywhere
- All errors logged
- User-friendly error messages

---

### **Phase 3: Quality & Documentation (Weeks 5-6)**

#### 3.1 Documentation 📚

**Actions**:
- [ ] Add JSDoc comments to all public APIs
- [ ] Document component props with TypeScript
- [ ] Create architecture decision records (ADRs)
- [ ] Update README with setup instructions
- [ ] Document testing patterns

**Priority**:
1. Service classes (PlannerService, ReviewService, StoryService)
2. Custom hooks (all hooks in `src/hooks/`)
3. Shared components
4. Complex utilities

**Success Criteria**: 
- All public APIs documented
- New developers can onboard quickly

---

#### 3.2 Performance Monitoring 📊

**Actions**:
- [ ] Add performance metrics collection
- [ ] Monitor bundle sizes
- [ ] Track render performance
- [ ] Set up performance budgets
- [ ] Add Lighthouse CI

**Tools**:
- Bundle analyzer
- React DevTools Profiler
- Web Vitals tracking
- Performance budgets in CI

**Success Criteria**: 
- Performance metrics tracked
- Alerts on regressions
- Bundle size under control

---

#### 3.3 Accessibility Audit ♿

**Actions**:
- [ ] Run automated a11y tests (already have `test:a11y`)
- [ ] Manual keyboard navigation audit
- [ ] Screen reader testing
- [ ] Color contrast verification
- [ ] Fix any WCAG violations

**Success Criteria**: 
- WCAG 2.1 AA compliance
- All interactive elements keyboard accessible
- Screen reader friendly

---

### **Phase 4: Advanced Optimizations (Weeks 7-8)**

#### 4.1 Code Splitting & Bundle Optimization 📦

**Actions**:
- [ ] Implement route-based code splitting
- [ ] Lazy load heavy components
- [ ] Optimize vendor bundles
- [ ] Use dynamic imports for large features
- [ ] Analyze and optimize bundle sizes

**Success Criteria**: 
- Initial bundle < 200KB
- Route chunks < 50KB each
- Fast Time to Interactive

---

#### 4.2 E2E Testing 🧪

**Actions**:
- [ ] Set up Playwright or Cypress
- [ ] Add critical user flow tests
- [ ] Test data persistence
- [ ] Test Google Sheets integration
- [ ] Add visual regression tests

**Critical Flows**:
1. Create story → Add to sprint → Complete
2. Create goal → Track progress → Complete
3. Import/Export data
4. Settings changes

**Success Criteria**: 
- Critical flows covered
- E2E tests in CI
- Visual regression tests

---

#### 4.3 CI/CD Pipeline 🚀

**Actions**:
- [ ] Set up GitHub Actions / CI
- [ ] Add quality gates:
  - Type checking
  - Linting
  - Testing (unit + E2E)
  - Coverage thresholds
  - Bundle size checks
- [ ] Automated deployments
- [ ] Preview deployments for PRs

**Success Criteria**: 
- All quality checks automated
- Deployments are safe and repeatable

---

## 📊 Success Metrics

### Code Quality
- [ ] Test coverage: 70%+ (critical paths: 90%+)
- [ ] TypeScript strict mode: 100% compliance
- [ ] No dead code
- [ ] All components < 300 lines
- [ ] Zero linting errors

### Performance
- [ ] Initial bundle < 200KB
- [ ] Lighthouse score > 90
- [ ] Time to Interactive < 3s
- [ ] No performance regressions

### Maintainability
- [ ] All public APIs documented
- [ ] Clear architecture documentation
- [ ] Onboarding time < 1 day
- [ ] Code review time < 30 min per PR

### Reliability
- [ ] Zero critical bugs in production
- [ ] Error rate < 0.1%
- [ ] All critical flows tested
- [ ] Automated quality gates

---

## 🎯 Quick Wins (Do This Week)

1. **Enable TypeScript strict unused checks** (30 min)
2. **Delete old component files** (15 min)
3. **Add test coverage reporting** (1 hour)
4. **Write tests for 2-3 critical hooks** (2 hours)

**Total Time**: ~4 hours for immediate improvements

---

## 📝 Notes

- **Risk Management**: All changes should maintain backward compatibility initially
- **Incremental Approach**: Don't try to do everything at once
- **Measure Progress**: Track metrics before/after each phase
- **Team Alignment**: Ensure team understands the roadmap

---

## 🔄 Review & Iterate

This roadmap should be reviewed monthly and adjusted based on:
- Team velocity
- Production issues
- User feedback
- Technical discoveries

**Next Review Date**: [Set monthly review]

---

*Last Updated: [Current Date]*  
*Owner: Engineering Team*  
*Status: Active*

