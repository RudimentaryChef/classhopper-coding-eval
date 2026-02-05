"""Backend bug fix tasks for ClassHopper evaluation."""

from grading.spec import problem
from grading.graders import AgentPatchGrader
from grading import Grade, EnvironmentState


@problem(
    id="fix_backend_bug_1_wrong_parameter",
    description="""Fix the wrong parameter name in signup_routes.py line 124.

The update_resource function is called with `pydantic_in=SignupIn` (the class)
instead of `pydantic_in=signup_in` (the instance variable).

File: backend/app/routes/signup_routes.py
Line: 124
Test: pytest backend/tests/test_signup_routes.py::test_update_signup -v
""",
    hints=[],
    difficulty="medium",
    task_type="code_fix",
    review_level="auto",
    base="backend_baseline",
    test="backend_test",
    golden="backend_golden",
)
def fix_backend_bug_1_wrong_parameter(state: EnvironmentState) -> Grade:
    return Grade.from_subscores([
        AgentPatchGrader.grade(
            state=state,
            weight=1.0,
            base="backend_baseline",
            test="backend_test",
            golden="backend_golden",
            test_files=["backend/tests/test_signup_routes.py::test_update_signup"],
        )
    ])


@problem(
    id="fix_backend_bug_2_duplicate_router",
    description="""Fix the duplicate router declaration in signup_routes.py.

The file declares `router = APIRouter()` twice (lines 11 and 28), causing the
second declaration to override the first and lose route registrations.

File: backend/app/routes/signup_routes.py
Lines: 11, 28
Test: pytest backend/tests/test_signup_routes.py::test_routes_registered -v
""",
    hints=[],
    difficulty="easy",
    task_type="code_fix",
    review_level="auto",
    base="backend_baseline",
    test="backend_test",
    golden="backend_golden",
)
def fix_backend_bug_2_duplicate_router(state: EnvironmentState) -> Grade:
    return Grade.from_subscores([
        AgentPatchGrader.grade(
            state=state,
            weight=1.0,
            base="backend_baseline",
            test="backend_test",
            golden="backend_golden",
            test_files=["backend/tests/test_signup_routes.py::test_routes_registered"],
        )
    ])


@problem(
    id="fix_backend_bug_3_typo_offset",
    description="""Fix the typo in parameter name - 'offest' should be 'offset'.

The parameter is misspelled as `offest` instead of `offset` in multiple places
(lines 131, 154, 194) in signup_routes.py.

File: backend/app/routes/signup_routes.py
Lines: 131, 154, 194
Test: pytest backend/tests/test_signup_routes.py::test_pagination -v
""",
    hints=[],
    difficulty="easy",
    task_type="code_fix",
    review_level="auto",
    base="backend_baseline",
    test="backend_test",
    golden="backend_golden",
)
def fix_backend_bug_3_typo_offset(state: EnvironmentState) -> Grade:
    return Grade.from_subscores([
        AgentPatchGrader.grade(
            state=state,
            weight=1.0,
            base="backend_baseline",
            test="backend_test",
            golden="backend_golden",
            test_files=["backend/tests/test_signup_routes.py::test_pagination"],
        )
    ])


@problem(
    id="fix_backend_bug_4_missing_import",
    description="""Fix the HTTPException import order in time_slot_routes.py.

HTTPException is used on line 30 but imported on line 103. This causes a
NameError when the code on line 30 executes before the import.

File: backend/app/routes/time_slot_routes.py
Lines: 30, 103
Test: pytest backend/tests/test_time_slot_routes.py::test_http_exception -v
""",
    hints=[],
    difficulty="medium",
    task_type="code_fix",
    review_level="auto",
    base="backend_baseline",
    test="backend_test",
    golden="backend_golden",
)
def fix_backend_bug_4_missing_import(state: EnvironmentState) -> Grade:
    return Grade.from_subscores([
        AgentPatchGrader.grade(
            state=state,
            weight=1.0,
            base="backend_baseline",
            test="backend_test",
            golden="backend_golden",
            test_files=["backend/tests/test_time_slot_routes.py::test_http_exception"],
        )
    ])


@problem(
    id="fix_backend_bug_5_type_hint",
    description="""Fix the type hint error in CRUD_services.py line 100.

The type hint uses lowercase `any` instead of `Any` from the typing module.

File: backend/app/services/CRUD_services.py
Line: 100
Test: pytest backend/tests/test_crud_services.py::test_type_hints -v
""",
    hints=[],
    difficulty="easy",
    task_type="code_fix",
    review_level="auto",
    base="backend_baseline",
    test="backend_test",
    golden="backend_golden",
)
def fix_backend_bug_5_type_hint(state: EnvironmentState) -> Grade:
    return Grade.from_subscores([
        AgentPatchGrader.grade(
            state=state,
            weight=1.0,
            base="backend_baseline",
            test="backend_test",
            golden="backend_golden",
            test_files=["backend/tests/test_crud_services.py::test_type_hints"],
        )
    ])


@problem(
    id="fix_backend_bug_6_duplicate_field",
    description="""Fix the duplicate created_at field in SignupClasses.py.

The SignupQuery class defines `created_at` field twice (lines 40 and 44).

File: backend/app/classes/SignupClasses.py
Lines: 40, 44
Test: pytest backend/tests/test_signup_classes.py::test_no_duplicates -v
""",
    hints=[],
    difficulty="easy",
    task_type="code_fix",
    review_level="auto",
    base="backend_baseline",
    test="backend_test",
    golden="backend_golden",
)
def fix_backend_bug_6_duplicate_field(state: EnvironmentState) -> Grade:
    return Grade.from_subscores([
        AgentPatchGrader.grade(
            state=state,
            weight=1.0,
            base="backend_baseline",
            test="backend_test",
            golden="backend_golden",
            test_files=["backend/tests/test_signup_classes.py::test_no_duplicates"],
        )
    ])


@problem(
    id="fix_backend_bug_7_schema_mismatch",
    description="""Fix the field name mismatch in SignupClasses.py line 34.

The SignupQuery uses `student_name` field but the Signup model doesn't have
this field defined.

File: backend/app/classes/SignupClasses.py
Line: 34
Test: pytest backend/tests/test_signup_classes.py::test_schema_match -v
""",
    hints=[],
    difficulty="medium",
    task_type="code_fix",
    review_level="auto",
    base="backend_baseline",
    test="backend_test",
    golden="backend_golden",
)
def fix_backend_bug_7_schema_mismatch(state: EnvironmentState) -> Grade:
    return Grade.from_subscores([
        AgentPatchGrader.grade(
            state=state,
            weight=1.0,
            base="backend_baseline",
            test="backend_test",
            golden="backend_golden",
            test_files=["backend/tests/test_signup_classes.py::test_schema_match"],
        )
    ])


@problem(
    id="fix_backend_bug_8_logic_error_filter",
    description="""Fix the logic error in course_services.py courseSorterService line 68.

The condition `course_sorter.greaterThan <= key_value <= course_sorter.lessThan`
is backwards. greaterThan should be the minimum threshold, not maximum.

File: backend/app/services/course_services.py
Line: 68
Test: pytest backend/tests/test_course_services.py::test_filter_logic -v
""",
    hints=[],
    difficulty="hard",
    task_type="code_fix",
    review_level="auto",
    base="backend_baseline",
    test="backend_test",
    golden="backend_golden",
)
def fix_backend_bug_8_logic_error_filter(state: EnvironmentState) -> Grade:
    return Grade.from_subscores([
        AgentPatchGrader.grade(
            state=state,
            weight=1.0,
            base="backend_baseline",
            test="backend_test",
            golden="backend_golden",
            test_files=["backend/tests/test_course_services.py::test_filter_logic"],
        )
    ])


@problem(
    id="fix_backend_bug_9_validation_logic",
    description="""Fix the validation logic error in signup_services.py lines 47-50.

The is_event_covered function only checks for exact match on line 47 and never
validates if occurrence falls within the event time range (between start_time
and end_time).

File: backend/app/services/signup_services.py
Lines: 47-50
Test: pytest backend/tests/test_signup_services.py::test_event_coverage -v
""",
    hints=[],
    difficulty="hard",
    task_type="code_fix",
    review_level="auto",
    base="backend_baseline",
    test="backend_test",
    golden="backend_golden",
)
def fix_backend_bug_9_validation_logic(state: EnvironmentState) -> Grade:
    return Grade.from_subscores([
        AgentPatchGrader.grade(
            state=state,
            weight=1.0,
            base="backend_baseline",
            test="backend_test",
            golden="backend_golden",
            test_files=["backend/tests/test_signup_services.py::test_event_coverage"],
        )
    ])


@problem(
    id="fix_backend_bug_10_null_comparison",
    description="""Fix the null check in instructor_routes.py line 198.

Uses `== None` instead of `is None` for proper null comparison.

File: backend/app/routes/instructor_routes.py
Line: 198
Test: pytest backend/tests/test_instructor_routes.py::test_null_check -v
""",
    hints=[],
    difficulty="easy",
    task_type="code_fix",
    review_level="auto",
    base="backend_baseline",
    test="backend_test",
    golden="backend_golden",
)
def fix_backend_bug_10_null_comparison(state: EnvironmentState) -> Grade:
    return Grade.from_subscores([
        AgentPatchGrader.grade(
            state=state,
            weight=1.0,
            base="backend_baseline",
            test="backend_test",
            golden="backend_golden",
            test_files=["backend/tests/test_instructor_routes.py::test_null_check"],
        )
    ])


@problem(
    id="fix_all_backend_bugs",
    description="""Fix all 10 identified bugs in the FastAPI backend.

This comprehensive task requires fixing all backend bugs including:
- Wrong parameters
- Duplicate declarations
- Typos
- Import orders
- Type hints
- Schema mismatches
- Logic errors
- Validation bugs
- Null comparisons

Run all backend tests to verify: pytest backend/tests/ -v
""",
    hints=[],
    difficulty="hard",
    task_type="code_fix",
    review_level="auto",
    base="backend_baseline",
    test="backend_test",
    golden="backend_golden",
)
def fix_all_backend_bugs(state: EnvironmentState) -> Grade:
    return Grade.from_subscores([
        AgentPatchGrader.grade(
            state=state,
            weight=1.0,
            base="backend_baseline",
            test="backend_test",
            golden="backend_golden",
            test_files=["backend/tests/"],
        )
    ])
