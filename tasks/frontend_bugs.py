"""Frontend bug fix tasks for ClassHopper evaluation."""

from grading.spec import problem
from grading.graders import AgentPatchGrader
from grading import Grade, EnvironmentState


@problem(
    id="fix_frontend_bug_1_phone_format",
    description="""Fix the phone number formatting off-by-one error in functions.ts.

The formatPhoneNumber function uses slice(7) instead of slice(6), causing the
last digit to be cut off from formatted phone numbers.

File: frontend/src/app/utils/functions.ts
Line: 49
Test: cd frontend && npx vitest run tests/functions.test.ts -t "phone"
""",
    hints=[],
    difficulty="easy",
    task_type="code_fix",
    review_level="auto",
    base="frontend_baseline",
    test="frontend_test",
    golden="frontend_golden",
)
def fix_frontend_bug_1_phone_format(state: EnvironmentState) -> Grade:
    return Grade.from_subscores([
        AgentPatchGrader.grade(
            state=state,
            weight=1.0,
            base="frontend_baseline",
            test="frontend_test",
            golden="frontend_golden",
            test_files=["frontend/tests/functions.test.ts"],
        )
    ])


@problem(
    id="fix_frontend_bug_2_time_validation",
    description="""Fix the time validation boundary condition in functions.ts.

The validation uses `minutes >= 59` instead of `minutes > 59`, incorrectly
rejecting valid minute value of 59.

File: frontend/src/app/utils/functions.ts
Line: 84
Test: cd frontend && npx vitest run tests/functions.test.ts -t "time validation"
""",
    hints=[],
    difficulty="easy",
    task_type="code_fix",
    review_level="auto",
    base="frontend_baseline",
    test="frontend_test",
    golden="frontend_golden",
)
def fix_frontend_bug_2_time_validation(state: EnvironmentState) -> Grade:
    return Grade.from_subscores([
        AgentPatchGrader.grade(
            state=state,
            weight=1.0,
            base="frontend_baseline",
            test="frontend_test",
            golden="frontend_golden",
            test_files=["frontend/tests/functions.test.ts"],
        )
    ])


@problem(
    id="fix_frontend_bug_3_stripe_amount",
    description="""Fix the Stripe payment amount calculation in stripeactions.ts.

The code multiplies by 100 twice: `Math.round(Number(res.data.course_Price) * 100) * 100`,
charging 100x more than intended.

File: frontend/src/app/utils/stripeactions.ts
Line: 128
Test: cd frontend && npx vitest run tests/stripeactions.test.ts -t "payment amount"
""",
    hints=[],
    difficulty="medium",
    task_type="code_fix",
    review_level="auto",
    base="frontend_baseline",
    test="frontend_test",
    golden="frontend_golden",
)
def fix_frontend_bug_3_stripe_amount(state: EnvironmentState) -> Grade:
    return Grade.from_subscores([
        AgentPatchGrader.grade(
            state=state,
            weight=1.0,
            base="frontend_baseline",
            test="frontend_test",
            golden="frontend_golden",
            test_files=["frontend/tests/stripeactions.test.ts"],
        )
    ])


@problem(
    id="fix_frontend_bug_4_api_field_name",
    description="""Fix the API parameter mismatch in actions.ts.

The code sends `timeslot_id` but the backend expects `time_slot_id` (snake_case
with underscore).

File: frontend/src/app/utils/actions.ts
Lines: 66-69
Test: cd frontend && npx vitest run tests/actions.test.ts -t "field name"
""",
    hints=[],
    difficulty="easy",
    task_type="code_fix",
    review_level="auto",
    base="frontend_baseline",
    test="frontend_test",
    golden="frontend_golden",
)
def fix_frontend_bug_4_api_field_name(state: EnvironmentState) -> Grade:
    return Grade.from_subscores([
        AgentPatchGrader.grade(
            state=state,
            weight=1.0,
            base="frontend_baseline",
            test="frontend_test",
            golden="frontend_golden",
            test_files=["frontend/tests/actions.test.ts"],
        )
    ])


@problem(
    id="fix_frontend_bug_5_api_method",
    description="""Fix the API method in TeacherDetails.tsx.

Uses axios.post() when it should use axios.put() for updating instructor profile,
and passes instructor_id in body instead of query parameter.

File: frontend/src/app/instructor/[...path]/components/TeacherDetails.tsx
Lines: 122-127
Test: cd frontend && npx vitest run tests/TeacherDetails.test.ts -t "API method"
""",
    hints=[],
    difficulty="medium",
    task_type="code_fix",
    review_level="auto",
    base="frontend_baseline",
    test="frontend_test",
    golden="frontend_golden",
)
def fix_frontend_bug_5_api_method(state: EnvironmentState) -> Grade:
    return Grade.from_subscores([
        AgentPatchGrader.grade(
            state=state,
            weight=1.0,
            base="frontend_baseline",
            test="frontend_test",
            golden="frontend_golden",
            test_files=["frontend/tests/TeacherDetails.test.ts"],
        )
    ])


@problem(
    id="fix_frontend_bug_6_filter_field",
    description="""Fix the course filter parameter in explore page.tsx.

Sends `classType` (camelCase) when backend expects `class_type` (snake_case).

File: frontend/src/app/explore/page.tsx
Line: 61
Test: cd frontend && npx vitest run tests/explore.test.ts -t "filter"
""",
    hints=[],
    difficulty="easy",
    task_type="code_fix",
    review_level="auto",
    base="frontend_baseline",
    test="frontend_test",
    golden="frontend_golden",
)
def fix_frontend_bug_6_filter_field(state: EnvironmentState) -> Grade:
    return Grade.from_subscores([
        AgentPatchGrader.grade(
            state=state,
            weight=1.0,
            base="frontend_baseline",
            test="frontend_test",
            golden="frontend_golden",
            test_files=["frontend/tests/explore.test.ts"],
        )
    ])


@problem(
    id="fix_frontend_bug_7_property_access",
    description="""Fix the property access in SignupCard.tsx.

Accesses `classInfo.coursePrice` (camelCase) when backend returns
`classInfo.course_Price` (snake_case).

File: frontend/src/app/student/SignupCard.tsx
Line: 105
Test: cd frontend && npx vitest run tests/SignupCard.test.ts -t "property"
""",
    hints=[],
    difficulty="easy",
    task_type="code_fix",
    review_level="auto",
    base="frontend_baseline",
    test="frontend_test",
    golden="frontend_golden",
)
def fix_frontend_bug_7_property_access(state: EnvironmentState) -> Grade:
    return Grade.from_subscores([
        AgentPatchGrader.grade(
            state=state,
            weight=1.0,
            base="frontend_baseline",
            test="frontend_test",
            golden="frontend_golden",
            test_files=["frontend/tests/SignupCard.test.ts"],
        )
    ])


@problem(
    id="fix_frontend_bug_8_image_props",
    description="""Fix the Image component props type error in SignupCard.tsx.

Width and height props receive string values "500" and "160" instead of numbers.

File: frontend/src/app/student/SignupCard.tsx
Lines: 81-82
Test: cd frontend && npx vitest run tests/SignupCard.test.ts -t "image props"
""",
    hints=[],
    difficulty="easy",
    task_type="code_fix",
    review_level="auto",
    base="frontend_baseline",
    test="frontend_test",
    golden="frontend_golden",
)
def fix_frontend_bug_8_image_props(state: EnvironmentState) -> Grade:
    return Grade.from_subscores([
        AgentPatchGrader.grade(
            state=state,
            weight=1.0,
            base="frontend_baseline",
            test="frontend_test",
            golden="frontend_golden",
            test_files=["frontend/tests/SignupCard.test.ts"],
        )
    ])


@problem(
    id="fix_frontend_bug_9_instructor_check",
    description="""Fix the instructor existence check logic in stripeactions.ts.

Checks `instructor.length === 0` but `instructor` is an object (res.data[0]),
not an array. Should check `res.data.length === 0`.

File: frontend/src/app/utils/stripeactions.ts
Lines: 66-67
Test: cd frontend && npx vitest run tests/stripeactions.test.ts -t "instructor check"
""",
    hints=[],
    difficulty="medium",
    task_type="code_fix",
    review_level="auto",
    base="frontend_baseline",
    test="frontend_test",
    golden="frontend_golden",
)
def fix_frontend_bug_9_instructor_check(state: EnvironmentState) -> Grade:
    return Grade.from_subscores([
        AgentPatchGrader.grade(
            state=state,
            weight=1.0,
            base="frontend_baseline",
            test="frontend_test",
            golden="frontend_golden",
            test_files=["frontend/tests/stripeactions.test.ts"],
        )
    ])


@problem(
    id="fix_frontend_bug_10_unused_import",
    description="""Remove the unused import in DisplayTimeSlots.tsx.

Imports `{ get } from "http"` on line 3 but never uses it.

File: frontend/src/app/explore/v2/[postid]/DisplayTimeSlots.tsx
Line: 3
Test: cd frontend && npx vitest run tests/DisplayTimeSlots.test.ts -t "unused import"
""",
    hints=[],
    difficulty="easy",
    task_type="code_fix",
    review_level="auto",
    base="frontend_baseline",
    test="frontend_test",
    golden="frontend_golden",
)
def fix_frontend_bug_10_unused_import(state: EnvironmentState) -> Grade:
    return Grade.from_subscores([
        AgentPatchGrader.grade(
            state=state,
            weight=1.0,
            base="frontend_baseline",
            test="frontend_test",
            golden="frontend_golden",
            test_files=["frontend/tests/DisplayTimeSlots.test.ts"],
        )
    ])


@problem(
    id="fix_all_frontend_bugs",
    description="""Fix all 10 identified bugs in the Next.js frontend.

This comprehensive task requires fixing all frontend bugs including:
- Phone formatting
- Time validation
- Stripe payment calculations
- API field name mismatches
- HTTP method errors
- Property access errors
- Component prop types
- Logic errors

Run all frontend tests to verify: cd frontend && npx vitest run tests/
""",
    hints=[],
    difficulty="hard",
    task_type="code_fix",
    review_level="auto",
    base="frontend_baseline",
    test="frontend_test",
    golden="frontend_golden",
)
def fix_all_frontend_bugs(state: EnvironmentState) -> Grade:
    return Grade.from_subscores([
        AgentPatchGrader.grade(
            state=state,
            weight=1.0,
            base="frontend_baseline",
            test="frontend_test",
            golden="frontend_golden",
            test_files=["frontend/tests/"],
        )
    ])
