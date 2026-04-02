# ♟ Python Chess AI — Minimax with Alpha-Beta Pruning

> **Final-Year CSE Project**  
> A fully playable chess engine implementing the Minimax algorithm with
> Alpha-Beta Pruning, piece-square positional evaluation, and a clean
> modular architecture.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Project Structure](#2-project-structure)
3. [Module Descriptions](#3-module-descriptions)
4. [Algorithm Deep-Dive](#4-algorithm-deep-dive)
5. [Setup & Installation](#5-setup--installation)
6. [How to Play](#6-how-to-play)
7. [Gameplay Flow](#7-gameplay-flow)
8. [Test Suite](#8-test-suite)
9. [Performance Benchmarks](#9-performance-benchmarks)
10. [Possible Extensions](#10-possible-extensions)

---

## 1. Project Overview

This project implements a **complete chess engine** in pure Python (no external
chess libraries). It supports:

| Feature | Status |
|---|---|
| Full 8 × 8 board representation | ✅ |
| All legal piece moves (including edge cases) | ✅ |
| En-passant | ✅ |
| Castling (kingside & queenside) | ✅ |
| Pawn promotion (all 4 choices) | ✅ |
| Check, checkmate & stalemate detection | ✅ |
| 50-move rule | ✅ |
| Minimax AI with Alpha-Beta Pruning | ✅ |
| Piece-square positional evaluation | ✅ |
| Move ordering (MVV-LVA heuristic) | ✅ |
| Adjustable AI difficulty (depth 1-5) | ✅ |
| Human vs AI & Human vs Human modes | ✅ |
| Undo / take-back | ✅ |
| CLI with Unicode board rendering | ✅ |
| Built-in test suite | ✅ |

---

## 2. Project Structure

```
chess_ai/
│
├── main.py                  ← Entry point; interactive setup menu
├── game_controller.py       ← Game loop, input/output, display
├── requirements.txt
│
└── chess_engine/            ← Core engine package
    ├── __init__.py
    ├── move.py              ← Move data structure
    ├── board.py             ← Board state manager (GameState)
    ├── move_generator.py    ← Legal move generation & attack detection
    ├── evaluation.py        ← Static evaluation function
    └── ai_engine.py         ← Minimax + Alpha-Beta AI
```

---

## 3. Module Descriptions

### `chess_engine/move.py` — Move Data Structure
Encapsulates everything about a single move:
- **Origin & destination squares** (row, col coordinates)
- **Moved piece & captured piece** (populated from the board on construction)
- **Special flags**: `is_pawn_promotion`, `is_en_passant`, `is_castle`
- **Notation helpers**: `get_uci_notation()` → `"e2e4"`,
  `get_pgn_notation()` → `"Nf3"`

```python
move = Move((6, 4), (4, 4), board.board)   # e2e4
print(move)   # → e2e4
```

---

### `chess_engine/board.py` — Board Manager (GameState)
Maintains the **complete mutable game state**:

| Attribute | Purpose |
|---|---|
| `board[8][8]` | 8×8 list of piece strings (`'wP'`, `'bQ'`, `'--'`) |
| `white_to_move` | Whose turn it is |
| `move_log` | List of played moves (enables undo) |
| `white_king_location` | `(row, col)` — O(1) check detection |
| `black_king_location` | `(row, col)` — O(1) check detection |
| `en_passant_square` | Target square for en-passant capture |
| `castling_rights` | `CastlingRights(wks, wqs, bks, bqs)` |
| `castling_rights_log` | History for undo |
| `fifty_move_counter` | For the 50-move draw rule |

Key methods:
- **`make_move(move)`** — applies a move in-place (no board copy)
- **`undo_move()`** — reverts the last move exactly

---

### `chess_engine/move_generator.py` — Move Generator & Rule Validator
Generates **legal** moves through a two-phase process:

**Phase 1 — Pseudo-legal generation** (`_get_all_pseudo_legal_moves`):
Enumerate candidate moves for each piece type without checking whether
they leave the king in check.

**Phase 2 — Legality filter** (`get_legal_moves`):
```
for each pseudo-legal move:
    make_move(move)
    if own king is NOT attacked:
        accept move
    undo_move()
```

**Attack detection** (`_is_square_attacked`):
Instead of generating all opponent moves, scan outward from the target
square along each vector (reverse-ray casting). This avoids generating
all enemy moves just to test one square and is significantly faster.

```
Rook/Queen  → 4 orthogonal rays
Bishop/Queen→ 4 diagonal rays
Knight      → 8 L-shaped jumps
Pawn        → 2 diagonal one-step checks (direction depends on color)
King        → 8 adjacent squares
```

Public interface:
```python
gen = MoveGenerator(game_state)
legal_moves = gen.get_legal_moves()   # List[Move]
in_check    = gen.is_in_check()       # bool
```

---

### `chess_engine/evaluation.py` — Evaluation Function
Static evaluation scores a position in **centipawns** from White's
perspective (+ve = White better, -ve = Black better).

**Piece values:**
| Piece  | Value |
|--------|-------|
| Pawn   |   100 |
| Knight |   320 |
| Bishop |   330 |
| Rook   |   500 |
| Queen  |   900 |
| King   | 20000 |

**Piece-square tables** add positional bonuses:
- Pawns are rewarded for advancing and controlling the centre.
- Knights are penalised on the rim and rewarded in the centre.
- Bishops prefer open diagonals.
- Rooks prefer open files and the 7th rank.
- King uses a middlegame table (shelter behind pawns) and an endgame
  table (centralisation) selected automatically.

**Move-ordering score** (`move_order_score`):
Used by the AI to sort moves before searching (captures first, then
positional moves). Better ordering → more beta cutoffs → faster search.

---

### `chess_engine/ai_engine.py` — AI Engine
Implements **Minimax with Alpha-Beta Pruning**.

```python
ai = ChessAI(depth=3)
move = ai.get_best_move(game_state, legal_moves)
print(ai.nodes_searched)   # diagnostic
```

Difficulty levels:

| Level | Depth | Approx. time |
|-------|-------|-------------|
| 1 — Beginner | 1 | instant |
| 2 — Easy     | 2 | < 0.1 s |
| 3 — Medium   | 3 | ~ 0.5 s |
| 4 — Hard     | 4 | ~ 3-8 s |
| 5 — Expert   | 5 | ~ 30-60 s |

---

### `game_controller.py` — Game Controller
Ties everything together:
- Renders the board (Unicode ♟ or ASCII fallback)
- Parses UCI input (`e2e4`, `e7e8q`)
- Manages the Human vs AI / Human vs Human game loop
- Handles undo, help, move listing
- Displays PGN move history and evaluation bar

---

## 4. Algorithm Deep-Dive

### Minimax

The game tree is explored assuming both sides play optimally:
- **Maximising player (White)** always picks the move leading to the
  highest evaluation.
- **Minimising player (Black)** always picks the move leading to the
  lowest evaluation.

```
minimax(state, depth, alpha, beta, maximising):
    if depth == 0 or terminal(state):
        return evaluate(state)          ← leaf: call evaluation function

    if maximising:
        value = −∞
        for move in ordered_moves(state):
            make(move)
            value = max(value, minimax(state, depth-1, alpha, beta, False))
            undo(move)
            alpha = max(alpha, value)
            if beta ≤ alpha:            ← β-cutoff
                break
        return value

    else:  # minimising
        value = +∞
        for move in ordered_moves(state):
            make(move)
            value = min(value, minimax(state, depth-1, alpha, beta, True))
            undo(move)
            beta = min(beta, value)
            if beta ≤ alpha:            ← α-cutoff
                break
        return value
```

### Alpha-Beta Pruning

Alpha and beta are bounds that eliminate branches that cannot affect
the outcome:

- **α (alpha)** — the best score the **maximiser** is guaranteed, regardless
  of what the minimiser does. If a node returns a value ≤ alpha, the
  minimiser would never allow it → prune.
- **β (beta)** — the best score the **minimiser** is guaranteed. If a node
  returns a value ≥ beta, the maximiser would never allow it → prune.

**Effect:**  
Without pruning, branching factor ~35 → nodes at depth 4 ≈ 35⁴ ≈ 1.5 M.  
With good move ordering and alpha-beta → effectively searches depth 8
in the same time (worst case still depth 4, best case depth 8).

### Move Ordering (MVV-LVA)

Moves are sorted before searching to maximise cutoffs:

```
score = victim_value - attacker_value / 10 + 10000   (for captures)
      + promotion_value                               (for promotions)
      + 50                                            (for castling)
```

**MVV-LVA** = Most Valuable Victim, Least Valuable Attacker:  
Taking a Queen with a Pawn is searched before taking a Pawn with a
Queen — the former is more likely to cause a cutoff.

---

## 5. Setup & Installation

### Requirements
- Python 3.10 or later (no external dependencies)

### Steps

```bash
# 1. Clone or download the project
git clone <your-repo-url>
cd chess_ai

# 2. (Optional) Create a virtual environment
python -m venv venv
source venv/bin/activate      # Linux/macOS
venv\Scripts\activate         # Windows

# 3. Run the test suite to verify everything works
python main.py --test

# 4. Start a game
python main.py
```

### Command-line flags (skip the menu)

```bash
python main.py --depth 3          # Medium AI, play as White
python main.py --depth 4 --black  # Hard AI, play as Black
python main.py --hvh              # Human vs Human
python main.py --ascii            # ASCII pieces for older terminals
python main.py --test             # Run tests and exit
```

---

## 6. How to Play

Moves are entered in **UCI notation**: `<file><rank><file><rank>`

```
e2e4     — move pawn from e2 to e4
g1f3     — move knight from g1 to f3
e1g1     — castle kingside  (king moves e1→g1)
e1c1     — castle queenside (king moves e1→c1)
e7e8q    — promote pawn to Queen
e7e8n    — promote pawn to Knight
```

**In-game commands:**

| Command | Action |
|---------|--------|
| `moves` or `m` | Show all legal moves |
| `undo` or `u`  | Take back last move (+ AI's move in HvAI) |
| `eval`         | Show current position evaluation |
| `help` or `h`  | Show help screen |
| `quit` or `q`  | Exit the game |

---

## 7. Gameplay Flow

```
START
  │
  ▼
Interactive Menu
  (mode / side / difficulty / piece style)
  │
  ▼
┌─────────────────────────────────────────┐
│            GAME LOOP                    │
│                                         │
│  1. Generate legal moves                │
│  2. Check for checkmate / stalemate     │
│  3a. Human turn → parse UCI input       │
│  3b. AI turn   → Minimax search         │
│  4. make_move() updates board state     │
│  5. Repeat                              │
└─────────────────────────────────────────┘
  │
  ▼
GAME OVER
  (Checkmate / Stalemate / 50-move rule)
```

---

## 8. Test Suite

Run with:

```bash
python main.py --test
```

Tests covered:

| Test | Expected |
|------|----------|
| Starting position move count | 20 |
| Starting position not in check | True |
| AI returns a valid move at depth 2 | Move in legal list |
| Fool's Mate (checkmate in 2) | 0 legal moves, in check |
| Make/undo preserves full state | Board identical to original |

---

## 9. Performance Benchmarks

Tested on a standard laptop (Python 3.12, no parallelism):

| Depth | Avg. nodes | Avg. time (opening) |
|-------|-----------|---------------------|
| 1 | ~35 | < 0.01 s |
| 2 | ~400 | < 0.05 s |
| 3 | ~4 000 | ~ 0.3 s |
| 4 | ~40 000 | ~ 3 s |
| 5 | ~350 000 | ~ 25 s |

Alpha-beta pruning typically reduces the effective branching factor
from ~35 to ~6 with good move ordering.

---

## 10. Possible Extensions

| Extension | Difficulty |
|-----------|------------|
| Zobrist hashing + transposition table | Medium |
| Iterative deepening | Easy |
| Null-move pruning | Medium |
| Quiescence search (avoid horizon effect) | Medium |
| Opening book integration | Easy |
| Pygame graphical UI | Medium |
| UCI protocol (connect to Stockfish GUI) | Hard |
| Endgame tablebases | Hard |
| Neural-network evaluation (NNUE style) | Very Hard |

---

*Built with Python 3 · No external libraries required*
