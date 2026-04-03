# Test Report

Generated: 2026-04-03
Report file: TEST_REPORT.md
Status: Coverage folders removed after report generation; this file is the retained snapshot.

## 1) Executive Summary

- Overall result: 684/684 tests passed (100.00%)
- Total test files: 63/63 passed (100.00%)
- Combined runtime: 72.83s
- Weighted total coverage:
- Statements: 97.76% (1918/1962)
- Branches: 90.50% (629/695)
- Functions: 97.26% (320/329)
- Lines: 98.14% (1899/1935)

## 2) Test Execution Details

| Project | Test Files | Tests | Failed | Duration | Tests/sec |
|---|---:|---:|---:|---:|---:|
| Frontend | 23 | 196 | 0 | 35.84s | 5.47 |
| Backend | 20 | 271 | 0 | 8.76s | 30.94 |
| Admin | 20 | 217 | 0 | 28.23s | 7.69 |
| Total | 63 | 684 | 0 | 72.83s | 9.39 |

## 3) Coverage by Project

| Project | Statements | Branches | Functions | Lines |
|---|---:|---:|---:|---:|
| Frontend | 95.44% (335/351) | 86.25% (138/160) | 95.57% (108/113) | 97.26% (320/329) |
| Backend | 97.27% (499/513) | 91.85% (248/270) | 99.19% (123/124) | 97.44% (495/508) |
| Admin | 98.72% (1084/1098) | 91.69% (243/265) | 96.73% (89/92) | 98.72% (1084/1098) |

## 4) Weighted Coverage Totals (All Apps)

| Metric | Covered | Total | Percent | Uncovered |
|---|---:|---:|---:|---:|
| Statements | 1918 | 1962 | 97.76% | 44 |
| Branches | 629 | 695 | 90.50% | 66 |
| Functions | 320 | 329 | 97.26% | 9 |
| Lines | 1899 | 1935 | 98.14% | 36 |

## 5) Risk-Focused Findings

- Branch coverage is the main remaining gap (90.50%), with 66 uncovered branch paths.
- Highest uncovered statements come from a small set of service/config files and should give the largest ROI.
- Test pass rate is perfect, so remaining quality gains are mostly from edge-path and error-path branch tests.

## 6) Per-File Top 10 Uncovered (By Statements)

| Rank | Project | File | Uncovered Statements | Total Statements |
|---:|---|---|---:|---:|
| 1 | Admin | admin/src/services/ApiService.js | 12 | 66 |
| 2 | Frontend | Frontend/src/firebase/config.js | 5 | 5 |
| 3 | Backend | backend/src/services/OrderService.js | 5 | 50 |
| 4 | Backend | backend/src/services/FoodService.js | 4 | 42 |
| 5 | Frontend | Frontend/src/components/Navbar/navbar.jsx | 4 | 42 |
| 6 | Backend | backend/src/controllers/OrderController.js | 4 | 63 |
| 7 | Frontend | Frontend/src/context/StoreContext.jsx | 3 | 60 |
| 8 | Frontend | Frontend/src/components/header/header.jsx | 3 | 13 |
| 9 | Admin | admin/src/models/index.js | 2 | 154 |
| 10 | Frontend | Frontend/src/components/ExploreMenu/explore-menu.jsx | 1 | 5 |

## 7) Per-File Top 10 Uncovered (By Branches)

| Rank | Project | File | Uncovered Branches | Total Branches |
|---:|---|---|---:|---:|
| 1 | Admin | admin/src/models/index.js | 13 | 71 |
| 2 | Frontend | Frontend/src/firebase/config.js | 12 | 12 |
| 3 | Backend | backend/src/services/FoodService.js | 8 | 39 |
| 4 | Backend | backend/src/services/OrderService.js | 7 | 41 |
| 5 | Frontend | Frontend/src/context/StoreContext.jsx | 4 | 27 |
| 6 | Admin | admin/src/services/ApiService.js | 3 | 11 |
| 7 | Frontend | Frontend/src/components/Navbar/navbar.jsx | 2 | 26 |
| 8 | Frontend | Frontend/src/components/ExploreMenu/explore-menu.jsx | 2 | 4 |
| 9 | Backend | backend/src/services/CartService.js | 2 | 26 |
| 10 | Admin | admin/src/pages/add/add.jsx | 2 | 23 |

## 8) Priority Fix Order (Coverage ROI)

| Priority | Target File | Why First |
|---:|---|---|
| 1 | admin/src/services/ApiService.js | Highest uncovered statements (12) and low branch coverage |
| 2 | admin/src/models/index.js | Highest uncovered branches (13) |
| 3 | Frontend/src/firebase/config.js | Full uncovered config path (0% in run snapshot) |
| 4 | backend/src/services/FoodService.js | Large branch gap (8) and statement gap (4) |
| 5 | backend/src/services/OrderService.js | Large branch gap (7) and statement gap (5) |

## 9) Notes

- This report reflects the latest successful run snapshot from 2026-04-03.
- Coverage artifact directories were intentionally removed after report generation as requested.
