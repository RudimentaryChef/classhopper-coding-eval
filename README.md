# ClassHopper Coding Evaluation

HUD Evaluation Environment for ClassHopper Full-Stack Bug Fixing tasks.

## Overview

This repository integrates the ClassHopper full-stack application (FastAPI backend + Next.js frontend) into the HUD coding-template evaluation framework. It provides automated evaluation of AI agents' ability to fix bugs in a real-world full-stack application.

## Application Stack

- **Backend**: Python 3.12, FastAPI, SQLAlchemy, SQLite
- **Frontend**: Node.js 18, Next.js, React, TypeScript
- **Testing**: pytest (backend), vitest (frontend)

## Task Structure

### Backend Tasks (10 bugs)
- `fix_backend_bug_1_wrong_parameter` - Wrong parameter name in signup_routes.py
- `fix_backend_bug_2_duplicate_router` - Duplicate router declaration
- `fix_backend_bug_3_typo_offset` - Typo in parameter name
- `fix_backend_bug_4_missing_import` - HTTPException import order
- `fix_backend_bug_5_type_hint` - Type hint error (any vs Any)
- `fix_backend_bug_6_duplicate_field` - Duplicate field in Pydantic model
- `fix_backend_bug_7_schema_mismatch` - Field name mismatch
- `fix_backend_bug_8_logic_error_filter` - Logic error in filtering
- `fix_backend_bug_9_validation_logic` - Event coverage validation bug
- `fix_backend_bug_10_null_comparison` - Null check style issue
- `fix_all_backend_bugs` - Fix all backend bugs (comprehensive)

### Frontend Tasks (10 bugs)
- `fix_frontend_bug_1_phone_format` - Phone number formatting off-by-one
- `fix_frontend_bug_2_time_validation` - Time validation boundary condition
- `fix_frontend_bug_3_stripe_amount` - Stripe payment calculation error
- `fix_frontend_bug_4_api_field_name` - API parameter mismatch
- `fix_frontend_bug_5_api_method` - Wrong HTTP method
- `fix_frontend_bug_6_filter_field` - Course filter parameter mismatch
- `fix_frontend_bug_7_property_access` - Property access error
- `fix_frontend_bug_8_image_props` - Image component prop types
- `fix_frontend_bug_9_instructor_check` - Instructor existence check logic
- `fix_frontend_bug_10_unused_import` - Unused import
- `fix_all_frontend_bugs` - Fix all frontend bugs (comprehensive)

## Git Branch Structure

The repository uses a 3-branch structure for each stack:

### Backend Branches
- `backend_baseline` - Contains all backend bugs
- `backend_test` - Adds pytest test suite
- `backend_golden` - All bugs fixed

### Frontend Branches
- `frontend_baseline` - Contains all frontend bugs
- `frontend_test` - Adds vitest test suite
- `frontend_golden` - All bugs fixed

### Main Branch
- `main` - Includes coding-template infrastructure and task definitions

## Local Testing

```bash
# Test a single bug fix
python local_test.py --problem-id fix_backend_bug_1_wrong_parameter

# Test comprehensive backend task
python local_test.py --problem-id fix_all_backend_bugs

# Test frontend task
python local_test.py --problem-id fix_frontend_bug_1_phone_format
```

## Docker Build

```bash
# Build the evaluation environment
docker build -f Dockerfile.hud -t classhopper-eval:latest \
  --build-arg REPO_URL=https://github.com/your-org/classhopper-coding-eval .

# For private repos, add GitHub token
docker build -f Dockerfile.hud -t classhopper-eval:latest \
  --build-arg REPO_URL=https://github.com/your-org/classhopper-coding-eval \
  --secret id=CODING_GITHUB_TOKEN,env=CODING_GITHUB_TOKEN .
```

## HUD Development

```bash
# Start MCP server for local development
hud dev env:env --stdio

# Watch for changes in tasks and grading
hud dev -w tasks -w grading --port 8765
```

## Deployment

1. Push repository to GitHub
2. Go to hud.ai → Environments
3. Click "New Environment"
4. Connect GitHub repository
5. Set `REPO_URL` build argument
6. Build and deploy

## Test Execution

The grading runner automatically detects which stack to test based on the `problem_id`:

- `problem_id` contains "backend" → runs pytest
- `problem_id` contains "frontend" → runs vitest
- Otherwise → runs both (full-stack)

### Backend Tests
```bash
cd backend
pytest --junit-xml=pytest_results.xml -v tests/
```

### Frontend Tests
```bash
cd frontend
npx vitest run --reporter=junit --outputFile=junit-results.xml tests/
```

## Environment Variables

The evaluation environment uses dummy values for all external services:

- `DATABASE_URL=sqlite:///./test.db` (local SQLite, no cloud DB)
- `CLERK_SECRET_KEY=dummy_clerk_key`
- `STRIPE_SECRET_KEY=dummy_stripe_key`
- `GOOGLE_MAPS_API_KEY=dummy_maps_key`

## Project Structure

```
classhopper-coding-eval/
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── classes/        # Pydantic models
│   └── tests/              # pytest test suite
├── frontend/               # Next.js application
│   ├── src/
│   │   └── app/
│   │       ├── components/
│   │       └── utils/
│   └── tests/              # vitest test suite
├── tasks/                  # Task definitions
│   ├── backend_bugs.py
│   └── frontend_bugs.py
├── grading/                # Grading infrastructure
│   ├── runner.py          # Test orchestration
│   ├── graders.py
│   └── spec.py
├── tools/                  # Agent tools
├── Dockerfile.hud          # HUD environment build
├── pyproject.toml
└── README.md
```

## Contributing

To add new bug tasks:

1. Identify the bug in the codebase
2. Create test in appropriate test suite (pytest or vitest)
3. Add task definition in `tasks/backend_bugs.py` or `tasks/frontend_bugs.py`
4. Create git patch from baseline to golden branch
5. Test locally with `python local_test.py`

## License

This evaluation environment is based on the HUD coding-template and includes the ClassHopper application for educational purposes.
